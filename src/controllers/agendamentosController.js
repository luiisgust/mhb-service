const AgendamentoDAO = require('../models/agendamentosModel');

module.exports = (app) => {

    // LISTAR TODOS OS AGENDAMENTOS (Agenda Geral)
    app.get("/agendamento", async (req, res) => {
        try {
            const lista = await AgendamentoDAO.listarTudo();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // CRIAR NOVO AGENDAMENTO
    app.post('/agendamento', async (req, res) => {
        try {
            // Esperamos que o Front envie os nomes das variáveis conforme o método addAgendamento
            const novo = await AgendamentoDAO.cadastrar(req.body);
            res.status(201).json({ success: true, data: novo });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR STATUS (Ex: De 'Agendado' para 'Concluído' ou 'Cancelado')
    app.patch('/agendamento/:id/status', async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const atualizado = await AgendamentoDAO.atualizarStatus(id, status);
            if (atualizado) {
                res.json({ success: true, data: atualizado });
            } else {
                res.status(404).json({ success: false, msg: "Agendamento não encontrado." });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // EXCLUIR AGENDAMENTO
    app.delete("/agendamento/:id", async (req, res) => {
        try {
            const rowCount = await AgendamentoDAO.excluir(req.params.id);
            res.json({ success: rowCount > 0 });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
}