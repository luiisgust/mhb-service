const db = require('../../repository/database.js');

// ============================================================
// ENTIDADE — CAIXA
// ============================================================
class Caixa {
    #id; #unidade_id; #unidade_nome;
    #user_abertura; #user_abertura_nome;
    #user_fechamento; #user_fechamento_nome;
    #data_abertura; #data_fechamento;
    #valor_inicial; #valor_final; #status; #observacoes;

    constructor(r) {
        this.#id                   = r.id;
        this.#unidade_id           = r.unidade_id;
        this.#unidade_nome         = r.unidade_nome;
        this.#user_abertura        = r.user_abertura;
        this.#user_abertura_nome   = r.user_abertura_nome;
        this.#user_fechamento      = r.user_fechamento;
        this.#user_fechamento_nome = r.user_fechamento_nome;
        this.#data_abertura        = r.data_abertura;
        this.#data_fechamento      = r.data_fechamento;
        this.#valor_inicial        = r.valor_inicial;
        this.#valor_final          = r.valor_final;
        this.#status               = r.status;
        this.#observacoes          = r.observacoes;
    }

    toJSON() {
        return {
            id:                   this.#id,
            unidade_id:           this.#unidade_id,
            unidade_nome:         this.#unidade_nome,
            user_abertura:        this.#user_abertura,
            user_abertura_nome:   this.#user_abertura_nome,
            user_fechamento:      this.#user_fechamento,
            user_fechamento_nome: this.#user_fechamento_nome,
            data_abertura:        this.#data_abertura,
            data_fechamento:      this.#data_fechamento,
            valor_inicial:        this.#valor_inicial,
            valor_final:          this.#valor_final,
            status:               this.#status,
            observacoes:          this.#observacoes
        };
    }
}

// ============================================================
// ENTIDADE — MOVIMENTAÇÃO DE CAIXA
// ============================================================
class Movimentacao {
    #id; #caixa_id; #tipo; #origem; #forma_pagamento;
    #valor; #descricao; #agendamento_id; #venda_id;
    #agendamento_curso_id; #user_id; #data_movimentacao;

    constructor(r) {
        this.#id                  = r.id;
        this.#caixa_id            = r.caixa_id;
        this.#tipo                = r.tipo;
        this.#origem              = r.origem;
        this.#forma_pagamento     = r.forma_pagamento;
        this.#valor               = r.valor;
        this.#descricao           = r.descricao;
        this.#agendamento_id      = r.agendamento_id;
        this.#venda_id            = r.venda_id;
        this.#agendamento_curso_id = r.agendamento_curso_id;
        this.#user_id             = r.user_id;
        this.#data_movimentacao   = r.data_movimentacao;
    }

    toJSON() {
        return {
            id:                   this.#id,
            caixa_id:             this.#caixa_id,
            tipo:                 this.#tipo,
            origem:               this.#origem,
            forma_pagamento:      this.#forma_pagamento,
            valor:                this.#valor,
            descricao:            this.#descricao,
            agendamento_id:       this.#agendamento_id,
            venda_id:             this.#venda_id,
            agendamento_curso_id: this.#agendamento_curso_id,
            user_id:              this.#user_id,
            data_movimentacao:    this.#data_movimentacao
        };
    }
}

// ============================================================
// ENTIDADE — PAGAMENTO
// ============================================================
class Pagamento {
    #id; #agendamento_id; #venda_id; #caixa_id; #unidade_id; #cliente_id;
    #forma_pagamento; #bandeira; #nsu; #autorizacao; #maquininha;
    #parcelas; #com_juros; #valor_parcela;
    #chave_pix; #txid_pix;
    #valor; #status; #motivo_estorno; #data_estorno; #estornado_por;
    #data_pagamento; #registrado_por; #observacoes;

