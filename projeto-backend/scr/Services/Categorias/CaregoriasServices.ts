import prismaClient from "../../Prisma/PrismaClient"

interface CadCategorias {
    nome: string,
    descricao: string
}

interface AltCategorias {
    id: string,
    nome: string,
    descricao: string
}

class CategoriasServices {

    async cadastrarCategorias({ nome, descricao }: CadCategorias) {

        const nomeExiste = await prismaClient.categorias.findFirst({
            where: {
                nome: nome
            }
        })

        if (nomeExiste) {
            throw new Error("Categoria já Cadastrada")
        }

        await prismaClient.categorias.create({
            data: {
                nome: nome,
                descricao: descricao
            }
        })

        return ({ dados: "Dados Salvos Com Sucesso" })
    }


    async visualizarDadosGeral() {

        const resposta = await prismaClient.categorias.findMany({
            select: {
                id: true,
                nome: true,
                descricao: true
            }
        })

        return resposta
    }


    async visualizarCategoriaUnica(id: string) {

        const resposta = await prismaClient.categorias.findFirst({
            where: {
                id: id
            },
            select: {
                id: true,
                nome: true,
                descricao: true
            }
        })

        return resposta
    }


    async alterarCategorias({
        id,
        nome,
        descricao
    }: AltCategorias) {

        const idExiste = await prismaClient.categorias.findFirst({
            where: {
                id: id
            }
        })

        if (!idExiste) {
            throw new Error("Registro não Encontrado")
        }

        await prismaClient.categorias.update({
            where: {
                id: id
            },
            data: {
                nome: nome,
                descricao: descricao
            }
        })

        return ({ dados: "Dados Alterados Com Sucesso" })
    }


    async apagarCategorias(id: string) {

        const idExiste = await prismaClient.categorias.findFirst({
            where: {
                id: id
            }
        })

        if (!idExiste) {
            throw new Error("Registro não Encontrado")
        }

        await prismaClient.categorias.delete({
            where: {
                id: id
            }
        })

        return ({ dados: "Registro Apagado com Sucesso" })
    }

}

export { CategoriasServices }