import { Request, Response } from "express";
import { UsuariosServices } from "../../Services/Usuarios/UsuariosServices";

class UsuariosControllers {
    async cadastrarUsuarios(req: Request, res: Response) {
        const { nome, email, senha, tipo } = req.body
        const enviarDadosServices = new UsuariosServices()
        const resposta = await enviarDadosServices.cadastrarUsuarios({
            nome,
            email,
            senha,
            tipo
        })
        return res.json(resposta)
    }
    async visualizarDadosGeral(req: Request, res: Response) {
    const usuarioId = req.usuarioId
    const enviarDados = new UsuariosServices()
    const resposta = await enviarDados.visualizarDadosGeral(usuarioId)
    return res.json(resposta)
}
    async visualizarUsuarioUnicoPost(req: Request, res: Response) {
        const { id } = req.body
        const enviarDados = new UsuariosServices()
        const resposta = await enviarDados.visualizarUsuarioUnicoPost(id)
        return res.json(resposta)
    }
    async alterarUsuarios(req: Request, res: Response) {
        const { id, email } = req.body
        const enviarDados = new UsuariosServices()
        const resposta = await enviarDados.alterarUsuarios({
            id,
            email
        })
        return res.json(resposta)
    }
    async apagarUsuarios(req: Request, res: Response) {
        const { id } = req.body
        const enviarDados = new UsuariosServices()
        const resposta = await enviarDados.apagarUsuarios(id)
        return res.json(resposta)
    }

}
export { UsuariosControllers}