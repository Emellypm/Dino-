import "./Login.css"
import { useState } from "react"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"

function Login() {

    const [aba, setAba] = useState("entrar")
    const [telefone, setTelefone] = useState("")
    const [senha, setSenha] = useState("")
    const [nome, setNome] = useState("")

    const navegar = useNavigate()

    async function continuar(e) {
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
                setTelefone("")
                setSenha("")

                return
            }

            localStorage.setItem("clienteToken", dados.token)

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
        <div className="login">

            <div className="login-container">

                {/* Logo */}
                <div className="login-logo">
                    <img
                        src="/logo-dino-doces.jpeg"
                        alt="Dino Doces"
                    />
                </div>

                <h1>Dino's Doces</h1>

                {/* Abas */}
                <div className="login-abas">

                    <button
                        type="button"
                        className={aba === "entrar" ? "aba ativa" : "aba"}
                        onClick={() => setAba("entrar")}
                    >
                        Entrar
                    </button>

                    <button
                        type="button"
                        className={aba === "cadastrar" ? "aba ativa" : "aba"}
                        onClick={() => setAba("cadastrar")}
                    >
                        Criar conta
                    </button>

                </div>

                <form onSubmit={continuar}>

                    {aba === "cadastrar" && (
                        <div className="campo">
                            <label>Nome</label>

                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Seu nome"
                                required
                            />
                        </div>
                    )}

                    <div className="campo">
                        <label>Telefone</label>

                        <input
                            type="tel"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            placeholder="(14) 9 9999-9999"
                            required
                        />
                    </div>

                    <div className="campo">
                        <label>Senha</label>

                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="botao-principal"
                    >
                        {aba === "entrar" ? "Entrar" : "Criar conta"}
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

        </div>
    )
}

export default Login