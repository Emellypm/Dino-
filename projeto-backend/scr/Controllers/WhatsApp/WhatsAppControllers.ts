import { Request, Response } from "express"

import WhatsAppServices from "../../Services/WhatsApp/WhatsAppServices"

class WhatsAppControllers {

    async testarWhatsApp(req: Request, res: Response) {
        try {
            const { telefone } = req.body

            if (!telefone) {
                return res.status(400).json({
                    error: "Telefone é obrigatório"
                })
            }

            const resposta = await WhatsAppServices.enviarMensagem({
                telefone
            })

            return res.status(200).json(resposta)
        } catch (erro) {
            console.log("Erro no WhatsApp:", erro)

            return res.status(500).json({
                error:
                    erro instanceof Error
                        ? erro.message
                        : "Não foi possível enviar a mensagem"
            })
        }
    }

    async verificarWebhook(req: Request, res: Response) {
        const modo = req.query["hub.mode"]
        const token = req.query["hub.verify_token"]
        const desafio = req.query["hub.challenge"]

        const tokenVerificacao = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

        if (
            modo === "subscribe" &&
            token === tokenVerificacao
        ) {
            return res.status(200).send(desafio)
        }

        return res.sendStatus(403)
    }

    async receberWebhook(req: Request, res: Response) {
        try {
            console.log(
                "Webhook WhatsApp recebido:",
                JSON.stringify(req.body, null, 2)
            )

            return res.sendStatus(200)
        } catch (erro) {
            console.log("Erro ao receber webhook:", erro)

            return res.sendStatus(500)
        }
    }
}

export { WhatsAppControllers }