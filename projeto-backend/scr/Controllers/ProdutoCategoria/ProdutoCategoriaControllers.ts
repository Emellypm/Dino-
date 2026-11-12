import { Request, Response } from "express"

import { ProdutoCategoriaServices } from "../../Services/ProdutoCategoria/ProdutoCategoriaServices"

class ProdutoCategoriaControllers {

    // CADASTRAR CATEGORIA NO PRODUTO
    async cadastrarProdutoCategoria(req: Request, res: Response) {

        const {
            produto_id,
            categoria_id
        } = req.body

        const enviarDadosServices = new ProdutoCategoriaServices()

        const resposta =
            await enviarDadosServices.cadastrarProdutoCategoria({
                produto_id,
                categoria_id
            })

        return res.json(resposta)
    }


    // VISUALIZAR TODOS OS VÍNCULOS
    async visualizarDados(req: Request, res: Response) {

        const enviarDadosServices = new ProdutoCategoriaServices()

        const resposta =
            await enviarDadosServices.visualizarDadosGeral()

        return res.json(resposta)
    }


    // APAGAR CATEGORIA DO PRODUTO
    async apagarProdutoCategoria(req: Request, res: Response) {

        const { id } = req.body

        const enviarDadosServices = new ProdutoCategoriaServices()

        const resposta =
            await enviarDadosServices.apagarProdutoCategoria(id)

        return res.json(resposta)
    }

}

export { ProdutoCategoriaControllers }