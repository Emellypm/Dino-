import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Cardapio.css"
import api from "../../services/api"

function Cardapio() {
    const [categorias, setCategorias] = useState([])
    const [produtos, setProdutos] = useState([])
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("TODAS")
    const [carrinho, setCarrinho] = useState(() => {
        const salvo = localStorage.getItem("carrinho")
        return salvo ? JSON.parse(salvo) : []
    })

    const navegar = useNavigate()

    useEffect(() => {
        async function buscarDados() {
            try {
                const respostaCategorias = await fetch(`${api}/VisualizarDadosGeralCat`)
                const respostaProdutos = await fetch(`${api}/VisualizarDadosGeralPro`)
                const dadosCategorias = await respostaCategorias.json()
                const dadosProdutos = await respostaProdutos.json()

                setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : dadosCategorias.dados || [])
                setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : dadosProdutos.dados || [])
            } catch (erro) {
                console.log(erro)
            }
        }

        buscarDados()
    }, [])

    function adicionarCarrinho(produto) {
        setCarrinho((itens) => {
            const existe = itens.find((item) => item.id === produto.id)

            const novoCarrinho = existe
                ? itens.map((item) =>
                    item.id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                )
                : [...itens, { ...produto, quantidade: 1 }]

            localStorage.setItem("carrinho", JSON.stringify(novoCarrinho))
            return novoCarrinho
        })
    }

    const produtosAtivos = produtos.filter(
        (produto) => produto.status === "ATIVO"
    )

    const produtosFiltrados =
        categoriaSelecionada === "TODAS"
            ? produtosAtivos
            : produtosAtivos.filter((produto) =>
                produto.categorias?.some(
                    (item) => item.categoria?.id === categoriaSelecionada
                )
            )

    const quantidadeCarrinho = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    )

    function entrarEmContato(produto) {
        const mensagem = `Olá! Gostaria de saber mais sobre o produto "${produto.nome}" e fazer uma encomenda.`
        const link = `https://wa.me/5514991446325?text=${encodeURIComponent(mensagem)}`
        window.open(link, "_blank")
    }

    return (
        <div className="cardapio">
            <div className="cardapio-container">
                {/* Cabeçalho */}
                <header className="cardapio-cabecalho">
                    <button
                        className="botao-voltar"
                        onClick={() => navegar("/home")}
                    >
                        ← Voltar
                    </button>

                    <div className="cardapio-topo">
                        <img
                            src="/logo-dino-doces.jpeg"
                            alt="Dino's Doces"
                            className="cardapio-logo"
                        />
                        <h1>Dino's Doces</h1>
                        <p>Amor em forma de doces · Curitiba</p>
                    </div>

                    <button
                        className="botao-carrinho"
                        onClick={() => navegar("/carrinho")}
                    >
                        🛒 Carrinho ({quantidadeCarrinho})
                    </button>
                </header>

                <main className="cardapio-conteudo">
                    <h2>Nosso cardápio</h2>

                    {/* Categorias */}
                    <div className="categorias">
                        <button
                            className={categoriaSelecionada === "TODAS" ? "categoria ativa" : "categoria"}
                            onClick={() => setCategoriaSelecionada("TODAS")}
                        >
                            Todas
                        </button>

                        {categorias.map((categoria) => (
                            <button
                                key={categoria.id}
                                className={categoriaSelecionada === categoria.id ? "categoria ativa" : "categoria"}
                                onClick={() => setCategoriaSelecionada(categoria.id)}
                            >
                                {categoria.nome}
                            </button>
                        ))}
                    </div>

                    {/* Produtos */}
                    <div className="produtos-cardapio">
                        {produtosFiltrados.length > 0 ? (
                            produtosFiltrados.map((produto) => (
                                <div
                                    className="produto-card"
                                    key={produto.id}
                                    onClick={() => navegar(`/produto/${produto.id}`)}
                                >
                                    <img
                                        src={`${api}/files/${produto.imagem}`}
                                        alt={produto.nome}
                                    />

                                    <div className="produto-card-info">
                                        <h3>{produto.nome}</h3>
                                        <p>{produto.descricao}</p>

                                        {produto.sob_encomenda && (
                                            <span className="produto-encomenda">
                                                Sob encomenda
                                            </span>
                                        )}

                                        <strong>
                                            R$ {Number(produto.preco).toFixed(2)}
                                        </strong>

                                        {produto.sob_encomenda ? (
                                            <button onClick={() => entrarEmContato(produto)}>
                                                💬 Entrar em contato
                                            </button>
                                        ) : (
                                            <button onClick={() => adicionarCarrinho(produto)}>
                                                Adicionar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="sem-produtos">
                                Nenhum produto encontrado nessa categoria.
                            </p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Cardapio