const UnidadeDAO = require('../models/unidadesModel');
const { authMiddleware, requireRole } = require('../models/authModel');

module.exports = (app) => {

    // LISTAR TODAS
    app.get('/unidades', authMiddleware, async (req, res) => {
        try {
            const lista = await UnidadeDAO.consultarTodos();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar unidades.', details: error.message });
        }
    });

    // BUSCAR UMA
    app.get('/unidades/:id', authMiddleware, async (req, res) => {
        try {
            const unidade = await UnidadeDAO.consultarUm(req.params.id);
            if (!unidade) return res.status(404).json({ success: false, msg: 'Unidade não encontrada.' });
            res.json(unidade);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // CADASTRAR (apenas admin/gerente)
    app.post('/unidades', authMiddleware, requireRole('admin', 'gerente'), async (req, res) => {
        const { nome, endereco, cidade } = req.body;

        if (!nome) return res.status(400).json({ success: false, msg: 'O campo nome é obrigatório.' });

        try {
            const nova = await UnidadeDAO.cadastrar(nome, endereco, cidade);
            res.status(201).json({ success: true, msg: 'Unidade cadastrada!', data: nova });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR (apenas admin/gerente)
    app.put('/unidades/:id', authMiddleware, requireRole('admin', 'gerente'), async (req, res) => {
        const { nome, endereco, cidade, ativa } = req.body;

        if (!nome) return res.status(400).json({ success: false, msg: 'O campo nome é obrigatório.' });

        try {
            const editada = await UnidadeDAO.atualizar(req.params.id, nome, endereco, cidade, ativa);
            if (!editada) return res.status(404).json({ success: false, msg: 'Unidade não encontrada.' });
            res.json({ success: true, msg: 'Unidade atualizada!', data: editada });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR (apenas admin)
    app.delete('/unidades/:id', authMiddleware, requireRole('admin'), async (req, res) => {
        try {
            const rowCount = await UnidadeDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Unidade removida com sucesso!' });
            res.status(404).json({ success: false, msg: 'Unidade não encontrada.' });
        } catch (error) {
            res.status(400).json({
                success: false,
                msg: 'Não foi possível excluir. Verifique se existem profissionais ou agendamentos vinculados.',
                details: error.message
            });
        }
    });

    // STATUS
    app.get('/unidades-status', (req, res) => {
        res.json({ modulo: 'Unidades', online: true, database: 'PostgreSQL' });
    });
};