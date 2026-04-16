const DatabasePG = require('../../repository/database.js');

// 1. A Entidade (O Molde do Dado)
class Unidade {
    #id;
    #nome;
    #localidade;

    constructor(id, nome, localidade) {
        this.#id = id;
        this.#nome = nome;
        this.#localidade = localidade;
    }

    get id() { return this.#id; }
    get nome() { return this.#nome; }
    get localidade() { return this.#localidade; }

    toJSON() {
        return {
            id: this.#id,
            nome: this.#nome,
            localidade: this.#localidade
        };
    }
}

// 2. O DAO (A Lógica de acesso ao Banco)
class UnidadeDAO {
    
    async consultarTodos() {
        const rows = await DatabasePG.selectUnidades();
        // Transformamos as linhas puras do banco em objetos da classe Unidade
        return rows.map(r => new Unidade(r.id, r.nome, r.localidade).toJSON());
    }

    async consultarUm(id) {
        const rows = await DatabasePG.selectUnidades();
        const row = rows.find(r => r.id == id);
        return row ? new Unidade(row.id, row.nome, row.localidade).toJSON() : null;
    }

    async cadastrar(nome, localidade) {
        const row = await DatabasePG.addUnidade(nome, localidade);
        return row ? new Unidade(row.id, row.nome, row.localidade).toJSON() : null;
    }

    async atualizar(id, nome, localidade) {
        const row = await DatabasePG.updateUnidade(id, nome, localidade);
        return row ? new Unidade(row.id, row.nome, row.localidade).toJSON() : null;
    }

    async excluir(id) {
        // Usando o método genérico deleteById que criamos no database.js
        return await DatabasePG.deleteById('unidades', id);
    }
}

module.exports = new UnidadeDAO();