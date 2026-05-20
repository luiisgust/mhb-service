const db = require('../../repository/database.js');

// ============================================================
// ENTIDADE — AGENDAMENTO
// ============================================================
class Agendamento {
    #id; #unidade_id; #unidade_nome;
    #cliente_id; #cliente_nome; #cliente_telefone;
    #profissional_id; #profissional_nome;
    #user_id; #cliente_pacote_id;
    #data_hora_inicio; #data_hora_fim; #tempo_total_min;
    #valor_total; #desconto; #gorjeta; #valor_final;
    #data_retorno_recomendada; #status; #motivo_cancelamento;
    #etiqueta_customizada; #observacoes;
    #recorrente; #recorrencia_pai_id;
    #criado_em; #atualizado_em;

    constructor(r) {
        this.#id                       = r.id;
        this.#unidade_id               = r.unidade_id;
        this.#unidade_nome             = r.unidade_nome;
        this.#cliente_id               = r.cliente_id;
        this.#cliente_nome             = r.cliente_nome;
        this.#cliente_telefone         = r.cliente_telefone;
        this.#profissional_id          = r.profissional_id;
        this.#profissional_nome        = r.profissional_nome;
        this.#user_id                  = r.user_id;
        this.#cliente_pacote_id        = r.cliente_pacote_id;
        this.#data_hora_inicio         = r.data_hora_inicio;
        this.#data_hora_fim            = r.data_hora_fim;
        this.#tempo_total_min          = r.tempo_total_min;
        this.#valor_total              = r.valor_total;
        this.#desconto                 = r.desconto;
        this.#gorjeta                  = r.gorjeta;
        this.#valor_final              = r.valor_final;
        this.#data_retorno_recomendada = r.data_retorno_recomendada;
        this.#status                   = r.status;
        this.#motivo_cancelamento      = r.motivo_cancelamento;
        this.#etiqueta_customizada     = r.etiqueta_customizada;
        this.#observacoes              = r.observacoes;
        this.#recorrente               = r.recorrente;
        this.#recorrencia_pai_id       = r.recorrencia_pai_id;
        this.#criado_em                = r.criado_em;
        this.#atualizado_em            = r.atualizado_em;
    }

    toJSON() {
        return {
            id:                       this.#id,
            unidade_id:               this.#unidade_id,
            unidade_nome:             this.#unidade_nome,
            cliente_id:               this.#cliente_id,
            cliente_nome:             this.#cliente_nome,
            cliente_telefone:         this.#cliente_telefone,
            profissional_id:          this.#profissional_id,
            profissional_nome:        this.#profissional_nome,
            user_id:                  this.#user_id,
            cliente_pacote_id:        this.#cliente_pacote_id,
            data_hora_inicio:         this.#data_hora_inicio,
            data_hora_fim:            this.#data_hora_fim,
            tempo_total_min:          this.#tempo_total_min,
            valor_total:              this.#valor_total,
            desconto:                 this.#desconto,
            gorjeta:                  this.#gorjeta,
            valor_final:              this.#valor_final,
            data_retorno_recomendada: this.#data_retorno_recomendada,
            status:                   this.#status,
            motivo_cancelamento:      this.#motivo_cancelamento,
            etiqueta_customizada:     this.#etiqueta_customizada,
            observacoes:              this.#observacoes,
            recorrente:               this.#recorrente,
            recorrencia_pai_id:       this.#recorrencia_pai_id,
            criado_em:                this.#criado_em,
            atualizado_em:            this.#atualizado_em
        };
    }
}

// ============================================================
// ENTIDADE — PROCEDIMENTO DO AGENDAMENTO
// ============================================================
class AgendamentoProcedimento {
    #id; #agendamento_id; #procedimento_id; #procedimento_nome_atual;
    #nome_snapshot; #valor_snapshot; #tempo_snapshot; #desconto;

    constructor(r) {
        this.#id                      = r.id;
        this.#agendamento_id          = r.agendamento_id;
        this.#procedimento_id         = r.procedimento_id;
        this.#procedimento_nome_atual = r.procedimento_nome_atual;
        this.#nome_snapshot           = r.nome_snapshot;
        this.#valor_snapshot          = r.valor_snapshot;
        this.#tempo_snapshot          = r.tempo_snapshot;
        this.#desconto                = r.desconto;
    }

    toJSON() {
        return {
            id:                      this.#id,
            agendamento_id:          this.#agendamento_id,
            procedimento_id:         this.#procedimento_id,
            procedimento_nome_atual: this.#procedimento_nome_atual,
            nome_snapshot:           this.#nome_snapshot,
            valor_snapshot:          this.#valor_snapshot,
            tempo_snapshot:          this.#tempo_snapshot,
            desconto:                this.#desconto
        };
    }
}

// ============================================================
// ENTIDADE — FOTO DO AGENDAMENTO
// ============================================================
class AgendamentoFoto {
    #id; #agendamento_id; #cliente_id; #tipo;
    #url; #descricao; #criado_por; #criado_em;

