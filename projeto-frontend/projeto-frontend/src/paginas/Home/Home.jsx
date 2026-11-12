import { useEffect, useState } from "react"
import "./Home.css"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"

function Home() {
    const [categorias, setCategorias] = useState([])
    const [maisVendidos, setMaisVendidos] = useState([])
    const [menuAberto, setMenuAberto] = useState(false)

    const [carrinho, setCarrinho] = useState(() => {
        const carrinhoSalvo = localStorage.getItem("carrinho")
        return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : []
    })

    const navegar = useNavigate()

    useEffect(() => {
        async function buscarCategorias() {
            try {
                const resposta = await fetch(`${api}/VisualizarDadosGeralCat`)
                const dados = await resposta.json()

                setCategorias(
                    Array.isArray(dados)
                        ? dados
                        : Array.isArray(dados.dados)
                            ? dados.dados
                            : []
                )
            } catch (erro) {
                console.log(erro)
                setCategorias([])
            }
        }

        async function buscarMaisVendidos() {
            try {
                const resposta = await fetch(`${api}/VisualizarMaisVendidos`)
                const dados = await resposta.json()

                setMaisVendidos(
                    Array.isArray(dados)
                        ? dados
                        : Array.isArray(dados.dados)
                            ? dados.dados
                            : []
                )
            } catch (erro) {
                console.log(erro)
                setMaisVendidos([])
            }
        }

        buscarCategorias()
        buscarMaisVendidos()
    }, [])

    function fecharMenu() {
        setMenuAberto(false)
    }

    function adicionarCarrinho(produto) {
        setCarrinho((itens) => {
            const itemExiste = itens.find(
                (item) => item.id === produto.id
            )

            let novoCarrinho

            if (itemExiste) {
                novoCarrinho = itens.map((item) =>
                    item.id === produto.id
                        ? {
                            ...item,
                            quantidade: item.quantidade + 1
                        }
                        : item
                )
            } else {
                novoCarrinho = [
                    ...itens,
                    {
                        ...produto,
                        quantidade: 1
                    }
                ]
            }

            localStorage.setItem(
                "carrinho",
                JSON.stringify(novoCarrinho)
            )

            return novoCarrinho
        })
    }

    const quantidadeCarrinho = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    )

    return (
        <div className="home">
            <nav className="home-navbar">
                <div className="home-navbar-conteudo">
                    <div
                        className="home-marca"
                        onClick={() => {
                            navegar("/")
                            fecharMenu()
                        }}
                    >
                        <img
                            src="/logo-dino-doces.jpeg"
                            alt="Dino Doces"
                        />

                        <span>Dino's Doces</span>
                    </div>

                    <div
                        className={
                            menuAberto
                                ? "home-links menu-aberto"
                                : "home-links"
                        }
                    >
                        <button
                            onClick={() => {
                                navegar("/cardapio")
                                fecharMenu()
                            }}
                        >
                            Cardápio
                        </button>

                        <a
                            href="#sobre"
                            onClick={fecharMenu}
                        >
                            Sobre
                        </a>

                        <a
                            href="#contato"
                            onClick={fecharMenu}
                        >
                            Contato
                        </a>

                        <button
                            onClick={() => {
                                navegar("/minha-conta")
                                fecharMenu()
                            }}
                        >
                            Minha conta
                        </button>
                    </div>

                    <div className="home-navbar-acoes">
                        <button
                            className="home-sacola"
                            onClick={() => navegar("/carrinho")}
                        >
                            🛍️ {quantidadeCarrinho}
                        </button>

                        <button
                            className="home-menu-mobile"
                            onClick={() => setMenuAberto(!menuAberto)}
                            aria-label="Abrir menu"
                            aria-expanded={menuAberto}
                        >
                            {menuAberto ? "✕" : "☰"}
                        </button>
                    </div>
                </div>
            </nav>

            <header className="home-hero">
                <div className="home-hero-conteudo">
                    <div className="home-hero-texto">
                        <p className="home-tag">
                            CURITIBA · ENCOMENDAS ONLINE
                        </p>

                        <h1>
                            Amor em forma
                            <br />
                            de doces
                        </h1>

                        <p>
                            Um pouquinho de carinho em cada doce. ♡
                        </p>

                        <button
                            className="home-botao"
                            onClick={() => navegar("/cardapio")}
                        >
                            Ver cardápio
                        </button>
                    </div>

                    <div className="home-hero-logo">
                        <img
                            src="/logo-dino-doces.jpeg"
                            alt="Dino Doces"
                        />
                    </div>
                </div>
            </header>

            <section
                id="cardapio"
                className="home-secao categorias"
            >
                <h2>Categorias</h2>

                <div className="categorias-grid">
                    {categorias.map((categoria) => (
                        <button
                            key={categoria.id}
                            className="categoria"
                            onClick={() => navegar("/cardapio")}
                        >
                            <div className="categoria-imagem" />

                            <p>{categoria.nome}</p>
                        </button>
                    ))}
                </div>
            </section>

            <section className="home-secao destaques">
                <h2>Destaques da semana</h2>

                <div className="destaques-grid">
                    {maisVendidos.length > 0 ? (
                        maisVendidos.map((produto) => (
                            <div
                                className="destaque"
                                key={produto.id}
                            >
                                <div className="destaque-imagem">
                                    <img
                                        src={`${api}/files/${produto.imagem}`}
                                        alt={produto.nome}
                                    />
                                </div>

                                <div className="destaque-info">
                                    <h3>{produto.nome}</h3>

                                    <strong>
                                        R$ {Number(produto.preco).toFixed(2)}
                                    </strong>

                                    <button
                                        onClick={() =>
                                            adicionarCarrinho(produto)
                                        }
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="sem-destaques">
                            Ainda não há produtos em destaque.
                        </p>
                    )}
                </div>
            </section>

            <section className="home-faixa">
            </section>

            <section
                id="sobre"
                className="home-secao home-sobre"
            >
                <div>
                    <h2>Sobre a Dino's Doces</h2>

                    <p>
                        Tudo fica mais gostoso quando é feito com carinho. ♡
                    </p>

                    <p>
                        Na Dino's Doces, cada doce é preparado com cuidado para
                        deixar seu dia mais feliz — seja em uma comemoração
                        especial ou naquele momento em que bate vontade de
                        comer um docinho. 🍰
                    </p>
                </div>
            </section>

            <footer
                id="contato"
                className="home-footer"
            >
                <div className="home-footer-conteudo">
                    <div className="home-footer-marca">
                        <img
                            src="/logo-dino-doces.jpeg"
                            alt="Dino Doces"
                        />

                        <span>Dino's Doces</span>
                    </div>

                    <div className="home-footer-info">
                        <span>Curitiba, PR</span>
                        <span>(00) 00000-0000</span>
                        <span>@dino_doces_ofc</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home