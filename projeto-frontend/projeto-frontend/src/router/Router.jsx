import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../paginas/Login/Login"
import Home from "../paginas/Home/Home"
import Carrinho from "../paginas/Carrinho/Carrinho"
import Pedido from "../paginas/Pedido/Pedido"
import Cardapio from "../paginas/Cardapio/Cardapio"
import Produto from "../paginas/Produto/Produto"
import Cadastro from "../paginas/Cadastro/Cadastro"
import LoginAdmin from "../paginas/LoginAdmin/LoginAdmin"
import Dashboard from "../paginas/Dashboard/Dashboard"
import GestaoPedidos from "../paginas/GestaoPedidos/GestaoPedidos"
import ProdutosAdmin from "../paginas/ProdutosAdmin/ProdutosAdmin"
import MinhaConta from "../paginas/MinhaConta/MinhaConta"
import CategoriasAdmin from "../paginas/CategoriasAdmin/CategoriasAdmin"
import ClientesAdmin from "../paginas/ClientesAdmin/ClientesAdmin"
import PagamentosAdmin from "../paginas/PagamentosAdmin/PagamentosAdmin"
import ConfiguracoesAdmin from "../paginas/ConfiguracoesAdmin/ConfiguracoesAdmin"

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin/login" element={<LoginAdmin />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/carrinho" element={<Carrinho />} />
                <Route path="/pedido" element={<Pedido />} />
                <Route path="/cardapio" element={<Cardapio />} />
                <Route path="/produto/:id" element={<Produto />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/pedidos" element={<GestaoPedidos />} />
                <Route path="/admin/produtos" element={<ProdutosAdmin />} />
                <Route path="/minha-conta" element={<MinhaConta />} />
                <Route path="/admin/categorias" element={<CategoriasAdmin />} />
                <Route path="/admin/clientes" element={<ClientesAdmin />} />
                <Route path="/admin/pagamentos" element={<PagamentosAdmin />} />
                <Route path="/admin/configuracoes" element={<ConfiguracoesAdmin />} />
            </Routes>
        </BrowserRouter>
    )
}

export default Router