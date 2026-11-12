
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import "./Dashboard.css"
import MenuAdmin from "../../componentes/MenuAdmin/MenuAdmin"

function Dashboard() {
    const navegar = useNavigate()
    const [pedidos, setPedidos] = useState([])
    const [pagamentos, setPagamentos] = useState([])
    const [clientes, setClientes] = useState([])
    const [produtos, setProdutos] = useState([])
    const [maisVendidos, setMaisVendidos] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [atualizando, setAtualizando] = useState(false)
    const [erro, setErro] = useState("")
    const [horario, setHorario] = useState(new Date())

    async function carregarDashboard(mostrarCarregamento = false) {
        try {
            if (mostrarCarregamento) setAtualizando(true)
            setErro("")

            const token = localStorage.getItem("tokenAdmin")
            if (!token) throw new Error("Sessão administrativa não encontrada. Entre novamente.")

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            }

            const respostas = await Promise.all([
                fetch(`${api}/VisualizarDadosPedidos`, config),
                fetch(`${api}/VisualizarDadosPagamentos`, config),
                fetch(`${api}/visualizarDadosGeralCli`, config),
                fetch(`${api}/VisualizarDadosGeralPro`),
                fetch(`${api}/VisualizarMaisVendidos`)
            ])

            const nomes = ["pedidos", "pagamentos", "clientes", "produtos", "produtos mais pedidos"]
            const indiceErro = respostas.findIndex(resposta => !resposta.ok)

            if (indiceErro !== -1) {
                throw new Error(`Não foi possível carregar ${nomes[indiceErro]}.`)
            }

            const dados = await Promise.all(respostas.map(resposta => resposta.json()))

            function extrairLista(valor, chaves = []) {
                if (Array.isArray(valor)) return valor
                if (Array.isArray(valor?.dados)) return valor.dados

                for (const chave of chaves) {
                    if (Array.isArray(valor?.[chave])) return valor[chave]
                }

                return []
            }

            setPedidos(extrairLista(dados[0], ["pedidos"]))
            setPagamentos(extrairLista(dados[1], ["pagamentos"]))
            setClientes(extrairLista(dados[2], ["clientes"]))
            setProdutos(extrairLista(dados[3], ["produtos"]))
            setMaisVendidos(extrairLista(dados[4], ["produtos", "maisVendidos"]))
        } catch (error) {
            console.error("Erro ao carregar Dashboard:", error)
            setErro(error.message || "Não foi possível carregar os dados do Dashboard.")
        } finally {
            setCarregando(false)
            setAtualizando(false)
        }
    }

    useEffect(() => {
        carregarDashboard(true)

        const intervaloDados = setInterval(() => carregarDashboard(false), 30000)
        const intervaloHora = setInterval(() => setHorario(new Date()), 60000)

        return () => {
            clearInterval(intervaloDados)
            clearInterval(intervaloHora)
        }
    }, [])

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
    }

    function formatarData(data) {
        if (!data) return "Data não informada"

        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    function nomeStatusPedido(status) {
        return status === "CANCELADO"
            ? "Cancelado"
            : status === "RECEBIDO"
                ? "Recebido"
                : status || "Não informado"
    }

    function nomeStatusPagamento(status) {
        const nomes = {
            PENDENTE: "Pendente",
            APROVADO: "Aprovado",
            CANCELADO: "Cancelado"
        }

        return nomes[status] || "Sem pagamento"
    }

    const agora = horario
    const inicioHoje = new Date(agora)
    inicioHoje.setHours(0, 0, 0, 0)

    const fimHoje = new Date(agora)
    fimHoje.setHours(23, 59, 59, 999)

    const pedidosHoje = pedidos.filter(pedido => {
        const data = new Date(pedido.data_criacao)
        return data >= inicioHoje && data <= fimHoje
    })

    const pedidosRecebidosHoje = pedidosHoje.filter(
        pedido => pedido.status === "RECEBIDO"
    ).length

    const pedidosCanceladosHoje = pedidosHoje.filter(
        pedido => pedido.status === "CANCELADO"
    ).length

    const pagamentosAprovados = pagamentos.filter(
        pagamento => pagamento.status === "APROVADO"
    )

    const pagamentosPendentes = pagamentos.filter(
        pagamento => pagamento.status === "PENDENTE"
    )

    const totalPendente = pagamentosPendentes.reduce(
        (total, pagamento) => total + Number(pagamento.valor || 0),
        0
    )

    const totalRecebido = pagamentosAprovados.reduce(
        (total, pagamento) => total + Number(pagamento.valor || 0),
        0
    )

    const recebidoHoje = pagamentosAprovados
        .filter(pagamento => {
            if (!pagamento.pago_em) return false
            const data = new Date(pagamento.pago_em)
            return data >= inicioHoje && data <= fimHoje
        })
        .reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0)

    const recebimentos = {
        PIX: 0,
        CARTAO: 0,
        DINHEIRO: 0
    }

    pagamentosAprovados.forEach(pagamento => {
        if (recebimentos[pagamento.metodo] !== undefined) {
            recebimentos[pagamento.metodo] += Number(pagamento.valor || 0)
        }
    })

    const estoqueBaixo = produtos
        .filter(produto =>
            produto.status === "ATIVO" &&
            !produto.sob_encomenda &&
            Number(produto.estoque) <= 5
        )
        .sort((a, b) => Number(a.estoque) - Number(b.estoque))
        .slice(0, 5)

    const pedidosRecentes = [...pedidos]
        .sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao))
        .slice(0, 5)

    const inicioSemana = new Date(agora)
    inicioSemana.setDate(inicioSemana.getDate() - 6)
    inicioSemana.setHours(0, 0, 0, 0)

    const recebimentosSemana = Array.from({ length: 7 }, (_, indice) => {
        const data = new Date(inicioSemana)
        data.setDate(inicioSemana.getDate() + indice)

        const inicioDia = new Date(data)
        inicioDia.setHours(0, 0, 0, 0)

        const fimDia = new Date(data)
        fimDia.setHours(23, 59, 59, 999)

        const valor = pagamentosAprovados
            .filter(pagamento => {
                if (!pagamento.pago_em) return false
                const dataPagamento = new Date(pagamento.pago_em)
                return dataPagamento >= inicioDia && dataPagamento <= fimDia
            })
            .reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0)

        return { data, valor }
    })

    const maiorRecebimento = Math.max(
        ...recebimentosSemana.map(dia => dia.valor),
        1
    )

    const hora = agora.getHours()
    const saudacao = hora >= 5 && hora < 12
        ? "Bom dia"
        : hora >= 12 && hora < 18
            ? "Boa tarde"
            : "Boa noite"

    if (carregando) {
        return (
            <div className="dashboard">
                <MenuAdmin paginaAtiva="dashboard" />
                <main className="dashboard-conteudo">
                    <div className="dashboard-carregando">
                        Preparando seu painel...
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="dashboard">
            <MenuAdmin paginaAtiva="dashboard" />

            <main className="dashboard-conteudo">
                <header className="dashboard-topo">
                    <div className="dashboard-boas-vindas">
                        <span className="dashboard-etiqueta">
                            DINO'S DOCES · PAINEL DE GESTÃO
                        </span>
                        <h1>{saudacao}!</h1>
                        <p>Aqui está o resumo do seu negócio.</p>
                    </div>


                    <div className="dashboard-topo-acoes">
                        <div className="data-atual">
                            <div className="data-atual-calendario">
                                <div className="data-atual-icone">
                                    <span>♡</span>
                                </div>
                                <div className="data-atual-texto">
                                    <small>HOJE É DIA DE</small>
                                    <strong>
                                        {agora.toLocaleDateString("pt-BR", {
                                            weekday: "long",
                                            day: "2-digit",
                                            month: "long"
                                        })}
                                    </strong>
                                </div>
                            </div>
                            <div className="data-atual-hora">
                            
                                <strong>
                                    {agora.toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </strong>
                            </div>
                        </div>
                        <button
                            className="dashboard-atualizar"
                            onClick={() => carregarDashboard(true)}
                            disabled={atualizando}
                        >
                            {atualizando ? "Atualizando..." : "↻ Atualizar"}
                        </button>
                    </div>

                </header>

                {erro && (
                    <div className="dashboard-erro">{erro}</div>
                )}

                <section className="cards-resumo">
                    <article className="card-resumo card-pedidos">
                        <div className="card-resumo-icone">📦</div>
                        <p>Pedidos recebidos hoje</p>
                        <strong>{pedidosRecebidosHoje}</strong>
                        <small>{pedidosCanceladosHoje} cancelado(s) hoje</small>
                    </article>

                    <article className="card-resumo card-recebido">
                        <div className="card-resumo-icone">✓</div>
                        <p>Recebido hoje</p>
                        <strong>{formatarMoeda(recebidoHoje)}</strong>
                        <small>Pagamentos aprovados hoje</small>
                    </article>

                    <article className="card-resumo card-pendente">
                        <div className="card-resumo-icone">◷</div>
                        <p>Aguardando pagamento</p>
                        <strong>{formatarMoeda(totalPendente)}</strong>
                        <small>{pagamentosPendentes.length} pagamento(s) pendente(s)</small>
                    </article>

                    <article className="card-resumo card-clientes">
                        <div className="card-resumo-icone">♡</div>
                        <p>Clientes cadastrados</p>
                        <strong>{clientes.length}</strong>
                        <small>Clientes da loja</small>
                    </article>
                </section>

                <section className="dashboard-grid">
                    <article className="painel painel-pedidos-recentes">
                        <div className="painel-titulo">
                            <div>
                                <span>ACOMPANHAMENTO INTERNO</span>
                                <h2>Pedidos recentes</h2>
                            </div>
                            <button onClick={() => navegar("/admin/pedidos")}>
                                Ver pedidos →
                            </button>
                        </div>

                        {pedidosRecentes.length > 0 ? (
                            <div className="lista-pedidos-dashboard">
                                {pedidosRecentes.map(pedido => (
                                    <div className="pedido-recente" key={pedido.id}>
                                        <div className="pedido-recente-identificacao">
                                            <strong>
                                                #{pedido.id.slice(0, 8).toUpperCase()}
                                            </strong>
                                            <span>{pedido.cliente?.nome || "Cliente"}</span>
                                            <small>{formatarData(pedido.data_criacao)}</small>
                                        </div>

                                        <div className="pedido-recente-valores">
                                            <strong>{formatarMoeda(pedido.valor_total)}</strong>
                                            <span className={`status-badge pedido-${pedido.status?.toLowerCase()}`}>
                                                {nomeStatusPedido(pedido.status)}
                                            </span>
                                            <span className={`status-badge pagamento-${pedido.pagamento?.status?.toLowerCase() || "sem"}`}>
                                                Pagamento: {nomeStatusPagamento(pedido.pagamento?.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="dashboard-vazio">
                                <span>📦</span>
                                <p>Nenhum pedido recebido ainda.</p>
                            </div>
                        )}
                    </article>

                    <div className="dashboard-coluna-direita">
                        <article className="painel painel-financeiro">
                            <div className="painel-titulo">
                                <div>
                                    <span>CONTROLE FINANCEIRO</span>
                                    <h2>Recebimentos</h2>
                                </div>
                                <button onClick={() => navegar("/admin/pagamentos")}>
                                    Ver financeiro →
                                </button>
                            </div>

                            <div className="financeiro-total-dashboard">
                                <span>Total recebido</span>
                                <strong>{formatarMoeda(totalRecebido)}</strong>
                                <small>Somente pagamentos aprovados</small>
                            </div>

                            <div className="recebimento-item">
                                <span>PIX</span>
                                <strong>{formatarMoeda(recebimentos.PIX)}</strong>
                            </div>
                            <div className="recebimento-item">
                                <span>Cartão</span>
                                <strong>{formatarMoeda(recebimentos.CARTAO)}</strong>
                            </div>
                            <div className="recebimento-item">
                                <span>Dinheiro</span>
                                <strong>{formatarMoeda(recebimentos.DINHEIRO)}</strong>
                            </div>
                        </article>

                        <article className="painel painel-mais-pedidos">
                            <div className="painel-titulo">
                                <div>
                                    <span>DESTAQUES DO CARDÁPIO</span>
                                    <h2>Produtos mais pedidos</h2>
                                </div>
                            </div>

                            {maisVendidos.length > 0 ? (
                                maisVendidos.map(produto => (
                                    <div className="produto-vendido" key={produto.id}>
                                        <span>{produto.nome}</span>
                                        <strong>{produto.quantidadeVendida || 0} pedidos</strong>
                                    </div>
                                ))
                            ) : (
                                <p className="sem-dados">
                                    Ainda não há pedidos suficientes para mostrar.
                                </p>
                            )}
                        </article>

                        <article className="painel painel-estoque">
                            <div className="painel-titulo">
                                <div>
                                    <span>ATENÇÃO AO ESTOQUE</span>
                                    <h2>Estoque baixo</h2>
                                </div>
                                <button onClick={() => navegar("/admin/produtos")}>
                                    Ver produtos →
                                </button>
                            </div>

                            {estoqueBaixo.length > 0 ? (
                                estoqueBaixo.map(produto => (
                                    <div className="estoque-item" key={produto.id}>
                                        <span>{produto.nome}</span>
                                        <strong>{produto.estoque} un.</strong>
                                    </div>
                                ))
                            ) : (
                                <p className="sem-dados">
                                    Nenhum produto com estoque baixo.
                                </p>
                            )}
                        </article>
                    </div>

                    <article className="painel painel-grafico">
                        <div className="painel-titulo">
                            <div>
                                <span>ÚLTIMOS SETE DIAS</span>
                                <h2>Recebimentos por dia</h2>
                            </div>
                        </div>

                        <div className="grafico">
                            {recebimentosSemana.map((dia, indice) => {
                                const altura = dia.valor > 0
                                    ? Math.max((dia.valor / maiorRecebimento) * 100, 4)
                                    : 2

                                const diaSemana = dia.data
                                    .toLocaleDateString("pt-BR", { weekday: "short" })
                                    .replace(".", "")
                                    .slice(0, 3)

                                return (
                                    <div
                                        className="barra"
                                        key={indice}
                                        title={`${formatarMoeda(dia.valor)} recebidos`}
                                    >
                                        <div className="barra-valor">
                                            {dia.valor > 0 ? formatarMoeda(dia.valor) : ""}
                                        </div>
                                        <div
                                            className="barra-preenchida"
                                            style={{ height: `${altura}%` }}
                                        />
                                        <span>{diaSemana}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </article>
                </section>
            </main>
        </div>
    )
}

export default Dashboard