    constructor(r) {
        this.#id             = r.id;
        this.#agendamento_id = r.agendamento_id;
        this.#cliente_id     = r.cliente_id;
        this.#tipo           = r.tipo;
        this.#url            = r.url;
        this.#descricao      = r.descricao;
        this.#criado_por     = r.criado_por;
        this.#criado_em      = r.criado_em;
    }

    toJSON() {
        return {
            id:             this.#id,
            agendamento_id: this.#agendamento_id,
            cliente_id:     this.#cliente_id,
            tipo:           this.#tipo,
            url:            this.#url,
            descricao:      this.#descricao,
            criado_por:     this.#criado_por,
            criado_em:      this.#criado_em
        };
    }
}

// ============================================================
// ENTIDADE — BLOQUEIO DE AGENDA
// ============================================================
class Bloqueio {
    #id; #profissional_id; #unidade_id;
    #data_hora_inicio; #data_hora_fim;
    #motivo; #criado_por; #criado_em;

    constructor(r) {
        this.#id               = r.id;
        this.#profissional_id  = r.profissional_id;
        this.#unidade_id       = r.unidade_id;
        this.#data_hora_inicio = r.data_hora_inicio;
        this.#data_hora_fim    = r.data_hora_fim;
        this.#motivo           = r.motivo;
        this.#criado_por       = r.criado_por;
        this.#criado_em        = r.criado_em;
    }

    toJSON() {
        return {
            id:               this.#id,
            profissional_id:  this.#profissional_id,
            unidade_id:       this.#unidade_id,
            data_hora_inicio: this.#data_hora_inicio,
            data_hora_fim:    this.#data_hora_fim,
            motivo:           this.#motivo,
            criado_por:       this.#criado_por,
            criado_em:        this.#criado_em
        };
    }
}

// ============================================================
// ENTIDADE — HISTÓRICO DO AGENDAMENTO
// ============================================================
class AgendamentoHistorico {
    #id; #agendamento_id; #status_anterior;
    #status_novo; #user_id; #observacao; #criado_em;

    constructor(r) {
        this.#id              = r.id;
        this.#agendamento_id  = r.agendamento_id;
        this.#status_anterior = r.status_anterior;
        this.#status_novo     = r.status_novo;
        this.#user_id         = r.user_id;
        this.#observacao      = r.observacao;
        this.#criado_em       = r.criado_em;
    }

    toJSON() {
        return {
            id:              this.#id,
            agendamento_id:  this.#agendamento_id,
            status_anterior: this.#status_anterior,
            status_novo:     this.#status_novo,
            user_id:         this.#user_id,
            observacao:      this.#observacao,
            criado_em:       this.#criado_em
        };
    }
}


// ============================================================
// DAO — AGENDAMENTOS
// ============================================================
class AgendamentoDAO {

    async consultarTodos(filtros = {}) {
        const rows = await db.selectAgendamentos(filtros);
        return rows.map(r => new Agendamento(r).toJSON());
    }

    async consultarUm(id) {
        const row = await db.getAgendamentoById(id);
        return row ? new Agendamento(row).toJSON() : null;
    }

    async agendaDia(data, unidade_id) {
        if (!data)       throw new Error('A data é obrigatória.');
        if (!unidade_id) throw new Error('A unidade é obrigatória.');
        return await db.getAgendaDia(data, unidade_id);
    }

    async proximosDaCliente(cliente_id) {
        if (!cliente_id) throw new Error('A cliente é obrigatória.');
        const rows = await db.getProximosAgendamentosCliente(cliente_id);
        return rows.map(r => new Agendamento(r).toJSON());
    }

    async naoPagos() {
        const rows = await db.agendamentosNaoPagos();
        return rows.map(r => new Agendamento(r).toJSON());
    }

    async relatorioFaltas(mes, ano) {
        if (!mes || !ano) throw new Error('Mês e ano são obrigatórios.');
        return await db.relatorioFaltas(mes, ano);
    }

    async relatorioFaturamentoProfissional(mes, ano, unidade_id) {
        if (!mes || !ano) throw new Error('Mês e ano são obrigatórios.');
        return await db.relatorioFaturamentoProfissional(mes, ano, unidade_id);
    }

    async cadastrar(dados) {
        const { cliente_id, profissional_id, data_hora_inicio, data_hora_fim } = dados;

        if (!cliente_id)       throw new Error('A cliente é obrigatória.');
        if (!profissional_id)  throw new Error('A profissional é obrigatória.');
        if (!data_hora_inicio) throw new Error('A data/hora de início é obrigatória.');
        if (!data_hora_fim)    throw new Error('A data/hora de fim é obrigatória.');

        if (new Date(data_hora_fim) <= new Date(data_hora_inicio)) {
            throw new Error('A data/hora de fim deve ser após o início.');
        }

        const row = await db.addAgendamento(dados);
        return row ? new Agendamento(row).toJSON() : null;
    }

