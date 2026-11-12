import prismaClient from "../../Prisma/PrismaClient"

interface CadItensPedido {
    pedido_id: string,
    produto_id: string,
    quantidade: number
}

interface AltItensPedido {
    id: string,
    quantidade: number
}

class ItensPedidoServices {

    async cadastrarItensPedido({ pedido_id, produto_id, quantidade }: CadItensPedido, cliente_id?: string) {
        const pedidoExiste = await prismaClient.pedidos.findFirst({
            where: {
                id: pedido_id,
                ...(cliente_id ? {
                    cliente_id: cliente_id
                } : {})
            }
        })

        if (!pedidoExiste) {
            throw new Error("Pedido não Encontrado")
        }

        const produtoExiste = await prismaClient.produtos.findFirst({
            where: {
                id: produto_id
            }
        })

        if (!produtoExiste) {
            throw new Error("Produto não Encontrado")
        }

        const preco_unitario = Number(produtoExiste.preco)
        const subtotal = preco_unitario * quantidade

        await prismaClient.itens_pedido.create({
            data: {
                pedido_id: pedido_id,
                produto_id: produto_id,
                quantidade: quantidade,
                preco_unitario: preco_unitario,
                subtotal: subtotal
            }
        })

        return ({ dados: "Item Adicionado ao Pedido Com Sucesso" })
    }

    async visualizarDadosGeral(cliente_id?: string) {
        const resposta = await prismaClient.itens_pedido.findMany({
            where: cliente_id ? {
                pedido: {
                    cliente_id: cliente_id
                }
            } : undefined,
            select: {
                id: true,
                pedido_id: true,
                produto_id: true,
                quantidade: true,
                preco_unitario: true,
                subtotal: true
            }
        })

        return resposta
    }

    async visualizarItemUnico(id: string, cliente_id?: string) {
        const resposta = await prismaClient.itens_pedido.findFirst({
            where: {
                id: id,
                ...(cliente_id ? {
                    pedido: {
                        cliente_id: cliente_id
                    }
                } : {})
            },
            select: {
                id: true,
                pedido_id: true,
                produto_id: true,
                quantidade: true,
                preco_unitario: true,
                subtotal: true
            }
        })

        return resposta
    }

    async alterarItensPedido({ id, quantidade }: AltItensPedido, cliente_id?: string) {
        const itemExiste = await prismaClient.itens_pedido.findFirst({
            where: {
                id: id,
                ...(cliente_id ? {
                    pedido: {
                        cliente_id: cliente_id
                    }
                } : {})
            },
            include: {
                produto: true
            }
        })

        if (!itemExiste) {
            throw new Error("Registro não Encontrado")
        }

        const preco_unitario = Number(itemExiste.produto.preco)
        const subtotal = preco_unitario * quantidade

        await prismaClient.itens_pedido.update({
            where: {
                id: id
            },
            data: {
                quantidade: quantidade,
                preco_unitario: preco_unitario,
                subtotal: subtotal
            }
        })

        return ({ dados: "Item Alterado Com Sucesso" })
    }

    async apagarItensPedido(id: string, cliente_id?: string) {
        const idExiste = await prismaClient.itens_pedido.findFirst({
            where: {
                id: id,
                ...(cliente_id ? {
                    pedido: {
                        cliente_id: cliente_id
                    }
                } : {})
            }
        })

        if (!idExiste) {
            throw new Error("Registro não Encontrado")
        }

        await prismaClient.itens_pedido.delete({
            where: {
                id: id
            }
        })

        return ({ dados: "Item Apagado com Sucesso" })
    }

}

export { ItensPedidoServices }