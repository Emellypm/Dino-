import { Request, Response, NextFunction } from 'express'

export function estaAutorizado(...tiposPermitidos: ("ADMIN" | "CLIENTE")[]) {
    return (req: Request, res: Response, next: NextFunction) => {

        if (!req.usuarioTipo) {
            return res.status(401).json({ dados: 'Tipo de usuário não identificado' })
        }

        if (!tiposPermitidos.includes(req.usuarioTipo)) {
            return res.status(403).json({ dados: 'Acesso não autorizado' })
        }

        return next()
    }
}