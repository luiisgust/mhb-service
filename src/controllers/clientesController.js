const ClienteDAO = require('../models/clientesModel');

module.exports = (app) => {

    // LISTAR TODOS OS CLIENTES
    app.get("/cliente", async (req, res) => {
        try {
            const lista = await ClienteDAO.consultarTodos();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: "Erro ao buscar clientes", 
                details: error.message 
            });
        }
    });

    // BUSCAR UM CLIENTE POR ID
    app.get("/cliente/:id", async (req, res) => {
        try {
            const cliente = await ClienteDAO.consultarUm(req.params.id);
            if (cliente) {
                res.json(cliente);
            } else {
                res.status(404).json({ success: false, msg: "Cliente não encontrado" });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // SALVAR (CADASTRO OU EDIÇÃO)
    app.post('/cliente', async (req, res) => {
        const { id, nome, telefone, aniversario } = req.body;

        try {
            if (!id) {
                // Cadastro Novo
                const novo = await ClienteDAO.cadastrar(nome, telefone, aniversario);
                res.status(201).json({ success: true, msg: "Cliente cadastrado!", data: novo });
            } else {
                // Atualização
                const editado = await ClienteDAO.atualizar(id, nome, telefone, aniversario);
                if (editado) {
                    res.json({ success: true, msg: "Cliente atualizado!", data: editado });
                } else {
                    res.status(404).json({ success: false, msg: "Cliente não encontrado." });
                }
            }
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR CLIENTE
    app.delete("/cliente/:id", async (req, res) => {
        try {
            const rowCount = await ClienteDAO.excluir(req.params.id);
            if (rowCount > 0) {
                res.json({ success: true, msg: "Cliente removido com sucesso!" });
            } else {
                res.status(404).json({ success: false, msg: "Cliente não encontrado." });
            }
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                msg: "Erro ao excluir: Verifique se este cliente possui agendamentos ou vendas vinculadas.",
                details: error.message
            });
        }
    });
}