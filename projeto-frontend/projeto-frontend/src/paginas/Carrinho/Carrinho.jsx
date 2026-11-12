import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Carrinho.css"
import api from "../../services/api"

function Carrinho() {
    const [carrinho, setCarrinho] = useState([])
    const navegar = useNavigate()

    useEffect(() => {
        const carrinhoSalvo = localStorage.getItem("carrinho")
        if (carrinhoSalvo) {
            setCarrinho(JSON.parse(carrinhoSalvo))
        }
    }, [])

    function atualizarCarrinho(novoCarrinho) {
        setCarrinho(novoCarrinho)
        localStorage.setItem("carrinho", JSON.stringify(novoCarrinho))
    }

    function aumentarQuantidade(id) {
        const novoCarrinho = carrinho.map((item) =>
            item.id === id
                ? {
                    ...item,
                    quantidade: Math.min(item.quantidade + 1, item.estoque)
                }
                : item
        )
        atualizarCarrinho(novoCarrinho)
    }

    function diminuirQuantidade(id) {
        const novoCarrinho = carrinho
            .map((item) =>
                item.id === id
                    ? { ...item, quantidade: item.quantidade - 1 }
                    : item
            )
            .filter((item) => item.quantidade > 0)

        atualizarCarrinho(novoCarrinho)
    }

    function removerProduto(id) {
        const novoCarrinho = carrinho.filter((item) => item.id !== id)
        atualizarCarrinho(novoCarrinho)
    }

    const subtotal = carrinho.reduce(
        (total, item) => total + Number(item.preco) * item.quantidade,
        0
    )
    const total = subtotal

    const quantidadeItens = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    )

    return (
        <div className="carrinho">
            <div className="carrinho-container">
                <header className="carrinho-cabecalho">
                    <button
                        className="carrinho-voltar"
                        onClick={() => navegar("/cardapio")}
                    >
                        ← Voltar
                    </button>

                    <div className="carrinho-titulo">
                        <h1>Meu carrinho</h1>
                        <p>
                            {quantidadeItens}{" "}
                            {quantidadeItens === 1 ? "item" : "itens"}
                        </p>
                    </div>
                </header>
                {carrinho.length === 0 ? (
                    <section className="carrinho-vazio">
                        <div className="carrinho-vazio-icone">🛍️</div>
                        <h2>Seu carrinho está vazio</h2>
                        <p>
                            Que tal escolher um docinho para começar?
                        </p>
                        <button onClick={() => navegar("/cardapio")}>
                            Ver cardápio
                        </button>
                    </section>
                ) : (
                    <main className="carrinho-conteudo">
                        <section className="itens-carrinho">
                            {carrinho.map((item) => (
                                <article className="item-carrinho" key={item.id}>
                                    <img
                                        src={`${api}/files/${item.imagem}`}
                                        alt={item.nome}
                                    />

                                    <div className="item-carrinho-info">
                                        <div className="item-carrinho-topo">
                                            <div>
                                                <h2>{item.nome}</h2>
                                                <p>
                                                    R$ {Number(item.preco).toFixed(2)}
                                                    {" "}cada
                                                </p>
                                            </div>

                                            <button
                                                className="botao-remover"
                                                onClick={() => removerProduto(item.id)}
                                                title="Remover produto"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="item-carrinho-baixo">
                                            <div className="quantidade">
                                                <button
                                                    onClick={() => diminuirQuantidade(item.id)}
                                                >
                                                    −
                                                </button>

                                                <span>{item.quantidade}</span>

                                                <button
                                                    onClick={() => aumentarQuantidade(item.id)}
                                                    disabled={
                                                        item.quantidade >= item.estoque
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <strong>
                                                R$ {(Number(item.preco) * item.quantidade).toFixed(2)}
                                            </strong>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </section>

                        <aside className="resumo-carrinho">
                            <h2>Resumo do pedido</h2>

                            <div className="linha-resumo">
                                <span>Subtotal</span>
                                <span>R$ {subtotal.toFixed(2)}</span>
                            </div>

                            <div className="linha-total">
                                <span>Total</span>
                                <strong>R$ {total.toFixed(2)}</strong>
                            </div>

                            <button
                                className="botao-finalizar"
                                onClick={() => navegar("/pedido")}
                            >
                                Finalizar pedido
                            </button>

                            <button
                                className="botao-continuar"
                                onClick={() => navegar("/cardapio")}
                            >
                                Continuar comprando
                            </button>
                        </aside>
                    </main>
                )}
            </div>
        </div>
    )
}

export default Carrinho