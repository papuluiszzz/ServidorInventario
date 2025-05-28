import { Router } from "../Dependencies/dependencias.ts";
import { uploadFile, getFile, deleteFile, updateUserPhoto } from "../Controllers/fileController.ts";

const routerFile = new Router();

// Endpoint de prueba


// Subir foto de usuario
routerFile.post("/upload", uploadFile);

// Actualizar foto de usuario específico
routerFile.put("/usuario/:id/foto", updateUserPhoto);

// Obtener foto de usuario por nombre
routerFile.get("/uploads/usuarios/:filename", getFile);

// Eliminar foto de usuario
routerFile.delete("/upload", deleteFile);

export { routerFile };