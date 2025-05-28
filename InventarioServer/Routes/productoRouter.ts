import { Router } from "../Dependencies/dependencias.ts";
import { 
    getProducto, 
    getProductoPorId, 
    getProductosPorCategoria, 
    postProducto, 
    putProducto, 
    deleteProducto 
} from "../Controllers/productoController.ts";

const routerProducto = new Router();

routerProducto.get("/producto", getProducto);
routerProducto.get("/producto/:id", getProductoPorId);
routerProducto.get("/producto/categoria/:idCategoria", getProductosPorCategoria);
routerProducto.post("/producto", postProducto);
routerProducto.put("/producto", putProducto);
routerProducto.delete("/producto", deleteProducto);

export { routerProducto };