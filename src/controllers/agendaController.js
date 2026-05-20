const { authMiddleware, requireRole } = require('../models/authModel');
const {
    AgendamentoDAO,
    AgendamentoProcedimentoDAO,
    AgendamentoFotoDAO,
    BloqueioDAO,
    HistoricoDAO
} = require('../models/agendaModel');

module.exports = (app) => {

    // ============================================================
    // AGENDAMENTOS
    // ============================================================

    // LISTAR COM FILTROS
    // query params: ?data=&profissional_id=&cliente_id=&unidade_id=&status=
    app.get('/agendamentos', authMiddleware, async (req, res) => {
        try {
            const filtros = {
                data:            req.query.data,
                profissional_id: req.query.profissional_id,
                cliente_id:      req.query.cliente_id,
                unidade_id:      req.query.unidade_id,
                status:          req.query.status
            };
            const lista = await AgendamentoDAO.consultarTodos(filtros);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar agendamentos.', details: error.message });
        }
    });

    // BUSCAR UM
    app.get('/agendamentos/:id', authMiddleware, async (req, res) => {
        try {
            const agendamento = await AgendamentoDAO.consultarUm(req.params.id);
            if (!agendamento) return res.status(404).json({ success: false, msg: 'Agendamento não encontrado.' });
            res.json(agendamento);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // AGENDA DO DIA — agendamentos + bloqueios
    // query params: ?data=2025-06-10&unidade_id=1
    app.get('/agenda/dia', authMiddleware, async (req, res) => {
        const { data, unidade_id } = req.query;

        if (!data || !unidade_id) {
            return res.status(400).json({ success: false, msg: 'Informe data e unidade_id.' });
        }

        try {
            const agenda = await AgendamentoDAO.agendaDia(data, unidade_id);
            res.json({ success: true, data, unidade_id, ...agenda });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // PRÓXIMOS AGENDAMENTOS DE UMA CLIENTE
    app.get('/agendamentos/cliente/:cliente_id/proximos', authMiddleware, async (req, res) => {
        try {
            const lista = await AgendamentoDAO.proximosDaCliente(req.params.cliente_id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // AGENDAMENTOS FINALIZADOS MAS NÃO PAGOS
    app.get('/agendamentos/nao-pagos', authMiddleware, async (req, res) => {
        try {
            const lista = await AgendamentoDAO.naoPagos();
            res.json({ success: true, total: lista.length, data: lista });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // RELATÓRIO DE FALTAS POR PROFISSIONAL
    // query params: ?mes=6&ano=2025
    app.get('/agendamentos/relatorio/faltas', authMiddleware, async (req, res) => {
        const { mes, ano } = req.query;

        if (!mes || !ano) {
            return res.status(400).json({ success: false, msg: 'Informe mês e ano. Ex: ?mes=6&ano=2025' });
        }

        try {
            const relatorio = await AgendamentoDAO.relatorioFaltas(mes, ano);
            res.json({ success: true, mes, ano, data: relatorio });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // RELATÓRIO DE FATURAMENTO POR PROFISSIONAL
    // query params: ?mes=6&ano=2025&unidade_id=1
    app.get('/agendamentos/relatorio/faturamento', authMiddleware, async (req, res) => {
        const { mes, ano, unidade_id } = req.query;

        if (!mes || !ano) {
            return res.status(400).json({ success: false, msg: 'Informe mês e ano. Ex: ?mes=6&ano=2025' });
        }

        try {
            const relatorio = await AgendamentoDAO.relatorioFaturamentoProfissional(mes, ano, unidade_id);
            res.json({ success: true, mes, ano, data: relatorio });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // CADASTRAR AGENDAMENTO
    app.post('/agendamentos', authMiddleware, async (req, res) => {
        try {
            const novo = await AgendamentoDAO.cadastrar(req.body);
            res.status(201).json({ success: true, msg: 'Agendamento criado!', data: novo });
        } catch (error) {
            const status = error.message.includes('obrigatória') || error.message.includes('após') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR AGENDAMENTO
    app.put('/agendamentos/:id', authMiddleware, async (req, res) => {
        try {
            const editado = await AgendamentoDAO.atualizar(req.params.id, req.body);
            res.json({ success: true, msg: 'Agendamento atualizado!', data: editado });
        } catch (error) {
            const status = error.message.includes('não encontrado') ? 404
                         : error.message.includes('após') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR STATUS DO AGENDAMENTO
    app.put('/agendamentos/:id/status', authMiddleware, async (req, res) => {
        const { status, motivo_cancelamento, user_id } = req.body;

        if (!status) return res.status(400).json({ success: false, msg: 'O status é obrigatório.' });

        try {
            const atualizado = await AgendamentoDAO.atualizarStatus(req.params.id, status, motivo_cancelamento, user_id);
            res.json({ success: true, msg: `Status atualizado para "${status}"!`, data: atualizado });
        } catch (error) {
            const status_code = error.message.includes('não encontrado') ? 404
                              : error.message.includes('motivo') ? 400 : 500;
            res.status(status_code).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR AGENDAMENTO
    app.delete('/agendamentos/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await AgendamentoDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Agendamento removido!' });
            res.status(404).json({ success: false, msg: 'Agendamento não encontrado.' });
        } catch (error) {
            res.status(400).json({ success: false, msg: 'Não foi possível excluir este agendamento.', details: error.message });
        }
    });


    // ============================================================
    // PROCEDIMENTOS DO AGENDAMENTO
    // ============================================================

    // LISTAR PROCEDIMENTOS DE UM AGENDAMENTO
    app.get('/agendamentos/:id/procedimentos', authMiddleware, async (req, res) => {
        try {
            const lista = await AgendamentoProcedimentoDAO.consultarDoAgendamento(req.params.id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ADICIONAR PROCEDIMENTO AO AGENDAMENTO
    app.post('/agendamentos/:id/procedimentos', authMiddleware, async (req, res) => {
        const { procedimento_id, nome_snapshot, valor_snapshot, tempo_snapshot, desconto } = req.body;

        try {
            const novo = await AgendamentoProcedimentoDAO.adicionar(
                req.params.id, procedimento_id,
                nome_snapshot, valor_snapshot,
                tempo_snapshot, desconto
            );
            res.status(201).json({ success: true, msg: 'Procedimento adicionado ao agendamento!', data: novo });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('negativo') || error.message.includes('zero') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // REMOVER PROCEDIMENTO DO AGENDAMENTO
    app.delete('/agendamentos/procedimentos/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await AgendamentoProcedimentoDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Procedimento removido do agendamento!' });
            res.status(404).json({ success: false, msg: 'Procedimento não encontrado.' });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // FOTOS DO AGENDAMENTO
    // ============================================================

    // FOTOS DE UM AGENDAMENTO
    app.get('/agendamentos/:id/fotos', authMiddleware, async (req, res) => {
        try {
            const lista = await AgendamentoFotoDAO.consultarDoAgendamento(req.params.id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // TODAS AS FOTOS DE UMA CLIENTE
    app.get('/clientes/:cliente_id/fotos', authMiddleware, async (req, res) => {
        try {
            const lista = await AgendamentoFotoDAO.consultarDaCliente(req.params.cliente_id);
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ADICIONAR FOTO
    app.post('/agendamentos/:id/fotos', authMiddleware, async (req, res) => {
        const { cliente_id, tipo, url, descricao, criado_por } = req.body;

        try {
            const foto = await AgendamentoFotoDAO.adicionar(req.params.id, cliente_id, tipo, url, descricao, criado_por);
            res.status(201).json({ success: true, msg: 'Foto adicionada!', data: foto });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('obrigatória') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // REMOVER FOTO
    app.delete('/agendamentos/fotos/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await AgendamentoFotoDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Foto removida!' });
            res.status(404).json({ success: false, msg: 'Foto não encontrada.' });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // BLOQUEIOS DE AGENDA
    // ============================================================

    // ADICIONAR BLOQUEIO
    app.post('/agenda/bloqueios', authMiddleware, async (req, res) => {
        try {
            const bloqueio = await BloqueioDAO.adicionar(req.body);
            res.status(201).json({ success: true, msg: 'Horário bloqueado!', data: bloqueio });
        } catch (error) {
            const status = error.message.includes('obrigatória') || error.message.includes('após') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // REMOVER BLOQUEIO
    app.delete('/agenda/bloqueios/:id', authMiddleware, async (req, res) => {
        try {
            const rowCount = await BloqueioDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Bloqueio removido!' });
            res.status(404).json({ success: false, msg: 'Bloqueio não encontrado.' });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // HISTÓRICO DO AGENDAMENTO
    // ============================================================

    app.get('/agendamentos/:id/historico', authMiddleware, async (req, res) => {
        try {
            const historico = await HistoricoDAO.consultarDoAgendamento(req.params.id);
            res.json(historico);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });


    // ============================================================
    // STATUS DO MÓDULO
    // ============================================================
    app.get('/agenda-status', (req, res) => {
        res.json({ modulo: 'Agenda (Agendamentos, Procedimentos, Fotos, Bloqueios, Histórico)', online: true, database: 'PostgreSQL' });
    });
};