const db = require('../../repository/database.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';
const SALT_ROUNDS = 10;

// ============================================================
// ENTIDADE — USER (sem senha)
// ============================================================
class User {
    #id; #nome; #email; #role; #unidade_id; #ativo; #ultimo_login; #criado_em;

    constructor(r) {
        this.#id          = r.id;
        this.#nome        = r.nome;
        this.#email       = r.email;
        this.#role        = r.role;
        this.#unidade_id  = r.unidade_id;
        this.#ativo       = r.ativo;
        this.#ultimo_login = r.ultimo_login;
        this.#criado_em   = r.criado_em;
    }

    toJSON() {
        return {
            id:           this.#id,
            nome:         this.#nome,
            email:        this.#email,
            role:         this.#role,
            unidade_id:   this.#unidade_id,
            ativo:        this.#ativo,
            ultimo_login: this.#ultimo_login,
            criado_em:    this.#criado_em
            // senha NUNCA exposta
        };
    }
}


// ============================================================
// DAO — AUTH
// ============================================================
class AuthDAO {

    async login(email, senha) {
        if (!email) throw new Error('O e-mail é obrigatório.');
        if (!senha)  throw new Error('A senha é obrigatória.');

        // Busca usuário com senha (hash)
        const userRaw = await db.getUserByEmail(email);
        if (!userRaw) throw new Error('E-mail ou senha inválidos.');
        if (!userRaw.ativo) throw new Error('Usuário inativo. Entre em contato com o administrador.');

        // Compara a senha com o hash
        const senhaCorreta = await bcrypt.compare(senha, userRaw.password);
        if (!senhaCorreta) throw new Error('E-mail ou senha inválidos.');

        // Atualiza último login
        await db.updateUltimoLogin(userRaw.id);

        // Gera o token JWT
        const payload = {
            id:        userRaw.id,
            nome:      userRaw.nome,
            email:     userRaw.email,
            role:      userRaw.role,
            unidade_id: userRaw.unidade_id
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        return {
            token,
            user: new User(userRaw).toJSON()
        };
    }

    async cadastrar(nome, email, senha, role, unidade_id) {
        if (!nome)  throw new Error('O campo nome é obrigatório.');
        if (!email) throw new Error('O campo e-mail é obrigatório.');
        if (!senha) throw new Error('O campo senha é obrigatório.');
        if (senha.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres.');

        // Verifica e-mail duplicado
        const existente = await db.getUserByEmail(email);
        if (existente) throw new Error('E-mail já cadastrado.');

        const hash = await bcrypt.hash(senha, SALT_ROUNDS);
        const row = await db.addUser(nome, email, hash, role, unidade_id);
        return row ? new User(row).toJSON() : null;
    }

    async alterarSenha(id, senhaAtual, novaSenha) {
        if (!senhaAtual || !novaSenha) throw new Error('Senha atual e nova senha são obrigatórias.');
        if (novaSenha.length < 6) throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
        if (senhaAtual === novaSenha) throw new Error('A nova senha deve ser diferente da atual.');

        const userRaw = await db.getUserByEmail(
            (await db.getUserById(id)).email
        );
        if (!userRaw) throw new Error('Usuário não encontrado.');

        const senhaCorreta = await bcrypt.compare(senhaAtual, userRaw.password);
        if (!senhaCorreta) throw new Error('Senha atual incorreta.');

        const novoHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
        await db.updateUserPassword(id, novoHash);
    }

    verificarToken(token) {
        if (!token) throw new Error('Token não informado.');
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') throw new Error('Token expirado. Faça login novamente.');
            throw new Error('Token inválido.');
        }
    }

    async consultarTodos() {
        const rows = await db.selectUsers();
        return rows.map(r => new User(r).toJSON());
    }

    async consultarUm(id) {
        const row = await db.getUserById(id);
        return row ? new User(row).toJSON() : null;
    }

    async atualizar(id, nome, email, role, unidade_id, ativo) {
        const row = await db.updateUser(id, nome, email, role, unidade_id, ativo);
        return row ? new User(row).toJSON() : null;
    }

    async excluir(id) {
        return await db.deleteById('users', id);
    }
}

// ============================================================
// MIDDLEWARE — verifica JWT em rotas protegidas
// ============================================================
const authDAO = new AuthDAO();

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    try {
        const payload = authDAO.verificarToken(token);
        req.user = payload; // disponibiliza os dados do user na req
        next();
    } catch (error) {
        return res.status(401).json({ success: false, msg: error.message });
    }
}

// Middleware que verifica role específica
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ success: false, msg: 'Não autenticado.' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, msg: 'Acesso negado. Permissão insuficiente.' });
        }
        next();
    };
}

module.exports = {
    AuthDAO: authDAO,
    authMiddleware,
    requireRole
};