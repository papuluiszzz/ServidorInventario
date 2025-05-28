// deno-lint-ignore-file
import { ensureDir, extname } from "../Dependencies/dependencias.ts";
import { conexion } from "../Models/conexion.ts";

export const uploadFile = async(ctx: any) => {
    const { response, request } = ctx;

    try {
        // Verificar que el contenido sea multipart/form-data
        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Content-type debe ser multipart/form-data"
            };
            return;
        }

        // Extraer el archivo del FormData
        const formData = await request.body.formData();
        const file = formData.get("file") as File;

        if (!file || !file.name) {
            response.status = 400;
            response.body = {
                success: false,
                message: "No se encontró el archivo en el campo file"
            };
            return;
        }

        // Validar tipos de archivo permitidos (solo imágenes para fotos de usuario)
        const allowedTypes = [
            "image/jpeg", 
            "image/png", 
            "image/gif", 
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            response.status = 400;
            response.body = {
                success: false,
                message: `Tipo de archivo no permitido: ${file.type}. Solo se permiten imágenes (JPG, PNG, GIF, WebP)`
            };
            return;
        }

        // Validar tamaño máximo (3MB para fotos de perfil)
        const maxSize = 3 * 1024 * 1024; // 3MB
        if (file.size > maxSize) {
            response.status = 400;
            response.body = {
                success: false,
                message: "El archivo es demasiado grande (máximo 3MB)"
            };
            return;
        }

        // Crear directorio de uploads si no existe
        const uploadDir = "./uploads/usuarios";
        await ensureDir(uploadDir);

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const extension = extname(file.name);
        const uniqueId = crypto.randomUUID();
        const fileName = `usuario_${timestamp}_${uniqueId}${extension}`;
        const filePath = `${uploadDir}/${fileName}`;

        // Convertir y guardar el archivo
        const arrayBuffer = await file.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        await Deno.writeFile(filePath, fileData);

        // Respuesta exitosa
        response.status = 200;
        response.body = {
            success: true,
            message: "Foto subida correctamente",
            data: {
                originalName: file.name,
                fileName: fileName,
                filePath: filePath,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString(),
                url: `/uploads/usuarios/${fileName}`
            }
        };

    } catch (error) {
        console.error("Error al subir foto:", error);
        response.status = 500;
        response.body = {
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : String(error)
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

        // Verificar que el contenido sea multipart/form-data
        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Content-type debe ser multipart/form-data"
            };
            return;
        }

        // Extraer el archivo del FormData
        const formData = await request.body.formData();
        const file = formData.get("file") as File;

        if (!file || !file.name) {
            response.status = 400;
            response.body = {
                success: false,
                message: "No se encontró el archivo en el campo file"
            };
            return;
        }

        // Validar tipos y tamaño (igual que en uploadFile)
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            response.status = 400;
            response.body = {
                success: false,
                message: `Tipo de archivo no permitido: ${file.type}. Solo se permiten imágenes`
            };
            return;
        }

        const maxSize = 3 * 1024 * 1024; // 3MB
        if (file.size > maxSize) {
            response.status = 400;
            response.body = {
                success: false,
                message: "El archivo es demasiado grande (máximo 3MB)"
            };
            return;
        }

        // Obtener datos del usuario actual para obtener la foto anterior
        const [usuarioActual] = await conexion.query('SELECT foto FROM usuario WHERE idUsuario = ?', [idUsuario]);
        
        if (!usuarioActual) {
            response.status = 404;
            response.body = {
                success: false,
                message: "Usuario no encontrado"
            };
            return;
        }

        // Crear directorio de uploads si no existe
        const uploadDir = "./uploads/usuarios";
        await ensureDir(uploadDir);

        // Generar nombre único para la nueva foto
        const timestamp = Date.now();
        const extension = extname(file.name);
        const uniqueId = crypto.randomUUID();
        const fileName = `usuario_${timestamp}_${uniqueId}${extension}`;
        const filePath = `${uploadDir}/${fileName}`;

        // Guardar la nueva foto
        const arrayBuffer = await file.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        await Deno.writeFile(filePath, fileData);

        // Actualizar la base de datos con la nueva foto
        const newPhotoUrl = `/uploads/usuarios/${fileName}`;
        await conexion.execute(
            'UPDATE usuario SET foto = ? WHERE idUsuario = ?',
            [newPhotoUrl, idUsuario]
        );

        // Eliminar la foto anterior si existe
        if (usuarioActual.foto && usuarioActual.foto.startsWith('/uploads/usuarios/')) {
            const oldFileName = usuarioActual.foto.replace('/uploads/usuarios/', '');
            const oldFilePath = `${uploadDir}/${oldFileName}`;
            
            try {
                await Deno.remove(oldFilePath);
            } catch (error) {
                console.warn(`No se pudo eliminar la foto anterior: ${oldFilePath}`, error);
                // No es un error crítico, continuamos
            }
        }

        // Obtener el usuario actualizado
        const [usuarioActualizado] = await conexion.query('SELECT * FROM usuario WHERE idUsuario = ?', [idUsuario]);

        response.status = 200;
        response.body = {
            success: true,
            message: "Foto de usuario actualizada correctamente",
            data: {
                usuario: usuarioActualizado,
                fotoAnterior: usuarioActual.foto,
                fotoNueva: newPhotoUrl,
                archivoInfo: {
                    originalName: file.name,
                    fileName: fileName,
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString()
                }
            }
        };

    } catch (error) {
        console.error("Error al actualizar foto de usuario:", error);
        response.status = 500;
        response.body = {
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

export const getFile = async(ctx: any) => {
    const { response, params } = ctx;

    try {
        const fileName = params.filename;
        const filePath = `./uploads/usuarios/${fileName}`;

        // Verificar si el archivo existe
        try {
            const fileInfo = await Deno.stat(filePath);
            if (!fileInfo.isFile) {
                throw new Error("No es un archivo");
            }
        } catch {
            response.status = 404;
            response.body = {
                success: false,
                message: "Foto no encontrada"
            };
            return;
        }

        // Leer el archivo
        const file = await Deno.readFile(filePath);

        // Determinar el tipo MIME según la extensión
        const extension = extname(fileName).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        const contentType = mimeTypes[extension] || 'application/octet-stream';

        // Configurar headers y enviar archivo
        response.headers.set("Content-Type", contentType);
        response.headers.set("Content-Length", file.length.toString());
        response.headers.set("Content-Disposition", `inline; filename="${fileName}"`);
        response.headers.set("Cache-Control", "public, max-age=31536000"); // Cache por 1 año
        response.body = file;

    } catch (error) {
        console.error("Error al obtener foto:", error);
        response.status = 500;
        response.body = {
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

export const deleteFile = async(ctx: any) => {
    const { response, request } = ctx;

    try {
        const contentLength = request.headers.get("Content-Length");
        if (contentLength === "0") {
            response.status = 400;
            response.body = {
                success: false,
                message: "Nombre del archivo requerido"
            };
            return;
        }

        const body = await request.body.json();
        const fileName = body.fileName;

        if (!fileName) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Nombre del archivo requerido"
            };
            return;
        }

        const filePath = `./uploads/usuarios/${fileName}`;

        // Verificar que el archivo existe
        try {
            await Deno.stat(filePath);
        } catch {
            response.status = 404;
            response.body = {
                success: false,
                message: "Foto no encontrada"
            };
            return;
        }

        // Eliminar el archivo
        await Deno.remove(filePath);

        response.status = 200;
        response.body = {
            success: true,
            message: "Foto eliminada correctamente"
        };

    } catch (error) {
        console.error("Error al eliminar foto:", error);
        response.status = 500;
        response.body = {
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};