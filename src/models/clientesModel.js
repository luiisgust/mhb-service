const DatabasePG = require('../../repository/database.js');

// 1. A Entidade (O Molde do Dado)
class Cliente {
    #id;
    #nome;
    #telefone;
    #aniversario;

    constructor(id, nome, telefone, aniversario) {
        this.#id = id;
        this.#nome = nome;
        this.#telefone = telefone;
        this.#aniversario = aniversario;
    }

    get id() { return this.#id; }
    get nome() { return this.#nome; }
    get telefone() { return this.#telefone; }
    get aniversario() { return this.#aniversario; }

    toJSON() {
        return {
            id: this.#id,
            nome: this.#nome,
            telefone: this.#telefone,
            aniversario: this.#aniversario
        };
    }
}

// 2. O DAO (Data Access Object)
class ClienteDAO {
    
    async consultarTodos() {
        const rows = await DatabasePG.selectClientes();
        return rows.map(r => new Cliente(r.id, r.nome, r.telefone, r.aniversario).toJSON());
    }

    async consultarUm(id) {
        const rows = await DatabasePG.selectClientes();
        const row = rows.find(r => r.id == id);
        return row ? new Cliente(row.id, row.nome, row.telefone, row.aniversario).toJSON() : null;
    }

    async cadastrar(nome, telefone, aniversario) {
        const row = await DatabasePG.addCliente(nome, telefone, aniversario);
        return row ? new Cliente(row.id, row.nome, row.telefone, row.aniversario).toJSON() : null;
    }

    async atualizar(id, nome, telefone, aniversario) {
        const row = await DatabasePG.updateCliente(id, nome, telefone, aniversario);
        return row ? new Cliente(row.id, row.nome, row.telefone, row.aniversario).toJSON() : null;
    }

    async excluir(id) {
        // Usando o método mestre para a tabela clientes
        return await DatabasePG.deleteById('clientes', id);
    }
}

module.exports = new ClienteDAO();