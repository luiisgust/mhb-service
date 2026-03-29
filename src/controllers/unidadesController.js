const Unidade = require('../models/unidadesModel')

module.exports = (app) => {

    // 1. GET - Página/Dados de Listagem (Visualizar Todos)
    app.get("/unidade", async (req, res) => {        
        const unidade = new Unidade()
        const lista = await unidade.consultarTodos()
        res.json(lista)        
    })

    // 2. GET - Dados de uma Unidade específica (Para carregar na página de Edição)
    app.get("/unidade/:id", async (req, res) => {
        const unidade = new Unidade()
        const dados = await unidade.consultarUm(req.params.id)
        if (dados.id) {
            res.json(dados)
        } else {
            res.status(404).json({ msg: "Unidade não encontrada." })
        }
    })

    // 3. GET - "Página" de Cadastro (No modelo API, isso pode ser apenas um log ou info)
    // No seu caso, como o Front está na Hostgator, esse GET no Back é opcional, 
    // mas serve para testar se a rota responde.
    app.get("/unidade/novo", (req, res) => {
        res.json({ msg: "Pronto para receber novo cadastro via POST em /registrarunidade" })
    })

    // 4. GET - Status do Sistema (Útil para saber se o Render está vivo)
    app.get("/unidade/status", (req, res) => {
        res.json({ online: true, database: "PostgreSQL/Supabase", ambiente: "Render" })
    })
   
    // --- AÇÕES (Não são páginas, são comandos) ---

    // POST - Registrar ou Atualizar (Lógica de Upsert)
    app.post('/registrarunidade', async (req, res) => {
        const unidade = new Unidade()
        const { id, localidade } = req.body 

        try {
            if (!id) {
                const novoId = await unidade.addUnidade(localidade)
                res.status(201).json({ success: true, msg: "Criado!", id: novoId })
            } else {
                const colunas = await unidade.atualizar(localidade, id)
                res.json({ success: true, msg: "Atualizado!", colunas })
            }
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message })
        }
    })

    // DELETE - Apagar
    app.delete("/unidade/:id", async (req, res) => {
        const unidade = new Unidade()
        const status = await unidade.apagar(req.params.id)
        res.json({ success: status > 0, status })
    })
}