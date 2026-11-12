import { Router } from 'express'

import multer from 'multer'

import uploadConfig from './config/multer'

import { estaAutenticado } from './Middleware/estaAutenticado'

import { estaAutorizado } from './Middleware/estaAutorizado'

// importação dos controladores

import { UsuariosControllers } from './Controllers/Usuarios/UsuariosControllers'

import { ClientesControllers } from './Controllers/Clientes/ClientesControllers'

import { ConfiguracoesLojaControllers } from './Controllers/ConfiguracoesLoja/ConfiguracoesLojaControllers'

import { CategoriasControllers } from './Controllers/Categorias/CategoriasControllers'

import { ProdutosControllers } from './Controllers/Produtos/ProdutosControllers'

import { ProdutoCategoriaControllers } from './Controllers/ProdutoCategoria/ProdutoCategoriaControllers'

import { PedidosControllers } from './Controllers/Pedidos/PedidosControllers'

import { ItensPedidoControllers } from './Controllers/ItensPedido/ItensPedidoControllers'

import { PagamentosControllers } from './Controllers/Pagamentos/PagamentosControllers'

import { LoginUsuariosControllers } from './Controllers/LoginUsuarios/LoginUsuariosControllers'

import { LoginClientesControllers } from './Controllers/LoginClientes/LoginClientesControllers'

import { MaisVendidosControllers } from "./Controllers/Pedidos/MaisVendidosControllers"

import { WhatsAppControllers } from './Controllers/WhatsApp/WhatsAppControllers'



// instanciar todas as funcionalidades do Router

const router = Router()

const upload = multer(uploadConfig.upload('./tmp'))

// criação das rotas de EndPoint

router.post('/cadastrarUsuarios', new UsuariosControllers().cadastrarUsuarios)

router.post('/loginUsuarios', new LoginUsuariosControllers().logarUsuarios)

router.post('/cadastrarClientes', new ClientesControllers().cadastrarClientes)

router.post('/loginClientes', new LoginClientesControllers().logarClientes)

// ROTAS PÚBLICAS DE CONSULTA

router.get("/VisualizarDadosGeralLoja", new ConfiguracoesLojaControllers().visualizarConfiguracoes)

router.get("/VisualizarDadosGeralCat", new CategoriasControllers().visualizarDadosGeralCat)

router.post("/VisualizarCategoriaUnica", new CategoriasControllers().visualizarCategoriaUnica)

router.get("/VisualizarDadosGeralPro", new ProdutosControllers().visualizarDadosGeralPro)

router.post("/VisualizarProdutoUnico", new ProdutosControllers().visualizarProdutoUnico)

router.get("/VisualizarMaisVendidos", new MaisVendidosControllers().visualizarMaisVendidos)


router.get("/WebhookWhatsApp", new WhatsAppControllers().verificarWebhook)

router.post("/WebhookWhatsApp", new WhatsAppControllers().receberWebhook)

// A PARTIR DAQUI PRECISA DE AUTENTICAÇÃO

router.use(estaAutenticado)

// ROTAS DE ADMIN

router.post('/VisualizarUsuarioUnicoPost', estaAutorizado("ADMIN"), new UsuariosControllers().visualizarUsuarioUnicoPost)

router.put('/AlterarUsuarios', estaAutorizado("ADMIN"), new UsuariosControllers().alterarUsuarios)

router.get('/VisualizarDadosGeral', estaAutorizado("ADMIN"), new UsuariosControllers().visualizarDadosGeral)

router.delete('/ApagarUsuarios', estaAutorizado("ADMIN"), new UsuariosControllers().apagarUsuarios)

router.get('/visualizarDadosGeralCli', estaAutorizado("ADMIN"), new ClientesControllers().visualizarDadosGeralCli)

router.post('/visualizarClienteUnico', estaAutorizado("ADMIN"), new ClientesControllers().visualizarClienteUnico)

router.put('/alterarClientes', estaAutorizado("ADMIN"), new ClientesControllers().alterarClientes)

