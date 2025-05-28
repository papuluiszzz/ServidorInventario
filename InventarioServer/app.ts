import { Application, oakCors } from "./Dependencies/dependencias.ts";
import { routerUsuario } from "./Routes/usuarioRouter.ts";
import { routerFile } from "./Routes/fileRouter.ts";
import { routerCategoria } from "./Routes/categoriaRouter.ts";
import { routerProducto } from "./Routes/productoRouter.ts";
const app = new Application();

// Configurar CORS para permitir peticiones desde el frontend
app.use(oakCors({
    origin: "*", // En producción, especifica el dominio exacto
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware para manejar el tamaño máximo de archivos
app.use(async (ctx, next) => {
    const contentLength = ctx.request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) { // 5MB máximo
        ctx.response.status = 413;
        ctx.response.body = {
            success: false,
            message: "Archivo demasiado grande (máximo 5MB)"
        };
        return;
    }
    await next();
});

// Middleware para logging de peticiones
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.request.method} ${ctx.request.url} - ${ctx.response.status} - ${ms}ms`);
});

const routers = [routerUsuario, routerFile,
    routerCategoria,
    routerProducto];

routers.forEach((router) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
});
console.log("Servidor corriendo por el puerto 8000")

app.listen({port:8000});
