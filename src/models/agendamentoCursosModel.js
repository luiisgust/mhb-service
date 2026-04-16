const DatabasePG = require('../../repository/database.js');

class AgendamentoCurso {
    #id; #status; #cafe; #inicio; #fim;

    constructor(row) {
        this.#id = row.id;
        this.#status = row.status || 'Pendente';
        this.#cafe = row.descricao_cafe;
        this.#inicio = row.data_hora_inicio;
        this.#fim = row.data_hora_fim;
        // Campos de leitura (JOIN)
        this.curso_nome = row.curso_nome;
        this.cliente_nome = row.cliente_nome;
    }

    toJSON() {
        return {
            id: this.#id,
            status: this.#status,
            descricao_cafe: this.#cafe,
            data_hora_inicio: this.#inicio,
            data_hora_fim: this.#fim,
            curso_nome: this.curso_nome,
            cliente_nome: this.cliente_nome
        };
    }
}

class AgendamentoCursoDAO {
    async listar() {
        // SQL com JOINs para o Front-end ter os nomes
        const sql = `SELECT ac.*, c.nome as curso_nome, cl.nome as cliente_nome 
                     FROM agendamento_curso ac 
                     JOIN cursos c ON ac.curso_id = c.id 
                     JOIN clientes cl ON ac.cliente_id = cl.id 
                     ORDER BY ac.data_hora_inicio DESC`;
        const res = await DatabasePG.query(sql);
        return res.rows.map(r => new AgendamentoCurso(r).toJSON());
    }

    async salvar(id, d) {
        const row = id
            ? await DatabasePG.updateAgendamentoCurso(id, d.curso_id, d.cliente_id, d.prof_id, d.unid_id, d.d_inicio, d.d_fim, d.desc_cafe, d.status)
            : await DatabasePG.addAgendamentoCurso(d.curso_id, d.cliente_id, d.prof_id, d.unid_id, d.d_inicio, d.d_fim, d.desc_cafe);
        return row ? new AgendamentoCurso(row).toJSON() : null;
    }

    async excluir(id) {
        return await DatabasePG.deleteById('agendamento_curso', id);
    }
}

module.exports = new AgendamentoCursoDAO(); 