import { Request, Response } from "express"
import { ClientesServices } from "../../Services/Clientes/ClientesServices"

class ClientesControllers {
    async cadastrarClientes(req: Request, res: Response) {
        const { nome, senha, telefone } = req.body
        const enviarDadosServices = new ClientesServices()

        const resposta = await enviarDadosServices.cadastrarClientes({
            nome,
            senha,
            telefone
        })

        return res.json(resposta)
    }

    async visualizarDadosGeralCli(req: Request, res: Response) {
        const enviarDados = new ClientesServices()
        const resposta = await enviarDados.visualizarDadosGeral()

        return res.json(resposta)
    }

    async visualizarClienteUnico(req: Request, res: Response) {
        const { id } = req.body
        const enviarDados = new ClientesServices()
        const resposta = await enviarDados.visualizarClienteUnico(id)

        return res.json(resposta)
    }

    async alterarClientes(req: Request, res: Response) {
        const { id, nome, telefone } = req.body
        const enviarDados = new ClientesServices()

        const resposta = await enviarDados.alterarClientes({
            id,
            nome,
            telefone
        })

        return res.json(resposta)
    }

    async apagarClientes(req: Request, res: Response) {
        const { id } = req.body
        const enviarDados = new ClientesServices()
        const resposta = await enviarDados.apagarClientes(id)

        return res.json(resposta)
    }

    async meuPerfil(req: Request, res: Response) {
        const enviarDados = new ClientesServices()
        const resposta = await enviarDados.visualizarClienteUnico(req.usuarioId)

        return res.json(resposta)
    }
}

export { ClientesControllers }