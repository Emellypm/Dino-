import { Request, Response } from "express"

import { ItensPedidoServices } from "../../Services/ItensPedido/ItensPedidoServices"

class ItensPedidoControllers {

    async cadastrarItensPedido(req: Request, res: Response) {
        const {
            pedido_id,
            produto_id,
            quantidade
        } = req.body

        const enviarDadosServices = new ItensPedidoServices()

        const cliente_id = req.usuarioTipo === "CLIENTE"
            ? req.usuarioId
            : undefined

        const resposta = await enviarDadosServices.cadastrarItensPedido({
            pedido_id,
            produto_id,
            quantidade
        }, cliente_id)

        return res.json(resposta)
    }

    async visualizarDadosIP(req: Request, res: Response) {
        const enviarDados = new ItensPedidoServices()

        const cliente_id = req.usuarioTipo === "CLIENTE"
            ? req.usuarioId
            : undefined

        const resposta = await enviarDados.visualizarDadosGeral(cliente_id)

        return res.json(resposta)
    }

    async visualizarItemUnico(req: Request, res: Response) {
        const { id } = req.body

        const enviarDados = new ItensPedidoServices()

        const cliente_id = req.usuarioTipo === "CLIENTE"
            ? req.usuarioId
            : undefined

        const resposta = await enviarDados.visualizarItemUnico(id, cliente_id)

        return res.json(resposta)
    }

    async alterarItensPedido(req: Request, res: Response) {
        const {
            id,
            quantidade
        } = req.body

        const enviarDados = new ItensPedidoServices()

        const cliente_id = req.usuarioTipo === "CLIENTE"
            ? req.usuarioId
            : undefined

        const resposta = await enviarDados.alterarItensPedido({
            id,
            quantidade
        }, cliente_id)

        return res.json(resposta)
    }

    async apagarItensPedido(req: Request, res: Response) {
        const { id } = req.body

        const enviarDados = new ItensPedidoServices()

        const cliente_id = req.usuarioTipo === "CLIENTE"
            ? req.usuarioId
            : undefined

        const resposta = await enviarDados.apagarItensPedido(id, cliente_id)

        return res.json(resposta)
    }

}

export { ItensPedidoControllers }