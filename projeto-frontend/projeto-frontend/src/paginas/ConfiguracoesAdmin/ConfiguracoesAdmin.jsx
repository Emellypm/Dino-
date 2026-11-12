
import { useEffect, useState } from "react"
import api from "../../services/api"
import "./ConfiguracoesAdmin.css"
import MenuAdmin from "../../componentes/MenuAdmin/MenuAdmin"

function ConfiguracoesAdmin() {
    const [carregando, setCarregando] = useState(true)
    const [salvando, setSalvando] = useState(false)

    const [nome, setNome] = useState("")
    const [descricao, setDescricao] = useState("")
    const [telefone, setTelefone] = useState("")
    const [endereco, setEndereco] = useState("")
    const [cidade, setCidade] = useState("")
    const [estado, setEstado] = useState("")
    const [instagram, setInstagram] = useState("")

    useEffect(() => {
        buscarConfiguracoes()
    }, [])

    async function buscarConfiguracoes() {
        try {
            setCarregando(true)

            const resposta = await fetch(`${api}/VisualizarDadosGeralLoja`)
            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(dados.error || "Não foi possível carregar as configurações")
            }

            const configuracao = dados?.loja ?? dados

            if (!configuracao) return

            setNome(configuracao.nome || "")
            setDescricao(configuracao.descricao || "")
            setTelefone(configuracao.telefone || "")
            setEndereco(configuracao.endereco || "")
            setCidade(configuracao.cidade || "")
            setEstado(configuracao.estado || "")
            setInstagram(configuracao.instagram || "")
        } catch (erro) {
            console.log(erro)
            alert(erro.message || "Não foi possível conectar ao servidor")
        } finally {
            setCarregando(false)
        }
    }

    async function salvarConfiguracoes(e) {
        e.preventDefault()

        if (!nome.trim()) {
            alert("Informe o nome da loja")
            return
        }

        try {
            setSalvando(true)

            const token = localStorage.getItem("tokenAdmin")

            if (!token) {
                alert("Sessão administrativa não encontrada. Entre novamente.")
                return
            }

            const resposta = await fetch(`${api}/SalvarConfiguracoesLoja`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: nome.trim(),
                    descricao: descricao.trim(),
                    telefone: telefone.trim(),
                    endereco: endereco.trim(),
                    cidade: cidade.trim(),
                    estado: estado.trim(),
                    instagram: instagram.trim()
                })
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(dados.error || dados.dados || "Não foi possível salvar as configurações")
            }

            alert("Configurações salvas com sucesso!")
        } catch (erro) {
            console.log(erro)
            alert(erro.message || "Não foi possível conectar ao servidor")
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div className="configuracoes-admin">
            <MenuAdmin paginaAtiva="configuracoes" />

            <main className="configuracoes-admin-conteudo">
                <header className="configuracoes-topo">
                    <div>
                        <h2>Configurações da loja</h2>
                        <span>
                            Gerencie as informações da Dino's Doces.
                        </span>
                    </div>
                </header>

                {carregando ? (
                    <div className="estado-configuracoes">
                        <span>⚙️</span>
                        <p>Carregando configurações...</p>
                    </div>
                ) : (
                    <form
                        className="configuracoes-form"
                        onSubmit={salvarConfiguracoes}
                    >
                        <section className="configuracao-card">
                            <div className="configuracao-card-topo">
                                <div>
                                    <p>Estabelecimento</p>
                                    <h3>Informações da loja</h3>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="campo-configuracao campo-completo">
                                    <label>Nome da loja</label>
                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                        placeholder="Nome da loja"
                                        required
                                    />
                                </div>

                                <div className="campo-configuracao campo-completo">
                                    <label>Descrição</label>
                                    <textarea
                                        value={descricao}
                                        onChange={e => setDescricao(e.target.value)}
                                        placeholder="Conte um pouco sobre a loja"
                                    />
                                </div>

                                <div className="campo-configuracao campo-completo">
                                    <label>Endereço da loja</label>
                                    <input
                                        type="text"
                                        value={endereco}
                                        onChange={e => setEndereco(e.target.value)}
                                        placeholder="Endereço do estabelecimento"
                                    />
                                </div>

                                <div className="campo-configuracao">
                                    <label>Cidade</label>
                                    <input
                                        type="text"
                                        value={cidade}
                                        onChange={e => setCidade(e.target.value)}
                                        placeholder="Cidade"
                                    />
                                </div>

                                <div className="campo-configuracao">
                                    <label>Estado</label>
                                    <input
                                        type="text"
                                        value={estado}
                                        onChange={e => setEstado(e.target.value)}
                                        placeholder="SP"
                                        maxLength={2}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="configuracao-card">
                            <div className="configuracao-card-topo">
                                <div>
                                    <p>Contato</p>
                                    <h3>Informações de contato</h3>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="campo-configuracao">
                                    <label>Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={telefone}
                                        onChange={e => setTelefone(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                <div className="campo-configuracao">
                                    <label>Instagram</label>
                                    <input
                                        type="text"
                                        value={instagram}
                                        onChange={e => setInstagram(e.target.value)}
                                        placeholder="@seuinstagram"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="configuracoes-acoes">
                            <button
                                type="submit"
                                className="botao-salvar-configuracoes"
                                disabled={salvando}
                            >
                                {salvando
                                    ? "Salvando..."
                                    : "Salvar configurações"}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    )
}

export default ConfiguracoesAdmin
