
import prismaClient from "../../Prisma/PrismaClient"

type StatusPagamento = "PENDENTE" | "APROVADO" | "CANCELADO"
type MetodoPagamento = "PIX" | "CARTAO" | "DINHEIRO"

interface AltPagamentos {
    id: string
    status: StatusPagamento
    metodo?: MetodoPagamento | null
    valor?: number
}

class PagamentosServices {
    async visualizarDadosGeral(cliente_id?: string) {
        return await prismaClient.pagamentos.findMany({
            where: cliente_id
                ? { pedido: { cliente_id } }
                : undefined,
            include: {
                pedido: {
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
                }
            },
            orderBy: {
                data_criacao: "desc"
            }
        })
    }

    async visualizarPagamentoUnico(id: string, cliente_id?: string) {
        return await prismaClient.pagamentos.findFirst({
            where: {
                id,
                ...(cliente_id
                    ? { pedido: { cliente_id } }
                    : {})
            },
            include: {
                pedido: {
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
                }
            }
        })
    }

    async alterarPagamentos({
        id,
        status,
        metodo,
        valor
    }: AltPagamentos) {
        const pagamento = await prismaClient.pagamentos.findUnique({
            where: { id }
        })

        if (!pagamento) {
            throw new Error("Pagamento não encontrado")
        }

        const metodoFinal = metodo === undefined
            ? pagamento.metodo
            : metodo

        if (status === "APROVADO" && !metodoFinal) {
            throw new Error("Informe a forma de pagamento antes de aprovar")
        }

        if (valor !== undefined && (!Number.isFinite(valor) || valor < 0)) {
            throw new Error("O valor do pagamento é inválido")
        }

        if (
            pagamento.status === "APROVADO" &&
            status === "PENDENTE"
        ) {
            throw new Error("Um pagamento aprovado não pode voltar para pendente")
        }

        await prismaClient.pagamentos.update({
            where: { id },
            data: {
                status,
                metodo: metodoFinal,
                ...(valor !== undefined ? { valor } : {}),
                pago_em: status === "APROVADO"
                    ? pagamento.pago_em || new Date()
                    : pagamento.pago_em
            }
        })

        return {
            dados: "Pagamento atualizado com sucesso"
        }
    }

    async cadastrarPagamentos() {
        throw new Error("O pagamento é criado automaticamente junto com o pedido")
    }

    async apagarPagamentos() {
        throw new Error("Os registros financeiros não podem ser excluídos")
    }
}

export { PagamentosServices }
