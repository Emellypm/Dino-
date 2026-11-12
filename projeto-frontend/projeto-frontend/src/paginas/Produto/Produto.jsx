import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./Produto.css"
import api from "../../services/api"

function Produto() {
    const { id } = useParams()
    const navegar = useNavigate()
    const [produto, setProduto] = useState(null)
    const [quantidade, setQuantidade] = useState(1)
    const [adicionado, setAdicionado] = useState(false)

    useEffect(() => {
        async function buscarProduto() {
            try {
                const resposta = await fetch(`${api}/VisualizarProdutoUnico`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id })
                })

                const dados = await resposta.json()

                if (!resposta.ok) {
                    console.log(dados)
                    return
                }

                setProduto(dados)
            } catch (erro) {
                console.log(erro)
            }
        }

        buscarProduto()
    }, [id])

    function aumentarQuantidade() {
        if (produto && quantidade < produto.estoque) {
            setQuantidade(quantidade + 1)
        }
    }

    function diminuirQuantidade() {
        if (quantidade > 1) {
            setQuantidade(quantidade - 1)
        }
    }

    function adicionarCarrinho() {
        const carrinhoSalvo = localStorage.getItem("carrinho")
        const carrinho = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : []
        const itemExiste = carrinho.find(item => item.id === produto.id)
        let novoCarrinho

        if (itemExiste) {
            novoCarrinho = carrinho.map(item =>
                item.id === produto.id
                    ? {
                        ...item,
                        quantidade: Math.min(
                            item.quantidade + quantidade,
                            produto.estoque
                        )
                    }
                    : item
            )
        } else {
            novoCarrinho = [
                ...carrinho,
                {
                    ...produto,
                    quantidade
                }
            ]
        }

        localStorage.setItem("carrinho", JSON.stringify(novoCarrinho))
        setAdicionado(true)
    }

    function entrarEmContato() {
        const mensagem = `Olá! Gostaria de saber mais sobre o produto "${produto.nome}" e fazer uma encomenda.`
        const link = `https://wa.me/5514991443625?text=${encodeURIComponent(mensagem)}`
        window.open(link, "_blank")
    }

    if (!produto) {
        return (
            <div className="produto-pagina">
                <p className="produto-carregando">
                    Carregando produto...
                </p>
            </div>
        )
    }

    return (
        <div className="produto-pagina">
            <div className="produto-container">
                <header className="produto-cabecalho">
                    <button onClick={() => navegar("/cardapio")}>
                        ← Voltar
                    </button>

                    <button
                        className="produto-carrinho"
                        onClick={() => navegar("/carrinho")}
                    >
                        🛒 Carrinho
                    </button>
                </header>

                <main className="produto-conteudo">
                    <div className="produto-imagem-container">
                        <img
                            src={`${api}/files/${produto.imagem}`}
                            alt={produto.nome}
                        />
                    </div>

                    <section className="produto-detalhes">
                        <div className="produto-categoria">
                            {produto.categorias?.map(item => (
                                <span key={item.categoria.id}>
                                    {item.categoria.nome}
                                </span>
                            ))}
                        </div>

                        <h1>{produto.nome}</h1>

                        {produto.sob_encomenda && (
                            <span className="produto-encomenda">
                                Sob encomenda
                            </span>
                        )}

                        <p className="produto-descricao">
                            {produto.descricao}
                        </p>

                        <strong className="produto-preco">
                            R$ {Number(produto.preco).toFixed(2)}
                        </strong>

                        {produto.sob_encomenda ? (
                            <>
                                <p className="produto-estoque">
                                    Produto feito sob encomenda
                                </p>

                                <button
                                    className="produto-botao"
                                    onClick={entrarEmContato}
                                >
                                    💬 Entrar em contato
                                </button>
                            </>
                        ) : produto.estoque > 0 ? (
                            <>
                                <p className="produto-estoque">
                                    {produto.estoque} unidades disponíveis
                                </p>

                                <div className="produto-quantidade">
                                    <span>Quantidade</span>

                                    <div className="quantidade-controle">
                                        <button onClick={diminuirQuantidade}>
                                            −
                                        </button>

                                        <strong>{quantidade}</strong>

                                        <button onClick={aumentarQuantidade}>
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="produto-botao"
                                    onClick={adicionarCarrinho}
                                >
                                    Adicionar ao carrinho
                                </button>

                                {adicionado && (
                                    <div className="produto-adicionado">
                                        <p>✓ Produto adicionado ao carrinho!</p>

                                        <div>
                                            <button
                                                onClick={() => setAdicionado(false)}
                                            >
                                                Continuar comprando
                                            </button>

                                            <button
                                                onClick={() => navegar("/carrinho")}
                                            >
                                                Ir para o carrinho
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                className="produto-botao desabilitado"
                                disabled
                            >
                                Produto esgotado
                            </button>
                        )}
                    </section>
                </main>
            </div>
        </div>
    )
}

export default Produto