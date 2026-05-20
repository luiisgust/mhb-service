const { authMiddleware, requireRole } = require('../models/authModel');
const EstoqueDAO = require('../models/estoqueModel');

module.exports = (app) => {

    // ============================================================
    // CONSULTAS
    // ============================================================

    // LISTAR TODOS (query param: ?todos=true para incluir inativos)
    app.get('/estoque', authMiddleware, async (req, res) => {
        try {
            const apenasAtivos = req.query.todos !== 'true';
            const lista = await EstoqueDAO.consultarTodos(apenasAtivos);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar estoque.', details: error.message });
        }
    });

    // BUSCAR UM PRODUTO
    app.get('/estoque/:id', authMiddleware, async (req, res) => {
        try {
            const produto = await EstoqueDAO.consultarUm(req.params.id);
            if (!produto) return res.status(404).json({ success: false, msg: 'Produto não encontrado.' });
            res.json(produto);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // PRODUTOS COM ESTOQUE BAIXO
    app.get('/estoque-baixo', authMiddleware, async (req, res) => {
        try {
            const lista = await EstoqueDAO.estoqueBaixo();
            res.json({
                success: true,
                total: lista.length,
                data: lista
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // PRODUTOS VENCENDO (query param: ?dias=30)
    app.get('/estoque-vencendo', authMiddleware, async (req, res) => {
        try {
            const dias = parseInt(req.query.dias) || 30;
            const lista = await EstoqueDAO.estoqueVencendo(dias);
            res.json({
                success: true,
                dias_verificados: dias,
                total: lista.length,
                data: lista
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // MOVIMENTAÇÕES DE UM PRODUTO
    app.get('/estoque/:id/movimentacoes', authMiddleware, async (req, res) => {
        try {
            const lista = await EstoqueDAO.consultarMovimentacoes(req.params.id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });


    // ============================================================
    // CADASTRO E EDIÇÃO
    // ============================================================

    // CADASTRAR PRODUTO
    app.post('/estoque', authMiddleware, async (req, res) => {
        try {
            const novo = await EstoqueDAO.cadastrar(req.body);
            res.status(201).json({ success: true, msg: 'Produto cadastrado!', data: novo });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('não pode') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR PRODUTO
    app.put('/estoque/:id', authMiddleware, async (req, res) => {
        try {
            const editado = await EstoqueDAO.atualizar(req.params.id, req.body);
            if (!editado) return res.status(404).json({ success: false, msg: 'Produto não encontrado.' });
            res.json({ success: true, msg: 'Produto atualizado!', data: editado });
        } catch (error) {
            const status = error.message.includes('obrigatório') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // REPOSIÇÃO DE ESTOQUE
    // ============================================================

    // REPOR QUANTIDADE (entrada de produto)
    app.post('/estoque/:id/repor', authMiddleware, async (req, res) => {
        const { quantidade, user_id, observacao } = req.body;

        if (!quantidade) return res.status(400).json({ success: false, msg: 'Informe a quantidade a repor.' });

        try {
            const movimentacao = await EstoqueDAO.repor(req.params.id, quantidade, user_id, observacao);
            res.status(201).json({
                success: true,
                msg: `Estoque reposto com sucesso! +${quantidade} unidades.`,
                data: movimentacao
            });
        } catch (error) {
            const status = error.message.includes('maior que zero') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // EXCLUIR
    // ============================================================

    app.delete('/estoque/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await EstoqueDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Produto removido com sucesso!' });
            res.status(404).json({ success: false, msg: 'Produto não encontrado.' });
        } catch (error) {
            res.status(400).json({
                success: false,
                msg: 'Não foi possível excluir. Verifique se existem vendas vinculadas a este produto.',
                details: error.message
            });
        }
    });


    // ============================================================
    // STATUS DO MÓDULO
    // ============================================================
    app.get('/estoque-status', (req, res) => {
        res.json({ modulo: 'Estoque', online: true, database: 'PostgreSQL' });
    });
};