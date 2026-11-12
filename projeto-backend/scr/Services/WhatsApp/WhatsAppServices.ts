interface EnviarMensagem {
    telefone: string
}

class WhatsAppServices {
    async enviarMensagem({ telefone }: EnviarMensagem) {
        const token = process.env.WHATSAPP_TOKEN
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
        const apiVersion = process.env.WHATSAPP_API_VERSION

        if (!token || !phoneNumberId || !apiVersion) {
            throw new Error("Configurações do WhatsApp não encontradas")
        }

        const resposta = await fetch(
            `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: telefone,
                    type: "template",
                    template: {
                        name: "hello_world",
                        language: {
                            code: "en_US"
                        }
                    }
                })
            }
        )

        const dados = await resposta.json()

        if (!resposta.ok) {
            console.log("Erro WhatsApp:", dados)
            throw new Error(
                dados?.error?.message || "Não foi possível enviar a mensagem"
            )
        }

        return dados
    }
}

export default new WhatsAppServices()