    constructor(r) {
        this.#id              = r.id;
        this.#agendamento_id  = r.agendamento_id;
        this.#venda_id        = r.venda_id;
        this.#caixa_id        = r.caixa_id;
        this.#unidade_id      = r.unidade_id;
        this.#cliente_id      = r.cliente_id;
        this.#forma_pagamento = r.forma_pagamento;
        this.#bandeira        = r.bandeira;
        this.#nsu             = r.nsu;
        this.#autorizacao     = r.autorizacao;
        this.#maquininha      = r.maquininha;
        this.#parcelas        = r.parcelas;
        this.#com_juros       = r.com_juros;
        this.#valor_parcela   = r.valor_parcela;
        this.#chave_pix       = r.chave_pix;
        this.#txid_pix        = r.txid_pix;
        this.#valor           = r.valor;
        this.#status          = r.status;
        this.#motivo_estorno  = r.motivo_estorno;
        this.#data_estorno    = r.data_estorno;
        this.#estornado_por   = r.estornado_por;
        this.#data_pagamento  = r.data_pagamento;
        this.#registrado_por  = r.registrado_por;
        this.#observacoes     = r.observacoes;
    }

    toJSON() {
        return {
            id:              this.#id,
            agendamento_id:  this.#agendamento_id,
            venda_id:        this.#venda_id,
            caixa_id:        this.#caixa_id,
            unidade_id:      this.#unidade_id,
            cliente_id:      this.#cliente_id,
            forma_pagamento: this.#forma_pagamento,
            bandeira:        this.#bandeira,
            nsu:             this.#nsu,
            autorizacao:     this.#autorizacao,
            maquininha:      this.#maquininha,
            parcelas:        this.#parcelas,
            com_juros:       this.#com_juros,
            valor_parcela:   this.#valor_parcela,
            chave_pix:       this.#chave_pix,
            txid_pix:        this.#txid_pix,
            valor:           this.#valor,
            status:          this.#status,
            motivo_estorno:  this.#motivo_estorno,
            data_estorno:    this.#data_estorno,
            estornado_por:   this.#estornado_por,
            data_pagamento:  this.#data_pagamento,
            registrado_por:  this.#registrado_por,
            observacoes:     this.#observacoes
        };
    }
}

// ============================================================
// ENTIDADE — VENDA
// ============================================================
class Venda {
    #id; #cliente_id; #agendamento_id; #unidade_id; #user_id;
    #valor_total; #desconto; #valor_final; #data_venda; #observacoes;
    #cliente_nome; #unidade_nome;

    constructor(r) {
        this.#id            = r.id;
        this.#cliente_id    = r.cliente_id;
        this.#agendamento_id = r.agendamento_id;
        this.#unidade_id    = r.unidade_id;
        this.#user_id       = r.user_id;
        this.#valor_total   = r.valor_total;
        this.#desconto      = r.desconto;
        this.#valor_final   = r.valor_final;
        this.#data_venda    = r.data_venda;
        this.#observacoes   = r.observacoes;
        this.#cliente_nome  = r.cliente_nome;
        this.#unidade_nome  = r.unidade_nome;
    }

    toJSON() {
        return {
            id:             this.#id,
            cliente_id:     this.#cliente_id,
            agendamento_id: this.#agendamento_id,
            unidade_id:     this.#unidade_id,
            user_id:        this.#user_id,
            valor_total:    this.#valor_total,
            desconto:       this.#desconto,
            valor_final:    this.#valor_final,
            data_venda:     this.#data_venda,
            observacoes:    this.#observacoes,
            cliente_nome:   this.#cliente_nome,
            unidade_nome:   this.#unidade_nome
        };
    }
}


// ============================================================
// DAO — CAIXA
// ============================================================
class CaixaDAO {

    async consultarTodos() {
        const rows = await db.selectCaixas();
        return rows.map(r => new Caixa(r).toJSON());
    }

    async caixaAberto(unidade_id) {
        if (!unidade_id) throw new Error('A unidade é obrigatória.');
        const row = await db.getCaixaAberto(unidade_id);
        return row ? new Caixa(row).toJSON() : null;
    }

    async abrir(unidade_id, valor_inicial, user_id) {
        if (!unidade_id) throw new Error('A unidade é obrigatória.');

        // Verifica se já existe caixa aberto nesta unidade
        const aberto = await db.getCaixaAberto(unidade_id);
        if (aberto) throw new Error('Já existe um caixa aberto nesta unidade.');

        const row = await db.abrirCaixa(unidade_id, valor_inicial || 0, user_id);
        return row ? new Caixa(row).toJSON() : null;
    }

    async fechar(id, valor_final, user_id, observacoes) {
        if (valor_final === undefined || valor_final === null) throw new Error('O valor final é obrigatório.');

        const row = await db.fecharCaixa(id, valor_final, user_id, observacoes);
        if (!row) throw new Error('Caixa não encontrado.');
        return new Caixa(row).toJSON();
    }

