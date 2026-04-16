const DatabasePG = require('../../repository/database.js');

class Produto {
    #id; #nome; #quantidade; #categoria_id; #categoria_nome;

    constructor(row) {
        this.#id = row.id;
        this.#nome = row.nome;
        this.#quantidade = row.quantidade;
        this.#categoria_id = row.categoria_id;
        this.#categoria_nome = row.categoria_nome; // Do LEFT JOIN
    }

    toJSON() {
        return {
            id: this.#id,
            nome: this.#nome,
            quantidade: this.#quantidade,
            categoria_id: this.#categoria_id,
            categoria_nome: this.#categoria_nome
        };
    }
}

class EstoqueDAO {
    async listar() {
        const rows = await DatabasePG.selectEstoque();
        return rows.map(r => new Produto(r).toJSON());
    }

    async salvar(id, d) {
        const row = id 
            ? await DatabasePG.updateEstoque(id, d.nome, d.qtd, d.cat_id)
            : await DatabasePG.addEstoque(d.nome, d.qtd, d.cat_id);
        return row ? new Produto(row).toJSON() : null;
    }

    async excluir(id) {
        return await DatabasePG.deleteById('estoque', id);
    }
}

module.exports = new EstoqueDAO();