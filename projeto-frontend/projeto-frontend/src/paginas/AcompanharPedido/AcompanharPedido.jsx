import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./AcompanharPedido.css"
import api from "../../services/api"

function AcompanharPedido() {
    const { id } = useParams()
    const navegar = useNavigate()

    const [pedido, setPedido] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [atualizando, setAtualizando] = useState(false)
    const [linkWhatsApp, setLinkWhatsApp] = useState(null)

    async function buscarPedido() {
        try {
            const token = localStorage.getItem("clienteToken")

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
                console.log(dados)
                return
            }

            setPedido(dados)

            const respostaWhatsApp = await fetch(`${api}/GerarWhatsApp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            })

            const dadosWhatsApp = await respostaWhatsApp.json()

            if (respostaWhatsApp.ok) {
                setLinkWhatsApp(dadosWhatsApp.linkWhatsApp)
            }

        } catch (erro) {
            console.log(erro)
        } finally {
            setCarregando(false)
            setAtualizando(false)
        }
    }

    useEffect(() => {
        buscarPedido()

        const intervalo = setInterval(() => {
            if (
                pedido?.status !== "ENTREGUE" &&
                pedido?.status !== "CANCELADO"
            ) {
                setAtualizando(true)
                buscarPedido()
            }
        }, 10000)

        return () => clearInterval(intervalo)
    }, [id, pedido?.status])

    const pedidoEhRetirada = !pedido?.rua?.trim() &&
        !pedido?.cidade?.trim() &&
        !pedido?.cep?.trim()

    const etapas = [
        {
            status: "PENDENTE",
            titulo: "Pedido recebido",
            mensagem: "Recebemos seu pedido 💗",
            icone: "📋"
        },
        {
            status: "CONFIRMADO",
            titulo: "Pedido confirmado",
            mensagem: "Seu pedido foi confirmado!",
            icone: "✓"
        },
        {
            status: "EM_PREPARACAO",
            titulo: "Em preparação",
            mensagem: "Estamos preparando seus doces 🍰",
            icone: "🍰"
        },
        {
            status: "A_CAMINHO",
            titulo: pedidoEhRetirada ? "Pronto para retirada" : "Saiu para entrega",
            mensagem: pedidoEhRetirada
                ? "Seu pedido está pronto! Você já pode retirar na loja 🛍️"
                : "Seu pedido saiu para entrega 🛵",
            icone: pedidoEhRetirada ? "🛍️" : "🛵"
        },
        {
            status: "ENTREGUE",
            titulo: pedidoEhRetirada ? "Pedido retirado" : "Pedido entregue",
            mensagem: pedidoEhRetirada
                ? "Seu pedido foi retirado! Aproveite seus doces ✨"
                : "Pedido entregue! Aproveite seu docinho ✨",
            icone: "✨"
        }
    ]

    const statusAtual = etapas.findIndex(
        etapa => etapa.status === pedido?.status
    )

    if (carregando) {
        return (
            <div className="acompanhar-pedido">
                <div className="acompanhar-carregando">
                    <div className="loading-doce">🍰</div>
                    <p>Carregando seu pedido...</p>
                </div>
            </div>
        )
    }

    if (!pedido) {
        return (
            <div className="acompanhar-pedido">
                <div className="pedido-nao-encontrado">
                    <span>🍰</span>

                    <h2>Pedido não encontrado</h2>

                    <button onClick={() => navegar("/cardapio")}>
                        Voltar ao cardápio
                    </button>
                </div>
            </div>
        )
    }

    const etapaAtual = etapas.find(
        etapa => etapa.status === pedido.status
    )

    return (
        <div className="acompanhar-pedido">
            <div className="acompanhar-container">

                <header className="acompanhar-cabecalho">
                    <button onClick={() => navegar("/home")}>
                        ← Voltar
                    </button>

                    <div>
                        <p>Acompanhamento</p>
                        <h1>Seu pedido 💗</h1>
                    </div>
                </header>

                <section className="pedido-topo">
                    <span>Pedido</span>

                    <strong>
                        #{pedido.id.slice(0, 8)}
                    </strong>

                    {atualizando && (
                        <span className="atualizando">
                            Atualizando...
                        </span>
                    )}
                </section>

                {pedido.status === "CANCELADO" ? (
                    <section className="pedido-cancelado">
                        <div className="cancelado-icone">
                            ×
                        </div>

                        <h2>Pedido cancelado</h2>

                        <p>
                            Esse pedido foi cancelado pela loja.
                        </p>
                    </section>
                ) : (
                    <>
                        <section className="status-atual">

                            <div className="status-atual-icone">
                                {etapaAtual?.icone}
                            </div>

                            <div>
                                <span>Status atual</span>

                                <h2>
                                    {etapaAtual?.titulo}
                                </h2>

                                <p>
                                    {etapaAtual?.mensagem}
                                </p>
                            </div>

                        </section>

                        <section className="timeline">

                            {etapas.map((etapa, index) => {

                                const concluida =
                                    index < statusAtual

                                const atual =
                                    index === statusAtual

                                return (
                                    <div
                                        className={`timeline-item ${concluida
                                            ? "concluida"
                                            : ""
                                            } ${atual
                                                ? "atual"
                                                : ""
                                            }`}
                                        key={etapa.status}
                                    >
                                        <div className="timeline-linha">

                                            <div className="timeline-icone">
                                                {concluida
                                                    ? "✓"
                                                    : atual
                                                        ? etapa.icone
                                                        : ""}
                                            </div>

                                            {index <
                                                etapas.length - 1 && (
                                                    <div className="timeline-conexao"></div>
                                                )}

                                        </div>

                                        <div className="timeline-info">

                                            <h3>
                                                {etapa.titulo}
                                            </h3>

                                            {atual && (
                                                <p>
                                                    {etapa.mensagem}
                                                </p>
                                            )}

                                        </div>
                                    </div>
                                )
                            })}

                        </section>
                    </>
                )}

                <section className="resumo-pedido">

                    <div className="resumo-titulo">
                        <h2>Resumo do pedido</h2>
                    </div>

                    {pedido.itens?.map((item, index) => (
                        <div
                            className="item-resumo"
                            key={index}
                        >
                            <div>
                                <strong>
                                    {item.quantidade}x{" "}
                                    {item.produto.nome}
                                </strong>
                            </div>

                            <span>
                                R$ {Number(
                                    item.subtotal
                                ).toFixed(2)}
                            </span>
                        </div>
                    ))}

                    <div className="resumo-linha">
                        <span>Modalidade</span>
                        <span>
                            {pedidoEhRetirada ? "Retirada no local" : "Entrega"}
                        </span>
                    </div>

                    {!pedidoEhRetirada && (
                        <div className="resumo-linha">
                            <span>Taxa de entrega</span>
                            <span>
                                R$ {Number(pedido.valor_entrega).toFixed(2)}
                            </span>
                        </div>
                    )}

                    <div className="resumo-total">
                        <span>Total</span>

                        <strong>
                            R$ {Number(
                                pedido.valor_total
                            ).toFixed(2)}
                        </strong>
                    </div>

                    {linkWhatsApp && (
                        <button
                            className="botao-whatsapp"
                            onClick={() =>
                                window.open(
                                    linkWhatsApp,
                                    "_blank"
                                )
                            }
                        >
                            Falar com a loja pelo WhatsApp
                        </button>
                    )}

                </section>

            </div>
        </div>
    )
}

export default AcompanharPedido