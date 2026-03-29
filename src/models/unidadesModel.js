const DatabasePG = require('../../repository/database.js');

// 1. A Entidade (O Molde do Dado)
class Unidade {
    #id
    #localidade
    #nome

    constructor(localidade, nome) {
        this.#localidade = localidade;
        this.#nome = nome;
    }

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get localidade() { return this.#localidade; }
    set localidade(value) { this.#localidade = value; }
    get nome() { return this.#nome; }
    set nome(value) { this.#nome = value; }

    toJson() {
        return {
            "id": this.#id,
            "localidade": this.#localidade
        };
    }
}

// 2. O DAO (A Lógica de Banco)
class UnidadeDAO {
    #db

    constructor() {
        // Se o seu database.js já exporta "new Database()", usamos direto
        this.#db = DatabasePG; 
    }

    async consultarTodos() {
        let list_unidade = [];
        // No Postgres/pg, o resultado vem direto no array se você tratou no Database.js
        const rows = await this.#db.selectUnidades(); 

        for (let i = 0; i < rows.length; i++) {
            const unidade = new Unidade();
            unidade.id = rows[i].id;
            unidade.localidade = rows[i].localidade;
            unidade.nome = rows[i].nome;
            list_unidade.push(unidade.toJson());
        }
        return list_unidade;
    }

    async consultarUm(id) {
        const row = await this.#db.selectUnidadeId(id);
        const unidade = new Unidade();

        if (row) {
            unidade.id = row.id;
            unidade.localidade = row.localidade;
            unidade.nome = row.nome;
        }
        return unidade.toJson();
    }

    async addUnidade(localidade) {
        // No Postgres, quando fazemos INSERT ... RETURNING *, 
        // o banco nos devolve a linha criada.
        const rowCriada = await this.#db.addUnidade(localidade);
        
        // Em vez de .insertId (MySQL), pegamos o .id do objeto retornado
        return rowCriada.id; 
    }

    async apagar(id) {
        // O método deleteUnidade no Database.js deve retornar o res.rowCount
        const linhasAfetadas = await this.#db.deleteUnidade(id);
        return linhasAfetadas; 
    }

    async atualizar(localidade, id) {
        // Chamando o update com os parâmetros corretos para o Postgres
        const rowAtualizada = await this.#db.updateUnidade(id, localidade);
        
        // Se o objeto voltou, significa que atualizou (1 linha), senão 0
        return rowAtualizada ? 1 : 0;
    }
}

// Exportamos o DAO para o Controller usar
module.exports = UnidadeDAO;