    async consultarMovimentacoes(caixa_id) {
        const rows = await db.selectMovimentacoes(caixa_id);
        return rows.map(r => new Movimentacao(r).toJSON());
    }

    async addMovimentacao(dados) {
        const { caixa_id, tipo, origem, forma_pagamento, valor, descricao, user_id, refs } = dados;

        if (!caixa_id) throw new Error('O caixa é obrigatório.');
        if (!tipo)     throw new Error('O tipo é obrigatório.');
        if (!origem)   throw new Error('A origem é obrigatória.');
        if (!valor || valor <= 0) throw new Error('O valor deve ser maior que zero.');

        const row = await db.addMovimentacao(caixa_id, tipo, origem, forma_pagamento, valor, descricao, user_id, refs || {});
        return row ? new Movimentacao(row).toJSON() : null;
    }
}


// ============================================================
// DAO — PAGAMENTOS
// ============================================================
class PagamentoDAO {

    async consultarDoAgendamento(agendamento_id) {
        const rows = await db.getPagamentosAgendamento(agendamento_id);
        return rows.map(r => new Pagamento(r).toJSON());
    }

    async registrar(dados) {
        const { agendamento_id, venda_id, forma_pagamento, valor } = dados;

        if (!agendamento_id && !venda_id) throw new Error('Informe o agendamento ou a venda.');
        if (!forma_pagamento) throw new Error('A forma de pagamento é obrigatória.');
        if (!valor || valor <= 0) throw new Error('O valor deve ser maior que zero.');

        // Validações específicas por forma de pagamento
        if (forma_pagamento === 'Cartão Crédito' && dados.parcelas > 1 && !dados.valor_parcela) {
            throw new Error('Informe o valor da parcela para pagamento parcelado.');
        }
        if (forma_pagamento === 'Cartão Débito' || forma_pagamento === 'Cartão Crédito') {
            if (!dados.bandeira) throw new Error('Informe a bandeira do cartão.');
        }

        const row = await db.addPagamento(dados);
        return row ? new Pagamento(row).toJSON() : null;
    }

    async estornar(id, motivo, user_id) {
        if (!motivo) throw new Error('O motivo do estorno é obrigatório.');

        const row = await db.estornarPagamento(id, motivo, user_id);
        if (!row) throw new Error('Pagamento não encontrado.');
        return new Pagamento(row).toJSON();
    }

    async relatorioFaturamento(filtros = {}) {
        return await db.relatorioFaturamentoPagamentos(filtros);
    }
}


// ============================================================
// DAO — VENDAS
// ============================================================
class VendaDAO {

    async consultarTodos(filtros = {}) {
        const rows = await db.selectVendas(filtros);
        return rows.map(r => new Venda(r).toJSON());
    }

    async registrar(dados, itens) {
        if (!itens || itens.length === 0) throw new Error('A venda deve ter pelo menos um item.');

        for (const item of itens) {
            if (!item.estoque_id)    throw new Error('Informe o produto de cada item.');
            if (!item.quantidade || item.quantidade <= 0) throw new Error('A quantidade de cada item deve ser maior que zero.');
            if (!item.preco_unit || item.preco_unit < 0)  throw new Error('Informe o preço unitário de cada item.');
        }

        const row = await db.addVenda(dados, itens);
        return row ? new Venda(row).toJSON() : null;
    }
}


// ============================================================
// DAO — COMISSÕES GERADAS (histórico)
// ============================================================
class ComissaoGeradaDAO {

    async consultar(filtros = {}) {
        const { profissional_id, mes, ano, pago } = filtros;
        return await db.selectComissoesGeradas(profissional_id, mes, ano, pago);
    }

    async pagar(ids_comissoes) {
        if (!ids_comissoes || ids_comissoes.length === 0) {
            throw new Error('Informe ao menos uma comissão para pagar.');
        }
        return await db.pagarComissoes(ids_comissoes);
    }
}


// ============================================================
// EXPORTS
// ============================================================
module.exports = {
    CaixaDAO:          new CaixaDAO(),
    PagamentoDAO:      new PagamentoDAO(),
    VendaDAO:          new VendaDAO(),
    ComissaoGeradaDAO: new ComissaoGeradaDAO()
};