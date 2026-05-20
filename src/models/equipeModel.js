const db = require('../../repository/database.js');

// ============================================================
// ENTIDADE — PROFISSIONAL
// ============================================================
class Profissional {
    #id; #nome; #telefone; #email; #unidade_id; #unidade_nome;
    #user_id; #apta_cursos; #ativo; #criado_em; #atualizado_em;

    constructor(r) {
        this.#id            = r.id;
        this.#nome          = r.nome;
        this.#telefone      = r.telefone;
        this.#email         = r.email;
        this.#unidade_id    = r.unidade_id;
        this.#unidade_nome  = r.unidade_nome;
        this.#user_id       = r.user_id;
        this.#apta_cursos   = r.apta_cursos;
        this.#ativo         = r.ativo;
        this.#criado_em     = r.criado_em;
        this.#atualizado_em = r.atualizado_em;
    }

    toJSON() {
        return {
            id:            this.#id,
            nome:          this.#nome,
            telefone:      this.#telefone,
            email:         this.#email,
            unidade_id:    this.#unidade_id,
            unidade_nome:  this.#unidade_nome,
            user_id:       this.#user_id,
            apta_cursos:   this.#apta_cursos,
            ativo:         this.#ativo,
            criado_em:     this.#criado_em,
            atualizado_em: this.#atualizado_em
        };
    }
}

// ============================================================
// ENTIDADE — AUSÊNCIA
// ============================================================
class Ausencia {
    #id; #profissional_id; #profissional_nome; #unidade_id;
    #tipo; #data_inicio; #data_fim; #motivo; #aprovado_por; #criado_em;

    constructor(r) {
        this.#id               = r.id;
        this.#profissional_id  = r.profissional_id;
        this.#profissional_nome = r.profissional_nome;
        this.#unidade_id       = r.unidade_id;
        this.#tipo             = r.tipo;
        this.#data_inicio      = r.data_inicio;
        this.#data_fim         = r.data_fim;
        this.#motivo           = r.motivo;
        this.#aprovado_por     = r.aprovado_por;
        this.#criado_em        = r.criado_em;
    }

    toJSON() {
        return {
            id:               this.#id,
            profissional_id:  this.#profissional_id,
            profissional_nome: this.#profissional_nome,
            unidade_id:       this.#unidade_id,
            tipo:             this.#tipo,
            data_inicio:      this.#data_inicio,
            data_fim:         this.#data_fim,
            motivo:           this.#motivo,
            aprovado_por:     this.#aprovado_por,
            criado_em:        this.#criado_em
        };
    }
}

// ============================================================
// ENTIDADE — META
// ============================================================
class Meta {
    #id; #profissional_id; #profissional_nome; #unidade_id;
    #mes; #ano; #meta_valor; #meta_atendimentos; #criado_em;

    constructor(r) {
        this.#id                 = r.id;
        this.#profissional_id    = r.profissional_id;
        this.#profissional_nome  = r.profissional_nome;
        this.#unidade_id         = r.unidade_id;
        this.#mes                = r.mes;
        this.#ano                = r.ano;
        this.#meta_valor         = r.meta_valor;
        this.#meta_atendimentos  = r.meta_atendimentos;
        this.#criado_em          = r.criado_em;
    }

    toJSON() {
        return {
            id:                this.#id,
            profissional_id:   this.#profissional_id,
            profissional_nome: this.#profissional_nome,
            unidade_id:        this.#unidade_id,
            mes:               this.#mes,
            ano:               this.#ano,
            meta_valor:        this.#meta_valor,
            meta_atendimentos: this.#meta_atendimentos,
            criado_em:         this.#criado_em
        };
    }
}

// ============================================================
// ENTIDADE — COMISSÃO (regra)
// ============================================================
class Comissao {
    #id; #profissional_id; #profissional_nome;
    #procedimento_id; #procedimento_nome;
    #porcentagem; #ativo; #criado_em;

    constructor(r) {
        this.#id               = r.id;
        this.#profissional_id  = r.profissional_id;
        this.#profissional_nome = r.profissional_nome;
        this.#procedimento_id  = r.procedimento_id;
        this.#procedimento_nome = r.procedimento_nome;
        this.#porcentagem      = r.porcentagem;
        this.#ativo            = r.ativo;
        this.#criado_em        = r.criado_em;
    }

    toJSON() {
        return {
            id:               this.#id,
            profissional_id:  this.#profissional_id,
            profissional_nome: this.#profissional_nome,
            procedimento_id:  this.#procedimento_id,
            procedimento_nome: this.#procedimento_nome,
            porcentagem:      this.#porcentagem,
            ativo:            this.#ativo,
            criado_em:        this.#criado_em
        };
    }
}


// ============================================================
// DAO — PROFISSIONAIS
// ============================================================
class ProfissionalDAO {

    async consultarTodos(apenasAtivos = true) {
        const rows = await db.selectProfissionais(apenasAtivos);
        return rows.map(r => new Profissional(r).toJSON());
    }

