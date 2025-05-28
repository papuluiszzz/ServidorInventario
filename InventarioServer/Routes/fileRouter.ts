import { Router } from "../Dependencies/dependencias.ts";
import { uploadFile, getFile, deleteFile } from "../Controllers/fileController.ts";

const routerFile = new Router();

// Subir foto de usuario
routerFile.post("/upload", uploadFile);

// Obtener foto de usuario por nombre
routerFile.get("/uploads/usuarios/:filename", getFile);

// Eliminar foto de usuario
routerFile.delete("/upload", deleteFile);

export { routerFile };