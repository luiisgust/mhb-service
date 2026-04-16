const DatabasePG = require('../../repository/database.js');

class Caixa {
    #id; #unidade_id; #v_inicial; #v_final; #status; #abertura; #fechamento;

    constructor(row) {
        this.#id = row.id;
        this.#unidade_id = row.unidade_id;
        this.#v_inicial = row.valor_inicial;
        this.#v_final = row.valor_final;
        this.#status = row.status;
        this.#abertura = row.data_abertura;
        this.#fechamento = row.data_fechamento;
        this.unidade_nome = row.unidade_nome; // Do JOIN
    }

    toJSON() {
        return {
            id: this.#id,
            unidade_id: this.#unidade_id,
            valor_inicial: this.#v_inicial,
            valor_final: this.#v_final,
            status: this.#status,
            data_abertura: this.#abertura,
            data_fechamento: this.#fechamento,
            unidade_nome: this.unidade_nome
        };
    }
}

class CaixaDAO {
    async listar() {
        const rows = await DatabasePG.selectCaixas();
        return rows.map(r => new Caixa(r).toJSON());
    }

    async salvar(id, d) {
        let row;
        if (!id) {
            row = await DatabasePG.abrirCaixa(d.unidade_id, d.v_inicial);
        } else {
            // Caso precise corrigir o valor inicial ou trocar unidade por erro
            row = await DatabasePG.updateCaixa(id, d.unidade_id, d.v_inicial, d.v_final, d.status);
        }
        return row ? new Caixa(row).toJSON() : null;
    }

    async fechar(id, valor_final) {
        const row = await DatabasePG.fecharCaixa(id, valor_final);
        return row ? new Caixa(row).toJSON() : null;
    }
}

module.exports = new CaixaDAO();