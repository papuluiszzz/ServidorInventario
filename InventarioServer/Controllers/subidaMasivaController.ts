// deno-lint-ignore-file
import { conexion } from "../Models/conexion.ts";

export const uploadMassiveProducts = async (ctx: any) => {
    const { response, request } = ctx;

    try {
        console.log('🔄 Procesando archivo masivo de productos...');

        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Content-type debe ser multipart/form-data"
            };
            return;
        }

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

        // Validar que sea un archivo de texto
        const allowedTypes = ['text/plain', 'text/csv', 'application/csv'];
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Solo se permiten archivos CSV o TXT"
            };
            return;
        }

        console.log('📄 Archivo aceptado:', file.name, file.type, file.size, 'bytes');

        // Leer contenido del archivo
        const fileContent = await file.text();
        console.log('📄 Contenido leído, líneas:', fileContent.split('\n').length);
        
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        if (lines.length === 0) {
            response.status = 400;
            response.body = {
                success: false,
                message: "El archivo está vacío"
            };
            return;
        }

        console.log('📄 Líneas válidas para procesar:', lines.length);

        const results = {
            total: 0,
            success: 0,
            errors: 0,
            details: [] as any[]
        };

        // Procesar cada línea
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            results.total++;

            try {
                // Formato esperado: descripcion|cantidad|precio|unidadMedida|nombreCategoria
                const parts = line.split('|').map(part => part.trim());
                
                if (parts.length !== 5) {
                    throw new Error(`Línea ${i + 1}: Formato incorrecto. Se esperan 5 campos separados por |`);
                }

                const [descripcion, cantidad, precio, unidadMedida, nombreCategoria] = parts;

                // Validar campos obligatorios
                if (!descripcion || !cantidad || !precio || !unidadMedida || !nombreCategoria) {
                    throw new Error(`Línea ${i + 1}: Todos los campos son obligatorios`);
                }

                // Buscar o crear categoría
                let [categoria] = await conexion.query(
                    'SELECT idCategoria FROM categoria WHERE nombreCategoria = ?',
                    [nombreCategoria]
                );

                let idCategoria;
                if (!categoria) {
                    // Crear nueva categoría
                    await conexion.execute(
                        'INSERT INTO categoria (nombreCategoria) VALUES (?)',
                        [nombreCategoria]
                    );
                    
                    // Obtener el ID de la categoría recién creada
                    const [nuevaCategoria] = await conexion.query(
                        'SELECT idCategoria FROM categoria WHERE nombreCategoria = ?',
                        [nombreCategoria]
                    );
                    
                    if (nuevaCategoria) {
                        idCategoria = nuevaCategoria.idCategoria;
                    } else {
                        throw new Error(`Línea ${i + 1}: No se pudo crear la categoría ${nombreCategoria}`);
                    }
                } else {
                    idCategoria = categoria.idCategoria;
                }

                // Insertar producto
                await conexion.execute(
                    'INSERT INTO producto (descripcion, cantidad, precio, unidadMedida, idCategoria) VALUES (?, ?, ?, ?, ?)',
                    [descripcion, cantidad, precio, unidadMedida, idCategoria]
                );

                results.success++;
                results.details.push({
                    line: i + 1,
                    status: 'success',
                    producto: descripcion,
                    categoria: nombreCategoria
                });

            } catch (error: any) {
                results.errors++;
                results.details.push({
                    line: i + 1,
                    status: 'error',
                    error: error.message
                });
                console.error(`Error en línea ${i + 1}:`, error.message);
            }
        }

        console.log(`✅ Procesamiento completado: ${results.success} éxitos, ${results.errors} errores de ${results.total} total`);

        response.status = 200;
        response.headers.set("Content-Type", "application/json");
        response.body = JSON.stringify({
            success: true,
            message: `Procesamiento completado: ${results.success} productos insertados, ${results.errors} errores`,
            data: results
        });

    } catch (error: any) {
        console.error("❌ Error en uploadMassiveProducts:", error);
        response.status = 500;
        response.headers.set("Content-Type", "application/json");
        response.body = JSON.stringify({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

export const uploadMassiveCategories = async (ctx: any) => {
    const { response, request } = ctx;

    try {
        console.log('🔄 Procesando archivo masivo de categorías...');

        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Content-type debe ser multipart/form-data"
            };
            return;
        }

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

        // Validar tipo de archivo
        const allowedTypes = ['text/plain', 'text/csv', 'application/csv'];
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
            response.status = 400;
            response.body = {
                success: false,
                message: "Solo se permiten archivos CSV o TXT"
            };
            return;
        }

        // Leer contenido
        const fileContent = await file.text();
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        if (lines.length === 0) {
            response.status = 400;
            response.body = {
                success: false,
                message: "El archivo está vacío"
            };
            return;
        }

        const results = {
            total: 0,
            success: 0,
            errors: 0,
            details: [] as any[]
        };

        // Procesar cada línea
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            results.total++;

            try {
                const nombreCategoria = line.trim();

                if (!nombreCategoria) {
                    throw new Error(`Línea ${i + 1}: El nombre de la categoría no puede estar vacío`);
                }

                // Verificar si ya existe
                const [categoriaExistente] = await conexion.query(
                    'SELECT idCategoria FROM categoria WHERE nombreCategoria = ?',
                    [nombreCategoria]
                );

                if (categoriaExistente) {
                    results.details.push({
                        line: i + 1,
                        status: 'skipped',
                        categoria: nombreCategoria,
                        message: 'Ya existe'
                    });
                    continue;
                }

                // Insertar nueva categoría
                await conexion.execute(
                    'INSERT INTO categoria (nombreCategoria) VALUES (?)',
                    [nombreCategoria]
                );

                results.success++;
                results.details.push({
                    line: i + 1,
                    status: 'success',
                    categoria: nombreCategoria
                });

            } catch (error: any) {
                results.errors++;
                results.details.push({
                    line: i + 1,
                    status: 'error',
                    error: error.message
                });
                console.error(`Error en línea ${i + 1}:`, error.message);
            }
        }

        console.log(`✅ Procesamiento completado: ${results.success} éxitos, ${results.errors} errores de ${results.total} total`);

        response.status = 200;
        response.headers.set("Content-Type", "application/json");
        response.body = JSON.stringify({
            success: true,
            message: `Procesamiento completado: ${results.success} categorías insertadas, ${results.errors} errores`,
            data: results
        });

    } catch (error: any) {
        console.error("❌ Error en uploadMassiveCategories:", error);
        response.status = 500;
        response.headers.set("Content-Type", "application/json");
        response.body = JSON.stringify({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

export const downloadProductTemplate = async (ctx: any) => {
    const { response } = ctx;

    try {
        const template = `# Plantilla para subida masiva de productos
# Formato: descripcion|cantidad|precio|unidadMedida|nombreCategoria
# Ejemplo:
iPhone 15 Pro|50|1299.99|unidades|Electrónicos
MacBook Air M3|20|1499.99|unidades|Computadoras
Escritorio de oficina|10|299.99|unidades|Muebles
Silla ergonómica|25|199.99|unidades|Muebles`;

        response.headers.set("Content-Type", "text/plain");
        response.headers.set("Content-Disposition", "attachment; filename=plantilla_productos.txt");
        response.body = template;

    } catch (error: any) {
        console.error("Error al generar plantilla:", error);
        response.status = 500;
        response.body = {
            success: false,
            message: "Error interno del servidor"
        };
    }
};

export const downloadCategoryTemplate = async (ctx: any) => {
    const { response } = ctx;

    try {
        const template = `# Plantilla para subida masiva de categorías
# Una categoría por línea
# Ejemplo:
Electrónicos
Computadoras
Muebles
Ropa
Hogar
Deportes`;

        response.headers.set("Content-Type", "text/plain");
        response.headers.set("Content-Disposition", "attachment; filename=plantilla_categorias.txt");
        response.body = template;

    } catch (error: any) {
        console.error("Error al generar plantilla:", error);
        response.status = 500;
        response.body = {
            success: false,
            message: "Error interno del servidor"
        };
    }
};