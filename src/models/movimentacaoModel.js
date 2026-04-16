const DatabasePG = require('../../repository/database.js');

class Movimentacao {
    #id; #caixa_id; #tipo; #origem; #valor; #desc;

    constructor(row) {
        this.#id = row.id;
        this.#caixa_id = row.caixa_id;
        this.#tipo = row.tipo;
        this.#origem = row.origem;
        this.#valor = row.valor;
        this.#desc = row.descricao;
    }

    toJSON() {
        return {
            id: this.#id,
            caixa_id: this.#caixa_id,
            tipo: this.#tipo,
            origem: this.#origem,
            valor: this.#valor,
            descricao: this.#desc
        };
    }
}

class MovimentacaoDAO {
    async listarPorCaixa(caixa_id) {
        const sql = `SELECT * FROM movimentacoes_caixa WHERE caixa_id = $1 ORDER BY id DESC`;
        const res = await DatabasePG.query(sql, [caixa_id]);
        return res.rows.map(r => new Movimentacao(r).toJSON());
    }

    async salvar(id, d) {
        const row = id 
            ? await DatabasePG.updateMovimentacao(id, d.caixa_id, d.tipo, d.origem, d.valor, d.desc)
            : await DatabasePG.addMovimentacao(d.caixa_id, d.tipo, d.origem, d.valor, d.desc);
        return row ? new Movimentacao(row).toJSON() : null;
    }

    async excluir(id) {
        return await DatabasePG.deleteById('movimentacoes_caixa', id);
    }
}

module.exports = new MovimentacaoDAO();