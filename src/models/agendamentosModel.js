const DatabasePG = require('../../repository/database.js');

// 1. A Entidade (O Objeto de Negócio)
class Agendamento {
    constructor(row) {
        this.id = row.id;
        this.unidade_id = row.unidade_id;
        this.unidade_nome = row.unidade_nome; // Do JOIN
        this.cliente_id = row.cliente_id;
        this.cliente_nome = row.cliente_nome; // Do JOIN
        this.profissional_id = row.profissional_id;
        this.profissional_nome = row.profissional_nome; // Do JOIN
        this.data = row.data;
        this.hora_inicio = row.hora_inicio;
        this.hora_fim = row.hora_fim;
        this.tempo_total_min = row.tempo_total_min;
        this.valor_total = row.valor_total;
        this.status = row.status;
        this.etiqueta_customizada = row.etiqueta_customizada;
    }

    toJSON() {
        return { ...this };
    }
}

// 2. O DAO
class AgendamentoDAO {
    
    async listarTudo() {
        const rows = await DatabasePG.selectAgendamentos();
        return rows.map(r => new Agendamento(r).toJSON());
    }

    async cadastrar(dados) {
        const { u_id, cl_id, pr_id, data, h_i, h_f, t_min, valor, status, etiqueta } = dados;
        const row = await DatabasePG.addAgendamento(u_id, cl_id, pr_id, data, h_i, h_f, t_min, valor, status, etiqueta);
        return row ? new Agendamento(row).toJSON() : null;
    }

    async atualizarStatus(id, status) {
        const row = await DatabasePG.updateStatusAgendamento(id, status);
        return row ? new Agendamento(row).toJSON() : null;
    }

    async excluir(id) {
        // Usando o método genérico do seu Database.js
        return await DatabasePG.deleteById('agendamentos', id);
    }
}

module.exports = new AgendamentoDAO();  