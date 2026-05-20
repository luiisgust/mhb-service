const { authMiddleware, requireRole } = require('../models/authModel');
const { CursoDAO, AgendamentoCursoDAO } = require('../models/cursosModel');

module.exports = (app) => {

    // ============================================================
    // CURSOS
    // ============================================================

    // LISTAR TODOS (query param: ?todos=true para incluir inativos)
    app.get('/cursos', authMiddleware, async (req, res) => {
        try {
            const apenasAtivos = req.query.todos !== 'true';
            const lista = await CursoDAO.consultarTodos(apenasAtivos);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar cursos.', details: error.message });
        }
    });

    // CADASTRAR CURSO
    app.post('/cursos', authMiddleware, async (req, res) => {
        try {
            const novo = await CursoDAO.cadastrar(req.body);
            res.status(201).json({ success: true, msg: 'Curso cadastrado!', data: novo });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('negativo') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR CURSO
    app.put('/cursos/:id', authMiddleware, async (req, res) => {
        try {
            const editado = await CursoDAO.atualizar(req.params.id, req.body);
            if (!editado) return res.status(404).json({ success: false, msg: 'Curso não encontrado.' });
            res.json({ success: true, msg: 'Curso atualizado!', data: editado });
        } catch (error) {
            const status = error.message.includes('obrigatório') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // VINCULAR PROFISSIONAL INSTRUTORA AO CURSO
    // Só aceita profissionais com apta_cursos = true (validado no banco)
    app.post('/cursos/:id/profissional', authMiddleware, async (req, res) => {
        const { profissional_id } = req.body;

        if (!profissional_id) {
            return res.status(400).json({ success: false, msg: 'O campo profissional_id é obrigatório.' });
        }

        try {
            await CursoDAO.vincularProfissional(req.params.id, profissional_id);
            res.json({ success: true, msg: 'Profissional vinculada ao curso!' });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR CURSO
    app.delete('/cursos/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await CursoDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Curso removido com sucesso!' });
            res.status(404).json({ success: false, msg: 'Curso não encontrado.' });
        } catch (error) {
            res.status(400).json({
                success: false,
                msg: 'Não foi possível excluir. Verifique se existem agendamentos vinculados a este curso.',
                details: error.message
            });
        }
    });


    // ============================================================
    // AGENDAMENTO DE CURSOS
    // ============================================================

    // CADASTRAR AGENDAMENTO DE CURSO
    app.post('/agendamento-curso', authMiddleware, async (req, res) => {
        try {
            const novo = await AgendamentoCursoDAO.cadastrar(req.body);
            res.status(201).json({ success: true, msg: 'Curso agendado!', data: novo });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('após') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR AGENDAMENTO DE CURSO
    app.put('/agendamento-curso/:id', authMiddleware, async (req, res) => {
        try {
            const editado = await AgendamentoCursoDAO.atualizar(req.params.id, req.body);
            if (!editado) return res.status(404).json({ success: false, msg: 'Agendamento não encontrado.' });
            res.json({ success: true, msg: 'Agendamento de curso atualizado!', data: editado });
        } catch (error) {
            const status = error.message.includes('após') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR AGENDAMENTO DE CURSO
    app.delete('/agendamento-curso/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await AgendamentoCursoDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Agendamento de curso removido!' });
            res.status(404).json({ success: false, msg: 'Agendamento não encontrado.' });
        } catch (error) {
            res.status(400).json({
                success: false,
                msg: 'Não foi possível excluir este agendamento.',
                details: error.message
            });
        }
    });


    // ============================================================
    // STATUS DO MÓDULO
    // ============================================================
    app.get('/cursos-status', (req, res) => {
        res.json({ modulo: 'Cursos + Agendamento de Cursos', online: true, database: 'PostgreSQL' });
    });
};