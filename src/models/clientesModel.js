const DatabasePG = require('../../repository/database.js');

// 1. A Entidade (O Molde do Dado)
class Profissional {
    #id;
    #nome;
    #quali_curso;
    #unidade_id;
    #unidade_nome; // Campo vindo do JOIN no banco

    constructor(id, nome, quali_curso, unidade_id, unidade_nome) {
        this.#id = id;
        this.#nome = nome;
        this.#quali_curso = quali_curso;
        this.#unidade_id = unidade_id;
        this.#unidade_nome = unidade_nome;
    }

    get id() { return this.#id; }
    get nome() { return this.#nome; }
    get quali_curso() { return this.#quali_curso; }
    get unidade_id() { return this.#unidade_id; }

    toJSON() {
        return {
            id: this.#id,
            nome: this.#nome,
            quali_curso: this.#quali_curso,
            unidade_id: this.#unidade_id,
            unidade_nome: this.#unidade_nome // Para facilitar a vida do Front-end
        };
    }
}

// 2. O DAO (A Lógica de acesso ao Banco)
class ProfissionalDAO {
    
    async consultarTodos() {
        const rows = await DatabasePG.selectProfissionais();
        return rows.map(r => new Profissional(r.id, r.nome, r.quali_curso, r.unidade_id, r.unidade_nome).toJSON());
    }

    async consultarUm(id) {
        const rows = await DatabasePG.selectProfissionais();
        const row = rows.find(r => r.id == id);
        return row ? new Profissional(row.id, row.nome, row.quali_curso, row.unidade_id, row.unidade_nome).toJSON() : null;
    }

    async cadastrar(nome, quali_curso, unidade_id) {
        const row = await DatabasePG.addProfissional(nome, quali_curso, unidade_id);
        return row ? new Profissional(row.id, row.nome, row.quali_curso, row.unidade_id, null).toJSON() : null;
    }

    async atualizar(id, nome, quali_curso, unidade_id) {
        const row = await DatabasePG.updateProfissional(id, nome, quali_curso, unidade_id);
        return row ? new Profissional(row.id, row.nome, row.quali_curso, row.unidade_id, null).toJSON() : null;
    }

    async excluir(id) {
        // Usando o método mestre para a tabela profissionais
        return await DatabasePG.deleteById('profissionais', id);
    }
}

module.exports = new ProfissionalDAO();