const DatabasePG = require('../../repository/database.js');

class Curso {
    #id; #nome; #tempo; #valor; #prof_id; #unid_id; #prof_nome; #unid_nome;

    constructor(row) {
        this.#id = row.id;
        this.#nome = row.nome;
        this.#tempo = row.tempo_duracao;
        this.#valor = row.valor;
        this.#prof_id = row.profissional_id;
        this.#unid_id = row.unidade_id;
        this.#prof_nome = row.profissional_nome;
        this.#unid_nome = row.unidade_nome;
    }

    toJSON() {
        return {
            id: this.#id,
            nome: this.#nome,
            tempo_duracao: this.#tempo,
            valor: this.#valor,
            profissional_id: this.#prof_id,
            unidade_id: this.#unid_id,
            profissional_nome: this.#prof_nome,
            unidade_nome: this.#unid_nome
        };
    }
}

class CursoDAO {
    async listar() {
        const rows = await DatabasePG.selectCursos();
        return rows.map(r => new Curso(r).toJSON());
    }

    async salvar(id, d) {
        const row = id 
            ? await DatabasePG.updateCurso(id, d.nome, d.tempo, d.valor, d.prof_id, d.unid_id)
            : await DatabasePG.addCurso(d.nome, d.tempo, d.valor, d.prof_id, d.unid_id);
        return row ? new Curso(row).toJSON() : null;
    }

    async excluir(id) {
        return await DatabasePG.deleteById('cursos', id);
    }
}

module.exports = new CursoDAO();