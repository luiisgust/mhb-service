const UnidadeDAO = require('../models/unidadesModel');

module.exports = (app) => {

    // LISTAR TODAS AS UNIDADES
    app.get("/unidade", async (req, res) => {
        try {
            const lista = await UnidadeDAO.consultarTodos();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: "Erro ao buscar unidades", 
                details: error.message 
            });
        }
    });

    // BUSCAR UMA UNIDADE ESPECÍFICA
    app.get("/unidade/:id", async (req, res) => {
        try {
            const unidade = await UnidadeDAO.consultarUm(req.params.id);
            if (unidade) {
                res.json(unidade);
            } else {
                res.status(404).json({ success: false, msg: "Unidade não encontrada" });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // SALVAR (CRIAÇÃO OU EDIÇÃO)
    // Se o corpo (body) vier com ID, ele atualiza. Se vier sem, ele cria.
    app.post('/unidade', async (req, res) => {
        const { id, nome, localidade } = req.body;

        try {
            if (!id) {
                // Cadastro Novo
                const nova = await UnidadeDAO.cadastrar(nome, localidade);
                res.status(201).json({ success: true, msg: "Unidade cadastrada!", data: nova });
            } else {
                // Atualização
                const editada = await UnidadeDAO.atualizar(id, nome, localidade);
                if (editada) {
                    res.json({ success: true, msg: "Unidade atualizada!", data: editada });
                } else {
                    res.status(404).json({ success: false, msg: "Unidade não encontrada para atualizar." });
                }
            }
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR UNIDADE
    app.delete("/unidade/:id", async (req, res) => {
        try {
            const rowCount = await UnidadeDAO.excluir(req.params.id);
            if (rowCount > 0) {
                res.json({ success: true, msg: "Unidade removida com sucesso!" });
            } else {
                res.status(404).json({ success: false, msg: "Unidade não encontrada." });
            }
        } catch (error) {
            // Tratamento de erro para Foreign Key (Chave Estrangeira)
            res.status(400).json({ 
                success: false, 
                msg: "Não foi possível excluir. Verifique se existem profissionais ou agendamentos vinculados a esta unidade.",
                details: error.message
            });
        }
    });

    // ROTA DE STATUS (Para testes rápidos)
    app.get("/unidade-status", (req, res) => {
        res.json({ 
            modulo: "Unidades", 
            online: true, 
            database: "PostgreSQL" 
        });
    });
}