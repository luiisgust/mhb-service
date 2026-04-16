const DatabasePG = require('../../repository/database.js');

// 1. A Entidade
class Categoria {
    #id;
    #nome;

    constructor(id, nome) {
        this.#id = id;
        this.#nome = nome;
    }

    toJSON() {
        return { id: this.#id, nome: this.#nome };
    }
}

// 2. O DAO
class CategoriaDAO {
    async listar() {
        const rows = await DatabasePG.selectCategorias();
        return rows.map(r => new Categoria(r.id, r.nome).toJSON());
    }

    async cadastrar(nome) {
        const row = await DatabasePG.addCategoria(nome);
        return row ? new Categoria(row.id, row.nome).toJSON() : null;
    }
}

module.exports = new CategoriaDAO();