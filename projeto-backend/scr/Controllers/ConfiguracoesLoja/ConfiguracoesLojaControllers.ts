
import { Request, Response } from "express"
import { ConfiguracoesLojaServices } from "../../Services/ConfiguracoesLoja/ConfiguracoesLojaServices"

class ConfiguracoesLojaControllers {
    async visualizarConfiguracoes(req: Request, res: Response) {
        const enviarDados = new ConfiguracoesLojaServices()
        const resposta = await enviarDados.visualizarConfiguracoes()
        return res.json(resposta)
    }

    async salvarConfiguracoes(req: Request, res: Response) {
        const {
            nome,
            descricao,
            telefone,
            endereco,
            cidade,
            estado,
            instagram
        } = req.body

        const enviarDados = new ConfiguracoesLojaServices()

        const resposta = await enviarDados.salvarConfiguracoes({
            nome,
            descricao,
            telefone,
            endereco,
            cidade,
            estado,
            instagram
        })

        return res.json({
            dados: "Configurações salvas com sucesso",
            loja: resposta
        })
    }
}

export { ConfiguracoesLojaControllers }
