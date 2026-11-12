
import { useEffect, useState } from "react"
import api from "../../services/api"
import "./GestaoPedidos.css"
import MenuAdmin from "../../componentes/MenuAdmin/MenuAdmin"

function GestaoPedidos() {
    const [pedidos, setPedidos] = useState([])
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
    const [filtroStatus, setFiltroStatus] = useState("TODOS")
    const [carregando, setCarregando] = useState(true)
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false)
    const [salvandoStatus, setSalvandoStatus] = useState(false)

    const status = ["TODOS", "RECEBIDO", "CANCELADO"]

    useEffect(() => {
        buscarPedidos()
    }, [])

    async function buscarPedidos() {
        try {
            setCarregando(true)
            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(`${api}/VisualizarDadosPedidos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(dados.error || "Não foi possível carregar os pedidos")
            }

            setPedidos(
                Array.isArray(dados)
                    ? dados
                    : Array.isArray(dados.dados)
                        ? dados.dados
                        : []
            )
        } catch (erro) {
            console.log(erro)
            alert(erro.message || "Não foi possível conectar ao servidor")
        } finally {
            setCarregando(false)
        }
    }

    async function abrirPedido(id) {
        try {
            setCarregandoDetalhes(true)
            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(`${api}/VisualizarPedidoUnico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(dados.error || "Não foi possível carregar o pedido")
            }

            setPedidoSelecionado(dados)
        } catch (erro) {
            console.log(erro)
            alert(erro.message || "Não foi possível conectar ao servidor")
        } finally {
            setCarregandoDetalhes(false)
        }
    }

    async function cancelarPedido() {
        if (!pedidoSelecionado || pedidoSelecionado.status === "CANCELADO") {
            return
        }

        const confirmar = window.confirm(
            "Deseja realmente cancelar este pedido? O registro continuará no histórico."
        )

        if (!confirmar) return

        try {
            setSalvandoStatus(true)
            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(`${api}/AlterarPedidos`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: pedidoSelecionado.id,
                    status: "CANCELADO",
                    observacao: pedidoSelecionado.observacao || ""
                })
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(dados.error || dados.dados || "Não foi possível cancelar o pedido")
            }

            const pedidoAtualizado = {
                ...pedidoSelecionado,
                status: "CANCELADO",
                pagamento: pedidoSelecionado.pagamento?.status === "PENDENTE"
                    ? {
                        ...pedidoSelecionado.pagamento,
                        status: "CANCELADO"
                    }
                    : pedidoSelecionado.pagamento
            }

            setPedidoSelecionado(pedidoAtualizado)

            setPedidos(lista =>
                lista.map(pedido =>
                    pedido.id === pedidoSelecionado.id
                        ? {
                            ...pedido,
                            status: "CANCELADO",
                            pagamento: pedidoAtualizado.pagamento
                        }
                        : pedido
                )
            )

            alert("Pedido cancelado com sucesso!")
        } catch (erro) {
            console.log(erro)
            alert(erro.message || "Não foi possível conectar ao servidor")
        } finally {
            setSalvandoStatus(false)
        }
    }

    function nomeStatusPedido(valor) {
        const nomes = {
            RECEBIDO: "Pedido recebido",
            CANCELADO: "Pedido cancelado"
        }

        return nomes[valor] || valor
    }

    function nomeStatusPagamento(valor) {
        const nomes = {
            PENDENTE: "Pagamento pendente",
            APROVADO: "Pagamento aprovado",
            CANCELADO: "Pagamento cancelado"
        }

        return nomes[valor] || "Não registrado"
    }

    function nomeMetodo(valor) {
        const nomes = {
            PIX: "PIX",
            CARTAO: "Cartão",
            DINHEIRO: "Dinheiro"
        }

        return nomes[valor] || "A combinar"
    }

    function formatarPreco(valor) {
        return Number(valor || 0).toFixed(2).replace(".", ",")
    }

    function formatarData(data) {
        if (!data) return "Não informado"

        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const pedidosFiltrados = filtroStatus === "TODOS"
        ? pedidos
        : pedidos.filter(pedido => pedido.status === filtroStatus)

    const totalRecebidos = pedidos.filter(
        pedido => pedido.status === "RECEBIDO"
    ).length

    const totalPendentes = pedidos.filter(
        pedido => pedido.pagamento?.status === "PENDENTE"
    ).length

    const totalCancelados = pedidos.filter(
        pedido => pedido.status === "CANCELADO"
    ).length

    return (
        <div className="gestao-pedidos">
            <MenuAdmin paginaAtiva="pedidos" />

            <main className="gestao-pedidos-conteudo">
                <header className="gestao-pedidos-topo">
                    <div>
                        <h2>Pedidos</h2>
                        <p className="gestao-pedidos-descricao">
                            Organização dos pedidos recebidos
                        </p>
                    </div>

                    <button
                        className="botao-atualizar"
                        onClick={buscarPedidos}
                    >
                        ↻ Atualizar
                    </button>
                </header>

                <div className="resumo-pedidos">
                    <div className="resumo-pedido-card recebido">
                        <div>
                            <span>Pedidos recebidos</span>
                            <strong>{totalRecebidos}</strong>
                        </div>
                        <span className="resumo-pedido-icone">📦</span>
                    </div>

                    <div className="resumo-pedido-card pendente">
                        <div>
                            <span>Pagamentos pendentes</span>
                            <strong>{totalPendentes}</strong>
                        </div>
                        <span className="resumo-pedido-icone">◷</span>
                    </div>

                    <div className="resumo-pedido-card cancelado">
                        <div>
                            <span>Pedidos cancelados</span>
                            <strong>{totalCancelados}</strong>
                        </div>
                        <span className="resumo-pedido-icone">×</span>
                    </div>
                </div>

                <div className="filtros-pedidos">
                    {status.map(item => (
                        <button
                            key={item}
                            className={
                                filtroStatus === item
                                    ? "filtro-pedido ativo"
                                    : "filtro-pedido"
                            }
                            onClick={() => setFiltroStatus(item)}
                        >
                            {item === "TODOS"
                                ? "Todos"
                                : nomeStatusPedido(item)}
                        </button>
                    ))}
                </div>

                {carregando ? (
                    <div className="estado-pedidos">
                        <span>Carregando pedidos...</span>
                    </div>
                ) : pedidosFiltrados.length === 0 ? (
                    <div className="estado-pedidos">
                        <span className="estado-icone">📦</span>
                        <h3>Nenhum pedido encontrado</h3>
                        <p>Os pedidos recebidos pelo site aparecerão aqui.</p>
                    </div>
                ) : (
                    <div className="lista-pedidos">
                        {pedidosFiltrados.map(pedido => (
                            <article
                                className="pedido-card-admin"
                                key={pedido.id}
                                onClick={() => abrirPedido(pedido.id)}
                            >
                                <div className="pedido-card-topo">
                                    <div>
                                        <span className="pedido-numero">
                                            Pedido #{pedido.id.slice(0, 8)}
                                        </span>
                                        <p>{formatarData(pedido.data_criacao)}</p>
                                    </div>

                                    <span className={`status-pedido ${pedido.status?.toLowerCase()}`}>
                                        {nomeStatusPedido(pedido.status)}
                                    </span>
                                </div>

                                <div className="pedido-card-info novo-pedido-info">
                                    <div>
                                        <span>Cliente</span>
                                        <strong>{pedido.cliente?.nome || "Cliente"}</strong>
                                    </div>

                                    <div>
                                        <span>Pagamento</span>
                                        <strong>
                                            {nomeStatusPagamento(pedido.pagamento?.status)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Total</span>
                                        <strong>
                                            R$ {formatarPreco(pedido.valor_total)}
                                        </strong>
                                    </div>
                                </div>

                                <button
                                    className="ver-pedido"
                                    onClick={e => {
                                        e.stopPropagation()
                                        abrirPedido(pedido.id)
                                    }}
                                >
                                    Ver detalhes →
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {pedidoSelecionado && (
                <div
                    className="modal-pedido-fundo"
                    onClick={() => setPedidoSelecionado(null)}
                >
                    <div
                        className="modal-pedido"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="modal-pedido-topo">
                            <div>
                                <span>Detalhes do pedido</span>
                                <h2>Pedido #{pedidoSelecionado.id.slice(0, 8)}</h2>
                            </div>

                            <button onClick={() => setPedidoSelecionado(null)}>
                                ×
                            </button>
                        </header>

                        {carregandoDetalhes ? (
                            <div className="modal-carregando">
                                Carregando...
                            </div>
                        ) : (
                            <div className="modal-pedido-conteudo">
                                <section className="pedido-secao">
                                    <div className="pedido-secao-titulo">
                                        <h3>Dados do cliente</h3>
                                    </div>

                                    <div className="dados-cliente">
                                        <div>
                                            <span>Nome</span>
                                            <strong>
                                                {pedidoSelecionado.cliente?.nome || "Não informado"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Telefone</span>
                                            <strong>
                                                {pedidoSelecionado.cliente?.telefone || "Não informado"}
                                            </strong>
                                        </div>
                                    </div>
                                </section>

                                <section className="pedido-secao">
                                    <div className="pedido-secao-titulo">
                                        <h3>Produtos solicitados</h3>
                                    </div>

                                    <div className="itens-pedido">
                                        {pedidoSelecionado.itens?.map(item => (
                                            <div className="item-pedido" key={item.id}>
                                                <div>
                                                    <strong>
                                                        {item.quantidade}x {item.produto?.nome}
                                                    </strong>
                                                    <span>
                                                        R$ {formatarPreco(item.preco_unitario)} cada
                                                    </span>
                                                </div>

                                                <strong>
                                                    R$ {formatarPreco(item.subtotal)}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="resumo-pedido">
                                    <div>
                                        <span>Subtotal dos produtos</span>
                                        <strong>
                                            R$ {formatarPreco(pedidoSelecionado.valor_subtotal)}
                                        </strong>
                                    </div>

                                    <div className="total-pedido">
                                        <span>Total inicial</span>
                                        <strong>
                                            R$ {formatarPreco(pedidoSelecionado.valor_total)}
                                        </strong>
                                    </div>

                                    <p className="aviso-entrega-pedido">
                                        Entrega e possíveis custos adicionais são combinados diretamente pelo WhatsApp.
                                    </p>
                                </section>

                                <section className="pedido-secao">
                                    <div className="pedido-secao-titulo">
                                        <h3>Controle do pedido</h3>
                                    </div>

                                    <div className="dados-cliente">
                                        <div>
                                            <span>Status do pedido</span>
                                            <strong>
                                                {nomeStatusPedido(pedidoSelecionado.status)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Status do pagamento</span>
                                            <strong>
                                                {nomeStatusPagamento(pedidoSelecionado.pagamento?.status)}
                                            </strong>
                                        </div>
                                    </div>
                                </section>

                                <section className="pedido-secao">
                                    <div className="pedido-secao-titulo">
                                        <h3>Informações do pagamento</h3>
                                    </div>

                                    <div className="pagamento-pedido">
                                        <div>
                                            <span>Forma de pagamento</span>
                                            <strong>
                                                {nomeMetodo(pedidoSelecionado.pagamento?.metodo)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Valor registrado</span>
                                            <strong>
                                                R$ {formatarPreco(pedidoSelecionado.pagamento?.valor)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Confirmado em</span>
                                            <strong>
                                                {formatarData(pedidoSelecionado.pagamento?.pago_em)}
                                            </strong>
                                        </div>
                                    </div>
                                </section>

                                {pedidoSelecionado.status === "CANCELADO" &&
                                    pedidoSelecionado.pagamento?.status === "APROVADO" && (
                                        <div className="aviso-pagamento-aprovado">
                                            O pagamento foi aprovado antes do cancelamento. O registro financeiro foi preservado para conferência.
                                        </div>
                                    )}

                                {pedidoSelecionado.observacao && (
                                    <section className="pedido-observacao">
                                        <span>Observação do cliente</span>
                                        <p>{pedidoSelecionado.observacao}</p>
                                    </section>
                                )}

                                <div className="acoes-pedido-modal">
                                    {pedidoSelecionado.status !== "CANCELADO" ? (
                                        <button
                                            className="botao-cancelar-pedido"
                                            onClick={cancelarPedido}
                                            disabled={salvandoStatus}
                                        >
                                            {salvandoStatus ? "Cancelando..." : "Cancelar pedido"}
                                        </button>
                                    ) : (
                                        <span className="pedido-ja-cancelado">
                                            Este pedido está cancelado.
                                        </span>
                                    )}

                                    <button
                                        className="botao-fechar-pedido"
                                        onClick={() => setPedidoSelecionado(null)}
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default GestaoPedidos
