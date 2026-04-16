const CaixaDAO = require('../models/caixaModel');

module.exports = (app) => {
    // Listar todos os caixas (Histórico de aberturas)
    app.get("/caixa", async (req, res) => {
        try { res.json(await CaixaDAO.listar()); } 
        catch (e) { res.status(500).json({ error: e.message }); }
    });

    // Abrir ou Atualizar Dados do Caixa
    app.post("/caixa", async (req, res) => {
        try {
            const resu = await CaixaDAO.salvar(req.body.id, req.body);
            res.json({ success: true, data: resu });
        } catch (e) { res.status(500).json({ success: false, msg: e.message }); }
    });

    // Rota específica para o fechamento
    app.patch("/caixa/:id/fechar", async (req, res) => {
        try {
            const resu = await CaixaDAO.fechar(req.params.id, req.body.valor_final);
            res.json({ success: true, data: resu });
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
}