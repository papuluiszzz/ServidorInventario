// deno-lint-ignore-file
import { Usuario } from '../Models/usuarioModel.ts';


export const getUsuario = async(ctx:any)=>{
    const {response} = ctx;

    try{
        const objUsuario = new Usuario();
        const listaUsuario = await objUsuario.SeleccionarUsuario();
        response.status = 200;
        response.body = {
            success:true,
            data:listaUsuario,
        }
    }catch(error){

        response.status = 400;
        response.body = {
            success:false,
            message:"Error al procesar la solicitud",
            errors:error
        }

    }

};

export const postUsuario = async(ctx:any)=>{
    const {response,request} = ctx;
    try{
       const contentLength = request.headers.get("Content-Length");

        if (contentLength === "0") {
            response.status = 400;
            response.body = {success:false,  message:"El cuerpo de la solicitud se encuentra vacío."};
            return;
    }
     const body = await request.body.json();
        const UsuarioData = {
            idUsuario: null,
            nombre: body.nombre,
            apellido: body.apellido,
            foto:body.foto
     
        }
        const objUsuario = new Usuario(UsuarioData)
        const result = await objUsuario.InsertarUsuario();
        response.body = {
            success:true,
            body:result
        };

    }catch(error){

        response.status = 400;
        response.body = {
            success:false,
            message:"Error al procesar la solicitud",
            errors:error
        }

    }
    
};

export const putUsuario = async(ctx: any)=>{
    const {response,request} = ctx;

    try{
        const contentLength = request.headers.get("Content-Length");

        if (contentLength === "0") {

            response.status = 400;
            response.body = {success: false,  message: "Cuerpo de la solicitud esta vacio"};
            return;
        }

        const body = await request.body.json();
        const UsuarioData = {

            idUsuario: body.idUsuario,
            nombre: body.nombre,
            apellido: body.apellido,
            foto:body.foto
        }

        const objUsuario = new Usuario(UsuarioData);
        const result = await objUsuario.ActualizarUsuario();
        response.status = 200;
        response.body = {
            success:true,
            body:result,
        };

    }catch(error){
        response.status = 400;
        response.body = {
            success:false,
            message:"Error al procesar la solicitud"
        }
    }
};

export const deleteUsuario = async (ctx: any) => {
    const { response, request } = ctx;
    try {
        const contentLength = request.headers.get("Content-Length");
        if (contentLength === "0") {
            response.status = 400;
            response.body = { success: false, message: "El ID del usuario es requerido para eliminarlo" };
            return;
        }

        const body = await request.body.json();
        if (!body.idUsuario) {
            response.status = 400;
            response.body = { success: false, message: "El ID del usuario es requerido para eliminarlo" };
            return;
        }

        // Forma más consistente de crear el objeto Cliente para eliminación
        const UsuarioData = {
            idUsuario: body.idUsuario,
            nombre: "",
            apellido: "",
            foto:""
        };
        
        const objUsuario = new Usuario(UsuarioData);
        const result = await objUsuario.EliminarUsuario();

        response.status = 200;
        response.body = {
            success: true,
            body: result,
        };
    } catch (error) {
        response.status = 400;
        response.body = {
            success: false,
            message: "Error al procesar la solicitud"
        }
    }
};
