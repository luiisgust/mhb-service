const EstoqueDAO = require('../models/estoqueModel');

module.exports = (app) => {
    // Listar produtos
    app.get("/estoque", async (req, res) => {
        try { res.json(await EstoqueDAO.listar()); } 
        catch (e) { res.status(500).json({ error: e.message }); }
    });

    // Salvar ou Atualizar (Reposição de estoque usa essa rota enviando o ID)
    app.post('/estoque', async (req, res) => {
        try {
            const resu = await EstoqueDAO.salvar(req.body.id, req.body);
            res.json({ success: true, data: resu });
        } catch (e) { res.status(500).json({ success: false, msg: e.message }); }
    });

    // Remover produto do estoque
    app.delete("/estoque/:id", async (req, res) => {
        try { res.json({ success: (await EstoqueDAO.excluir(req.params.id)) > 0 }); }
        catch (e) { res.status(500).json({ success: false, error: e.message }); }
    });
}