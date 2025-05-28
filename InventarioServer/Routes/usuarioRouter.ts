import { Router } from "../Dependencies/dependencias.ts";
import { getUsuario,postUsuario,putUsuario,deleteUsuario } from "../Controllers/usuarioController.ts";


const routerUsuario = new Router();

routerUsuario.get("/usuario",getUsuario);
routerUsuario.post("/usuario",postUsuario);
routerUsuario.put("/usuario",putUsuario);
routerUsuario.delete("/usuario",deleteUsuario)

export {routerUsuario}
