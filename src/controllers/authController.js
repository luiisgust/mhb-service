const { AuthDAO, authMiddleware, requireRole } = require('../models/authModel');

// ============================================================
// EXPORTA COMO FUNÇÃO — padrão de todos os controllers
// ============================================================
module.exports = (app) => {

    // ============================================================
    // ROTAS PÚBLICAS (sem token)
    // ============================================================

    // LOGIN
    app.post('/auth/login', async (req, res) => {
        const { email, senha } = req.body;

        try {
            const resultado = await AuthDAO.login(email, senha);
            res.json({
                success: true,
                msg: `Bem-vinda, ${resultado.user.nome}!`,
                token: resultado.token,
                user: resultado.user
            });
        } catch (error) {
            const status = error.message.includes('inválidos') || error.message.includes('inativo') ? 401 : 400;
            res.status(status).json({ success: false, msg: error.message });
        }
    });


    // ============================================================
    // ROTAS PROTEGIDAS (exigem token)
    // ============================================================

    // DADOS DO USUÁRIO LOGADO
    app.get('/auth/me', authMiddleware, async (req, res) => {
        try {
            const user = await AuthDAO.consultarUm(req.user.id);
            if (!user) return res.status(404).json({ success: false, msg: 'Usuário não encontrado.' });
            res.json(user);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ALTERAR SENHA DO PRÓPRIO USUÁRIO
    app.put('/auth/senha', authMiddleware, async (req, res) => {
        const { senhaAtual, novaSenha } = req.body;

        try {
            await AuthDAO.alterarSenha(req.user.id, senhaAtual, novaSenha);
            res.json({ success: true, msg: 'Senha alterada com sucesso!' });
        } catch (error) {
            const status = error.message.includes('obrigatória') || error.message.includes('incorreta') || error.message.includes('diferente') || error.message.includes('mínimo') ? 400 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // VERIFICAR SE TOKEN AINDA É VÁLIDO
    app.get('/auth/verificar', authMiddleware, (req, res) => {
        res.json({ success: true, msg: 'Token válido.', user: req.user });
    });


    // ============================================================
    // GESTÃO DE USUÁRIOS (apenas admin/gerente)
    // ============================================================

    // LISTAR TODOS
    app.get('/users', authMiddleware, requireRole('admin', 'gerente'), async (req, res) => {
        try {
            const lista = await AuthDAO.consultarTodos();
            res.json(lista);
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar usuários.', details: error.message });
        }
    });

    // BUSCAR UM
    app.get('/users/:id', authMiddleware, requireRole('admin', 'gerente'), async (req, res) => {
        try {
            const user = await AuthDAO.consultarUm(req.params.id);
            if (!user) return res.status(404).json({ success: false, msg: 'Usuário não encontrado.' });
            res.json(user);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // CADASTRAR (apenas admin)
    app.post('/users', authMiddleware, requireRole('admin'), async (req, res) => {
        const { nome, email, senha, role, unidade_id } = req.body;

        try {
            const novo = await AuthDAO.cadastrar(nome, email, senha, role, unidade_id);
            res.status(201).json({ success: true, msg: 'Usuário cadastrado!', data: novo });
        } catch (error) {
            const status = error.message.includes('obrigatório') || error.message.includes('mínimo') ? 400
                         : error.message.includes('já cadastrado') ? 409 : 500;
            res.status(status).json({ success: false, msg: error.message });
        }
    });

    // ATUALIZAR (apenas admin)
    app.put('/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
        const { nome, email, role, unidade_id, ativo } = req.body;

        if (!nome || !email) {
            return res.status(400).json({ success: false, msg: 'Nome e e-mail são obrigatórios.' });
        }

        try {
            const editado = await AuthDAO.atualizar(req.params.id, nome, email, role, unidade_id, ativo);
            if (!editado) return res.status(404).json({ success: false, msg: 'Usuário não encontrado.' });
            res.json({ success: true, msg: 'Usuário atualizado!', data: editado });
        } catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    });

    // EXCLUIR (apenas admin)
    app.delete('/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
        if (req.params.id == req.user.id) {
            return res.status(400).json({ success: false, msg: 'Você não pode excluir seu próprio usuário.' });
        }

        try {
            const rowCount = await AuthDAO.excluir(req.params.id);
            if (rowCount > 0) return res.json({ success: true, msg: 'Usuário removido!' });
            res.status(404).json({ success: false, msg: 'Usuário não encontrado.' });
        } catch (error) {
            res.status(400).json({ success: false, msg: 'Não foi possível excluir este usuário.', details: error.message });
        }
    });


    // ============================================================
    // STATUS DO MÓDULO
    // ============================================================
    app.get('/auth-status', (req, res) => {
        res.json({ modulo: 'Auth (Login, JWT, Users)', online: true, database: 'PostgreSQL' });
    });
};