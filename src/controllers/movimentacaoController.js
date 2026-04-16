const MovimentacaoDAO = require('../models/movimentacaoModel');

module.exports = (app) => {
    // Buscar movimentações de um caixa aberto
    app.get("/movimentacao/:caixa_id", async (req, res) => {
        try {
            const lista = await MovimentacaoDAO.listarPorCaixa(req.params.caixa_id);
            res.json(lista);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    // Criar ou Editar uma movimentação (Entrada/Saída)
    app.post("/movimentacao", async (req, res) => {
        try {
            const resu = await MovimentacaoDAO.salvar(req.body.id, req.body);
            res.json({ success: true, data: resu });
        } catch (e) { res.status(500).json({ success: false, msg: e.message }); }
    });

    // Excluir (Caso precise estornar algo)
    app.delete("/movimentacao/:id", async (req, res) => {
        try {
            const ok = await MovimentacaoDAO.excluir(req.params.id);
            res.json({ success: ok > 0 });
        } catch (e) { res.status(500).json({ success: false, error: e.message }); }
    });
}