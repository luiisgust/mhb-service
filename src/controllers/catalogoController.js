const { authMiddleware, requireRole } = require('../models/authModel');
const { CategoriaDAO, ProcedimentoDAO, PacoteDAO } = require('../models/catalogoModel');

module.exports = (app) => {

    // ============================================================
    // CATEGORIAS
    // ============================================================

    // LISTAR TODAS (query param: ?tipo=procedimento | produto | curso)
    app.get('/categorias', authMiddleware, async (req, res) => {
        try {
            const tipo = req.query.tipo || null;
            const lista = await CategoriaDAO.consultarTodos(tipo);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar categorias.', details: error.message });
        }
    });

    // CADASTRAR
    app.post('/categorias', authMiddleware, async (req, res) => {
        const { nome, tipo } = req.body;
        try {
            const nova = await CategoriaDAO.cadastrar(nome, tipo);
            res.status(201).json({ success: true, msg: 'Categoria cadastrada!', data: nova });
        } catch (error) {
            const status = error.message.includes('obrigatório') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR
    app.put('/categorias/:id', authMiddleware, async (req, res) => {
        const { nome, tipo } = req.body;
        try {
            const editada = await CategoriaDAO.atualizar(req.params.id, nome, tipo);
            if (!editada) return res.status(404).json({ success: false, msg: 'Categoria não encontrada.' });
            res.json({ success: true, msg: 'Categoria atualizada!', data: editada });
        } catch (error) {
            const status = error.message.includes('obrigatório') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR
    app.delete('/categorias/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await CategoriaDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Categoria removida!' });
            res.status(404).json({ success: false, msg: 'Categoria não encontrada.' });
        } catch (error) {
            res.status(400).json({
                success: false,
                msg: 'Não foi possível excluir. Verifique se existem procedimentos ou produtos vinculados.',
                details: error.message
            });
        }
    });


    // ============================================================
    // PROCEDIMENTOS
    // ============================================================

    // LISTAR TODOS (query param: ?todos=true para incluir inativos)
    app.get('/procedimentos', authMiddleware, async (req, res) => {
        try {
            const apenasAtivos = req.query.todos !== 'true';
            const lista = await ProcedimentoDAO.consultarTodos(apenasAtivos);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar procedimentos.', details: error.message });
        }
    });

    // BUSCAR UM
    app.get('/procedimentos/:id', authMiddleware, async (req, res) => {
        try {
            const procedimento = await ProcedimentoDAO.consultarUm(req.params.id);
            if (!procedimento) return res.status(404).json({ success: false, msg: 'Procedimento não encontrado.' });
            res.json(procedimento);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // CADASTRAR
    app.post('/procedimentos', authMiddleware, async (req, res) => {
        try {
            const novo = await ProcedimentoDAO.cadastrar(req.body);
            res.status(201).json({ success: true, msg: 'Procedimento cadastrado!', data: novo });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('negativo') || error.message.includes('zero') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR
    app.put('/procedimentos/:id', authMiddleware, async (req, res) => {
        try {
            const editado = await ProcedimentoDAO.atualizar(req.params.id, req.body);
            if (!editado) return res.status(404).json({ success: false, msg: 'Procedimento não encontrado.' });
            res.json({ success: true, msg: 'Procedimento atualizado!', data: editado });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('negativo') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR
    app.delete('/procedimentos/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await ProcedimentoDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Procedimento removido!' });
            res.status(404).json({ success: false, msg: 'Procedimento não encontrado.' });
        } catch (error) {
            res.status(400).json({
                success: false,
                msg: 'Não foi possível excluir. Verifique se existem agendamentos vinculados a este procedimento.',
                details: error.message
            });
        }
    });


    // ============================================================
    // PACOTES
    // ============================================================

    // LISTAR TODOS (query param: ?todos=true para incluir inativos)
    app.get('/pacotes', authMiddleware, async (req, res) => {
        try {
            const apenasAtivos = req.query.todos !== 'true';
            const lista = await PacoteDAO.consultarTodos(apenasAtivos);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar pacotes.', details: error.message });
        }
    });

    // CADASTRAR PACOTE
    app.post('/pacotes', authMiddleware, async (req, res) => {
        try {
            const novo = await PacoteDAO.cadastrar(req.body);
            res.status(201).json({ success: true, msg: 'Pacote cadastrado!', data: novo });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('negativo') || error.message.includes('zero') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR PACOTE
    app.put('/pacotes/:id', authMiddleware, async (req, res) => {
        try {
            const editado = await PacoteDAO.atualizar(req.params.id, req.body);
            if (!editado) return res.status(404).json({ success: false, msg: 'Pacote não encontrado.' });
            res.json({ success: true, msg: 'Pacote atualizado!', data: editado });
        } catch (error) {
            const status = error.message.includes('obrigatório') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // PACOTES DE UM CLIENTE
    app.get('/pacotes/cliente/:cliente_id', authMiddleware, async (req, res) => {
        try {
            const lista = await PacoteDAO.consultarDoCliente(req.params.cliente_id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // CLIENTE ADQUIRE UM PACOTE
    app.post('/pacotes/adquirir', authMiddleware, async (req, res) => {
        try {
            const clientePacote = await PacoteDAO.adquirir(req.body);
            res.status(201).json({ success: true, msg: 'Pacote adquirido pela cliente!', data: clientePacote });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('zero') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // USAR UMA SESSÃO DO PACOTE (chamado ao registrar agendamento com pacote)
    app.put('/pacotes/usar-sessao/:cliente_pacote_id', authMiddleware, async (req, res) => {
        try {
            const atualizado = await PacoteDAO.usarSessao(req.params.cliente_pacote_id);
            res.json({
                success: true,
                msg: `Sessão registrada! Restam ${atualizado.sessoes_restantes} sessão(ões).`,
                data: atualizado
            });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('ativo') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR PACOTE
    app.delete('/pacotes/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await PacoteDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Pacote removido!' });
            res.status(404).json({ success: false, msg: 'Pacote não encontrado.' });
        } catch (error) {
            res.status(400).json({
                success: false,
                msg: 'Não foi possível excluir. Verifique se existem clientes com este pacote ativo.',
                details: error.message
            });
        }
    });


    // ============================================================
    // STATUS DO MÓDULO
    // ============================================================
    app.get('/catalogo-status', (req, res) => {
        res.json({ modulo: 'Catálogo (Categorias, Procedimentos, Pacotes)', online: true, database: 'PostgreSQL' });
    });
};