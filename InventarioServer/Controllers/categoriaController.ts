// deno-lint-ignore-file
import { Categoria } from "../Models/categoriaModel.ts";

export const getCategoria = async (ctx: any) => {
    const { response } = ctx;

    try {
        const objCategoria = new Categoria();
        const listaCategorias = await objCategoria.SeleccionarCategorias();
        response.status = 200;
        response.body = {
            success: true,
            data: listaCategorias,
            count: listaCategorias.length
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

export const postCategoria = async (ctx: any) => {
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
        const categoriaData = {
            idCategoria: null,
            nombreCategoria: body.nombreCategoria
        };

        const objCategoria = new Categoria(categoriaData);
        const result = await objCategoria.InsertarCategoria();
        
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

export const putCategoria = async (ctx: any) => {
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
        const categoriaData = {
            idCategoria: body.idCategoria,
            nombreCategoria: body.nombreCategoria
        };

        const objCategoria = new Categoria(categoriaData);
        const result = await objCategoria.ActualizarCategoria();
        
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

export const deleteCategoria = async (ctx: any) => {
    const { response, request } = ctx;
    
    try {
        const contentLength = request.headers.get("Content-Length");
        if (contentLength === "0") {
            response.status = 400;
            response.body = {
                success: false,
                message: "El ID de la categoría es requerido para eliminarla"
            };
            return;
        }

        const body = await request.body.json();
        if (!body.idCategoria) {
            response.status = 400;
            response.body = {
                success: false,
                message: "El ID de la categoría es requerido para eliminarla"
            };
            return;
        }

        const categoriaData = {
            idCategoria: body.idCategoria,
            nombreCategoria: ""
        };

        const objCategoria = new Categoria(categoriaData);
        const result = await objCategoria.EliminarCategoria();
        
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