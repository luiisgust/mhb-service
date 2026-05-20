const { authMiddleware, requireRole } = require('../models/authModel');
const { CaixaDAO, PagamentoDAO, VendaDAO, ComissaoGeradaDAO } = require('../models/financeiroModel');

module.exports = (app) => {

    // ============================================================
    // CAIXA
    // ============================================================

    // LISTAR TODOS OS CAIXAS
    app.get('/caixa', authMiddleware, async (req, res) => {
        try {
            const lista = await CaixaDAO.consultarTodos();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar caixas.', details: error.message });
        }
    });

    // CAIXA ABERTO DE UMA UNIDADE (query param: ?unidade_id=1)
    app.get('/caixa/aberto', authMiddleware, async (req, res) => {
        const { unidade_id } = req.query;

        if (!unidade_id) return res.status(400).json({ success: false, msg: 'Informe a unidade_id.' });

        try {
            const caixa = await CaixaDAO.caixaAberto(unidade_id);
            if (!caixa) return res.status(404).json({ success: false, msg: 'Nenhum caixa aberto nesta unidade.' });
            res.json(caixa);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ABRIR CAIXA
    app.post('/caixa/abrir', authMiddleware, async (req, res) => {
        const { unidade_id, valor_inicial, user_id } = req.body;

        if (!unidade_id) return res.status(400).json({ success: false, msg: 'A unidade é obrigatória.' });

        try {
            const caixa = await CaixaDAO.abrir(unidade_id, valor_inicial, user_id);
            res.status(201).json({ success: true, msg: 'Caixa aberto!', data: caixa });
        } catch (error) {
            const status = error.message.includes('Já existe') ? 409 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // FECHAR CAIXA
    app.put('/caixa/:id/fechar', authMiddleware, async (req, res) => {
        const { valor_final, user_id, observacoes } = req.body;

        if (valor_final === undefined || valor_final === null) {
            return res.status(400).json({ success: false, msg: 'O valor final é obrigatório.' });
        }

        try {
            const caixa = await CaixaDAO.fechar(req.params.id, valor_final, user_id, observacoes);
            res.json({ success: true, msg: 'Caixa fechado!', data: caixa });
        } catch (error) {
            const status = error.message.includes('não encontrado') ? 404 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // MOVIMENTAÇÕES DE CAIXA
    // ============================================================

    // LISTAR MOVIMENTAÇÕES DE UM CAIXA
    app.get('/caixa/:id/movimentacoes', authMiddleware, async (req, res) => {
        try {
            const lista = await CaixaDAO.consultarMovimentacoes(req.params.id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // REGISTRAR MOVIMENTAÇÃO (sangria, reforço, outros)
    app.post('/caixa/movimentacao', authMiddleware, async (req, res) => {
        try {
            const mov = await CaixaDAO.addMovimentacao(req.body);
            res.status(201).json({ success: true, msg: 'Movimentação registrada!', data: mov });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('zero') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // PAGAMENTOS
    // ============================================================

    // PAGAMENTOS DE UM AGENDAMENTO
    app.get('/pagamentos/agendamento/:agendamento_id', authMiddleware, async (req, res) => {
        try {
            const lista = await PagamentoDAO.consultarDoAgendamento(req.params.agendamento_id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // REGISTRAR PAGAMENTO
    // Suporta: Dinheiro, PIX, Cartão Débito, Cartão Crédito (com bandeira, NSU, parcelas)
    app.post('/pagamentos', authMiddleware, async (req, res) => {
        try {
            const pagamento = await PagamentoDAO.registrar(req.body);
            res.status(201).json({ success: true, msg: 'Pagamento registrado!', data: pagamento });
        } catch (error) {
            const status = error.message.includes('Informe') || error.message.includes('obrigatório') || error.message.includes('zero') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ESTORNAR PAGAMENTO
    app.put('/pagamentos/:id/estornar', authMiddleware, async (req, res) => {
        const { motivo, user_id } = req.body;

        if (!motivo) return res.status(400).json({ success: false, msg: 'O motivo do estorno é obrigatório.' });

        try {
            const pagamento = await PagamentoDAO.estornar(req.params.id, motivo, user_id);
            res.json({ success: true, msg: 'Pagamento estornado!', data: pagamento });
        } catch (error) {
            const status = error.message.includes('não encontrado') ? 404 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // RELATÓRIO DE FATURAMENTO POR FORMA DE PAGAMENTO
    // query params: ?data_inicio=&data_fim=&unidade_id=&forma_pagamento=&bandeira=
    // Exemplo: /pagamentos/relatorio?forma_pagamento=Cartão Crédito&bandeira=Visa&unidade_id=1
    app.get('/pagamentos/relatorio', authMiddleware, async (req, res) => {
        try {
            const filtros = {
                data_inicio:     req.query.data_inicio,
                data_fim:        req.query.data_fim,
                unidade_id:      req.query.unidade_id,
                forma_pagamento: req.query.forma_pagamento,
                bandeira:        req.query.bandeira
            };
            const relatorio = await PagamentoDAO.relatorioFaturamento(filtros);
            res.json({ success: true, data: relatorio });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });


    // ============================================================
    // VENDAS
    // ============================================================

    // LISTAR VENDAS
    // query params: ?cliente_id=&unidade_id=&data_inicio=&data_fim=
    app.get('/vendas', authMiddleware, async (req, res) => {
        try {
            const filtros = {
                cliente_id:  req.query.cliente_id,
                unidade_id:  req.query.unidade_id,
                data_inicio: req.query.data_inicio,
                data_fim:    req.query.data_fim
            };
            const lista = await VendaDAO.consultarTodos(filtros);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar vendas.', details: error.message });
        }
    });

    // REGISTRAR VENDA (com itens — baixa estoque automaticamente)
    app.post('/vendas', authMiddleware, async (req, res) => {
        const { dados, itens } = req.body;

        if (!dados) return res.status(400).json({ success: false, msg: 'Informe os dados da venda.' });
        if (!itens || itens.length === 0) return res.status(400).json({ success: false, msg: 'A venda deve ter ao menos um item.' });

        try {
            const venda = await VendaDAO.registrar(dados, itens);
            res.status(201).json({ success: true, msg: 'Venda registrada!', data: venda });
        } catch (error) {
            const status = error.message.includes('Informe') || error.message.includes('zero') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // COMISSÕES GERADAS (histórico real)
    // ============================================================

    // CONSULTAR COMISSÕES GERADAS
    // query params: ?profissional_id=&mes=&ano=&pago=false
    app.get('/comissoes-geradas', authMiddleware, async (req, res) => {
        try {
            const filtros = {
                profissional_id: req.query.profissional_id || null,
                mes:             req.query.mes || null,
                ano:             req.query.ano || null,
                pago:            req.query.pago !== undefined ? req.query.pago === 'true' : null
            };
            const lista = await ComissaoGeradaDAO.consultar(filtros);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // MARCAR COMISSÕES COMO PAGAS
    // body: { ids: [1, 2, 3] }
    app.put('/comissoes-geradas/pagar', authMiddleware, async (req, res) => {
        const { ids } = req.body;

        if (!ids || ids.length === 0) {
            return res.status(400).json({ success: false, msg: 'Informe os IDs das comissões a pagar.' });
        }

        try {
            const pagas = await ComissaoGeradaDAO.pagar(ids);
            res.json({ success: true, msg: `${pagas.length} comissão(ões) marcada(s) como paga(s)!`, data: pagas });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // STATUS DO MÓDULO
    // ============================================================
    app.get('/financeiro-status', (req, res) => {
        res.json({ modulo: 'Financeiro (Caixa, Pagamentos, Vendas, Comissões)', online: true, database: 'PostgreSQL' });
    });
};