// deno-lint-ignore-file
import { ensureDir, extname } from "../Dependencies/dependencias.ts";

export const uploadFile = async(ctx: any) => {
    const { response, request } = ctx;

    try {
        console.log('🔄 Procesando upload...');
        
        // Verificar content-type
        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            console.log('❌ Content-type inválido:', contentType);
            response.status = 400;
            response.body = {
                success: false,
                message: "Content-type debe ser multipart/form-data"
            };
            return;
        }

        // Procesar FormData
        const formData = await request.body.formData();
        const file = formData.get("file") as File;

        if (!file || !file.name) {
            console.log('❌ Archivo no encontrado');
            response.status = 400;
            response.body = {
                success: false,
                message: "Archivo no encontrado"
            };
            return;
        }

        console.log('📄 Archivo recibido:', file.name, file.size, 'bytes');

        // Validaciones básicas
        if (!file.type.startsWith('image/')) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Solo se permiten imágenes"
            };
            return;
        }

        // Crear directorio
        const uploadDir = "./uploads/usuarios";
        await ensureDir(uploadDir);

        // Generar nombre único
        const timestamp = Date.now();
        const extension = extname(file.name) || '.jpg';
        const fileName = `${timestamp}${extension}`;
        const filePath = `${uploadDir}/${fileName}`;

        console.log('💾 Guardando archivo:', fileName);

        // Guardar archivo
        const arrayBuffer = await file.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        await Deno.writeFile(filePath, fileData);

        const fileUrl = `/uploads/usuarios/${fileName}`;
        console.log('✅ Archivo guardado:', fileUrl);

        // Respuesta simple y consistente
        response.status = 200;
        response.body = {
            success: true,
            message: "Archivo subido correctamente",
            data: {
                url: fileUrl,
                fileName: fileName,
                size: file.size
            }
        };

    } catch (error: any) {
        console.error("❌ Error en uploadFile:", error);
        response.status = 500;
        response.body = {
            success: false,
            message: "Error interno del servidor",
            error: error.message
        };
    }
};

export const updateUserPhoto = async(ctx: any) => {
    const { response, request, params } = ctx;

    try {
        const idUsuario = params.id;
        
        if (!idUsuario) {
            response.status = 400;
            response.body = {
                success: false,
                message: "ID de usuario requerido"
            };
            return;
        }

        // Verificar content-type
        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Content-type inválido"
            };
            return;
        }

        // Procesar FormData
        const formData = await request.body.formData();
        const file = formData.get("file") as File;

        if (!file || !file.name) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Archivo no encontrado"
            };
            return;
        }


        // Validaciones
        if (!file.type.startsWith('image/')) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Solo se permiten imágenes"
            };
            return;
        }

        // Crear directorio
        const uploadDir = "./uploads/usuarios";
        await ensureDir(uploadDir);

        // Generar nombre único
        const timestamp = Date.now();
        const extension = extname(file.name) || '.jpg';
        const fileName = `user_${idUsuario}_${timestamp}${extension}`;
        const filePath = `${uploadDir}/${fileName}`;


        // Guardar archivo
        const arrayBuffer = await file.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        await Deno.writeFile(filePath, fileData);

        const newPhotoUrl = `/uploads/usuarios/${fileName}`;

        // Respuesta simple y consistente
        response.status = 200;
        response.body = {
            success: true,
            message: "Foto actualizada correctamente",
            data: {
                fotoNueva: newPhotoUrl,
                fileName: fileName,
                size: file.size
            }
        };

    } catch (error: any) {
        console.error("❌ Error en updateUserPhoto:", error);
        response.status = 500;
        response.body = {
            success: false,
            message: "Error interno del servidor",
            error: error.message
        };
    }
};

export const getFile = async(ctx: any) => {
    const { response, params } = ctx;

    try {
        const fileName = params.filename;
        const filePath = `./uploads/usuarios/${fileName}`;

        // Verificar archivo
        let fileInfo;
        try {
            fileInfo = await Deno.stat(filePath);
            if (!fileInfo.isFile) {
                throw new Error("No es archivo");
            }
        } catch {
            response.status = 404;
            response.body = "Archivo no encontrado";
            return;
        }

        // Leer y servir archivo
        const file = await Deno.readFile(filePath);
        const extension = extname(fileName).toLowerCase();
        
        const mimeTypes: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        const contentType = mimeTypes[extension] || 'image/jpeg';

        response.headers.set("Content-Type", contentType);
        response.headers.set("Content-Length", file.length.toString());
        response.headers.set("Cache-Control", "public, max-age=3600");
        response.body = file;

    } catch (error) {
        console.error("Error al obtener archivo:", error);
        response.status = 500;
        response.body = "Error interno";
    }
};

export const deleteFile = async(ctx: any) => {
    const { response, request } = ctx;

    try {
        const body = await request.body.json();
        const fileName = body.fileName;

        if (!fileName) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Nombre de archivo requerido"
            };
            return;
        }

        const filePath = `./uploads/usuarios/${fileName}`;

        try {
            await Deno.stat(filePath);
            await Deno.remove(filePath);
            
            response.status = 200;
            response.body = {
                success: true,
                message: "Archivo eliminado"
            };
        } catch {
            response.status = 404;
            response.body = {
                success: false,
                message: "Archivo no encontrado"
            };
        }

    } catch (error) {
        console.error("Error al eliminar archivo:", error);
        response.status = 500;
        response.body = {
            success: false,
            message: "Error interno del servidor"
        };
    }
};