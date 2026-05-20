const db = require('../../repository/database.js');

// ============================================================
// ENTIDADE — PRODUTO (ESTOQUE)
// ============================================================
class Produto {
    #id; #nome; #descricao; #categoria_id; #categoria_nome;
    #unidade_medida; #quantidade; #quantidade_minima;
    #preco_custo; #preco_venda; #codigo_barras;
    #lote; #data_validade; #ativo; #criado_em; #atualizado_em;

    constructor(r) {
        this.#id               = r.id;
        this.#nome             = r.nome;
        this.#descricao        = r.descricao;
        this.#categoria_id     = r.categoria_id;
        this.#categoria_nome   = r.categoria_nome;
        this.#unidade_medida   = r.unidade_medida;
        this.#quantidade       = r.quantidade;
        this.#quantidade_minima = r.quantidade_minima;
        this.#preco_custo      = r.preco_custo;
        this.#preco_venda      = r.preco_venda;
        this.#codigo_barras    = r.codigo_barras;
        this.#lote             = r.lote;
        this.#data_validade    = r.data_validade;
        this.#ativo            = r.ativo;
        this.#criado_em        = r.criado_em;
        this.#atualizado_em    = r.atualizado_em;
    }

    get estoqueBaixo() {
        return this.#quantidade <= this.#quantidade_minima;
    }

    toJSON() {
        return {
            id:                this.#id,
            nome:              this.#nome,
            descricao:         this.#descricao,
            categoria_id:      this.#categoria_id,
            categoria_nome:    this.#categoria_nome,
            unidade_medida:    this.#unidade_medida,
            quantidade:        this.#quantidade,
            quantidade_minima: this.#quantidade_minima,
            estoque_baixo:     this.estoqueBaixo,
            preco_custo:       this.#preco_custo,
            preco_venda:       this.#preco_venda,
            codigo_barras:     this.#codigo_barras,
            lote:              this.#lote,
            data_validade:     this.#data_validade,
            ativo:             this.#ativo,
            criado_em:         this.#criado_em,
            atualizado_em:     this.#atualizado_em
        };
    }
}

// ============================================================
// ENTIDADE — MOVIMENTAÇÃO DE ESTOQUE
// ============================================================
class MovimentacaoEstoque {
    #id; #estoque_id; #tipo; #quantidade; #motivo;
    #agendamento_id; #venda_id; #user_id; #user_nome;
    #observacao; #criado_em;

    constructor(r) {
        this.#id             = r.id;
        this.#estoque_id     = r.estoque_id;
        this.#tipo           = r.tipo;
        this.#quantidade     = r.quantidade;
        this.#motivo         = r.motivo;
        this.#agendamento_id = r.agendamento_id;
        this.#venda_id       = r.venda_id;
        this.#user_id        = r.user_id;
        this.#user_nome      = r.user_nome;
        this.#observacao     = r.observacao;
        this.#criado_em      = r.criado_em;
    }

    toJSON() {
        return {
            id:             this.#id,
            estoque_id:     this.#estoque_id,
            tipo:           this.#tipo,
            quantidade:     this.#quantidade,
            motivo:         this.#motivo,
            agendamento_id: this.#agendamento_id,
            venda_id:       this.#venda_id,
            user_id:        this.#user_id,
            user_nome:      this.#user_nome,
            observacao:     this.#observacao,
            criado_em:      this.#criado_em
        };
    }
}

// ============================================================
// DAO — ESTOQUE
// ============================================================
class EstoqueDAO {

    async consultarTodos(apenasAtivos = true) {
        const rows = await db.selectEstoque(apenasAtivos);
        return rows.map(r => new Produto(r).toJSON());
    }

    async consultarUm(id) {
        // Reutiliza o selectEstoque completo e filtra por id
        const rows = await db.selectEstoque(false);
        const row = rows.find(r => r.id == id);
        return row ? new Produto(row).toJSON() : null;
    }

    async estoqueBaixo() {
        const rows = await db.getEstoqueBaixo();
        return rows.map(r => new Produto(r).toJSON());
    }

    async estoqueVencendo(dias = 30) {
        const rows = await db.getEstoqueVencendo(dias);
        return rows.map(r => new Produto(r).toJSON());
    }

    async cadastrar(dados) {
        const {
            nome, descricao, categoria_id, unidade_medida,
            quantidade, quantidade_minima,
            preco_custo, preco_venda,
            codigo_barras, lote, data_validade
        } = dados;

        if (!nome) throw new Error('O campo nome é obrigatório.');
        if (quantidade < 0) throw new Error('Quantidade não pode ser negativa.');
        if (preco_venda < preco_custo) throw new Error('Preço de venda não pode ser menor que o preço de custo.');

        const row = await db.addEstoque(
            nome, descricao, categoria_id, unidade_medida,
            quantidade || 0, quantidade_minima || 0,
            preco_custo, preco_venda,
            codigo_barras, lote, data_validade
        );
        return row ? new Produto(row).toJSON() : null;
    }

    async atualizar(id, dados) {
        const {
            nome, descricao, categoria_id, unidade_medida,
            quantidade_minima, preco_custo, preco_venda,
            lote, data_validade, ativo
        } = dados;

        if (!nome) throw new Error('O campo nome é obrigatório.');

        const row = await db.updateEstoque(
            id, nome, descricao, categoria_id, unidade_medida,
            quantidade_minima, preco_custo, preco_venda,
            lote, data_validade, ativo
        );
        return row ? new Produto(row).toJSON() : null;
    }

    async repor(estoque_id, quantidade, user_id, observacao) {
        if (!quantidade || quantidade <= 0) throw new Error('Quantidade de reposição deve ser maior que zero.');
        const row = await db.reporEstoque(estoque_id, quantidade, user_id, observacao);
        return row ? new MovimentacaoEstoque(row).toJSON() : null;
    }

    async consultarMovimentacoes(estoque_id) {
        const rows = await db.getMovimentacoesEstoque(estoque_id);
        return rows.map(r => new MovimentacaoEstoque(r).toJSON());
    }

    async excluir(id) {
        return await db.deleteById('estoque', id);
    }
}

module.exports = new EstoqueDAO();