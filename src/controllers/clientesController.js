const { authMiddleware, requireRole } = require('../models/authModel');
const { ClienteDAO, AnamneseDAO, CreditoDAO } = require('../models/clientesModel');

module.exports = (app) => {

    // ============================================================
    // CLIENTES
    // ============================================================

    // LISTAR TODAS
    app.get('/clientes', authMiddleware, async (req, res) => {
        try {
            const lista = await ClienteDAO.consultarTodos();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar clientes.', details: error.message });
        }
    });

    // BUSCAR UMA
    app.get('/clientes/:id', authMiddleware, async (req, res) => {
        try {
            const cliente = await ClienteDAO.consultarUm(req.params.id);
            if (!cliente) return res.status(404).json({ success: false, msg: 'Cliente não encontrada.' });
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // BUSCAR POR NOME OU TELEFONE (query param: ?termo=ana)
    app.get('/clientes/buscar/:termo', authMiddleware, async (req, res) => {
        try {
            const lista = await ClienteDAO.buscar(req.params.termo);
            res.json(lista);
        } catch (error) {
            const status = error.message.includes('Informe') ? 400 : 500;
            res.status(status).json({ success: false, error: error.message });
        }
    });

    // ANIVERSARIANTES DO MÊS (query param: ?mes=6 — padrão: mês atual)
    app.get('/clientes/aniversariantes', authMiddleware, async (req, res) => {
        try {
            const lista = await ClienteDAO.aniversariantes(req.query.mes);
            res.json({ success: true, total: lista.length, data: lista });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // CLIENTES INATIVAS HÁ X DIAS (query param: ?dias=60)
    app.get('/clientes/inativas', authMiddleware, async (req, res) => {
        try {
            const dias = parseInt(req.query.dias) || 60;
            const lista = await ClienteDAO.inativos(dias);
            res.json({ success: true, dias_sem_visita: dias, total: lista.length, data: lista });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // CADASTRAR
    app.post('/clientes', authMiddleware, async (req, res) => {
        try {
            const nova = await ClienteDAO.cadastrar(req.body);
            res.status(201).json({ success: true, msg: 'Cliente cadastrada!', data: nova });
        } catch (error) {
            const status = error.message.includes('obrigatório') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR
    app.put('/clientes/:id', authMiddleware, async (req, res) => {
        try {
            const editada = await ClienteDAO.atualizar(req.params.id, req.body);
            if (!editada) return res.status(404).json({ success: false, msg: 'Cliente não encontrada.' });
            res.json({ success: true, msg: 'Cliente atualizada!', data: editada });
        } catch (error) {
            const status = error.message.includes('obrigatório') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // INATIVAR (soft delete — não apaga do banco)
    app.put('/clientes/:id/inativar', authMiddleware, async (req, res) => {
        try {
            await ClienteDAO.inativar(req.params.id);
            res.json({ success: true, msg: 'Cliente inativada com sucesso!' });
        } catch (error) {
            const status = error.message.includes('não encontrada') ? 404 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR (hard delete — use com cuidado)
    app.delete('/clientes/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await ClienteDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Cliente removida com sucesso!' });
            res.status(404).json({ success: false, msg: 'Cliente não encontrada.' });
        } catch (error) {
            res.status(400).json({
                success: false,
                msg: 'Não foi possível excluir. Verifique se existem agendamentos vinculados a esta cliente.',
                details: error.message
            });
        }
    });


    // ============================================================
    // ANAMNESE
    // ============================================================

    // CONSULTAR ANAMNESE DA CLIENTE
    app.get('/clientes/:id/anamnese', authMiddleware, async (req, res) => {
        try {
            const anamnese = await AnamneseDAO.consultarDaCliente(req.params.id);
            if (!anamnese) return res.status(404).json({ success: false, msg: 'Anamnese não preenchida ainda.' });
            res.json(anamnese);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // SALVAR ANAMNESE (cria ou atualiza — upsert)
    app.post('/clientes/:id/anamnese', authMiddleware, async (req, res) => {
        try {
            const { user_id, ...dados } = req.body;
            const anamnese = await AnamneseDAO.salvar(req.params.id, dados, user_id);
            res.status(201).json({ success: true, msg: 'Anamnese salva!', data: anamnese });
        } catch (error) {
            const status = error.message.includes('obrigatória') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // CRÉDITOS DA CLIENTE
    // ============================================================

    // HISTÓRICO DE CRÉDITOS
    app.get('/clientes/:id/creditos', authMiddleware, async (req, res) => {
        try {
            const historico = await CreditoDAO.historico(req.params.id);
            res.json(historico);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ADICIONAR CRÉDITO OU DÉBITO MANUAL
    app.post('/clientes/:id/creditos', authMiddleware, async (req, res) => {
        try {
            const credito = await CreditoDAO.adicionar({
                cliente_id: req.params.id,
                ...req.body
            });
            res.status(201).json({ success: true, msg: 'Movimentação de crédito registrada!', data: credito });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('zero') || error.message.includes('insuficiente') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // STATUS DO MÓDULO
    // ============================================================
    app.get('/clientes-status', (req, res) => {
        res.json({ modulo: 'Clientes (Clientes, Anamnese, Créditos)', online: true, database: 'PostgreSQL' });
    });
};