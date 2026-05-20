const { authMiddleware, requireRole } = require('../models/authModel');
const { ProfissionalDAO, AusenciaDAO, MetaDAO, ComissaoDAO } = require('../models/equipeModel');

module.exports = (app) => {

    // ============================================================
    // PROFISSIONAIS
    // ============================================================

    // LISTAR TODAS (query param: ?todos=true para incluir inativas)
    app.get('/profissionais', authMiddleware, async (req, res) => {
        try {
            const apenasAtivos = req.query.todos !== 'true';
            const lista = await ProfissionalDAO.consultarTodos(apenasAtivos);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar profissionais.', details: error.message });
        }
    });

    // BUSCAR UMA
    app.get('/profissionais/:id', authMiddleware, async (req, res) => {
        try {
            const profissional = await ProfissionalDAO.consultarUm(req.params.id);
            if (!profissional) return res.status(404).json({ success: false, msg: 'Profissional não encontrada.' });
            res.json(profissional);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // LISTAR APENAS APTAS PARA CURSOS
    app.get('/profissionais-aptas-cursos', authMiddleware, async (req, res) => {
        try {
            const lista = await ProfissionalDAO.consultarAptas();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // LISTAR PROCEDIMENTOS DE UMA PROFISSIONAL
    app.get('/profissionais/:id/procedimentos', authMiddleware, async (req, res) => {
        try {
            const lista = await ProfissionalDAO.consultarProcedimentos(req.params.id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // CADASTRAR
    app.post('/profissionais', authMiddleware, async (req, res) => {
        try {
            const nova = await ProfissionalDAO.cadastrar(req.body);
            res.status(201).json({ success: true, msg: 'Profissional cadastrada!', data: nova });
        } catch (error) {
            const status = error.message.includes('obrigatório') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR
    app.put('/profissionais/:id', authMiddleware, async (req, res) => {
        try {
            const editada = await ProfissionalDAO.atualizar(req.params.id, req.body);
            if (!editada) return res.status(404).json({ success: false, msg: 'Profissional não encontrada.' });
            res.json({ success: true, msg: 'Profissional atualizada!', data: editada });
        } catch (error) {
            const status = error.message.includes('obrigatório') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // VINCULAR PROCEDIMENTO À PROFISSIONAL
    app.post('/profissionais/:id/procedimentos', authMiddleware, async (req, res) => {
        const { procedimento_id } = req.body;

        if (!procedimento_id) {
            return res.status(400).json({ success: false, msg: 'O campo procedimento_id é obrigatório.' });
        }

        try {
            await ProfissionalDAO.vincularProcedimento(req.params.id, procedimento_id);
            res.json({ success: true, msg: 'Procedimento vinculado à profissional!' });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    // DESVINCULAR PROCEDIMENTO DA PROFISSIONAL
    app.delete('/profissionais/:id/procedimentos/:procedimento_id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await ProfissionalDAO.desvincularProcedimento(req.params.id, req.params.procedimento_id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Procedimento desvinculado!' });
            res.status(404).json({ success: false, msg: 'Vínculo não encontrado.' });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR
    app.delete('/profissionais/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await ProfissionalDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Profissional removida com sucesso!' });
            res.status(404).json({ success: false, msg: 'Profissional não encontrada.' });
        } catch (error) {
            res.status(400).json({
                success: false,
                msg: 'Não foi possível excluir. Verifique se existem agendamentos vinculados a esta profissional.',
                details: error.message
            });
        }
    });


    // ============================================================
    // AUSÊNCIAS
    // ============================================================

    // LISTAR TODAS (query param: ?profissional_id=1 para filtrar)
    app.get('/ausencias', authMiddleware, async (req, res) => {
        try {
            const profissional_id = req.query.profissional_id || null;
            const lista = await AusenciaDAO.consultarTodos(profissional_id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar ausências.', details: error.message });
        }
    });

    // CADASTRAR
    app.post('/ausencias', authMiddleware, async (req, res) => {
        try {
            const nova = await AusenciaDAO.cadastrar(req.body);
            res.status(201).json({ success: true, msg: 'Ausência registrada!', data: nova });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('anterior') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR
    app.delete('/ausencias/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await AusenciaDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Ausência removida!' });
            res.status(404).json({ success: false, msg: 'Ausência não encontrada.' });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // METAS
    // ============================================================

    // CONSULTAR METAS DO MÊS (query params: ?mes=6&ano=2025)
    app.get('/metas', authMiddleware, async (req, res) => {
        const { mes, ano } = req.query;

        if (!mes || !ano) {
            return res.status(400).json({ success: false, msg: 'Informe mês e ano como query params. Ex: ?mes=6&ano=2025' });
        }

        try {
            const lista = await MetaDAO.consultarMes(mes, ano);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // RELATÓRIO DE METAS VS FATURAMENTO REAL DO MÊS
    app.get('/metas/relatorio', authMiddleware, async (req, res) => {
        const { mes, ano } = req.query;

        if (!mes || !ano) {
            return res.status(400).json({ success: false, msg: 'Informe mês e ano. Ex: ?mes=6&ano=2025' });
        }

        try {
            const relatorio = await MetaDAO.relatorio(mes, ano);
            res.json({ success: true, mes, ano, data: relatorio });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // SALVAR META (cria ou atualiza — upsert)
    app.post('/metas', authMiddleware, async (req, res) => {
        try {
            const meta = await MetaDAO.salvar(req.body);
            res.status(201).json({ success: true, msg: 'Meta salva!', data: meta });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('maior') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // COMISSÕES (regras)
    // ============================================================

    // LISTAR TODAS (query param: ?profissional_id=1 para filtrar)
    app.get('/comissoes', authMiddleware, async (req, res) => {
        try {
            const profissional_id = req.query.profissional_id || null;
            const lista = await ComissaoDAO.consultarTodos(profissional_id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar comissões.', details: error.message });
        }
    });

    // SALVAR COMISSÃO (cria ou atualiza — upsert)
    // Se procedimento_id vier nulo, é a regra geral da profissional
    app.post('/comissoes', authMiddleware, async (req, res) => {
        try {
            const comissao = await ComissaoDAO.salvar(req.body);
            res.status(201).json({ success: true, msg: 'Comissão salva!', data: comissao });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('entre') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR COMISSÃO
    app.delete('/comissoes/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await ComissaoDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Comissão removida!' });
            res.status(404).json({ success: false, msg: 'Comissão não encontrada.' });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // STATUS DO MÓDULO
    // ============================================================
    app.get('/equipe-status', (req, res) => {
        res.json({ modulo: 'Equipe (Profissionais, Ausências, Metas, Comissões)', online: true, database: 'PostgreSQL' });
    });
};