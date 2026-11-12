
import prismaClient from "../../Prisma/PrismaClient"

type StatusPedido = "RECEBIDO" | "CANCELADO"

interface FinalizarPedido {
    cliente_id: string
    observacao?: string
    itens: {
        produto_id: string
        quantidade: number
    }[]
}

interface AltPedidos {
    id: string
    status: StatusPedido
    observacao?: string
}

class PedidosServices {
    async visualizarDadosGeral(cliente_id?: string) {
        return await prismaClient.pedidos.findMany({
            where: cliente_id ? { cliente_id } : undefined,
            include: {
                cliente: {
                    select: {
                        nome: true,
                        telefone: true
                    }
                },
                pagamento: {
                    select: {
                        id: true,
                        metodo: true,
                        status: true,
                        valor: true,
                        pago_em: true
                    }
                }
            },
            orderBy: {
                data_criacao: "desc"
            }
        })
    }

    async visualizarPedidoUnico(id: string, cliente_id?: string) {
        return await prismaClient.pedidos.findFirst({
            where: {
                id,
                ...(cliente_id ? { cliente_id } : {})
            },
            include: {
                cliente: {
                    select: {
                        nome: true,
                        telefone: true
                    }
                },
                itens: {
                    include: {
                        produto: {
                            select: {
                                nome: true
                            }
                        }
                    }
                },
                pagamento: {
                    select: {
                        id: true,
                        metodo: true,
                        status: true,
                        valor: true,
                        pago_em: true
                    }
                }
            }
        })
    }

    async gerarWhatsApp(id: string, cliente_id?: string) {
        const pedido = await prismaClient.pedidos.findFirst({
            where: {
                id,
                ...(cliente_id ? { cliente_id } : {})
            },
            include: {
                cliente: {
                    select: {
                        nome: true,
                        telefone: true
                    }
                },
                itens: {
                    include: {
                        produto: {
                            select: {
                                nome: true
                            }
                        }
                    }
                }
            }
        })

        if (!pedido) {
            throw new Error("Pedido não encontrado")
        }

        let mensagem = `🍰 NOVO PEDIDO - DINO'S DOCES\n\n`
        mensagem += `Cliente: ${pedido.cliente.nome}\n`
        mensagem += `Telefone: ${pedido.cliente.telefone}\n\n`
        mensagem += `🛍️ PRODUTOS\n`

        pedido.itens.forEach(item => {
            mensagem += `${item.quantidade}x ${item.produto.nome} - R$ ${Number(item.subtotal).toFixed(2)}\n`
        })

        mensagem += `\n💰 Subtotal: R$ ${Number(pedido.valor_subtotal).toFixed(2)}\n`
        mensagem += `💵 Total dos produtos: R$ ${Number(pedido.valor_total).toFixed(2)}\n`
        mensagem += `📦 Entrega e forma de pagamento: a combinar pelo WhatsApp.\n`

        if (pedido.observacao) {
            mensagem += `\n📝 Observação:\n${pedido.observacao}\n`
        }

        const numeroWhatsApp = "5514991446325"
        const mensagemCodificada = encodeURIComponent(mensagem)
        const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`

        return {
            linkWhatsApp,
            mensagem
        }
    }

    async finalizarPedido({
        cliente_id,
        observacao,
        itens
    }: FinalizarPedido) {
        const clienteExiste = await prismaClient.clientes.findFirst({
            where: { id: cliente_id }
        })

        if (!clienteExiste) {
            throw new Error("Cliente não encontrado")
        }

        if (!Array.isArray(itens) || itens.length === 0) {
            throw new Error("O pedido precisa ter pelo menos um produto")
        }

        const resultado = await prismaClient.$transaction(async tx => {
            const produtos = []

            for (const item of itens) {
                if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
                    throw new Error("A quantidade deve ser um número inteiro maior que zero")
                }

                const produto = await tx.produtos.findFirst({
                    where: {
                        id: item.produto_id,
                        status: "ATIVO"
                    }
                })

                if (!produto) {
                    throw new Error(`Produto não encontrado: ${item.produto_id}`)
                }

                if (!produto.sob_encomenda && item.quantidade > produto.estoque) {
                    throw new Error(`Estoque insuficiente para o produto: ${produto.nome}`)
                }

                produtos.push({
                    produto_id: produto.id,
                    quantidade: item.quantidade,
                    preco_unitario: Number(produto.preco),
                    subtotal: Number(produto.preco) * item.quantidade
                })
            }

            const valor_subtotal = produtos.reduce(
                (total, item) => total + item.subtotal,
                0
            )

            const pedido = await tx.pedidos.create({
                data: {
                    cliente_id,
                    status: "RECEBIDO",
                    valor_subtotal,
                    valor_total: valor_subtotal,
                    observacao: observacao?.trim() || null
                }
            })

            for (const item of produtos) {
                await tx.itens_pedido.create({
                    data: {
                        pedido_id: pedido.id,
                        produto_id: item.produto_id,
                        quantidade: item.quantidade,
                        preco_unitario: item.preco_unitario,
                        subtotal: item.subtotal
                    }
                })
            }

            await tx.pagamentos.create({
                data: {
                    pedido_id: pedido.id,
                    metodo: null,
                    status: "PENDENTE",
                    valor: valor_subtotal
                }
            })

            return pedido
        })

        const whatsapp = await this.gerarWhatsApp(
            resultado.id,
            cliente_id
        )

        return {
            dados: "Pedido recebido com sucesso",
            pedido_id: resultado.id,
            linkWhatsApp: whatsapp.linkWhatsApp,
            mensagem: whatsapp.mensagem
        }
    }

    async alterarPedidos({
        id,
        status,
        observacao
    }: AltPedidos) {
        const pedido = await prismaClient.pedidos.findFirst({
            where: { id }
        })

        if (!pedido) {
            throw new Error("Pedido não encontrado")
        }

        if (pedido.status === "CANCELADO" && status !== "CANCELADO") {
            throw new Error("Um pedido cancelado não pode ser reativado")
        }

        await prismaClient.$transaction(async tx => {
            await tx.pedidos.update({
                where: { id },
                data: {
                    status,
                    observacao
                }
            })

            if (status === "CANCELADO") {
                await tx.pagamentos.updateMany({
                    where: {
                        pedido_id: id,
                        status: "PENDENTE"
                    },
                    data: {
                        status: "CANCELADO"
                    }
                })
            }
        })

        return {
            dados: "Pedido atualizado com sucesso"
        }
    }

    async apagarPedidos(id: string) {
        const pedido = await prismaClient.pedidos.findFirst({
            where: { id }
        })

        if (!pedido) {
            throw new Error("Pedido não encontrado")
        }

        throw new Error("Para preservar o histórico financeiro, cancele o pedido em vez de excluí-lo")
    }
}

export { PedidosServices }
