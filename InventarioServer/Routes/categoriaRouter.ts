import { Router } from "../Dependencies/dependencias.ts";
import { getCategoria, postCategoria, putCategoria, deleteCategoria } from "../Controllers/categoriaController.ts";

const routerCategoria = new Router();

routerCategoria.get("/categoria", getCategoria);
routerCategoria.post("/categoria", postCategoria);
routerCategoria.put("/categoria", putCategoria);
routerCategoria.delete("/categoria", deleteCategoria);

export { routerCategoria };