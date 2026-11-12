import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'

interface Payload {
    sub: string
    tipo?: "ADMIN" | "CLIENTE"
}

export function estaAutenticado(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const autoToken = req.headers.authorization

    if (!autoToken) {
    return res.status(401).json({ dados: 'Token Inexistente' })
    }

    const [, token] = autoToken.split(' ')

    try {
        const decoded = verify(
            token,
            process.env.JWT_SECRETO as string
        ) as Payload

        req.usuarioId = decoded.sub
        req.usuarioTipo = decoded.tipo

        return next()

    } catch (err) {
        return res.status(401).json({ dados: 'Token Inválido' })
    }
}