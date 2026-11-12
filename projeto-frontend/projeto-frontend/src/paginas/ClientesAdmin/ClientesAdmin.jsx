import { useEffect, useState } from "react"
import api from "../../services/api"
import "./ClientesAdmin.css"
import MenuAdmin from "../../componentes/MenuAdmin/MenuAdmin"

function ClientesAdmin() {
    const [clientes, setClientes] = useState([])
    const [clienteSelecionado, setClienteSelecionado] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [modalAberto, setModalAberto] = useState(false)

    const [nome, setNome] = useState("")
    const [telefone, setTelefone] = useState("")

    useEffect(() => {
        buscarClientes()
    }, [])

    async function buscarClientes() {
        try {
            setCarregando(true)

            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(
                `${api}/visualizarDadosGeralCli`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                console.log(dados)
                return
            }

            setClientes(
                Array.isArray(dados)
                    ? dados
                    : dados.clientes || []
            )
        } catch (erro) {
            console.log(erro)
        } finally {
            setCarregando(false)
        }
    }

    async function abrirCliente(id) {
        try {
            setCarregandoDetalhes(true)

            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(
                `${api}/visualizarClienteUnico`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id
                    })
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                alert(
                    dados.error ||
                    dados.dados ||
                    "Não foi possível carregar o cliente"
                )
                return
            }

            setClienteSelecionado(dados)
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        } finally {
            setCarregandoDetalhes(false)
        }
    }

    function abrirModalEdicao(cliente) {
        setClienteSelecionado(cliente)
        setNome(cliente.nome || "")
        setTelefone(cliente.telefone || "")
        setModalAberto(true)
    }

    function fecharModal() {
        setModalAberto(false)
        setNome("")
        setTelefone("")
    }

    async function alterarCliente(e) {
        e.preventDefault()

        if (!nome.trim()) {
            alert("Digite o nome do cliente")
            return
        }

        try {
            setSalvando(true)

            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(
                `${api}/alterarClientes`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: clienteSelecionado.id,
                        nome: nome.trim(),
                        telefone: telefone.trim()
                    })
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                alert(
                    dados.error ||
                    dados.dados ||
                    "Não foi possível alterar o cliente"
                )
                return
            }

            setClientes(
                clientes.map((cliente) =>
                    cliente.id === clienteSelecionado.id
                        ? {
                              ...cliente,
                              nome: nome.trim(),
                              telefone: telefone.trim()
                          }
                        : cliente
                )
            )

            setClienteSelecionado({
                ...clienteSelecionado,
                nome: nome.trim(),
                telefone: telefone.trim()
            })

            fecharModal()

            alert("Cliente alterado com sucesso!")
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        } finally {
            setSalvando(false)
        }
    }

    async function excluirCliente(cliente) {
        const confirmar = window.confirm(
            `Tem certeza que deseja excluir o cliente "${cliente.nome}"?`
        )

        if (!confirmar) {
            return
        }

        try {
            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(
                `${api}/apagarClientes`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: cliente.id
                    })
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                alert(
                    dados.error ||
                    dados.dados ||
                    "Não foi possível excluir o cliente"
                )
                return
            }

            setClientes(
                clientes.filter(
                    (item) => item.id !== cliente.id
                )
            )

            setClienteSelecionado(null)

            alert("Cliente excluído com sucesso!")
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        }
    }

    return (
        <div className="clientes-admin">
            <MenuAdmin paginaAtiva="clientes" />

            <main className="clientes-admin-conteudo">
                <header className="clientes-topo">
                    <div>
                        <p>Administração</p>
                        <h2>Clientes</h2>
                        <span>
                            Visualize e gerencie os clientes da loja.
                        </span>
                    </div>

                    <button
                        className="botao-atualizar-clientes"
                        onClick={buscarClientes}
                    >
                        ↻ Atualizar
                    </button>
                </header>

                {carregando ? (
                    <div className="estado-clientes">
                        <span className="estado-clientes-icone">
                            👥
                        </span>
                        <p>Carregando clientes...</p>
                    </div>
                ) : clientes.length === 0 ? (
                    <div className="estado-clientes">
                        <span className="estado-clientes-icone">
                            👥
                        </span>

                        <h3>
                            Nenhum cliente cadastrado
                        </h3>

                        <p>
                            Os clientes cadastrados aparecerão aqui.
                        </p>
                    </div>
                ) : (
                    <section className="lista-clientes">
                        {clientes.map((cliente) => (
                            <article
                                className="cliente-card"
                                key={cliente.id}
                            >
                                <div className="cliente-avatar">
                                    {cliente.nome
                                        ? cliente.nome
                                              .charAt(0)
                                              .toUpperCase()
                                        : "?"}
                                </div>

                                <div className="cliente-info">
                                    <h3>
                                        {cliente.nome ||
                                            "Cliente"}
                                    </h3>

                                    <span>
                                        {cliente.telefone ||
                                            "Telefone não informado"}
                                    </span>
                                </div>

                                <div className="cliente-acoes">
                                    <button
                                        onClick={() =>
                                            abrirCliente(
                                                cliente.id
                                            )
                                        }
                                    >
                                        Ver detalhes
                                    </button>

                                    <button
                                        onClick={() =>
                                            abrirModalEdicao(
                                                cliente
                                            )
                                        }
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className="botao-excluir-cliente"
                                        onClick={() =>
                                            excluirCliente(
                                                cliente
                                            )
                                        }
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            {clienteSelecionado &&
                !modalAberto && (
                    <div
                        className="modal-cliente-fundo"
                        onClick={() =>
                            setClienteSelecionado(null)
                        }
                    >
                        <div
                            className="modal-cliente"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            <header className="modal-cliente-topo">
                                <div>
                                    <span>
                                        Cliente
                                    </span>

                                    <h2>
                                        Detalhes
                                    </h2>
                                </div>

                                <button
                                    onClick={() =>
                                        setClienteSelecionado(
                                            null
                                        )
                                    }
                                >
                                    ×
                                </button>
                            </header>

                            {carregandoDetalhes ? (
                                <div className="modal-carregando-cliente">
                                    Carregando...
                                </div>
                            ) : (
                                <div className="modal-cliente-conteudo">
                                    <div className="cliente-detalhe-avatar">
                                        {clienteSelecionado.nome
                                            ? clienteSelecionado.nome
                                                  .charAt(0)
                                                  .toUpperCase()
                                            : "?"}
                                    </div>

                                    <div className="cliente-detalhe">
                                        <span>Nome</span>

                                        <strong>
                                            {clienteSelecionado.nome ||
                                                "Não informado"}
                                        </strong>
                                    </div>

                                    <div className="cliente-detalhe">
                                        <span>Telefone</span>

                                        <strong>
                                            {clienteSelecionado.telefone ||
                                                "Não informado"}
                                        </strong>
                                    </div>

                                    <div className="acoes-detalhes-cliente">
                                        <button
                                            onClick={() =>
                                                abrirModalEdicao(
                                                    clienteSelecionado
                                                )
                                            }
                                        >
                                            Editar cliente
                                        </button>

                                        <button
                                            className="botao-fechar-cliente"
                                            onClick={() =>
                                                setClienteSelecionado(
                                                    null
                                                )
                                            }
                                        >
                                            Fechar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            {modalAberto && (
                <div
                    className="modal-cliente-fundo"
                    onClick={fecharModal}
                >
                    <div
                        className="modal-cliente"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <header className="modal-cliente-topo">
                            <div>
                                <span>
                                    Clientes
                                </span>

                                <h2>
                                    Editar cliente
                                </h2>
                            </div>

                            <button
                                onClick={fecharModal}
                            >
                                ×
                            </button>
                        </header>

                        <form
                            className="form-cliente"
                            onSubmit={alterarCliente}
                        >
                            <label>
                                Nome
                            </label>

                            <input
                                type="text"
                                value={nome}
                                onChange={(e) =>
                                    setNome(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <label>
                                Telefone
                            </label>

                            <input
                                type="text"
                                value={telefone}
                                onChange={(e) =>
                                    setTelefone(
                                        e.target.value
                                    )
                                }
                            />

                            <div className="acoes-cliente-modal">
                                <button
                                    type="button"
                                    className="botao-cancelar-cliente"
                                    onClick={fecharModal}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="botao-salvar-cliente"
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : "Salvar alterações"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ClientesAdmin