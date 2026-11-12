import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import "./MC.css"

function MinhaConta() {
    const [perfil, setPerfil] = useState(null)
    const [pedidos, setPedidos] = useState([])
    const [editando, setEditando] = useState(false)
    const [nome, setNome] = useState("")
    const [telefone, setTelefone] = useState("")
    const navegar = useNavigate()

    useEffect(() => {
        buscarPerfil()
        buscarPedidos()
    }, [])

    async function buscarPerfil() {
        try {
            const resposta = await fetch(`${api}/MeuPerfil`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("clienteToken")}`
                }
            })
            const dados = await resposta.json()
            setPerfil(dados)
            setNome(dados.nome || "")
            setTelefone(dados.telefone || "")
        } catch (erro) {
            console.log(erro)
        }
    }

    async function buscarPedidos() {
        try {
            const resposta = await fetch(`${api}/MeusPedidos`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("clienteToken")}`
                }
            })
            const dados = await resposta.json()
            setPedidos(Array.isArray(dados) ? dados : dados.dados || [])
        } catch (erro) {
            console.log(erro)
        }
    }

    async function salvarAlteracoes(e) {
        e.preventDefault()

        try {
            const resposta = await fetch(`${api}/AlterarClientes`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("clienteToken")}`
                },
                body: JSON.stringify({
                    id: perfil.id,
                    nome,
                    telefone
                })
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                alert(dados.error || "Não foi possível alterar os dados")
                return
            }

            setPerfil(dados)
            setEditando(false)
            alert("Dados alterados com sucesso!")
        } catch (erro) {
            console.log(erro)
            alert("Erro ao conectar com o servidor")
        }
    }

    function sair() {
        localStorage.removeItem("clienteToken")
        navegar("/login")
    }

    return (
        <div className="minha-conta">
            <header className="mc-header">
                <div className="mc-marca" onClick={() => navegar("/home")}>
                    <img src="/logo-dino-doces.jpeg" alt="Dino Doces" />
                    <span>Dino Doces</span>
                </div>
                <button onClick={() => navegar("/cardapio")}>Cardápio</button>
                <button onClick={sair}>Sair</button>
            </header>

            <main className="mc-conteudo">
                <section className="mc-perfil">
                    <div className="mc-titulo">
                        <div>
                            <h1>Minha conta</h1>
                            <p>Seus dados e pedidos</p>
                        </div>
                        {!editando && (
                            <button onClick={() => setEditando(true)}>Editar</button>
                        )}
                    </div>

                    {perfil && !editando && (
                        <div className="mc-dados">
                            <div>
                                <span>Nome</span>
                                <strong>{perfil.nome}</strong>
                            </div>
                            <div>
                                <span>Telefone</span>
                                <strong>{perfil.telefone}</strong>
                            </div>
                        </div>
                    )}

                    {editando && (
                        <form className="mc-form" onSubmit={salvarAlteracoes}>
                            <label>Nome</label>
                            <input value={nome} onChange={(e) => setNome(e.target.value)} required />

                            <label>Telefone</label>
                            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} required />

                            <div className="mc-acoes">
                                <button type="button" onClick={() => setEditando(false)}>Cancelar</button>
                                <button type="submit">Salvar</button>
                            </div>
                        </form>
                    )}
                </section>

                <section className="mc-pedidos">
                    <h2>Meus pedidos</h2>

                    {pedidos.length === 0 ? (
                        <div className="mc-vazio">
                            <p>Você ainda não fez nenhum pedido.</p>
                            <button onClick={() => navegar("/cardapio")}>Ver cardápio</button>
                        </div>
                    ) : (
                        <div className="mc-lista-pedidos">
                            {pedidos.map((pedido) => (
                                <div className="mc-pedido" key={pedido.id}>
                                    <div>
                                        <strong>Pedido #{pedido.id.slice(0, 8)}</strong>
                                        <span>{new Date(pedido.data_criacao).toLocaleDateString("pt-BR")}</span>
                                    </div>

                                    <div>
                                        <span className={`mc-status ${pedido.status?.toLowerCase()}`}>
                                            {pedido.status}
                                        </span>
                                        <strong>R$ {Number(pedido.valor_total).toFixed(2)}</strong>
                                    </div>

                                    <button onClick={() => navegar(`/pedido/${pedido.id}`)}>
                                        Ver pedido
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

export default MinhaConta