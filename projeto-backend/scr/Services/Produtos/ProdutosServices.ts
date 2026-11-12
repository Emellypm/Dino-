
import prismaClient from "../../Prisma/PrismaClient"

interface CadProdutos {
    nome: string
    descricao: string
    preco: number
    imagem: string
    estoque: number
    sob_encomenda: boolean
}

interface AlterarProdutos {
    id: string
    nome: string
    descricao: string
    preco: number
    imagem?: string
    estoque: number
    status: "ATIVO" | "INATIVO"
    sob_encomenda: boolean
}

class ProdutosServices {
    async cadastrarProdutos({
        nome,
        descricao,
        preco,
        imagem,
        estoque,
        sob_encomenda
    }: CadProdutos) {
        const produto = await prismaClient.produtos.create({
            data: {
                nome,
                descricao,
                preco,
                imagem,
                estoque,
                sob_encomenda
            }
        })

        return {
            dados: "Dados Salvos Com Sucesso",
            produto_id: produto.id
        }
    }

    async visualizarDadosGeral() {
        const resposta = await prismaClient.produtos.findMany({
            select: {
                id: true,
                nome: true,
                descricao: true,
                preco: true,
                imagem: true,
                estoque: true,
                sob_encomenda: true,
                status: true,
                categorias: {
                    select: {
                        categoria: {
                            select: {
                                id: true,
                                nome: true,
                                descricao: true
                            }
                        }
                    }
                }
            }
        })

        return resposta
    }

    async visualizarProdutoUnico(id: string) {
        const resposta = await prismaClient.produtos.findFirst({
            where: { id },
            select: {
                id: true,
                nome: true,
                descricao: true,
                preco: true,
                imagem: true,
                estoque: true,
                sob_encomenda: true,
                status: true,
                categorias: {
                    select: {
                        categoria: {
                            select: {
                                id: true,
                                nome: true,
                                descricao: true
                            }
                        }
                    }
                }
            }
        })

        return resposta
    }

    async alterarProdutos({
        id,
        nome,
        descricao,
        preco,
        imagem,
        estoque,
        status,
        sob_encomenda
    }: AlterarProdutos) {
        const idExiste = await prismaClient.produtos.findFirst({
            where: { id }
        })

        if (!idExiste) {
            throw new Error("Registro não Encontrado")
        }

        await prismaClient.produtos.update({
            where: { id },
            data: {
                nome,
                descricao,
                preco,
                estoque,
                status,
                sob_encomenda,
                ...(imagem ? { imagem } : {})
            }
        })

        return {
            dados: "Dados Alterados Com Sucesso"
        }
    }

    async apagarProdutos(id: string) {
        const idExiste = await prismaClient.produtos.findFirst({
            where: { id }
        })

        if (!idExiste) {
            throw new Error("Registro não Encontrado")
        }

        await prismaClient.produto_categoria.deleteMany({
            where: { produto_id: id }
        })

        await prismaClient.produtos.delete({
            where: { id }
        })

        return {
            dados: "Dados Apagados Com Sucesso"
        }
    }
}

export { ProdutosServices }
