
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Pedido.css"
import api from "../../services/api"

function Pedido() {
    const [carrinho, setCarrinho] = useState([])
    const [observacao, setObservacao] = useState("")
    const [carregando, setCarregando] = useState(false)
    const [modalPedidoAberto, setModalPedidoAberto] = useState(false)
    const [linkWhatsApp, setLinkWhatsApp] = useState("")
    const navegar = useNavigate()

    useEffect(() => {
        try {
            const carrinhoSalvo = localStorage.getItem("carrinho")
            const itens = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : []
            setCarrinho(Array.isArray(itens) ? itens : [])
        } catch (erro) {
            console.log("Erro ao carregar carrinho:", erro)
            setCarrinho([])
        }
    }, [])

    const subtotal = carrinho.reduce(
        (total, item) => total + Number(item.preco) * Number(item.quantidade),
        0
    )

    async function finalizarPedido(e) {
        e.preventDefault()

        const token = localStorage.getItem("clienteToken")

        if (!token) {
            alert("Faça login para finalizar o pedido")
            navegar("/login")
            return
        }

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio")
            navegar("/home")
            return
        }

        try {
            setCarregando(true)

            const mensagemFallback = [
                "🍰 NOVO PEDIDO - DINO'S DOCES",
                "",
                ...carrinho.map(item =>
                    `${item.quantidade}x ${item.nome} - R$ ${(Number(item.preco) * Number(item.quantidade)).toFixed(2).replace(".", ",")}`
                ),
                "",
                `Subtotal dos produtos: R$ ${subtotal.toFixed(2).replace(".", ",")}`,
                observacao.trim() ? `Observação: ${observacao.trim()}` : "",
                "Entrega, retirada e pagamento serão combinados pelo WhatsApp."
            ].filter(Boolean).join("\n")

            const resposta = await fetch(`${api}/FinalizarPedido`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    observacao,
                    itens: carrinho.map(item => ({
                        produto_id: item.id,
                        quantidade: item.quantidade
                    }))
                })
            })

            const dados = await resposta.json()

            console.log("STATUS:", resposta.status)
            console.log("RESPOSTA DO BACKEND:", dados)

            if (!resposta.ok) {
                alert(
                    dados.error ||
                    dados.dados ||
                    "Erro ao finalizar pedido"
                )
                return
            }

            const mensagem = dados.mensagem || dados?.dados?.mensagem || mensagemFallback

            const link = dados.linkWhatsApp ||
                dados?.dados?.linkWhatsApp ||
                `https://wa.me/5514991446325?text=${encodeURIComponent(mensagem)}`

            localStorage.removeItem("carrinho")
            setCarrinho([])
            setLinkWhatsApp(link)
            setModalPedidoAberto(true)

        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        } finally {
            setCarregando(false)
        }
    }

    return (
        <div className="pedido">
            <div className="pedido-container">
                <header className="pedido-cabecalho">
                    <button
                        type="button"
                        onClick={() => navegar("/carrinho")}
                    >
                        ← Voltar
                    </button>
                    <h1>Finalizar pedido 🍰</h1>
                </header>

                <form onSubmit={finalizarPedido}>
                    <section className="pedido-secao">
                        <h2>📝 Observação</h2>
                        <textarea
                            placeholder="Alguma observação sobre seu pedido?"
                            value={observacao}
                            onChange={e => setObservacao(e.target.value)}
                        />
                    </section>

                    <section className="pedido-secao">
                        <h2>📦 Entrega e pagamento</h2>
                        <p>
                            Os detalhes da entrega ou retirada,
                            valores adicionais e forma de pagamento
                            serão combinados diretamente com a loja
                            pelo WhatsApp após o envio do pedido.
                        </p>
                    </section>

                    <section className="resumo-pedido">
                        <h2>Resumo do pedido</h2>

                        {carrinho.map(item => (
                            <p key={item.id}>
                                {item.quantidade}x {item.nome}
                                <strong>
                                    R$ {(Number(item.preco) * Number(item.quantidade))
                                        .toFixed(2).replace(".", ",")}
                                </strong>
                            </p>
                        ))}

                        <div className="resumo-total-pedido">
                            <span>Subtotal dos produtos:</span>
                            <strong>
                                R$ {subtotal.toFixed(2).replace(".", ",")}
                            </strong>
                        </div>

                        <p className="aviso-total-pedido">
                            O valor da entrega, quando houver, será
                            combinado diretamente com a loja.
                        </p>

                        <button
                            type="submit"
                            disabled={carregando || carrinho.length === 0}
                        >
                            {carregando
                                ? "Registrando pedido..."
                                : "Finalizar pedido"}
                        </button>
                    </section>
                </form>
            </div>

            {modalPedidoAberto && (
                <div className="modal-confirmacao-fundo">
                    <div className="modal-confirmacao">
                        <div className="modal-confirmacao-icone">
                            ✓
                        </div>

                        <span className="modal-confirmacao-tag">
                            DINO'S DOCES
                        </span>

                        <h2>Pedido recebido! ♡</h2>

                        <p>
                            Seu pedido foi registrado com sucesso.
                            Agora só falta combinar alguns detalhes!
                        </p>

                        <div className="modal-confirmacao-aviso">
                            <strong>📱 Próximo passo</strong>
                            <p>
                                Para combinar a forma de pagamento,
                                os valores e as condições de entrega
                                ou retirada, entre em contato conosco
                                pelo WhatsApp.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="modal-confirmacao-whatsapp"
                            onClick={() => {
                                window.location.href = linkWhatsApp
                            }}
                        >
                            Conversar pelo WhatsApp
                        </button>

                        <button
                            type="button"
                            className="modal-confirmacao-voltar"
                            onClick={() => navegar("/home")}
                        >
                            Voltar para o início
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Pedido
