import { Request, Response } from 'express'
import { LogarClientesServices } from '../../Services/LoginClientes/LoginClientesServices'

class LoginClientesControllers {
    async logarClientes(req: Request, res: Response) {
        const { telefone, senha } = req.body
        const enviarDadosServices = new LogarClientesServices()
        const resposta = await enviarDadosServices.logarClientes({
            telefone,
            senha
        })
        return res.json(resposta)
    }
}
export { LoginClientesControllers }