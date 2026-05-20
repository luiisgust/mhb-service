const db = require('../../repository/database.js');

// ============================================================
// ENTIDADE — CURSO
// ============================================================
class Curso {
    #id; #nome; #descricao; #categoria_id; #categoria_nome;
    #duracao_horas; #valor; #vagas_max; #ativo;
    #criado_em; #profissionais;

    constructor(r) {
        this.#id            = r.id;
        this.#nome          = r.nome;
        this.#descricao     = r.descricao;
        this.#categoria_id  = r.categoria_id;
        this.#categoria_nome = r.categoria_nome;
        this.#duracao_horas = r.duracao_horas;
        this.#valor         = r.valor;
        this.#vagas_max     = r.vagas_max;
        this.#ativo         = r.ativo;
        this.#criado_em     = r.criado_em;
        this.#profissionais = r.profissionais || [];
    }

    toJSON() {
        return {
            id:             this.#id,
            nome:           this.#nome,
            descricao:      this.#descricao,
            categoria_id:   this.#categoria_id,
            categoria_nome: this.#categoria_nome,
            duracao_horas:  this.#duracao_horas,
            valor:          this.#valor,
            vagas_max:      this.#vagas_max,
            ativo:          this.#ativo,
            criado_em:      this.#criado_em,
            profissionais:  this.#profissionais  // lista de instrutoras aptas
        };
    }
}

// ============================================================
// ENTIDADE — AGENDAMENTO DE CURSO
// ============================================================
class AgendamentoCurso {
    #id; #curso_id; #cliente_id; #profissional_id; #unidade_id;
    #data_hora_inicio; #data_hora_fim; #valor_cobrado;
    #status; #descricao_cafe; #observacoes; #criado_em;

    constructor(r) {
        this.#id               = r.id;
        this.#curso_id         = r.curso_id;
        this.#cliente_id       = r.cliente_id;
        this.#profissional_id  = r.profissional_id;
        this.#unidade_id       = r.unidade_id;
        this.#data_hora_inicio = r.data_hora_inicio;
        this.#data_hora_fim    = r.data_hora_fim;
        this.#valor_cobrado    = r.valor_cobrado;
        this.#status           = r.status;
        this.#descricao_cafe   = r.descricao_cafe;
        this.#observacoes      = r.observacoes;
        this.#criado_em        = r.criado_em;
    }

    toJSON() {
        return {
            id:               this.#id,
            curso_id:         this.#curso_id,
            cliente_id:       this.#cliente_id,
            profissional_id:  this.#profissional_id,
            unidade_id:       this.#unidade_id,
            data_hora_inicio: this.#data_hora_inicio,
            data_hora_fim:    this.#data_hora_fim,
            valor_cobrado:    this.#valor_cobrado,
            status:           this.#status,
            descricao_cafe:   this.#descricao_cafe,
            observacoes:      this.#observacoes,
            criado_em:        this.#criado_em
        };
    }
}

// ============================================================
// DAO — CURSOS
// ============================================================
class CursoDAO {

    async consultarTodos(apenasAtivos = true) {
        const rows = await db.selectCursos(apenasAtivos);
        return rows.map(r => new Curso(r).toJSON());
    }

    async cadastrar(dados) {
        const { nome, descricao, categoria_id, duracao_horas, valor, vagas_max } = dados;

        if (!nome) throw new Error('O campo nome é obrigatório.');
        if (valor < 0) throw new Error('O valor não pode ser negativo.');

        const row = await db.addCurso(nome, descricao, categoria_id, duracao_horas, valor, vagas_max);
        return row ? new Curso(row).toJSON() : null;
    }

    async atualizar(id, dados) {
        const { nome, descricao, categoria_id, duracao_horas, valor, vagas_max, ativo } = dados;

        if (!nome) throw new Error('O campo nome é obrigatório.');

        const row = await db.updateCurso(id, nome, descricao, categoria_id, duracao_horas, valor, vagas_max, ativo);
        return row ? new Curso(row).toJSON() : null;
    }

    // Vincula uma profissional apta como instrutora do curso
    async vincularProfissional(curso_id, profissional_id) {
        const row = await db.addProfissionalCurso(curso_id, profissional_id);
        return row;
    }

    async excluir(id) {
        return await db.deleteById('cursos', id);
    }
}

// ============================================================
// DAO — AGENDAMENTO DE CURSOS
// ============================================================
class AgendamentoCursoDAO {

    async cadastrar(dados) {
        const {
            curso_id, cliente_id, profissional_id, unidade_id,
            data_hora_inicio, data_hora_fim, valor_cobrado,
            descricao_cafe, observacoes
        } = dados;

        if (!curso_id)         throw new Error('O curso é obrigatório.');
        if (!cliente_id)       throw new Error('A cliente é obrigatória.');
        if (!profissional_id)  throw new Error('A profissional instrutora é obrigatória.');
        if (!data_hora_inicio) throw new Error('A data/hora de início é obrigatória.');
        if (!data_hora_fim)    throw new Error('A data/hora de fim é obrigatória.');

        if (new Date(data_hora_fim) <= new Date(data_hora_inicio)) {
            throw new Error('A data/hora de fim deve ser após o início.');
        }

        const row = await db.addAgendamentoCurso({
            curso_id, cliente_id, profissional_id, unidade_id,
            data_hora_inicio, data_hora_fim, valor_cobrado,
            descricao_cafe, observacoes
        });
        return row ? new AgendamentoCurso(row).toJSON() : null;
    }

    async atualizar(id, dados) {
        if (dados.data_hora_inicio && dados.data_hora_fim) {
            if (new Date(dados.data_hora_fim) <= new Date(dados.data_hora_inicio)) {
                throw new Error('A data/hora de fim deve ser após o início.');
            }
        }

        const row = await db.updateAgendamentoCurso(id, dados);
        return row ? new AgendamentoCurso(row).toJSON() : null;
    }

    async excluir(id) {
        return await db.deleteById('agendamento_curso', id);
    }
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
    CursoDAO:            new CursoDAO(),
    AgendamentoCursoDAO: new AgendamentoCursoDAO()
};