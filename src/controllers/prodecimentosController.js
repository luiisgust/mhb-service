const ProcedimentoDAO = require('../models/procedimentosModel');

module.exports = (app) => {
    // GET - Listar
    app.get("/procedimento", async (req, res) => {
        try {
            const lista = await ProcedimentoDAO.listar();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST - Cadastrar
    app.post('/procedimento', async (req, res) => {
        const { nome, tempo_maximo, valor } = req.body;
        try {
            const novo = await ProcedimentoDAO.cadastrar(nome, tempo_maximo, valor);
            res.status(201).json({ success: true, data: novo });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    app.delete("/procedimento/:id", async (req, res) => {
        try {
            const rowCount = await ProcedimentoDAO.excluir(req.params.id);
            if (rowCount > 0) {
                res.json({ success: true, msg: "Procedimento removido com sucesso!" });
            } else {
                res.status(404).json({ success: false, msg: "Procedimento não encontrado." });
            }
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                msg: "Erro ao excluir: Verifique se este procedimento possui agendamentos ou vendas vinculadas.",
                details: error.message
            });
        }
    });
}