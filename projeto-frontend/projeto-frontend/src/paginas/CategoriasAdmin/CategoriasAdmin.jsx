import { useEffect, useState } from "react"
import api from "../../services/api"
import "./CategoriasAdmin.css"
import MenuAdmin from "../../componentes/MenuAdmin/MenuAdmin"

function CategoriasAdmin() {
    const [categorias, setCategorias] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [modalAberto, setModalAberto] = useState(false)
    const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
    const [nome, setNome] = useState("")
    const [descricao, setDescricao] = useState("")

    useEffect(() => {
        buscarCategorias()
    }, [])

    async function buscarCategorias() {
        try {
            setCarregando(true)

            const resposta = await fetch(
                `${api}/VisualizarDadosGeralCat`
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                console.log(dados)
                return
            }

            setCategorias(
                Array.isArray(dados)
                    ? dados
                    : dados.categorias || []
            )
        } catch (erro) {
            console.log(erro)
        } finally {
            setCarregando(false)
        }
    }

    function abrirModal() {
        setCategoriaSelecionada(null)
        setNome("")
        setDescricao("")
        setModalAberto(true)
    }

    function editarCategoria(categoria) {
        setCategoriaSelecionada(categoria)
        setNome(categoria.nome || "")
        setDescricao(categoria.descricao || "")
        setModalAberto(true)
    }

    function fecharModal() {
        setModalAberto(false)
        setCategoriaSelecionada(null)
        setNome("")
        setDescricao("")
    }

    async function salvarCategoria(e) {
        e.preventDefault()

        if (!nome.trim()) {
            alert("Digite o nome da categoria")
            return
        }

        try {
            setSalvando(true)

            const token = localStorage.getItem("tokenAdmin")

            let resposta

            if (categoriaSelecionada) {
                resposta = await fetch(
                    `${api}/AlterarCategorias`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            id: categoriaSelecionada.id,
                            nome: nome.trim(),
                            descricao: descricao.trim()
                        })
                    }
                )
            } else {
                resposta = await fetch(
                    `${api}/CadastrarCategorias`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            nome: nome.trim(),
                            descricao: descricao.trim()
                        })
                    }
                )
            }

            const dados = await resposta.json()

            if (!resposta.ok) {
                alert(
                    dados.error ||
                    dados.dados ||
                    "Não foi possível salvar a categoria"
                )
                return
            }

            alert(
                categoriaSelecionada
                    ? "Categoria alterada com sucesso!"
                    : "Categoria cadastrada com sucesso!"
            )

            fecharModal()
            buscarCategorias()
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        } finally {
            setSalvando(false)
        }
    }

    async function excluirCategoria(categoria) {
        const confirmar = window.confirm(
            `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`
        )

        if (!confirmar) {
            return
        }

        try {
            const token = localStorage.getItem("tokenAdmin")

            const resposta = await fetch(
                `${api}/ApagarCategorias`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: categoria.id
                    })
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                alert(
                    dados.error ||
                    dados.dados ||
                    "Não foi possível excluir a categoria"
                )
                return
            }

            setCategorias(
                categorias.filter(
                    (item) => item.id !== categoria.id
                )
            )

            alert("Categoria excluída com sucesso!")
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        }
    }

    return (
        <div className="categorias-admin">
            <MenuAdmin paginaAtiva="categorias" />

            <main className="categorias-admin-conteudo">
                <header className="categorias-topo">
                    <div>
                        <p>Administração</p>

                        <h2>Categorias</h2>

                        <span>
                            Organize os produtos do seu cardápio.
                        </span>
                    </div>

                    <button
                        className="botao-nova-categoria"
                        onClick={abrirModal}
                    >
                        + Nova categoria
                    </button>
                </header>

                {carregando ? (
                    <div className="estado-categorias">
                        <span className="estado-categorias-icone">
                            🏷️
                        </span>

                        <p>
                            Carregando categorias...
                        </p>
                    </div>
                ) : categorias.length === 0 ? (
                    <div className="estado-categorias">
                        <span className="estado-categorias-icone">
                            🏷️
                        </span>

                        <h3>
                            Nenhuma categoria cadastrada
                        </h3>

                        <p>
                            Crie sua primeira categoria para
                            organizar os produtos.
                        </p>

                        <button
                            className="botao-criar-primeira"
                            onClick={abrirModal}
                        >
                            Criar categoria
                        </button>
                    </div>
                ) : (
                    <section className="lista-categorias">
                        {categorias.map((categoria) => (
                            <article
                                className="categoria-card"
                                key={categoria.id}
                            >
                                <div className="categoria-icone">
                                    🏷️
                                </div>

                                <div className="categoria-info">
                                    <h3>
                                        {categoria.nome}
                                    </h3>

                                    <span>
                                        {categoria.descricao ||
                                            "Categoria de produtos"}
                                    </span>
                                </div>

                                <div className="categoria-acoes">
                                    <button
                                        onClick={() =>
                                            editarCategoria(
                                                categoria
                                            )
                                        }
                                    >
                                        Editar
                                    </button>

                                    <button
                                        onClick={() =>
                                            excluirCategoria(
                                                categoria
                                            )
                                        }
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            {modalAberto && (
                <div
                    className="modal-categoria-fundo"
                    onClick={fecharModal}
                >
                    <div
                        className="modal-categoria"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <header className="modal-categoria-topo">
                            <div>
                                <span>
                                    Categorias
                                </span>

                                <h2>
                                    {categoriaSelecionada
                                        ? "Editar categoria"
                                        : "Nova categoria"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={fecharModal}
                            >
                                ×
                            </button>
                        </header>

                        <form
                            className="form-categoria"
                            onSubmit={salvarCategoria}
                        >
                            <label>
                                Nome da categoria
                            </label>

                            <input
                                type="text"
                                placeholder="Ex: Bolos"
                                value={nome}
                                onChange={(e) =>
                                    setNome(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <label>
                                Descrição
                            </label>

                            <textarea
                                placeholder="Ex: Bolos e sobremesas"
                                value={descricao}
                                onChange={(e) =>
                                    setDescricao(
                                        e.target.value
                                    )
                                }
                            />

                            <div className="acoes-categoria-modal">
                                <button
                                    type="button"
                                    className="botao-cancelar-categoria"
                                    onClick={fecharModal}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="botao-salvar-categoria"
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : categoriaSelecionada
                                            ? "Salvar alterações"
                                            : "Criar categoria"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CategoriasAdmin