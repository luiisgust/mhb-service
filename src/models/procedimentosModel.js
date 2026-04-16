const DatabasePG = require('../../repository/database.js');

// 1. A Entidade
class Procedimento {
    #id;
    #nome;
    #tempo_maximo;
    #valor;

    constructor(id, nome, tempo_maximo, valor) {
        this.#id = id;
        this.#nome = nome;
        this.#tempo_maximo = tempo_maximo;
        this.#valor = valor;
    }

    toJSON() {
        return {
            id: this.#id,
            nome: this.#nome,
            tempo_maximo: this.#tempo_maximo,
            valor: this.#valor
        };
    }
}

// 2. O DAO
class ProcedimentoDAO {
    async listar() {
        const rows = await DatabasePG.selectProcedimentos();
        return rows.map(r => new Procedimento(r.id, r.nome, r.tempo_maximo, r.valor).toJSON());
    }

    async cadastrar(nome, tempo_maximo, valor) {
        const row = await DatabasePG.addProcedimento(nome, tempo_maximo, valor);
        return row ? new Procedimento(row.id, row.nome, row.tempo_maximo, row.valor).toJSON() : null;
    }
}

module.exports = new ProcedimentoDAO();