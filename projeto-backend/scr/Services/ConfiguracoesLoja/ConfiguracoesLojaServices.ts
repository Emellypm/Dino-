
import prismaClient from "../../Prisma/PrismaClient"

interface DadosConfiguracoesLoja {
    nome: string
    descricao: string
    telefone: string
    endereco?: string
    cidade?: string | null
    estado?: string | null
    instagram?: string | null
}

class ConfiguracoesLojaServices {
    async visualizarConfiguracoes() {
        const resposta = await prismaClient.configuracoesLoja.findUnique({
            where: {
                id: "principal"
            },
            select: {
                id: true,
                nome: true,
                descricao: true,
                telefone: true,
                endereco: true,
                cidade: true,
                estado: true,
                instagram: true
            }
        })

        return resposta
    }

    async salvarConfiguracoes({
        nome,
        descricao,
        telefone,
        endereco,
        cidade,
        estado,
        instagram
    }: DadosConfiguracoesLoja) {
        if (!nome.trim()) {
            throw new Error("O nome da loja é obrigatório")
        }

        const dados = {
            nome: nome.trim(),
            descricao: descricao.trim(),
            telefone: telefone.trim(),
            endereco: endereco?.trim() || "",
            cidade: cidade?.trim() || null,
            estado: estado?.trim() || null,
            instagram: instagram?.trim() || null
        }

        const resposta = await prismaClient.configuracoesLoja.upsert({
            where: {
                id: "principal"
            },
            update: dados,
            create: {
                id: "principal",
                ...dados
            }
        })

        return resposta
    }
}

export { ConfiguracoesLojaServices }
