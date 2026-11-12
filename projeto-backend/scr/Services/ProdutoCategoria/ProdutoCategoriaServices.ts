import prismaClient from "../../Prisma/PrismaClient"

interface CadProdutoCategoria {

    produto_id: string

    categoria_id: string
}

class ProdutoCategoriaServices {

    // CADASTRAR CATEGORIA NO PRODUTO
    async cadastrarProdutoCategoria({
        produto_id,
        categoria_id
    }: CadProdutoCategoria) {

        const produtoExiste = await prismaClient.produtos.findFirst({
            where: {
                id: produto_id
            }
        })

        if (!produtoExiste) {
            throw new Error("Produto não Encontrado")
        }

        const categoriaExiste = await prismaClient.categorias.findFirst({
            where: {
                id: categoria_id
            }
        })

        if (!categoriaExiste) {
            throw new Error("Categoria não Encontrada")
        }

        const relacionamentoExiste =
            await prismaClient.produto_categoria.findFirst({
                where: {
                    produto_id: produto_id,
                    categoria_id: categoria_id
                }
            })

        if (relacionamentoExiste) {
            throw new Error("Produto já possui essa Categoria")
        }

        await prismaClient.produto_categoria.create({
            data: {
                produto_id: produto_id,
                categoria_id: categoria_id
            }
        })

        return {
            dados: "Categoria Adicionada ao Produto Com Sucesso"
        }
    }


    // VISUALIZAR TODOS OS VÍNCULOS
    async visualizarDadosGeral() {

        const resposta =
            await prismaClient.produto_categoria.findMany({
                select: {
                    id: true,
                    produto_id: true,
                    categoria_id: true,

                    produto: {
                        select: {
                            nome: true
                        }
                    },

                    categoria: {
                        select: {
                            nome: true
                        }
                    }
                }
            })

        return resposta
    }


    // REMOVER CATEGORIA DO PRODUTO
    async apagarProdutoCategoria(id: string) {

        const idExiste =
            await prismaClient.produto_categoria.findFirst({
                where: {
                    id: id
                }
            })

        if (!idExiste) {
            throw new Error("Registro não Encontrado")
        }

        await prismaClient.produto_categoria.delete({
            where: {
                id: id
            }
        })

        return {
            dados: "Categoria Removida do Produto Com Sucesso"
        }
    }

}

export { ProdutoCategoriaServices }