    async atualizar(id, dados) {
        if (dados.data_hora_inicio && dados.data_hora_fim) {
            if (new Date(dados.data_hora_fim) <= new Date(dados.data_hora_inicio)) {
                throw new Error('A data/hora de fim deve ser após o início.');
            }
        }

        const row = await db.updateAgendamento(id, dados);
        if (!row) throw new Error('Agendamento não encontrado.');
        return new Agendamento(row).toJSON();
    }

    async atualizarStatus(id, status, motivo_cancelamento, user_id) {
        if (!status) throw new Error('O status é obrigatório.');

        if (status === 'Cancelado' && !motivo_cancelamento) {
            throw new Error('Informe o motivo do cancelamento.');
        }

        const row = await db.updateStatusAgendamento(id, status, motivo_cancelamento, user_id);
        if (!row) throw new Error('Agendamento não encontrado.');
        return new Agendamento(row).toJSON();
    }

    async excluir(id) {
        return await db.deleteById('agendamentos', id);
    }
}


// ============================================================
// DAO — PROCEDIMENTOS DO AGENDAMENTO
// ============================================================
class AgendamentoProcedimentoDAO {

    async consultarDoAgendamento(agendamento_id) {
        const rows = await db.getProcedimentosAgendamento(agendamento_id);
        return rows.map(r => new AgendamentoProcedimento(r).toJSON());
    }

    async adicionar(agendamento_id, procedimento_id, nome_snapshot, valor_snapshot, tempo_snapshot, desconto = 0) {
        if (!agendamento_id)     throw new Error('O agendamento é obrigatório.');
        if (!nome_snapshot)      throw new Error('O nome do procedimento é obrigatório.');
        if (valor_snapshot < 0)  throw new Error('O valor não pode ser negativo.');
        if (tempo_snapshot <= 0) throw new Error('O tempo deve ser maior que zero.');

        const row = await db.addAgendamentoProcedimento(
            agendamento_id, procedimento_id,
            nome_snapshot, valor_snapshot,
            tempo_snapshot, desconto
        );
        return row ? new AgendamentoProcedimento(row).toJSON() : null;
    }

    async excluir(id) {
        return await db.deleteById('agendamento_procedimentos', id);
    }
}


// ============================================================
// DAO — FOTOS DO AGENDAMENTO
// ============================================================
class AgendamentoFotoDAO {

    async consultarDoAgendamento(agendamento_id) {
        const rows = await db.getFotosAgendamento(agendamento_id);
        return rows.map(r => new AgendamentoFoto(r).toJSON());
    }

    async consultarDaCliente(cliente_id) {
        const rows = await db.getFotosCliente(cliente_id);
        return rows.map(r => new AgendamentoFoto(r).toJSON());
    }

    async adicionar(agendamento_id, cliente_id, tipo, url, descricao, criado_por) {
        if (!agendamento_id) throw new Error('O agendamento é obrigatório.');
        if (!tipo)           throw new Error('O tipo é obrigatório (Antes ou Depois).');
        if (!url)            throw new Error('A URL da foto é obrigatória.');

        const row = await db.addFotoAgendamento(agendamento_id, cliente_id, tipo, url, descricao, criado_por);
        return row ? new AgendamentoFoto(row).toJSON() : null;
    }

    async excluir(id) {
        return await db.deleteById('agendamento_fotos', id);
    }
}


// ============================================================
// DAO — BLOQUEIOS DE AGENDA
// ============================================================
class BloqueioDAO {

    async adicionar(dados) {
        const { profissional_id, unidade_id, data_hora_inicio, data_hora_fim, motivo, criado_por } = dados;

        if (!data_hora_inicio) throw new Error('A data/hora de início é obrigatória.');
        if (!data_hora_fim)    throw new Error('A data/hora de fim é obrigatória.');

        if (new Date(data_hora_fim) <= new Date(data_hora_inicio)) {
            throw new Error('A data/hora de fim deve ser após o início.');
        }

        const row = await db.addBloqueio(profissional_id, unidade_id, data_hora_inicio, data_hora_fim, motivo, criado_por);
        return row ? new Bloqueio(row).toJSON() : null;
    }

    async excluir(id) {
        return await db.deleteById('agenda_bloqueios', id);
    }
}


// ============================================================
// DAO — HISTÓRICO DO AGENDAMENTO
// ============================================================
class HistoricoDAO {

    async consultarDoAgendamento(agendamento_id) {
        const rows = await db.getHistoricoAgendamento(agendamento_id);
        return rows.map(r => new AgendamentoHistorico(r).toJSON());
    }
}


// ============================================================
// EXPORTS
// ============================================================
module.exports = {
    AgendamentoDAO:             new AgendamentoDAO(),
    AgendamentoProcedimentoDAO: new AgendamentoProcedimentoDAO(),
    AgendamentoFotoDAO:         new AgendamentoFotoDAO(),
    BloqueioDAO:                new BloqueioDAO(),
    HistoricoDAO:               new HistoricoDAO()
};