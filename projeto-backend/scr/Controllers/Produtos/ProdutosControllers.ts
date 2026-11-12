
import { Request, Response } from "express"
import { ProdutosServices } from "../../Services/Produtos/ProdutosServices"

class ProdutosControllers {
    async cadastrarProdutos(req: Request, res: Response) {
        const {
            nome,
            descricao,
            preco,
            estoque,
            sob_encomenda
        } = req.body

        if (!req.file) {
            throw new Error("Imagem não Enviada")
        }

        const imagem = req.file.filename
        const enviarDadosServices = new ProdutosServices()

        const resposta = await enviarDadosServices.cadastrarProdutos({
            nome,
            descricao,
            preco: Number(preco),
            imagem,
            estoque: Number(estoque),
            sob_encomenda: sob_encomenda === "true"
        })

        return res.json(resposta)
    }

    async visualizarDadosGeralPro(req: Request, res: Response) {
        const enviarDados = new ProdutosServices()
        const resposta = await enviarDados.visualizarDadosGeral()
        return res.json(resposta)
    }

    async visualizarProdutoUnico(req: Request, res: Response) {
        const { id } = req.body
        const enviarDados = new ProdutosServices()
        const resposta = await enviarDados.visualizarProdutoUnico(id)
        return res.json(resposta)
    }

    async alterarProdutos(req: Request, res: Response) {
        const {
            id,
            nome,
            descricao,
            preco,
            estoque,
            status,
            sob_encomenda
        } = req.body

        const imagem = req.file?.filename
        const enviarDados = new ProdutosServices()

        const resposta = await enviarDados.alterarProdutos({
            id,
            nome,
            descricao,
            preco: Number(preco),
            imagem,
            estoque: Number(estoque),
            status,
            sob_encomenda: sob_encomenda === "true"
        })

        return res.json(resposta)
    }

    async apagarProdutos(req: Request, res: Response) {
        const { id } = req.body
        const enviarDados = new ProdutosServices()
        const resposta = await enviarDados.apagarProdutos(id)
        return res.json(resposta)
    }
}

export { ProdutosControllers }
