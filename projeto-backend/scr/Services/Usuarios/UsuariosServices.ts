import prismaClient from "../../Prisma/PrismaClient";
import { hash } from "bcryptjs";

interface CadUsuarios {
    nome: string,
    email: string,
    senha: string,
    tipo: "ADMIN"
}

interface AltUsuarios {
    id: string,
    email: string
}

class UsuariosServices {
    async cadastrarUsuarios({ nome, email, senha, tipo }: CadUsuarios) {
        const emailExiste = await prismaClient.usuarios.findFirst({
            where: {
                email: email
            }
        })
        if (emailExiste) {
            throw new Error("E-mail já Cadastrado")
        }

        const senhaHash = await hash(senha, 8)

        await prismaClient.usuarios.create({
            data: {
                nome: nome,
                email: email,
                senha: senhaHash,
                tipo: tipo
            }
        })
        return ({ dados: "Dados Salvo Com Sucesso" })
    }
   async visualizarDadosGeral(usuarioId: string) {
    const resposta = await prismaClient.usuarios.findFirst({
        where: {
            id: usuarioId
        },
        select: {
            id: true,
            nome: true,
            email: true,
            tipo: true
        }
    })

    return resposta
}
    async visualizarUsuarioUnicoPost(id: string) {
        const resposta = await prismaClient.usuarios.findFirst({
            where: {
                id: id
            },
            select: {
                id: true,
                nome: true,
                email: true,
                tipo: true
            }
        })
        return resposta
    }
    async alterarUsuarios({id, email}: AltUsuarios){
        const idExiste = await prismaClient.usuarios.findFirst({
            where: { 
                id: id
            }
        })
        if (!idExiste) {
            throw new Error("Registro não Encontrado")
        }
        await prismaClient.usuarios.update({
            where: {
                id: id
            },
            data: {
                email: email
            }
        })
        return ({dados: "Dados Alterados Com Sucesso"})
    }
    async apagarUsuarios(id: string){
        const idExiste = await prismaClient.usuarios.findFirst({
            where: {
                id: id
            }
        })
        if (!idExiste) {
            throw new Error("Registro não Encontrado ")
        }
        await prismaClient.usuarios.delete({
            where: {
                id: id
            }
        })
        return ({dados: "Registro Apagado com Sucesso"})
    }
}
export {UsuariosServices}