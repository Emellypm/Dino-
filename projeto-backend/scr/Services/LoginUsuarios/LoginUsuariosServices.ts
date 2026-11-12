import prismaClient from '../../Prisma/PrismaClient'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

interface LogarUsuarios {
    email: string,
    senha: string
}

class LogarUsuariosServices {
    async logarUsuarios({ email, senha }: LogarUsuarios) {
        const emailExiste = await prismaClient.usuarios.findFirst({
            where: {
                email: email
            }
        })
        if (!emailExiste) {
            throw new Error('Email Incorretos')
        }

        const senhaCrypt = await compare(senha, emailExiste.senha)
        if (!senhaCrypt) {
            throw new Error('Senha Incorretos')
        }

        const token = sign({
            id: emailExiste.id,
            nome: emailExiste.nome,
            email: emailExiste.email,
            tipo: "ADMIN"
        },
            process.env.JWT_SECRETO,
            {
                subject: emailExiste.id,
                expiresIn: '8h'
            }
        )
        return{
            id: emailExiste.id,
            nome: emailExiste.nome,
            email: emailExiste.email,
            token: token
        }

    }
}

export { LogarUsuariosServices }