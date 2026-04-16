const ComissaoDAO = require('../models/comissaoModel');

module.exports = (app) => {
    app.get("/comissao", async (req, res) => {
        try { res.json(await ComissaoDAO.listar()); } 
        catch (e) { res.status(500).json({ error: e.message }); }
    });

    app.post("/comissao", async (req, res) => {
        try {
            const resu = await ComissaoDAO.salvar(req.body.id, req.body);
            res.json({ success: true, data: resu });
        } catch (e) { res.status(500).json({ success: false, msg: e.message }); }
    });

    app.delete("/comissao/:id", async (req, res) => {
        try { res.json({ success: (await ComissaoDAO.excluir(req.params.id)) > 0 }); }
        catch (e) { res.status(500).json({ success: false, error: e.message }); }
    });
}