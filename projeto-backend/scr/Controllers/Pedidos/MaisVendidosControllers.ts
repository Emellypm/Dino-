import { Request, Response } from "express"
import { MaisVendidosServices } from "../../Services/Pedidos/MaisVendidosServices"

class MaisVendidosControllers {

    async visualizarMaisVendidos(req: Request, res: Response) {

        const service = new MaisVendidosServices()

        const resposta = await service.visualizarMaisVendidos()

        return res.json(resposta)
    }
}

export { MaisVendidosControllers }