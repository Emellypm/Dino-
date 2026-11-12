import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Cadastro.css"
import api from "../../services/api"

function Cadastro() {
    const [aba, setAba] = useState("entrar")

    const [nome, setNome] = useState("")
    const [telefone, setTelefone] = useState("")
    const [senha, setSenha] = useState("")

    const navegar = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            const rota =
                aba === "entrar"
                    ? "/loginClientes"
                    : "/cadastrarClientes"

            const corpo =
                aba === "entrar"
                    ? {
                          telefone,
                          senha
                      }
                    : {
                          nome,
                          telefone,
                          senha
                      }

            const resposta = await fetch(`${api}${rota}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(corpo)
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                alert(
                    dados.error ||
                    dados.dados ||
                    "Não foi possível continuar"
                )
                return
            }

            if (aba === "cadastrar") {
                alert("Conta criada com sucesso!")

                setAba("entrar")
                setNome("")
                setSenha("")

                return
            }

            const token =
                dados.token ||
                dados.dados?.token

            if (token) {
                localStorage.setItem("clienteToken", token)
            }

            navegar("/home")

        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        }
    }

    function continuarComoVisitante() {
        navegar("/cardapio")
    }

    return (
        <div className="login-cadastro">

            <div className="login-cadastro-container">

                <div className="login-cadastro-logo">
                    <span>🍰</span>
                </div>

                <h1>Dino Doces</h1>

                <p className="login-cadastro-subtitulo">
                    Entre ou crie sua conta para fazer seu pedido
                </p>

                <div className="abas">

                    <button
                        type="button"
                        className={
                            aba === "entrar"
                                ? "aba ativa"
                                : "aba"
                        }
                        onClick={() => setAba("entrar")}
                    >
                        Entrar
                    </button>

                    <button
                        type="button"
                        className={
                            aba === "cadastrar"
                                ? "aba ativa"
                                : "aba"
                        }
                        onClick={() => setAba("cadastrar")}
                    >
                        Criar conta
                    </button>

                </div>

                <div className="login-cadastro-card">

                    <form onSubmit={handleSubmit}>

                        {aba === "cadastrar" && (
                            <div className="campo">
                                <label>Nome</label>

                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) =>
                                        setNome(e.target.value)
                                    }
                                    placeholder="Seu nome"
                                    required
                                />
                            </div>
                        )}

                        <div className="campo">
                            <label>WhatsApp / celular</label>

                            <input
                                type="tel"
                                value={telefone}
                                onChange={(e) =>
                                    setTelefone(e.target.value)
                                }
                                placeholder="(14) 99999-9999"
                                required
                            />
                        </div>

                        <div className="campo">
                            <label>Senha</label>

                            <input
                                type="password"
                                value={senha}
                                onChange={(e) =>
                                    setSenha(e.target.value)
                                }
                                placeholder="Digite sua senha"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="botao-principal"
                        >
                            {aba === "entrar"
                                ? "Entrar"
                                : "Criar minha conta"}
                        </button>

                    </form>

                    <div className="divisor">
                        <span></span>
                        <p>ou</p>
                        <span></span>
                    </div>

                    <button
                        type="button"
                        className="botao-visitante"
                        onClick={continuarComoVisitante}
                    >
                        Continuar como visitante
                    </button>

                </div>

                <button
                    type="button"
                    className="link-admin"
                    onClick={() => navegar("/admin/login")}
                >
                    Área do administrador
                </button>

            </div>

        </div>
    )
}

export default Cadastro