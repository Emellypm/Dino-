import prismaClient from '../../Prisma/PrismaClient'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

interface LogarClientes {
    telefone: string,
    senha: string
}

class LogarClientesServices {
    async logarClientes({ telefone, senha }: LogarClientes) {
        const telefoneExiste = await prismaClient.clientes.findFirst({
            where: {
                telefone: telefone
            }
        })
        if (!telefoneExiste) {
            throw new Error('Telefone Incorreto')
        }
        const senhaCrypt = await compare(senha, telefoneExiste.senha)
        if (!senhaCrypt) {
            throw new Error('Senha Incorreta')
        }
        const token = sign({
            id: telefoneExiste.id,
            nome: telefoneExiste.nome,
            telefone: telefoneExiste.telefone,
            tipo: "CLIENTE"
        },
            process.env.JWT_SECRETO as string,
            {
                subject: telefoneExiste.id,
                expiresIn: '8h'
            }
        )
        return {
            id: telefoneExiste.id,
            nome: telefoneExiste.nome,
            telefone: telefoneExiste.telefone,
            token: token
        }
    }
}
export { LogarClientesServices }