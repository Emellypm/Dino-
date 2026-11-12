import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./ProdutosAdmin.css"
import api from "../../services/api"
import MenuAdmin from "../../componentes/MenuAdmin/MenuAdmin"

function ProdutosAdmin() {
    const [produtos, setProdutos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [categoriaId, setCategoriaId] = useState("")
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [nome, setNome] = useState("")
    const [descricao, setDescricao] = useState("")
    const [preco, setPreco] = useState("")
    const [estoque, setEstoque] = useState("")
    const [imagem, setImagem] = useState(null)
    const [previewImagem, setPreviewImagem] = useState(null)
    const [disponivel, setDisponivel] = useState(true)
    const [sobEncomenda, setSobEncomenda] = useState(false)
    const [produtoEditando, setProdutoEditando] = useState(null)
    const [carregando, setCarregando] = useState(false)
    const navegar = useNavigate()

    useEffect(() => {
        buscarProdutos()
        buscarCategorias()
    }, [])

    async function buscarCategorias() {
        try {
            const resposta = await fetch(`${api}/VisualizarDadosGeralCat`)
            const dados = await resposta.json()

            if (!resposta.ok) {
                console.log(dados)
                return
            }

            setCategorias(dados)
        } catch (erro) {
            console.log(erro)
        }
    }

    async function buscarProdutos() {
        try {
            const resposta = await fetch(`${api}/VisualizarDadosGeralPro`)
            const dados = await resposta.json()

            if (!resposta.ok) {
                console.log(dados)
                return
            }

            setProdutos(dados)
        } catch (erro) {
            console.log(erro)
        }
    }

    function limparFormulario() {
        setNome("")
        setDescricao("")
        setPreco("")
        setEstoque("")
        setImagem(null)
        setPreviewImagem(null)
        setCategoriaId("")
        setDisponivel(true)
        setSobEncomenda(false)
        setProdutoEditando(null)
    }

    function selecionarImagem(e) {
        const arquivo = e.target.files[0]

        if (arquivo) {
            setImagem(arquivo)
            setPreviewImagem(URL.createObjectURL(arquivo))
        }
    }

    function abrirCadastro() {
        limparFormulario()
        setMostrarFormulario(true)
    }

    function abrirEdicao(produto) {
        setProdutoEditando(produto)
        setNome(produto.nome)
        setDescricao(produto.descricao)
        setPreco(produto.preco)
        setEstoque(produto.estoque)
        setSobEncomenda(produto.sob_encomenda === true)

        if (produto.categorias?.length > 0) {
            setCategoriaId(produto.categorias[0].categoria.id)
        } else {
            setCategoriaId("")
        }

        setDisponivel(produto.status === "ATIVO")

        if (produto.imagem) {
            setPreviewImagem(`${api}/files/${produto.imagem}`)
        } else {
            setPreviewImagem(null)
        }

        setImagem(null)
        setMostrarFormulario(true)
    }

    async function cadastrarProduto(e) {
        e.preventDefault()

        if (!imagem) {
            alert("Selecione uma imagem")
            return
        }

        if (!categoriaId) {
            alert("Selecione uma categoria")
            return
        }

        try {
            setCarregando(true)

            const token = localStorage.getItem("tokenAdmin")
            const dados = new FormData()

            dados.append("nome", nome)
            dados.append("descricao", descricao)
            dados.append("preco", preco)
            dados.append("estoque", estoque)
            dados.append("sob_encomenda", String(sobEncomenda))
            dados.append("imagem", imagem)

            const resposta = await fetch(`${api}/CadastrarProdutos`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: dados
            })

            const resultado = await resposta.json()

            if (!resposta.ok) {
                alert(
                    resultado.error ||
                    resultado.dados ||
                    "Não foi possível cadastrar o produto"
                )
                return
            }

            const respostaCategoria = await fetch(
                `${api}/CadastrarProdutoCategoria`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        produto_id: resultado.produto_id,
                        categoria_id: categoriaId
                    })
                }
            )

            const dadosCategoria = await respostaCategoria.json()

            if (!respostaCategoria.ok) {
                alert(
                    "Produto criado, mas não foi possível vincular a categoria"
                )
                console.log(dadosCategoria)
                return
            }

            alert("Produto cadastrado com sucesso!")
            setMostrarFormulario(false)
            limparFormulario()
            buscarProdutos()
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        } finally {
            setCarregando(false)
        }
    }

    async function editarProduto(e) {
        e.preventDefault()

        if (!produtoEditando) {
            return
        }

        if (!categoriaId) {
            alert("Selecione uma categoria")
            return
        }

        try {
            setCarregando(true)

            const token = localStorage.getItem("tokenAdmin")
            const dados = new FormData()

            dados.append("id", produtoEditando.id)
            dados.append("nome", nome)
            dados.append("descricao", descricao)
            dados.append("preco", preco)
            dados.append("estoque", estoque)
            dados.append("status", disponivel ? "ATIVO" : "INATIVO")
            dados.append("sob_encomenda", String(sobEncomenda))

            if (imagem) {
                dados.append("imagem", imagem)
            }

            const resposta = await fetch(`${api}/AlterarProdutos`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: dados
            })

            const resultado = await resposta.json()

            if (!resposta.ok) {
                alert(
                    resultado.error ||
                    resultado.dados ||
                    "Não foi possível alterar o produto"
                )
                return
            }

            alert("Produto alterado com sucesso!")
            setMostrarFormulario(false)
            limparFormulario()
            buscarProdutos()
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        } finally {
            setCarregando(false)
        }
    }

    async function alterarStatusProduto(produto) {
        const novoStatus =
            produto.status === "ATIVO"
                ? "INATIVO"
                : "ATIVO"

        const confirmar = window.confirm(
            novoStatus === "INATIVO"
                ? "Deseja desativar este produto?"
                : "Deseja ativar este produto novamente?"
        )

        if (!confirmar) {
            return
        }

        try {
            const token = localStorage.getItem("tokenAdmin")
            const dados = new FormData()

            dados.append("id", produto.id)
            dados.append("nome", produto.nome)
            dados.append("descricao", produto.descricao)
            dados.append("preco", produto.preco)
            dados.append("estoque", produto.estoque)
            dados.append("status", novoStatus)
            dados.append(
                "sob_encomenda",
                String(produto.sob_encomenda === true)
            )

            const resposta = await fetch(`${api}/AlterarProdutos`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: dados
            })

            const resultado = await resposta.json()

            if (!resposta.ok) {
                alert(
                    resultado.error ||
                    resultado.dados ||
                    "Não foi possível alterar o status"
                )
                return
            }

            buscarProdutos()
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        }
    }

    function formatarPreco(preco) {
        return Number(preco).toFixed(2).replace(".", ",")
    }

    return (
        <div className="produtos-admin">
            <MenuAdmin paginaAtiva="produtos" />

            <main className="produtos-admin-conteudo">
                <header className="produtos-admin-topo">
                    <div>
                        <p>Administração</p>
                        <h2>Produtos</h2>
                    </div>

                    <button
                        className="botao-cadastrar"
                        onClick={abrirCadastro}
                    >
                        + Cadastrar produto
                    </button>
                </header>

                <div className="produtos-lista">
                    {produtos.length === 0 ? (
                        <div className="sem-produtos-admin">
                            <span>🍰</span>
                            <h3>Nenhum produto encontrado</h3>
                            <p>
                                Ainda não existem produtos cadastrados.
                            </p>
                        </div>
                    ) : (
                        produtos.map(produto => (
                            <article
                                className="produto-admin-card"
                                key={produto.id}
                            >
                                <img
                                    src={`${api}/files/${produto.imagem}`}
                                    alt={produto.nome}
                                />

                                <div className="produto-admin-info">
                                    <div className="produto-admin-titulo">
                                        <div>
                                            <h3>{produto.nome}</h3>

                                            <p>{produto.descricao}</p>

                                            {produto.sob_encomenda && (
                                                <span className="produto-sob-encomenda">
                                                    Sob encomenda
                                                </span>
                                            )}
                                        </div>

                                        <span
                                            className={
                                                produto.status === "ATIVO"
                                                    ? "status ativo"
                                                    : "status inativo"
                                            }
                                        >
                                            {produto.status}
                                        </span>
                                    </div>

                                    <div className="produto-admin-detalhes">
                                        <div>
                                            <span>Categoria</span>

                                            <strong>
                                                {produto.categorias?.length > 0
                                                    ? produto.categorias
                                                        .map(
                                                            item =>
                                                                item.categoria.nome
                                                        )
                                                        .join(", ")
                                                    : "Sem categoria"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Preço</span>

                                            <strong>
                                                R$ {formatarPreco(
                                                    produto.preco
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Estoque</span>

                                            <strong>
                                                {produto.estoque} un.
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="produto-admin-acoes">
                                        <button
                                            className="botao-editar"
                                            onClick={() =>
                                                abrirEdicao(produto)
                                            }
                                        >
                                            Editar
                                        </button>

                                        <button
                                            className={
                                                produto.status === "ATIVO"
                                                    ? "botao-excluir"
                                                    : "botao-ativar"
                                            }
                                            onClick={() =>
                                                alterarStatusProduto(produto)
                                            }
                                        >
                                            {produto.status === "ATIVO"
                                                ? "Desativar"
                                                : "Ativar"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </main>

            {mostrarFormulario && (
                <div
                    className="modal-produto-fundo"
                    onClick={() => setMostrarFormulario(false)}
                >
                    <div
                        className="modal-produto"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="cadastro-produto-topo">
                            <button
                                type="button"
                                onClick={() => {
                                    setMostrarFormulario(false)
                                    limparFormulario()
                                }}
                            >
                                ←
                            </button>

                            <h2>
                                {produtoEditando
                                    ? "Editar produto"
                                    : "Novo produto"}
                            </h2>
                        </header>

                        <form
                            onSubmit={
                                produtoEditando
                                    ? editarProduto
                                    : cadastrarProduto
                            }
                            className="cadastro-produto-form"
                        >
                            <div className="cadastro-produto-grid">
                                <div className="cadastro-produto-esquerda">
                                    <label
                                        htmlFor="foto-produto"
                                        className="area-foto-produto"
                                    >
                                        {previewImagem ? (
                                            <img
                                                src={previewImagem}
                                                alt="Prévia do produto"
                                            />
                                        ) : (
                                            <span>
                                                Clique para adicionar foto
                                            </span>
                                        )}
                                    </label>

                                    <input
                                        id="foto-produto"
                                        type="file"
                                        accept="image/*"
                                        onChange={selecionarImagem}
                                        hidden
                                        required={!produtoEditando}
                                    />

                                    <div className="produto-disponivel">
                                        <span>
                                            Disponível no cardápio
                                        </span>

                                        <button
                                            type="button"
                                            className={
                                                disponivel
                                                    ? "toggle-produto ativo"
                                                    : "toggle-produto"
                                            }
                                            onClick={() =>
                                                setDisponivel(!disponivel)
                                            }
                                        >
                                            <span></span>
                                        </button>
                                    </div>

                                    <label className="produto-encomenda-check">
                                        <input
                                            type="checkbox"
                                            checked={sobEncomenda}
                                            onChange={e =>
                                                setSobEncomenda(
                                                    e.target.checked
                                                )
                                            }
                                        />

                                        <span>
                                            Produto sob encomenda
                                        </span>
                                    </label>
                                </div>

                                <div className="cadastro-produto-direita">
                                    <div className="campo-produto">
                                        <label>
                                            Nome do produto
                                        </label>

                                        <input
                                            type="text"
                                            value={nome}
                                            onChange={e =>
                                                setNome(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ex: Bolo de chocolate"
                                            required
                                        />
                                    </div>

                                    <div className="campo-produto">
                                        <label>
                                            Categoria
                                        </label>

                                        <select
                                            value={categoriaId}
                                            onChange={e =>
                                                setCategoriaId(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        >
                                            <option value="">
                                                Selecione uma categoria
                                            </option>

                                            {categorias.map(
                                                categoria => (
                                                    <option
                                                        key={
                                                            categoria.id
                                                        }
                                                        value={
                                                            categoria.id
                                                        }
                                                    >
                                                        {categoria.nome}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="campos-produto-linha">
                                        <div className="campo-produto">
                                            <label>
                                                Preço
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={preco}
                                                onChange={e =>
                                                    setPreco(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="R$ 0,00"
                                                required
                                            />
                                        </div>

                                        <div className="campo-produto">
                                            <label>
                                                Estoque
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={estoque}
                                                onChange={e =>
                                                    setEstoque(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Un."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="campo-produto">
                                        <label>
                                            Descrição
                                        </label>

                                        <textarea
                                            value={descricao}
                                            onChange={e =>
                                                setDescricao(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Conte sobre o produto..."
                                            rows="4"
                                            required
                                        />
                                    </div>

                                    <div className="cadastro-produto-acoes">
                                        <button
                                            type="button"
                                            className="botao-cancelar"
                                            onClick={() => {
                                                setMostrarFormulario(false)
                                                limparFormulario()
                                            }}
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            type="submit"
                                            className="botao-salvar"
                                            disabled={carregando}
                                        >
                                            {carregando
                                                ? "Salvando..."
                                                : produtoEditando
                                                    ? "Salvar alterações"
                                                    : "Salvar produto"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProdutosAdmin