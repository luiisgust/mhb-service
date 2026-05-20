const db = require('../../repository/database.js');

// ============================================================
// ENTIDADE — CLIENTE
// ============================================================
class Cliente {
    #id; #nome; #telefone; #aniversario; #observacoes;
    #saldo_credito; #ativo; #criado_em; #atualizado_em;

    constructor(r) {
        this.#id            = r.id;
        this.#nome          = r.nome;
        this.#telefone      = r.telefone;
        this.#aniversario   = r.aniversario;
        this.#observacoes   = r.observacoes;
        this.#saldo_credito = r.saldo_credito;
        this.#ativo         = r.ativo;
        this.#criado_em     = r.criado_em;
        this.#atualizado_em = r.atualizado_em;
    }

    toJSON() {
        return {
            id:            this.#id,
            nome:          this.#nome,
            telefone:      this.#telefone,
            aniversario:   this.#aniversario,
            observacoes:   this.#observacoes,
            saldo_credito: this.#saldo_credito,
            ativo:         this.#ativo,
            criado_em:     this.#criado_em,
            atualizado_em: this.#atualizado_em
        };
    }
}

// ============================================================
// ENTIDADE — ANAMNESE
// ============================================================
class Anamnese {
    #id; #cliente_id; #gestante; #amamentando; #pressao_alta;
    #diabetes; #problemas_cardiacos; #cancer;
    #medicamentos; #alergias; #doencas; #cirurgias;
    #tratamentos_anteriores; #observacoes;
    #preenchida_por; #criado_em; #atualizado_em;

    constructor(r) {
        this.#id                    = r.id;
        this.#cliente_id            = r.cliente_id;
        this.#gestante              = r.gestante;
        this.#amamentando           = r.amamentando;
        this.#pressao_alta          = r.pressao_alta;
        this.#diabetes              = r.diabetes;
        this.#problemas_cardiacos   = r.problemas_cardiacos;
        this.#cancer                = r.cancer;
        this.#medicamentos          = r.medicamentos;
        this.#alergias              = r.alergias;
        this.#doencas               = r.doencas;
        this.#cirurgias             = r.cirurgias;
        this.#tratamentos_anteriores = r.tratamentos_anteriores;
        this.#observacoes           = r.observacoes;
        this.#preenchida_por        = r.preenchida_por;
        this.#criado_em             = r.criado_em;
        this.#atualizado_em         = r.atualizado_em;
    }

    toJSON() {
        return {
            id:                     this.#id,
            cliente_id:             this.#cliente_id,
            gestante:               this.#gestante,
            amamentando:            this.#amamentando,
            pressao_alta:           this.#pressao_alta,
            diabetes:               this.#diabetes,
            problemas_cardiacos:    this.#problemas_cardiacos,
            cancer:                 this.#cancer,
            medicamentos:           this.#medicamentos,
            alergias:               this.#alergias,
            doencas:                this.#doencas,
            cirurgias:              this.#cirurgias,
            tratamentos_anteriores: this.#tratamentos_anteriores,
            observacoes:            this.#observacoes,
            preenchida_por:         this.#preenchida_por,
            criado_em:              this.#criado_em,
            atualizado_em:          this.#atualizado_em
        };
    }
}

// ============================================================
// ENTIDADE — CRÉDITO DO CLIENTE
// ============================================================
class Credito {
    #id; #cliente_id; #tipo; #origem; #valor;
    #saldo_anterior; #saldo_posterior;
    #agendamento_id; #pagamento_id; #user_id;
    #observacao; #criado_em;

    constructor(r) {
        this.#id              = r.id;
        this.#cliente_id      = r.cliente_id;
        this.#tipo            = r.tipo;
        this.#origem          = r.origem;
        this.#valor           = r.valor;
        this.#saldo_anterior  = r.saldo_anterior;
        this.#saldo_posterior = r.saldo_posterior;
        this.#agendamento_id  = r.agendamento_id;
        this.#pagamento_id    = r.pagamento_id;
        this.#user_id         = r.user_id;
        this.#observacao      = r.observacao;
        this.#criado_em       = r.criado_em;
    }

    toJSON() {
        return {
            id:              this.#id,
            cliente_id:      this.#cliente_id,
            tipo:            this.#tipo,
            origem:          this.#origem,
            valor:           this.#valor,
            saldo_anterior:  this.#saldo_anterior,
            saldo_posterior: this.#saldo_posterior,
            agendamento_id:  this.#agendamento_id,
            pagamento_id:    this.#pagamento_id,
            user_id:         this.#user_id,
            observacao:      this.#observacao,
            criado_em:       this.#criado_em
        };
    }
}


// ============================================================
// DAO — CLIENTES
// ============================================================
class ClienteDAO {

    async consultarTodos(apenasAtivos = true) {
        const rows = await db.selectClientes();
        return rows.map(r => new Cliente(r).toJSON());
    }

    async consultarUm(id) {
        const row = await db.getClienteById(id);
        return row ? new Cliente(row).toJSON() : null;
    }

    async buscar(termo) {
        if (!termo) throw new Error('Informe um termo para busca.');
        const rows = await db.searchClientes(termo);
        return rows.map(r => new Cliente(r).toJSON());
    }

    async aniversariantes(mes) {
        const m = mes || new Date().getMonth() + 1;
        const rows = await db.clientesAniversarioMes(m);
        return rows.map(r => new Cliente(r).toJSON());
    }

    async inativos(dias = 60) {
        const rows = await db.clientesInativos(dias);
        return rows.map(r => new Cliente(r).toJSON());
    }

    async cadastrar(dados) {
        const { nome, telefone, aniversario, observacoes } = dados;

        if (!nome) throw new Error('O campo nome é obrigatório.');

        const row = await db.addCliente(nome, telefone, aniversario, observacoes);
        return row ? new Cliente(row).toJSON() : null;
    }

    async atualizar(id, dados) {
        const { nome, telefone, aniversario, observacoes } = dados;

        if (!nome) throw new Error('O campo nome é obrigatório.');

        const row = await db.updateCliente(id, nome, telefone, aniversario, observacoes);
        return row ? new Cliente(row).toJSON() : null;
    }

    async inativar(id) {
        const row = await db.inativarCliente(id);
        if (!row) throw new Error('Cliente não encontrada.');
        return row;
    }

    async excluir(id) {
        return await db.deleteById('clientes', id);
    }
}


// ============================================================
// DAO — ANAMNESE
// ============================================================
class AnamneseDAO {

    async consultarDaCliente(cliente_id) {
        const row = await db.getAnamnese(cliente_id);
        return row ? new Anamnese(row).toJSON() : null;
    }

    async salvar(cliente_id, dados, user_id) {
        if (!cliente_id) throw new Error('A cliente é obrigatória.');

        const row = await db.upsertAnamnese(cliente_id, dados, user_id);
        return row ? new Anamnese(row).toJSON() : null;
    }
}


// ============================================================
// DAO — CRÉDITOS DO CLIENTE
// ============================================================
class CreditoDAO {

    async historico(cliente_id) {
        if (!cliente_id) throw new Error('A cliente é obrigatória.');
        const rows = await db.getHistoricoCreditos(cliente_id);
        return rows.map(r => new Credito(r).toJSON());
    }

    async adicionar(dados) {
        const { cliente_id, tipo, origem, valor, agendamento_id, pagamento_id, user_id, observacao } = dados;

        if (!cliente_id) throw new Error('A cliente é obrigatória.');
        if (!tipo)       throw new Error('O tipo é obrigatório (Crédito ou Débito).');
        if (!origem)     throw new Error('A origem é obrigatória.');
        if (!valor || valor <= 0) throw new Error('O valor deve ser maior que zero.');

        const row = await db.addCredito(cliente_id, tipo, origem, valor, agendamento_id, pagamento_id, user_id, observacao);
        return row ? new Credito(row).toJSON() : null;
    }
}


// ============================================================
// EXPORTS
// ============================================================
module.exports = {
    ClienteDAO:  new ClienteDAO(),
    AnamneseDAO: new AnamneseDAO(),
    CreditoDAO:  new CreditoDAO()
};