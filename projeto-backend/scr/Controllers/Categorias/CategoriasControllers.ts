import { Request, Response } from "express"
import { CategoriasServices } from "../../Services/Categorias/CaregoriasServices"

class CategoriasControllers {

    async cadastrarCategorias(req: Request, res: Response) {

        const { nome, descricao } = req.body

        const enviarDadosServices = new CategoriasServices()

        const resposta = await enviarDadosServices.cadastrarCategorias({
            nome,
            descricao
        })

        return res.json(resposta)
    }

    async visualizarDadosGeralCat(req: Request, res: Response) {

        const enviarDados = new CategoriasServices()

        const resposta = await enviarDados.visualizarDadosGeral()

        return res.json(resposta)
    }

    async visualizarCategoriaUnica(req: Request, res: Response) {

        const { id } = req.body

        const enviarDados = new CategoriasServices()

        const resposta = await enviarDados.visualizarCategoriaUnica(id)

        return res.json(resposta)
    }

    async alterarCategorias(req: Request, res: Response) {

        const { id, nome, descricao } = req.body

        const enviarDados = new CategoriasServices()

        const resposta = await enviarDados.alterarCategorias({
            id,
            nome,
            descricao
        })

        return res.json(resposta)
    }

    async apagarCategorias(req: Request, res: Response) {

        const { id } = req.body

        const enviarDados = new CategoriasServices()

        const resposta = await enviarDados.apagarCategorias(id)

        return res.json(resposta)
    }

}

export { CategoriasControllers }