import { useNavigate } from "react-router-dom"
import "./MenuAdmin.css"

function MenuAdmin({ paginaAtiva }) {
    const navegar = useNavigate()

    const itensMenu = [
        {
            pagina: "dashboard",
            icone: "🏠",
            nome: "Dashboard",
            rota: "/admin/dashboard"
        },
        {
            pagina: "pedidos",
            icone: "📦",
            nome: "Pedidos",
            rota: "/admin/pedidos"
        },
        {
            pagina: "produtos",
            icone: "🍰",
            nome: "Produtos",
            rota: "/admin/produtos"
        },
        {
            pagina: "categorias",
            icone: "🏷️",
            nome: "Categorias",
            rota: "/admin/categorias"
        },
        {
            pagina: "clientes",
            icone: "👥",
            nome: "Clientes",
            rota: "/admin/clientes"
        },
        {
            pagina: "pagamentos",
            icone: "💳",
            nome: "Pagamentos",
            rota: "/admin/pagamentos"
        },
        {
            pagina: "configuracoes",
            icone: "⚙️",
            nome: "Configurações",
            rota: "/admin/configuracoes"
        }
    ]

    return (
        <aside className="menu-admin">
            <div className="menu-logo">
                <img
                    src="/logo-dino-doces.jpeg"
                    alt="Dino Doces"
                />

                <h1>Dino's Doces</h1>
                <p>Painel administrativo</p>
            </div>

            <nav className="menu-links">
                {itensMenu.map((item) => (
                    <button
                        key={item.pagina}
                        className={
                            paginaAtiva === item.pagina
                                ? "menu-link ativo"
                                : "menu-link"
                        }
                        onClick={() => navegar(item.rota)}
                        title={item.nome}
                    >
                        <span className="menu-icone">
                            {item.icone}
                        </span>

                        <span className="menu-texto">
                            {item.nome}
                        </span>
                    </button>
                ))}
            </nav>

            <button
                className="menu-sair"
                onClick={() => {
                    localStorage.removeItem("tokenAdmin")
                    navegar("/admin/login")
                }}
                title="Sair"
            >
                <span className="menu-icone">🚪</span>
                <span className="menu-texto">Sair</span>
            </button>
        </aside>
    )
}

export default MenuAdmin