router.delete('/apagarClientes', estaAutorizado("ADMIN"), new ClientesControllers().apagarClientes)

router.put("/SalvarConfiguracoesLoja", estaAutorizado("ADMIN"),new ConfiguracoesLojaControllers().salvarConfiguracoes)

router.post("/CadastrarCategorias", estaAutorizado("ADMIN"), new CategoriasControllers().cadastrarCategorias)

router.put("/AlterarCategorias", estaAutorizado("ADMIN"), new CategoriasControllers().alterarCategorias)

router.delete("/ApagarCategorias", estaAutorizado("ADMIN"), new CategoriasControllers().apagarCategorias)

router.post("/CadastrarProdutos", estaAutorizado("ADMIN"), upload.single('imagem'), new ProdutosControllers().cadastrarProdutos)

router.put("/AlterarProdutos", estaAutorizado("ADMIN"), upload.single("imagem"), new ProdutosControllers().alterarProdutos)

router.delete("/ApagarProdutos", estaAutorizado("ADMIN"), new ProdutosControllers().apagarProdutos)

router.post("/CadastrarProdutoCategoria", estaAutorizado("ADMIN"), new ProdutoCategoriaControllers().cadastrarProdutoCategoria)

router.get("/VisualizarDados", estaAutorizado("ADMIN"), new ProdutoCategoriaControllers().visualizarDados)

router.delete("/ApagarProdutoCategoria", estaAutorizado("ADMIN"), new ProdutoCategoriaControllers().apagarProdutoCategoria)

router.post("/TestarWhatsApp", estaAutorizado("ADMIN"), new WhatsAppControllers().testarWhatsApp)

// ROTAS DE CLIENTE

router.get("/MeuPerfil", estaAutorizado("CLIENTE"), new ClientesControllers().meuPerfil)

router.get("/MeusPedidos", estaAutorizado("CLIENTE"), new PedidosControllers().meusPedidos)

router.get("/VisualizarDadosPedidos", estaAutorizado("CLIENTE", "ADMIN"), new PedidosControllers().visualizarDadosPedidos)

router.post("/VisualizarPedidoUnico", estaAutorizado("CLIENTE", "ADMIN"), new PedidosControllers().visualizarPedidoUnico)

router.post("/FinalizarPedido", estaAutorizado("CLIENTE"), new PedidosControllers().finalizarPedido)

// WHATSAPP

router.post("/GerarWhatsApp", estaAutorizado("CLIENTE", "ADMIN"), new PedidosControllers().gerarWhatsApp)

// ROTAS DE ADMIN PARA GERENCIAR PEDIDOS

router.put("/AlterarPedidos", estaAutorizado("ADMIN"), new PedidosControllers().alterarPedidos)

router.delete("/ApagarPedidos", estaAutorizado("ADMIN"), new PedidosControllers().apagarPedidos)

// ITENS DO PEDIDO

router.get("/VisualizarDadosIP", estaAutorizado("CLIENTE", "ADMIN"), new ItensPedidoControllers().visualizarDadosIP)

router.post("/VisualizarItemUnico", estaAutorizado("CLIENTE", "ADMIN"), new ItensPedidoControllers().visualizarItemUnico)

router.put("/AlterarItensPedido", estaAutorizado("ADMIN"), new ItensPedidoControllers().alterarItensPedido)

router.delete("/ApagarItensPedido", estaAutorizado("ADMIN"), new ItensPedidoControllers().apagarItensPedido)

// PAGAMENTOS

router.get("/VisualizarDadosPagamentos", estaAutorizado("CLIENTE", "ADMIN"), new PagamentosControllers().visualizarDadosPagamentos)

router.post("/VisualizarPagamentoUnico", estaAutorizado("CLIENTE", "ADMIN"), new PagamentosControllers().visualizarPagamentoUnico)

router.put("/AlterarPagamentos", estaAutorizado("ADMIN"), new PagamentosControllers().alterarPagamentos)


export default router