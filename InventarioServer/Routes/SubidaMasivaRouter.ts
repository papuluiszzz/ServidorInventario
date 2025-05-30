import { Router } from "../Dependencies/dependencias.ts";
import { 
    uploadMassiveProducts, 
    uploadMassiveCategories,
    downloadProductTemplate,
    downloadCategoryTemplate
} from "../Controllers/subidaMasivaController.ts";

const routerSubidaMasiva = new Router();

// Subida masiva de productos
routerSubidaMasiva.post("/subidamasiva/productos", uploadMassiveProducts);

// Subida masiva de categorías
routerSubidaMasiva.post("/subidamasiva/categorias", uploadMassiveCategories);

// Descargar plantillas
routerSubidaMasiva.get("/descargar/plantilla/productos", downloadProductTemplate);
routerSubidaMasiva.get("/descargar/plantilla/categorias", downloadCategoryTemplate);

export { routerSubidaMasiva };