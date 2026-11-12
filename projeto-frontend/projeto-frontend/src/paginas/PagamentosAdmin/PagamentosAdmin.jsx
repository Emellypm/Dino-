
import { useEffect, useState } from "react"
import api from "../../services/api"
import "./PagamentosAdmin.css"
import MenuAdmin from "../../componentes/MenuAdmin/MenuAdmin"

function PagamentosAdmin() {
    const [pagamentos, setPagamentos] = useState([])
    const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [filtroStatus, setFiltroStatus] = useState("TODOS")
    const [modalAberto, setModalAberto] = useState(false)
    const [novoStatus, setNovoStatus] = useState("PENDENTE")
    const [novoMetodo, setNovoMetodo] = useState("")
    const [novoValor, setNovoValor] = useState("")

    const status = ["TODOS", "PENDENTE", "APROVADO", "CANCELADO"]

    useEffect(() => {
        buscarPagamentos()
    }, [])

    async function buscarPagamentos() {
        try {
            setCarregando(true)
            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(`${api}/VisualizarDadosPagamentos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                console.log(dados)
                return
            }

            setPagamentos(
                Array.isArray(dados)
                    ? dados
                    : dados.pagamentos || dados.dados || []
            )
        } catch (erro) {
            console.log(erro)
        } finally {
            setCarregando(false)
        }
    }

    async function abrirPagamento(id) {
        try {
            setCarregandoDetalhes(true)
            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(`${api}/VisualizarPagamentoUnico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                alert(dados.error || dados.dados || "Não foi possível carregar o pagamento")
                return
            }

            setPagamentoSelecionado(dados)
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        } finally {
            setCarregandoDetalhes(false)
        }
    }

    function abrirModalAlteracao(pagamento) {
        setPagamentoSelecionado(pagamento)
        setNovoStatus(pagamento.status || "PENDENTE")
        setNovoMetodo(pagamento.metodo || "")
        setNovoValor(String(pagamento.valor ?? ""))
        setModalAberto(true)
    }

    function fecharModal() {
        setModalAberto(false)
        setNovoStatus("PENDENTE")
        setNovoMetodo("")
        setNovoValor("")
    }

    async function alterarPagamento(e) {
        e.preventDefault()

        if (!pagamentoSelecionado) return

        const valorFinal = Number(String(novoValor).replace(",", "."))

        if (novoValor.trim() === "" || !Number.isFinite(valorFinal) || valorFinal < 0) {
            alert("Informe um valor válido")
            return
        }

        if (novoStatus === "APROVADO" && !novoMetodo) {
            alert("Informe a forma de pagamento antes de aprovar")
            return
        }

        try {
            setSalvando(true)
            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(`${api}/AlterarPagamentos`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: pagamentoSelecionado.id,
                    status: novoStatus,
                    metodo: novoMetodo || null,
                    valor: valorFinal
                })
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                alert(dados.error || dados.dados || "Não foi possível alterar o pagamento")
                return
            }

            const pagamentoAtualizado = {
                ...pagamentoSelecionado,
                status: novoStatus,
                metodo: novoMetodo || null,
                valor: valorFinal,
                pago_em: novoStatus === "APROVADO"
                    ? pagamentoSelecionado.pago_em || new Date().toISOString()
                    : pagamentoSelecionado.pago_em
            }

            setPagamentos(lista =>
                lista.map(pagamento =>
                    pagamento.id === pagamentoAtualizado.id
                        ? pagamentoAtualizado
                        : pagamento
                )
            )

            setPagamentoSelecionado(pagamentoAtualizado)
            fecharModal()
            alert("Pagamento atualizado com sucesso!")
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        } finally {
            setSalvando(false)
        }
    }

    function nomeStatus(valor) {
        const nomes = {
            TODOS: "Todos",
            PENDENTE: "Pendente",
            APROVADO: "Aprovado",
            CANCELADO: "Cancelado"
        }

        return nomes[valor] || valor
    }

    function nomeMetodo(valor) {
        const nomes = {
            PIX: "PIX",
            CARTAO: "Cartão",
            DINHEIRO: "Dinheiro"
        }

        return nomes[valor] || (valor || "A combinar")
    }

    function formatarPreco(valor) {
        return Number(valor || 0).toFixed(2).replace(".", ",")
    }

    function formatarData(data) {
        if (!data) return "Ainda não aprovado"

        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const pagamentosFiltrados = filtroStatus === "TODOS"
        ? pagamentos
        : pagamentos.filter(pagamento => pagamento.status === filtroStatus)

    const totalRecebido = pagamentos
        .filter(pagamento => pagamento.status === "APROVADO")
        .reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0)

    const totalPendente = pagamentos
        .filter(pagamento => pagamento.status === "PENDENTE")
        .reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0)

    const totalCancelado = pagamentos
        .filter(pagamento => pagamento.status === "CANCELADO")
        .reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0)

    return (
        <div className="pagamentos-admin">
            <MenuAdmin paginaAtiva="pagamentos" />

            <main className="pagamentos-admin-conteudo">
                <header className="pagamentos-topo">
                    <div>
                        <h2>Pagamentos</h2>
                        <p className="pagamentos-topo-descricao">
                            Visão geral financeira
                        </p>
                    </div>

                    <button
                        className="botao-atualizar-pagamentos"
                        onClick={buscarPagamentos}
                    >
                        ↻ Atualizar
                    </button>
                </header>

                <div className="resumo-financeiro">
                    <div className="financeiro-card recebido">
                        <div className="financeiro-card-topo">
                            <span>Total recebido</span>
                            <span className="financeiro-icone">✓</span>
                        </div>
                        <strong>R$ {formatarPreco(totalRecebido)}</strong>
                        <small>Pagamentos aprovados</small>
                    </div>

                    <div className="financeiro-card pendente">
                        <div className="financeiro-card-topo">
                            <span>Aguardando pagamento</span>
                            <span className="financeiro-icone">◷</span>
                        </div>
                        <strong>R$ {formatarPreco(totalPendente)}</strong>
                        <small>Valores pendentes</small>
                    </div>

                    <div className="financeiro-card cancelado">
                        <div className="financeiro-card-topo">
                            <span>Cancelados</span>
                            <span className="financeiro-icone">×</span>
                        </div>
                        <strong>R$ {formatarPreco(totalCancelado)}</strong>
                        <small>Pagamentos cancelados</small>
                    </div>
                </div>

                <div className="filtros-pagamentos">
                    {status.map(item => (
                        <button
                            key={item}
                            className={
                                filtroStatus === item
                                    ? "filtro-pagamento ativo"
                                    : "filtro-pagamento"
                            }
                            onClick={() => setFiltroStatus(item)}
                        >
                            {nomeStatus(item)}
                        </button>
                    ))}
                </div>

                {carregando ? (
                    <div className="estado-pagamentos">
                        <span className="estado-pagamentos-icone">💳</span>
                        <p>Carregando pagamentos...</p>
                    </div>
                ) : pagamentosFiltrados.length === 0 ? (
                    <div className="estado-pagamentos">
                        <span className="estado-pagamentos-icone">💳</span>
                        <h3>Nenhum pagamento encontrado</h3>
                        <p>Não existem pagamentos nesse status.</p>
                    </div>
                ) : (
                    <section className="lista-pagamentos">
                        {pagamentosFiltrados.map(pagamento => (
                            <article
                                className="pagamento-card"
                                key={pagamento.id}
                                onClick={() => abrirPagamento(pagamento.id)}
                            >
                                <div className="pagamento-icone">💳</div>

                                <div className="pagamento-info">
                                    <div>
                                        <span>Método</span>
                                        <strong>{nomeMetodo(pagamento.metodo)}</strong>
                                    </div>

                                    <div>
                                        <span>Pedido</span>
                                        <strong>
                                            #{pagamento.pedido_id?.slice(0, 8) || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Valor</span>
                                        <strong>
                                            R$ {formatarPreco(pagamento.valor)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Status</span>
                                        <span className={`status-pagamento ${pagamento.status?.toLowerCase()}`}>
                                            {nomeStatus(pagamento.status)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="ver-pagamento"
                                    onClick={e => {
                                        e.stopPropagation()
                                        abrirPagamento(pagamento.id)
                                    }}
                                >
                                    Ver detalhes →
                                </button>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            {pagamentoSelecionado && !modalAberto && (
                <div
                    className="modal-pagamento-fundo"
                    onClick={() => setPagamentoSelecionado(null)}
                >
                    <div
                        className="modal-pagamento"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="modal-pagamento-topo">
                            <div>
                                <span>Pagamento</span>
                                <h2>Detalhes</h2>
                            </div>

                            <button onClick={() => setPagamentoSelecionado(null)}>
                                ×
                            </button>
                        </header>

                        {carregandoDetalhes ? (
                            <div className="modal-carregando-pagamento">
                                Carregando...
                            </div>
                        ) : (
                            <div className="modal-pagamento-conteudo">
                                <div className="pagamento-detalhe-icone">💳</div>

                                <div className="pagamento-detalhe">
                                    <span>Cliente</span>
                                    <strong>
                                        {pagamentoSelecionado.pedido?.cliente?.nome || "Não informado"}
                                    </strong>
                                </div>

                                <div className="pagamento-detalhe">
                                    <span>Telefone</span>
                                    <strong>
                                        {pagamentoSelecionado.pedido?.cliente?.telefone || "Não informado"}
                                    </strong>
                                </div>

                                <div className="pagamento-detalhe">
                                    <span>Método</span>
                                    <strong>
                                        {nomeMetodo(pagamentoSelecionado.metodo)}
                                    </strong>
                                </div>

                                <div className="pagamento-detalhe">
                                    <span>Valor registrado</span>
                                    <strong>
                                        R$ {formatarPreco(pagamentoSelecionado.valor)}
                                    </strong>
                                </div>

                                <div className="pagamento-detalhe">
                                    <span>Status</span>
                                    <strong>
                                        {nomeStatus(pagamentoSelecionado.status)}
                                    </strong>
                                </div>

                                <div className="pagamento-detalhe">
                                    <span>Pedido</span>
                                    <strong>
                                        #{pagamentoSelecionado.pedido_id?.slice(0, 8) || "—"}
                                    </strong>
                                </div>

                                <div className="pagamento-detalhe">
                                    <span>Pagamento confirmado em</span>
                                    <strong>
                                        {formatarData(pagamentoSelecionado.pago_em)}
                                    </strong>
                                </div>

                                <div className="acoes-detalhes-pagamento">
                                    <button
                                        onClick={() => abrirModalAlteracao(pagamentoSelecionado)}
                                    >
                                        Alterar pagamento
                                    </button>

                                    <button
                                        className="botao-fechar-pagamento"
                                        onClick={() => setPagamentoSelecionado(null)}
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
                    className="modal-pagamento-fundo"
                    onClick={fecharModal}
                >
                    <div
                        className="modal-pagamento"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="modal-pagamento-topo">
                            <div>
                                <span>Pagamentos</span>
                                <h2>Alterar pagamento</h2>
                            </div>

                            <button onClick={fecharModal}>×</button>
                        </header>

                        <form className="form-pagamento" onSubmit={alterarPagamento}>
                            <label>Forma de pagamento</label>

                            <select
                                value={novoMetodo}
                                onChange={e => setNovoMetodo(e.target.value)}
                            >
                                <option value="">A combinar</option>
                                <option value="PIX">PIX</option>
                                <option value="CARTAO">Cartão</option>
                                <option value="DINHEIRO">Dinheiro</option>
                            </select>

                            <label>Valor recebido (R$)</label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={novoValor}
                                onChange={e => setNovoValor(e.target.value)}
                                required
                            />

                            <label>Status do pagamento</label>

                            <select
                                value={novoStatus}
                                onChange={e => setNovoStatus(e.target.value)}
                            >
                                <option value="PENDENTE">Pendente</option>
                                <option value="APROVADO">Pagamento aprovado</option>
                                <option value="CANCELADO">Pagamento cancelado</option>
                            </select>

                            <div className="acoes-pagamento-modal">
                                <button
                                    type="button"
                                    className="botao-cancelar-pagamento"
                                    onClick={fecharModal}
                                >
                                    Voltar
                                </button>

                                <button
                                    type="submit"
                                    className="botao-salvar-pagamento"
                                    disabled={salvando}
                                >
                                    {salvando ? "Salvando..." : "Salvar alterações"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PagamentosAdmin
