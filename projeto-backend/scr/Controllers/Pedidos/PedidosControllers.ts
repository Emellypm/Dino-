
import { Request, Response } from "express"
import { PedidosServices } from "../../Services/Pedidos/PedidosServices"

class PedidosControllers {
    async finalizarPedido(req: Request, res: Response) {
        const { observacao, itens } = req.body

        const enviarDados = new PedidosServices()

        const resposta = await enviarDados.finalizarPedido({
            cliente_id: req.usuarioId,
            observacao,
            itens
        })

        return res.json(resposta)
    }

    async visualizarDadosPedidos(req: Request, res: Response) {
        const enviarDados = new PedidosServices()

        const cliente_id = req.usuarioTipo === "CLIENTE"
            ? req.usuarioId
            : undefined

        const resposta = await enviarDados.visualizarDadosGeral(cliente_id)

        return res.json(resposta)
    }

    async meusPedidos(req: Request, res: Response) {
        const enviarDados = new PedidosServices()
        const resposta = await enviarDados.visualizarDadosGeral(req.usuarioId)
        return res.json(resposta)
    }

    async visualizarPedidoUnico(req: Request, res: Response) {
        const { id } = req.body
        const enviarDados = new PedidosServices()

        const cliente_id = req.usuarioTipo === "CLIENTE"
            ? req.usuarioId
            : undefined

        const resposta = await enviarDados.visualizarPedidoUnico(id, cliente_id)

        return res.json(resposta)
    }

    async gerarWhatsApp(req: Request, res: Response) {
        const { id } = req.body
        const enviarDados = new PedidosServices()

        const cliente_id = req.usuarioTipo === "CLIENTE"
            ? req.usuarioId
            : undefined

        const resposta = await enviarDados.gerarWhatsApp(id, cliente_id)

        return res.json(resposta)
    }

    async alterarPedidos(req: Request, res: Response) {
        const { id, status, observacao } = req.body
        const enviarDados = new PedidosServices()

        const resposta = await enviarDados.alterarPedidos({
            id,
            status,
            observacao
        })

        return res.json(resposta)
    }

    async apagarPedidos(req: Request, res: Response) {
        const { id } = req.body
        const enviarDados = new PedidosServices()
        const resposta = await enviarDados.apagarPedidos(id)
        return res.json(resposta)
    }
}

export { PedidosControllers }
