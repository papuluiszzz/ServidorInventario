import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/dependencias.ts";

interface CategoriaData {
    idCategoria: number | null;
    nombreCategoria: string;
}

export class Categoria {
    public _objCategoria: CategoriaData | null;
    public _idCategoria: number | null;

    constructor(objCategoria: CategoriaData | null = null, idCategoria: number | null = null) {
        this._objCategoria = objCategoria;
        this._idCategoria = idCategoria;
    }

    public async SeleccionarCategorias(): Promise<CategoriaData[]> {
        const { rows: categoria } = await conexion.execute('SELECT * FROM categoria ORDER BY nombreCategoria ASC');
        return categoria as CategoriaData[];
    }

    public async InsertarCategoria(): Promise<{ success: boolean; message: string; categoria?: Record<string, unknown> }> {
        try {
            if (!this._objCategoria) {
                throw new Error("No se ha proporcionado un objeto de categoría válido");
            }

            const { nombreCategoria } = this._objCategoria;
            if (!nombreCategoria) {
                throw new Error("El nombre de la categoría es requerido");
            }

            await conexion.execute("START TRANSACTION");

            const result = await conexion.execute(
                'INSERT INTO categoria (nombreCategoria) VALUES (?)', 
                [nombreCategoria]
            );

            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const [categoria] = await conexion.query('SELECT * FROM categoria WHERE idCategoria = LAST_INSERT_ID()');
                await conexion.execute("COMMIT");
                return { success: true, message: "Categoría registrada correctamente", categoria: categoria };
            } else {
                throw new Error("No fue posible registrar la categoría");
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

    public async ActualizarCategoria(): Promise<{ success: boolean; message: string; categoria?: Record<string, unknown> }> {
        try {
            if (!this._objCategoria) {
                throw new Error("No se ha proporcionado un objeto de categoría válido");
            }

            const { idCategoria, nombreCategoria } = this._objCategoria;

            if (!idCategoria) {
                throw new Error("Se requiere el ID de la categoría para actualizarla");
            }

            if (!nombreCategoria) {
                throw new Error("El nombre de la categoría es requerido");
            }

            await conexion.execute("START TRANSACTION");

            const result = await conexion.execute(
                'UPDATE categoria SET nombreCategoria = ? WHERE idCategoria = ?',
                [nombreCategoria, idCategoria]
            );

            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const [categoria] = await conexion.query(
                    'SELECT * FROM categoria WHERE idCategoria = ?',
                    [idCategoria]
                );

                await conexion.execute("COMMIT");
                return { success: true, message: "Categoría actualizada correctamente", categoria: categoria };
            } else {
                throw new Error("No fue posible actualizar la categoría");
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

    public async EliminarCategoria(): Promise<{ success: boolean; message: string; categoria?: Record<string, unknown> }> {
        try {
            if (!this._objCategoria || !this._objCategoria.idCategoria) {
                throw new Error("No se ha proporcionado un ID de categoría válido");
            }

            const idCategoria = this._objCategoria.idCategoria;

            await conexion.execute("START TRANSACTION");

            // Verificar si la categoría tiene productos asociados
            const [productosAsociados] = await conexion.query(
                'SELECT COUNT(*) as total FROM producto WHERE idCategoria = ?',
                [idCategoria]
            );

            if (productosAsociados.total > 0) {
                await conexion.execute("ROLLBACK");
                return { 
                    success: false, 
                    message: `No se puede eliminar la categoría porque tiene ${productosAsociados.total} producto(s) asociado(s)` 
                };
            }

            // Verificar si la categoría existe
            const [categoriaExistente] = await conexion.query(
                'SELECT * FROM categoria WHERE idCategoria = ?',
                [idCategoria]
            );

            if (!categoriaExistente) {
                await conexion.execute("ROLLBACK");
                return { success: false, message: "La categoría no existe" };
            }

            const result = await conexion.execute(
                'DELETE FROM categoria WHERE idCategoria = ?',
                [idCategoria]
            );

            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                await conexion.execute("COMMIT");
                return {
                    success: true,
                    message: "Categoría eliminada correctamente",
                    categoria: categoriaExistente
                };
            } else {
                await conexion.execute("ROLLBACK");
                throw new Error("No fue posible eliminar la categoría");
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