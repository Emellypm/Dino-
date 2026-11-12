import prismaClient from "../../Prisma/PrismaClient"

class MaisVendidosServices {

    async visualizarMaisVendidos() {

        const dataInicio = new Date()

        dataInicio.setDate(dataInicio.getDate() - 7)

        const pedidos = await prismaClient.pedidos.findMany({
            where: {
                data_criacao: {
                    gte: dataInicio
                },
                status: {
                    not: "CANCELADO"
                }
            },
            include: {
                itens: {
                    include: {
                        produto: true
                    }
                }
            }
        })

        const vendas: {
            [key: string]: {
                quantidade: number
                produto: any
            }
        } = {}

        pedidos.forEach((pedido) => {

            pedido.itens.forEach((item) => {

                if (item.produto.status !== "ATIVO") {
                    return
                }

                if (!vendas[item.produto_id]) {

                    vendas[item.produto_id] = {
                        quantidade: 0,
                        produto: item.produto
                    }

                }

                vendas[item.produto_id].quantidade += item.quantidade

            })

        })

        const resultado = Object.values(vendas)
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 3)
            .map((item) => ({
                id: item.produto.id,
                nome: item.produto.nome,
                descricao: item.produto.descricao,
                preco: Number(item.produto.preco),
                imagem: item.produto.imagem,
                quantidadeVendida: item.quantidade
            }))

        return resultado
    }
}

export { MaisVendidosServices }