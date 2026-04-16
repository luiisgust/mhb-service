const VendaDAO = require('../models/vendasModel');

module.exports = (app) => {
    // Registrar uma nova venda (Dá baixa automática no estoque)
    app.post('/venda', async (req, res) => {
        try {
            const novaVenda = await VendaDAO.registrar(req.body);
            res.status(201).json({ success: true, data: novaVenda });
        } catch (e) {
            res.status(500).json({ success: false, msg: "Erro ao vender: " + e.message });
        }
    });

    // Ver histórico de vendas
    app.get("/venda", async (req, res) => {
        try { res.json(await VendaDAO.listarHistorico()); }
        catch (e) { res.status(500).json({ error: e.message }); }
    });
}