
import { Request, Response } from "express"
import { PagamentosServices } from "../../Services/Pagamentos/PagamentosServices"

class PagamentosControllers {
    async visualizarDadosPagamentos(req: Request, res: Response) {
        const enviarDados = new PagamentosServices()

        const cliente_id = req.usuarioTipo === "CLIENTE"
            ? req.usuarioId
            : undefined

        const resposta = await enviarDados.visualizarDadosGeral(cliente_id)

        return res.json(resposta)
    }

    async visualizarPagamentoUnico(req: Request, res: Response) {
        const { id } = req.body
        const enviarDados = new PagamentosServices()

        const cliente_id = req.usuarioTipo === "CLIENTE"
            ? req.usuarioId
            : undefined

        const resposta = await enviarDados.visualizarPagamentoUnico(
            id,
            cliente_id
        )

        return res.json(resposta)
    }

    async alterarPagamentos(req: Request, res: Response) {
        const {
            id,
            status,
            metodo,
            valor
        } = req.body

        const enviarDados = new PagamentosServices()

        const resposta = await enviarDados.alterarPagamentos({
            id,
            status,
            metodo,
            valor: valor === undefined ? undefined : Number(valor)
        })

        return res.json(resposta)
    }
}

export { PagamentosControllers }
