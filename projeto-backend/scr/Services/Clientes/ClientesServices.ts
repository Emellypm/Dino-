import prismaClient from "../../Prisma/PrismaClient"
import { hash } from "bcryptjs"

interface CadClientes {
    nome: string
    senha: string
    telefone: string
}

interface AltClientes {
    id: string
    nome: string
    telefone: string
}

class ClientesServices {
    async cadastrarClientes({ nome, senha, telefone }: CadClientes) {
        const telExiste = await prismaClient.clientes.findFirst({
            where: { telefone }
        })

        if (telExiste) {
            throw new Error("Telefone já Cadastrado")
        }

        const senhaHash = await hash(senha, 8)

        await prismaClient.clientes.create({
            data: {
                nome,
                senha: senhaHash,
                telefone
            }
        })

        return { dados: "Dados Salvos Com Sucesso" }
    }

    async visualizarDadosGeral() {
        const resposta = await prismaClient.clientes.findMany({
            select: {
                id: true,
                nome: true,
                telefone: true
            }
        })

        return resposta
    }

    async visualizarClienteUnico(id: string) {
        const resposta = await prismaClient.clientes.findFirst({
            where: { id },
            select: {
                id: true,
                nome: true,
                telefone: true
            }
        })

        return resposta
    }

    async alterarClientes({ id, nome, telefone }: AltClientes) {
        const idExiste = await prismaClient.clientes.findFirst({
            where: { id }
        })

        if (!idExiste) {
            throw new Error("Registro não Encontrado")
        }

        const telefoneExiste = await prismaClient.clientes.findFirst({
            where: {
                telefone,
                NOT: {
                    id
                }
            }
        })

        if (telefoneExiste) {
            throw new Error("Telefone já Cadastrado")
        }

        await prismaClient.clientes.update({
            where: { id },
            data: {
                nome,
                telefone
            }
        })

        return { dados: "Dados Alterados Com Sucesso" }
    }

    async apagarClientes(id: string) {
        const idExiste = await prismaClient.clientes.findFirst({
            where: { id }
        })

        if (!idExiste) {
            throw new Error("Registro não Encontrado")
        }

        await prismaClient.clientes.delete({
            where: { id }
        })

        return { dados: "Registro Apagado com Sucesso" }
    }
}

export { ClientesServices }