    async consultarUm(id) {
        const row = await db.getProfissionalById(id);
        return row ? new Profissional(row).toJSON() : null;
    }

    async consultarAptas() {
        const rows = await db.selectProfissionaisAptas();
        return rows.map(r => new Profissional(r).toJSON());
    }

    async consultarProcedimentos(profissional_id) {
        return await db.getProcedimentosDaProfissional(profissional_id);
    }

    async cadastrar(dados) {
        const { nome, telefone, email, unidade_id, apta_cursos } = dados;

        if (!nome) throw new Error('O campo nome é obrigatório.');

        const row = await db.addProfissional(nome, telefone, email, unidade_id, apta_cursos || false);
        return row ? new Profissional(row).toJSON() : null;
    }

    async atualizar(id, dados) {
        const { nome, telefone, email, unidade_id, apta_cursos, ativo } = dados;

        if (!nome) throw new Error('O campo nome é obrigatório.');

        const row = await db.updateProfissional(id, nome, telefone, email, unidade_id, apta_cursos, ativo);
        return row ? new Profissional(row).toJSON() : null;
    }

    async vincularProcedimento(profissional_id, procedimento_id) {
        return await db.addProcedimentoProfissional(profissional_id, procedimento_id);
    }

    async desvincularProcedimento(profissional_id, procedimento_id) {
        return await db.removeProcedimentoProfissional(profissional_id, procedimento_id);
    }

    async excluir(id) {
        return await db.deleteById('profissionais', id);
    }
}


// ============================================================
// DAO — AUSÊNCIAS
// ============================================================
class AusenciaDAO {

    async consultarTodos(profissional_id = null) {
        const rows = await db.selectAusencias(profissional_id);
        return rows.map(r => new Ausencia(r).toJSON());
    }

    async cadastrar(dados) {
        const { profissional_id, unidade_id, tipo, data_inicio, data_fim, motivo, aprovado_por } = dados;

        if (!profissional_id) throw new Error('A profissional é obrigatória.');
        if (!tipo)            throw new Error('O tipo de ausência é obrigatório.');
        if (!data_inicio)     throw new Error('A data de início é obrigatória.');
        if (!data_fim)        throw new Error('A data de fim é obrigatória.');

        if (new Date(data_fim) < new Date(data_inicio)) {
            throw new Error('A data de fim não pode ser anterior à data de início.');
        }

        const row = await db.addAusencia(profissional_id, unidade_id, tipo, data_inicio, data_fim, motivo, aprovado_por);
        return row ? new Ausencia(row).toJSON() : null;
    }

    async excluir(id) {
        return await db.deleteById('profissional_ausencias', id);
    }
}


// ============================================================
// DAO — METAS
// ============================================================
class MetaDAO {

    async consultarMes(mes, ano) {
        if (!mes || !ano) throw new Error('Mês e ano são obrigatórios.');
        const rows = await db.selectMetas(mes, ano);
        return rows.map(r => new Meta(r).toJSON());
    }

    async relatorio(mes, ano) {
        if (!mes || !ano) throw new Error('Mês e ano são obrigatórios.');
        return await db.relatorioMetasMes(mes, ano);
    }

    async salvar(dados) {
        const { profissional_id, unidade_id, mes, ano, meta_valor, meta_atendimentos } = dados;

        if (!profissional_id) throw new Error('A profissional é obrigatória.');
        if (!mes || !ano)     throw new Error('Mês e ano são obrigatórios.');
        if (!meta_valor || meta_valor <= 0) throw new Error('O valor da meta deve ser maior que zero.');

        const row = await db.upsertMeta(profissional_id, unidade_id, mes, ano, meta_valor, meta_atendimentos);
        return row ? new Meta(row).toJSON() : null;
    }
}


// ============================================================
// DAO — COMISSÕES (regras)
// ============================================================
class ComissaoDAO {

    async consultarTodos(profissional_id = null) {
        const rows = await db.selectComissoes(profissional_id);
        return rows.map(r => new Comissao(r).toJSON());
    }

    async salvar(dados) {
        const { profissional_id, procedimento_id, porcentagem } = dados;

        if (!profissional_id) throw new Error('A profissional é obrigatória.');
        if (porcentagem === undefined || porcentagem === null) throw new Error('A porcentagem é obrigatória.');
        if (porcentagem < 0 || porcentagem > 100) throw new Error('A porcentagem deve estar entre 0 e 100.');

        const row = await db.upsertComissao(profissional_id, procedimento_id || null, porcentagem);
        return row ? new Comissao(row).toJSON() : null;
    }

    async excluir(id) {
        return await db.deleteById('comissoes', id);
    }
}


// ============================================================
// EXPORTS
// ============================================================
module.exports = {
    ProfissionalDAO: new ProfissionalDAO(),
    AusenciaDAO:     new AusenciaDAO(),
    MetaDAO:         new MetaDAO(),
    ComissaoDAO:     new ComissaoDAO()
};