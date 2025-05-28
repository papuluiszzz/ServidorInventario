// deno-lint-ignore-file
import { Producto } from "../Models/productoModel.ts";

export const getProducto = async (ctx: any) => {
    const { response } = ctx;

    try {
        const objProducto = new Producto();
        const listaProductos = await objProducto.SeleccionarProductos();
        response.status = 200;
        response.body = {
            success: true,
            data: listaProductos,
            count: listaProductos.length
        };
    } catch (error) {
        response.status = 400;
        response.body = {
            success: false,
            message: "Error al procesar la solicitud",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

export const getProductoPorId = async (ctx: any) => {
    const { response, params } = ctx;

    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                message: "ID de producto inválido"
            };
            return;
        }

        const objProducto = new Producto();
        const producto = await objProducto.SeleccionarProductoPorId(id);
        
        if (!producto) {
            response.status = 404;
            response.body = {
                success: false,
                message: "Producto no encontrado"
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            data: producto
        };
    } catch (error) {
        response.status = 400;
        response.body = {
            success: false,
            message: "Error al procesar la solicitud",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

export const getProductosPorCategoria = async (ctx: any) => {
    const { response, params } = ctx;

    try {
        const idCategoria = parseInt(params.idCategoria);
        if (isNaN(idCategoria)) {
            response.status = 400;
            response.body = {
                success: false,
                message: "ID de categoría inválido"
            };
            return;
        }

        const objProducto = new Producto();
        const productos = await objProducto.SeleccionarProductosPorCategoria(idCategoria);
        
        response.status = 200;
        response.body = {
            success: true,
            data: productos,
            count: productos.length
        };
    } catch (error) {
        response.status = 400;
        response.body = {
            success: false,
            message: "Error al procesar la solicitud",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

export const postProducto = async (ctx: any) => {
    const { response, request } = ctx;
    
    try {
        const contentLength = request.headers.get("Content-Length");

        if (contentLength === "0") {
            response.status = 400;
            response.body = {
                success: false,
                message: "El cuerpo de la solicitud se encuentra vacío."
            };
            return;
        }

        const body = await request.body.json();
        const productoData = {
            idProducto: null,
            descripcion: body.descripcion,
            cantidad: body.cantidad,
            precio: body.precio,
            unidadMedida: body.unidadMedida,
            idCategoria: body.idCategoria
        };

        const objProducto = new Producto(productoData);
        const result = await objProducto.InsertarProducto();
        
        response.status = result.success ? 200 : 400;
        response.body = result;

    } catch (error) {
        response.status = 400;
        response.body = {
            success: false,
            message: "Error al procesar la solicitud",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

export const putProducto = async (ctx: any) => {
    const { response, request } = ctx;

    try {
        const contentLength = request.headers.get("Content-Length");

        if (contentLength === "0") {
            response.status = 400;
            response.body = {
                success: false,
                message: "Cuerpo de la solicitud está vacío"
            };
            return;
        }

        const body = await request.body.json();
        const productoData = {
            idProducto: body.idProducto,
            descripcion: body.descripcion,
            cantidad: body.cantidad,
            precio: body.precio,
            unidadMedida: body.unidadMedida,
            idCategoria: body.idCategoria
        };

        const objProducto = new Producto(productoData);
        const result = await objProducto.ActualizarProducto();
        
        response.status = result.success ? 200 : 400;
        response.body = result;

    } catch (error) {
        response.status = 400;
        response.body = {
            success: false,
            message: "Error al procesar la solicitud",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

export const deleteProducto = async (ctx: any) => {
    const { response, request } = ctx;
    
    try {
        const contentLength = request.headers.get("Content-Length");
        if (contentLength === "0") {
            response.status = 400;
            response.body = {
                success: false,
                message: "El ID del producto es requerido para eliminarlo"
            };
            return;
        }

        const body = await request.body.json();
        if (!body.idProducto) {
            response.status = 400;
            response.body = {
                success: false,
                message: "El ID del producto es requerido para eliminarlo"
            };
            return;
        }

        const productoData = {
            idProducto: body.idProducto,
            descripcion: "",
            cantidad: "",
            precio: "",
            unidadMedida: "",
            idCategoria: 0
        };

        const objProducto = new Producto(productoData);
        const result = await objProducto.EliminarProducto();
        
        response.status = result.success ? 200 : 400;
        response.body = result;

    } catch (error) {
        response.status = 400;
        response.body = {
            success: false,
            message: "Error al procesar la solicitud",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};