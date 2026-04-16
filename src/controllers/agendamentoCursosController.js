const AgendamentoDAO = require('../models/agendamentoCursosModel');

module.exports = (app) => {
    app.get("/agendamento-curso", async (req, res) => {
        try { res.json(await AgendamentoDAO.listar()); }
        catch (e) { res.status(500).json({ error: e.message }); }
    });

    app.post('/agendamento-curso', async (req, res) => {
        try {
            const resu = await AgendamentoDAO.salvar(req.body.id, req.body);
            res.json({ success: true, data: resu });
        } catch (e) { res.status(500).json({ success: false, msg: e.message }); }
    });

    app.delete("/agendamento-curso/:id", async (req, res) => {
        try { res.json({ success: (await AgendamentoDAO.excluir(req.params.id)) > 0 }); }
        catch (e) { res.status(500).json({ success: false, error: e.message }); }
    });
}