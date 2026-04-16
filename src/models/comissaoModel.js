const DatabasePG = require('../../repository/database.js');

class ComissaoDAO {
    async listar() {
        const sql = `SELECT c.*, p.nome as profissional_nome, proc.nome as procedimento_nome 
                     FROM comissoes c 
                     JOIN profissionais p ON c.profissional_id = p.id 
                     JOIN procedimentos proc ON c.procedimento_id = proc.id`;
        const res = await DatabasePG.query(sql);
        return res.rows;
    }

    async salvar(id, d) {
        return id 
            ? await DatabasePG.updateComissao(id, d.prof_id, d.proc_id, d.porcentagem)
            : await DatabasePG.addComissao(d.prof_id, d.proc_id, d.porcentagem);
    }

    async excluir(id) {
        return await DatabasePG.deleteById('comissoes', id);
    }
}

module.exports = new ComissaoDAO();