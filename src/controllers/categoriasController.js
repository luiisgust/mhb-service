const CategoriaDAO = require('../models/categoriasModel');

module.exports = (app) => {
    // GET - Listar
    app.get("/categoria", async (req, res) => {
        try {
            const lista = await CategoriaDAO.listar();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST - Cadastrar
    app.post('/categoria', async (req, res) => {
        const { nome } = req.body;
        try {
            const nova = await CategoriaDAO.cadastrar(nome);
            res.status(201).json({ success: true, data: nova });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });
}