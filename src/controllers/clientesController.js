const ProfissionalDAO = require('../models/profissionaisModel');

module.exports = (app) => {

    // LISTAR TODOS OS PROFISSIONAIS
    app.get("/profissional", async (req, res) => {
        try {
            const lista = await ProfissionalDAO.consultarTodos();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: "Erro ao buscar profissionais", 
                details: error.message 
            });
        }
    });

    // BUSCAR UM PROFISSIONAL POR ID
    app.get("/profissional/:id", async (req, res) => {
        try {
            const profissional = await ProfissionalDAO.consultarUm(req.params.id);
            if (profissional) {
                res.json(profissional);
            } else {
                res.status(404).json({ success: false, msg: "Profissional não encontrado" });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // SALVAR (CADASTRO OU EDIÇÃO)
    app.post('/profissional', async (req, res) => {
        const { id, nome, quali_curso, unidade_id } = req.body;

        try {
            // Validação simples: Profissional precisa estar em uma unidade
            if (!unidade_id) {
                return res.status(400).json({ success: false, msg: "É necessário informar o ID da unidade." });
            }

            if (!id) {
                // Cadastro Novo
                const novo = await ProfissionalDAO.cadastrar(nome, quali_curso, unidade_id);
                res.status(201).json({ success: true, msg: "Profissional cadastrado!", data: novo });
            } else {
                // Atualização
                const editado = await ProfissionalDAO.atualizar(id, nome, quali_curso, unidade_id);
                if (editada) {
                    res.json({ success: true, msg: "Profissional atualizado!", data: editado });
                } else {
                    res.status(404).json({ success: false, msg: "Profissional não encontrado." });
                }
            }
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR PROFISSIONAL
    app.delete("/profissional/:id", async (req, res) => {
        try {
            const rowCount = await ProfissionalDAO.excluir(req.params.id);
            if (rowCount > 0) {
                res.json({ success: true, msg: "Profissional removido com sucesso!" });
            } else {
                res.status(404).json({ success: false, msg: "Profissional não encontrado." });
            }
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                msg: "Erro ao excluir: Verifique se este profissional possui agendamentos ativos.",
                details: error.message
            });
        }
    });
}