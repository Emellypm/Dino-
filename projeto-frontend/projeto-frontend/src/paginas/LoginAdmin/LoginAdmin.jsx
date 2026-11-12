import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./LoginAdmin.css"
import api from "../../services/api"

function LoginAdmin() {
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")

    const navegar = useNavigate()

    async function entrar(e) {
        e.preventDefault()

        try {
            const resposta = await fetch(`${api}/loginUsuarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    senha
                })
            })

            const dados = await resposta.json()

            console.log("Resposta do login:", dados)

            if (!resposta.ok) {
                alert(
                    dados.error ||
                    dados.dados ||
                    "E-mail ou senha inválidos"
                )

                return
            }

            const token =
                dados.token ||
                dados.dados?.token

            if (!token) {
                console.log(
                    "Token não encontrado na resposta:",
                    dados
                )

                alert(
                    "Login realizado, mas o token não foi recebido."
                )

                return
            }

            localStorage.setItem("tokenAdmin", token)

            console.log(
                "Token admin salvo:",
                localStorage.getItem("tokenAdmin")
            )

            navegar("/admin/dashboard")
        } catch (erro) {
            console.log(erro)
            alert("Não foi possível conectar ao servidor")
        }
    }

    return (
        <div className="login-admin">
            <div className="login-admin-container">
                <div className="login-admin-logo">
                    <img
                        src="/logo-dino-doces.jpeg"
                        alt="Dino Doces"
                    />
                </div>

                <h1>Dino's Doces</h1>

                <p className="login-admin-subtitulo">
                    Painel administrativo
                </p>

                <form onSubmit={entrar}>
                    <div className="campo-admin">
                        <label>E-mail</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="seuemail@email.com"
                            required
                        />
                    </div>

                    <div className="campo-admin">
                        <label>Senha</label>

                        <input
                            type="password"
                            value={senha}
                            onChange={(e) =>
                                setSenha(e.target.value)
                            }
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="botao-login-admin"
                    >
                        Entrar
                    </button>
                </form>

                <button
                    type="button"
                    className="voltar-loja"
                    onClick={() => navegar("/login")}
                >
                    ← Voltar para a loja
                </button>
            </div>
        </div>
    )
}

export default LoginAdmin