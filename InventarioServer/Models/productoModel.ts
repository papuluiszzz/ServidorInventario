import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/dependencias.ts";

interface ProductoData {
    idProducto: number | null;
    descripcion: string;
    cantidad: string;
    precio: string;
    unidadMedida: string;
    idCategoria: number;
}

interface ProductoConCategoria extends ProductoData {
    nombreCategoria?: string;
}

export class Producto {
    public _objProducto: ProductoData | null;
    public _idProducto: number | null;

    constructor(objProducto: ProductoData | null = null, idProducto: number | null = null) {
        this._objProducto = objProducto;
        this._idProducto = idProducto;
    }

    public async SeleccionarProductos(): Promise<ProductoConCategoria[]> {
        const { rows: productos } = await conexion.execute(`
            SELECT 
                p.idProducto,
                p.descripcion,
                p.cantidad,
                p.precio,
                p.unidadMedida,
                p.idCategoria,
                c.nombreCategoria
            FROM producto p
            LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
            ORDER BY p.descripcion ASC
        `);
        return productos as ProductoConCategoria[];
    }

    public async SeleccionarProductoPorId(id: number): Promise<ProductoConCategoria | null> {
        const { rows: productos } = await conexion.execute(`
            SELECT 
                p.idProducto,
                p.descripcion,
                p.cantidad,
                p.precio,
                p.unidadMedida,
                p.idCategoria,
                c.nombreCategoria
            FROM producto p
            LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
            WHERE p.idProducto = ?
        `, [id]);
        
        return productos.length > 0 ? productos[0] as ProductoConCategoria : null;
    }

    public async SeleccionarProductosPorCategoria(idCategoria: number): Promise<ProductoConCategoria[]> {
        const { rows: productos } = await conexion.execute(`
            SELECT 
                p.idProducto,
                p.descripcion,
                p.cantidad,
                p.precio,
                p.unidadMedida,
                p.idCategoria,
                c.nombreCategoria
            FROM producto p
            LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
            WHERE p.idCategoria = ?
            ORDER BY p.descripcion ASC
        `, [idCategoria]);
        return productos as ProductoConCategoria[];
    }

    public async InsertarProducto(): Promise<{ success: boolean; message: string; producto?: Record<string, unknown> }> {
        try {
            if (!this._objProducto) {
                throw new Error("No se ha proporcionado un objeto de producto válido");
            }

            const { descripcion, cantidad, precio, unidadMedida, idCategoria } = this._objProducto;
            
            if (!descripcion || !cantidad || !precio || !unidadMedida || !idCategoria) {
                throw new Error("Todos los campos son requeridos para insertar el producto");
            }

            // Verificar que la categoría existe
            const [categoriaExiste] = await conexion.query(
                'SELECT idCategoria FROM categoria WHERE idCategoria = ?',
                [idCategoria]
            );

            if (!categoriaExiste) {
                throw new Error("La categoría especificada no existe");
            }

            await conexion.execute("START TRANSACTION");

            const result = await conexion.execute(
                'INSERT INTO producto (descripcion, cantidad, precio, unidadMedida, idCategoria) VALUES (?, ?, ?, ?, ?)',
                [descripcion, cantidad, precio, unidadMedida, idCategoria]
            );

            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const [producto] = await conexion.query(`
                    SELECT 
                        p.idProducto,
                        p.descripcion,
                        p.cantidad,
                        p.precio,
                        p.unidadMedida,
                        p.idCategoria,
                        c.nombreCategoria
                    FROM producto p
                    LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
                    WHERE p.idProducto = LAST_INSERT_ID()
                `);
                
                await conexion.execute("COMMIT");
                return { success: true, message: "Producto registrado correctamente", producto: producto };
            } else {
                throw new Error("No fue posible registrar el producto");
            }
        } catch (error) {
            await conexion.execute("ROLLBACK");
            if (error instanceof z.ZodError) {
                return { success: false, message: error.message };
            } else {
                return { success: false, message: error.message || "Error interno del servidor" };
            }
        }
    }

    public async ActualizarProducto(): Promise<{ success: boolean; message: string; producto?: Record<string, unknown> }> {
        try {
            if (!this._objProducto) {
                throw new Error("No se ha proporcionado un objeto de producto válido");
            }

            const { idProducto, descripcion, cantidad, precio, unidadMedida, idCategoria } = this._objProducto;

            if (!idProducto) {
                throw new Error("Se requiere el ID del producto para actualizarlo");
            }

            if (!descripcion || !cantidad || !precio || !unidadMedida || !idCategoria) {
                throw new Error("Todos los campos son requeridos para actualizar el producto");
            }

            // Verificar que la categoría existe
            const [categoriaExiste] = await conexion.query(
                'SELECT idCategoria FROM categoria WHERE idCategoria = ?',
                [idCategoria]
            );

            if (!categoriaExiste) {
                throw new Error("La categoría especificada no existe");
            }

            await conexion.execute("START TRANSACTION");

            const result = await conexion.execute(
                'UPDATE producto SET descripcion = ?, cantidad = ?, precio = ?, unidadMedida = ?, idCategoria = ? WHERE idProducto = ?',
                [descripcion, cantidad, precio, unidadMedida, idCategoria, idProducto]
            );

            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const [producto] = await conexion.query(`
                    SELECT 
                        p.idProducto,
                        p.descripcion,
                        p.cantidad,
                        p.precio,
                        p.unidadMedida,
                        p.idCategoria,
                        c.nombreCategoria
                    FROM producto p
                    LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
                    WHERE p.idProducto = ?
                `, [idProducto]);

                await conexion.execute("COMMIT");
                return { success: true, message: "Producto actualizado correctamente", producto: producto };
            } else {
                throw new Error("No fue posible actualizar el producto");
            }
        } catch (error) {
            await conexion.execute("ROLLBACK");
            if (error instanceof z.ZodError) {
                return { success: false, message: error.message };
            } else {
                return { success: false, message: error.message || "Error interno del servidor" };
            }
        }
    }

    public async EliminarProducto(): Promise<{ success: boolean; message: string; producto?: Record<string, unknown> }> {
        try {
            if (!this._objProducto || !this._objProducto.idProducto) {
                throw new Error("No se ha proporcionado un ID de producto válido");
            }

            const idProducto = this._objProducto.idProducto;

            await conexion.execute("START TRANSACTION");

            // Verificar si el producto existe
            const [productoExistente] = await conexion.query(`
                SELECT 
                    p.idProducto,
                    p.descripcion,
                    p.cantidad,
                    p.precio,
                    p.unidadMedida,
                    p.idCategoria,
                    c.nombreCategoria
                FROM producto p
                LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
                WHERE p.idProducto = ?
            `, [idProducto]);

            if (!productoExistente) {
                await conexion.execute("ROLLBACK");
                return { success: false, message: "El producto no existe" };
            }

            const result = await conexion.execute(
                'DELETE FROM producto WHERE idProducto = ?',
                [idProducto]
            );

            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                await conexion.execute("COMMIT");
                return {
                    success: true,
                    message: "Producto eliminado correctamente",
                    producto: productoExistente
                };
            } else {
                await conexion.execute("ROLLBACK");
                throw new Error("No fue posible eliminar el producto");
            }

        } catch (error) {
            await conexion.execute("ROLLBACK");
            if (error instanceof z.ZodError) {
                return { success: false, message: error.message };
            } else {
                return { success: false, message: "Error interno del servidor" };
            }
        }
    }
}