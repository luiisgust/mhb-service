require('dotenv').config();
const { Pool } = require('pg');

class Database {
  #connection;

  constructor() {
    this.#connection = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }

  // ==========================================
  // 1. USUÁRIOS (AUTH)
  // ==========================================
  async selectUsers() {
    const res = await this.#connection.query('SELECT id, nome, email FROM users ORDER BY nome ASC');
    return res.rows;
  }
  async login(email, password) {
    const res = await this.#connection.query('SELECT id, nome, email FROM users WHERE email = $1 AND password = $2', [email, password]);
    return res.rows[0];
  }
  async addUser(nome, email, password) {
    const res = await this.#connection.query('INSERT INTO users (nome, email, password) VALUES ($1, $2, $3) RETURNING id, nome, email', [nome, email, password]);
    return res.rows[0];
  }
  async updateUser(id, nome, email, password) {
    const res = await this.#connection.query('UPDATE users SET nome = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, nome, email', [nome, email, password, id]);
    return res.rows[0];
  }

  // ==========================================
  // 2. UNIDADES
  // ==========================================
  async selectUnidades() {
    const res = await this.#connection.query('SELECT * FROM unidades ORDER BY id ASC');
    return res.rows;
  }
  async addUnidade(nome, localidade) {
    const res = await this.#connection.query('INSERT INTO unidades (nome, localidade) VALUES ($1, $2) RETURNING *', [nome, localidade]);
    return res.rows[0];
  }
  async updateUnidade(id, nome, localidade) {
    const res = await this.#connection.query('UPDATE unidades SET nome = $1, localidade = $2 WHERE id = $3 RETURNING *', [nome, localidade, id]);
    return res.rows[0];
  }

  // ==========================================
  // 3. PROFISSIONAIS
  // ==========================================
  async selectProfissionais() {
    const sql = `SELECT p.*, u.nome as unidade_nome FROM profissionais p 
                 LEFT JOIN unidades u ON p.unidade_id = u.id ORDER BY p.nome ASC`;
    const res = await this.#connection.query(sql);
    return res.rows;
  }
  async addProfissional(nome, quali_curso, unidade_id) {
    const res = await this.#connection.query('INSERT INTO profissionais (nome, quali_curso, unidade_id) VALUES ($1, $2, $3) RETURNING *', [nome, quali_curso, unidade_id]);
    return res.rows[0];
  }
  async updateProfissional(id, nome, quali_curso, unidade_id) {
    const res = await this.#connection.query('UPDATE profissionais SET nome = $1, quali_curso = $2, unidade_id = $3 WHERE id = $4 RETURNING *', [nome, quali_curso, unidade_id, id]);
    return res.rows[0];
  }

  // ==========================================
  // 4. CLIENTES
  // ==========================================
  async selectClientes() {
    const res = await this.#connection.query('SELECT * FROM clientes ORDER BY nome ASC');
    return res.rows;
  }
  async addCliente(nome, telefone, aniversario) {
    const res = await this.#connection.query('INSERT INTO clientes (nome, telefone, aniversario) VALUES ($1, $2, $3) RETURNING *', [nome, telefone, aniversario]);
    return res.rows[0];
  }
  async updateCliente(id, nome, telefone, aniversario) {
    const res = await this.#connection.query('UPDATE clientes SET nome = $1, telefone = $2, aniversario = $3 WHERE id = $4 RETURNING *', [nome, telefone, aniversario, id]);
    return res.rows[0];
  }

  // ==========================================
  // 5. PROCEDIMENTOS & CATEGORIAS
  // ==========================================
  async selectProcedimentos() {
    const res = await this.#connection.query('SELECT * FROM procedimentos ORDER BY nome ASC');
    return res.rows;
  }
  async addProcedimento(nome, tempo_maximo, valor) {
    const res = await this.#connection.query('INSERT INTO procedimentos (nome, tempo_maximo, valor) VALUES ($1, $2, $3) RETURNING *', [nome, tempo_maximo, valor]);
    return res.rows[0];
  }
  async selectCategorias() {
    const res = await this.#connection.query('SELECT * FROM categorias ORDER BY nome ASC');
    return res.rows;
  }
  async addCategoria(nome) {
    const res = await this.#connection.query('INSERT INTO categorias (nome) VALUES ($1) RETURNING *', [nome]);
    return res.rows[0];
  }

  // ==========================================
  // 6. AGENDAMENTOS (PROCEDIMENTOS)
  // ==========================================
  async selectAgendamentos() {
    const sql = `SELECT a.*, c.nome as cliente_nome, p.nome as profissional_nome, u.nome as unidade_nome
                 FROM agendamentos a 
                 JOIN clientes c ON a.cliente_id = c.id 
                 JOIN profissionais p ON a.profissional_id = p.id
                 JOIN unidades u ON a.unidade_id = u.id ORDER BY a.data DESC`;
    const res = await this.#connection.query(sql);
    return res.rows;
  }
  async addAgendamento(u_id, cl_id, pr_id, data, h_i, h_f, t_min, valor, status, etiqueta) {
    const sql = `INSERT INTO agendamentos (unidade_id, cliente_id, profissional_id, data, hora_inicio, hora_fim, tempo_total_min, valor_total, status, etiqueta_customizada) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    const res = await this.#connection.query(sql, [u_id, cl_id, pr_id, data, h_i, h_f, t_min, valor, status || 'Agendado', etiqueta]);
    return res.rows[0];
  }
  async updateStatusAgendamento(id, status) {
    const res = await this.#connection.query('UPDATE agendamentos SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    return res.rows[0];
  }

  // ==========================================
  // 7. CURSOS & AGENDAMENTO CURSOS
  // ==========================================
  async selectCursos() {
    const sql = `SELECT c.*, p.nome as profissional_nome, u.nome as unidade_nome 
                 FROM cursos c JOIN profissionais p ON c.profissional_id = p.id JOIN unidades u ON c.unidade_id = u.id`;
    const res = await this.#connection.query(sql);
    return res.rows;
  }
  async addCurso(nome, tempo, valor, prof_id, unid_id) {
    const res = await this.#connection.query('INSERT INTO cursos (nome, tempo_duracao, valor, profissional_id, unidade_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [nome, tempo, valor, prof_id, unid_id]);
    return res.rows[0];
  }
  async updateCurso(id, nome, tempo, valor, prof_id, unid_id) {
    const sql = `UPDATE cursos SET nome = $1, tempo_duracao = $2, valor = $3, profissional_id = $4, unidade_id = $5 
                WHERE id = $6 RETURNING *`;
    const res = await this.#connection.query(sql, [nome, tempo, valor, prof_id, unid_id, id]);
    return res.rows[0];
  }
  async addAgendamentoCurso(curso_id, cliente_id, prof_id, unid_id, d_inicio, d_fim, desc_cafe) {
    const sql = `INSERT INTO agendamento_curso (curso_id, cliente_id, profissional_id, unidade_id, data_hora_inicio, data_hora_fim, descricao_cafe) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const res = await this.#connection.query(sql, [curso_id, cliente_id, prof_id, unid_id, d_inicio, d_fim, desc_cafe]);
    return res.rows[0];
  }
  async updateAgendamentoCurso(id, curso_id, cliente_id, prof_id, unid_id, d_inicio, d_fim, desc_cafe, status) {
    const sql = `UPDATE agendamento_curso 
                SET curso_id = $1, cliente_id = $2, profissional_id = $3, unidade_id = $4, 
                    data_hora_inicio = $5, data_hora_fim = $6, descricao_cafe = $7, status = $8
                WHERE id = $9 RETURNING *`;
    const res = await this.#connection.query(sql, [curso_id, cliente_id, prof_id, unid_id, d_inicio, d_fim, desc_cafe, status, id]);
    return res.rows[0];
  }

  // ==========================================
  // 8. ESTOQUE & VENDAS
  // ==========================================
  async selectEstoque() {
    const sql = `SELECT e.*, c.nome as categoria_nome FROM estoque e LEFT JOIN categorias c ON e.categoria_id = c.id`;
    const res = await this.#connection.query(sql);
    return res.rows;
  }
  async addEstoque(nome, qtd, cat_id) {
    const res = await this.#connection.query('INSERT INTO estoque (nome, quantidade, categoria_id) VALUES ($1, $2, $3) RETURNING *', [nome, qtd, cat_id]);
    return res.rows[0];
  }
  async updateEstoque(id, nome, qtd, cat_id) {
    const sql = `UPDATE estoque SET nome = $1, quantidade = $2, categoria_id = $3 WHERE id = $4 RETURNING *`;
    const res = await this.#connection.query(sql, [nome, qtd, cat_id, id]);
    return res.rows[0];
  }
  async addVenda(estoque_id, quantidade, valor_venda) {
    // Transação manual: Registra venda e baixa estoque
    await this.#connection.query('BEGIN');
    try {
      const resVenda = await this.#connection.query('INSERT INTO vendas (estoque_id, quantidade, valor_venda) VALUES ($1, $2, $3) RETURNING *', [estoque_id, quantidade, valor_venda]);
      await this.#connection.query('UPDATE estoque SET quantidade = quantidade - $1 WHERE id = $2', [quantidade, estoque_id]);
      await this.#connection.query('COMMIT');
      return resVenda.rows[0];
    } catch (e) {
      await this.#connection.query('ROLLBACK');
      throw e;
    }
  }

  // ==========================================
  // 9. FINANCEIRO (CAIXA, MOVIMENTAÇÕES, COMISSÕES)
  // ==========================================
  async selectCaixas() {
    const res = await this.#connection.query('SELECT c.*, u.nome as unidade_nome FROM caixa c JOIN unidades u ON c.unidade_id = u.id');
    return res.rows;
  }
  async abrirCaixa(unidade_id, valor_inicial) {
    const res = await this.#connection.query('INSERT INTO caixa (unidade_id, valor_inicial, status) VALUES ($1, $2, $3) RETURNING *', [unidade_id, valor_inicial, 'Aberto']);
    return res.rows[0];
  }
  async fecharCaixa(id, valor_final) {
    const res = await this.#connection.query('UPDATE caixa SET valor_final = $1, status = $2, data_fechamento = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *', [valor_final, 'Fechado', id]);
    return res.rows[0];
  }
  async updateCaixa(id, unidade_id, v_inicial, v_final, status) {
    const sql = `UPDATE caixa SET unidade_id = $1, valor_inicial = $2, valor_final = $3, status = $4 WHERE id = $5 RETURNING *`;
    const res = await this.#connection.query(sql, [unidade_id, v_inicial, v_final, status, id]);
    return res.rows[0];
  }
  async addMovimentacao(caixa_id, tipo, origem, valor, desc) {
    const sql = 'INSERT INTO movimentacoes_caixa (caixa_id, tipo, origem, valor, descricao) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const res = await this.#connection.query(sql, [caixa_id, tipo, origem, valor, desc]);
    return res.rows[0];
  }
  async updateMovimentacao(id, caixa_id, tipo, origem, valor, desc) {
    const sql = `UPDATE movimentacoes_caixa 
                SET caixa_id = $1, tipo = $2, origem = $3, valor = $4, descricao = $5 
                WHERE id = $6 RETURNING *`;
    const res = await this.#connection.query(sql, [caixa_id, tipo, origem, valor, desc, id]);
    return res.rows[0];
  }
  async addComissao(prof_id, proc_id, porcentagem) {
    const res = await this.#connection.query('INSERT INTO comissoes (profissional_id, procedimento_id, porcentagem) VALUES ($1, $2, $3) RETURNING *', [prof_id, proc_id, porcentagem]);
    return res.rows[0];
  }
  async updateComissao(id, prof_id, proc_id, porcentagem) {
    const sql = `UPDATE comissoes SET profissional_id = $1, procedimento_id = $2, porcentagem = $3 WHERE id = $4 RETURNING *`;
    const res = await this.#connection.query(sql, [prof_id, proc_id, porcentagem, id]);
    return res.rows[0];
  }

  // ==========================================
  // 10. MÉTODO MESTRE DE DELETE
  // ==========================================
  async deleteById(tabela, id) {
    const sql = `DELETE FROM ${tabela} WHERE id = $1`;
    const res = await this.#connection.query(sql, [id]);
    return res.rowCount;
  }
}

module.exports = new Database();