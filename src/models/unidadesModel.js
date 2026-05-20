const db = require('../../repository/database.js');

// ============================================================
// ENTIDADE
// ============================================================
class Unidade {
    #id; #nome; #endereco; #cidade; #ativa; #criado_em; #atualizado_em;

    constructor(r) {
        this.#id           = r.id;
        this.#nome         = r.nome;
        this.#endereco     = r.endereco;
        this.#cidade       = r.cidade;
        this.#ativa        = r.ativa;
        this.#criado_em    = r.criado_em;
        this.#atualizado_em = r.atualizado_em;
    }

    toJSON() {
        return {
            id:            this.#id,
            nome:          this.#nome,
            endereco:      this.#endereco,
            cidade:        this.#cidade,
            ativa:         this.#ativa,
            criado_em:     this.#criado_em,
            atualizado_em: this.#atualizado_em
        };
    }
}

// ============================================================
// DAO
// ============================================================
class UnidadeDAO {

    async consultarTodos() {
        const rows = await db.selectUnidades();
        return rows.map(r => new Unidade(r).toJSON());
    }

    async consultarUm(id) {
        const row = await db.getUnidadeById(id);
        return row ? new Unidade(row).toJSON() : null;
    }

    async cadastrar(nome, endereco, cidade) {
        const row = await db.addUnidade(nome, endereco, cidade);
        return row ? new Unidade(row).toJSON() : null;
    }

    async atualizar(id, nome, endereco, cidade, ativa) {
        const row = await db.updateUnidade(id, nome, endereco, cidade, ativa);
        return row ? new Unidade(row).toJSON() : null;
    }

    async excluir(id) {
        return await db.deleteById('unidades', id);
    }
}

module.exports = new UnidadeDAO();