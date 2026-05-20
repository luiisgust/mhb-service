require('dotenv').config();
const { Pool } = require('pg');

// ============================================================
// Whitelist de tabelas permitidas no deleteById
// Evita SQL Injection com nome de tabela dinâmico
// ============================================================
const TABELAS_PERMITIDAS = new Set([
  'users', 'unidades', 'clientes', 'anamneses',
  'categorias', 'procedimentos', 'profissionais',
  'profissional_procedimentos', 'profissional_ausencias',
  'metas_profissionais', 'comissoes', 'comissoes_geradas',
  'pacotes', 'cliente_pacotes',
  'agendamentos', 'agendamento_procedimentos',
  'agendamento_fotos', 'agendamento_historico', 'agenda_bloqueios',
  'cursos', 'curso_profissionais', 'agendamento_curso',
  'estoque', 'movimentacoes_estoque',
  'vendas', 'venda_itens',
  'caixa', 'movimentacoes_caixa',
  'pagamentos', 'pagamento_parcelas',
  'cliente_creditos', 'audit_log'
]);

class Database {
  #pool;

  constructor() {
    this.#pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Testa conexão ao iniciar
    this.#pool.connect((err, client, release) => {
      if (err) {
        console.error('❌ Erro ao conectar no banco:', err.message);
      } else {
        console.log('✅ Banco de dados conectado com sucesso!');
        release();
      }
    });
  }

  // Método interno para executar queries simples
  async #query(sql, params = []) {
    const client = await this.#pool.connect();
    try {
      const res = await client.query(sql, params);
      return res;
    } catch (err) {
      console.error('❌ Erro na query:', err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  // Método interno para executar transações
  async #transaction(callback) {
    const client = await this.#pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Transação revertida:', err.message);
      throw err;
    } finally {
      client.release();
    }
  }


  // ============================================================
  // 1. USERS
  // ============================================================
  async selectUsers() {
    const res = await this.#query(
      'SELECT id, nome, email, role, unidade_id, ativo, ultimo_login, criado_em FROM users ORDER BY nome ASC'
    );
    return res.rows;
  }

  async getUserById(id) {
    const res = await this.#query(
      'SELECT id, nome, email, role, unidade_id, ativo FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0];
  }

  // Retorna também a senha (hash) — usado apenas internamente no login
  async getUserByEmail(email) {
    const res = await this.#query(
      'SELECT id, nome, email, password, role, unidade_id, ativo FROM users WHERE email = $1',
      [email]
    );
    return res.rows[0];
  }

  async addUser(nome, email, passwordHash, role = 'recepcionista', unidade_id = null) {
    const res = await this.#query(
      `INSERT INTO users (nome, email, password, role, unidade_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, role, unidade_id`,
      [nome, email, passwordHash, role, unidade_id]
    );
    return res.rows[0];
  }

  async updateUser(id, nome, email, role, unidade_id, ativo) {
    const res = await this.#query(
      `UPDATE users SET nome = $1, email = $2, role = $3, unidade_id = $4, ativo = $5
       WHERE id = $6
       RETURNING id, nome, email, role, unidade_id, ativo`,
      [nome, email, role, unidade_id, ativo, id]
    );
    return res.rows[0];
  }

  async updateUserPassword(id, passwordHash) {
    const res = await this.#query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
      [passwordHash, id]
    );
    return res.rows[0];
  }

  async updateUltimoLogin(id) {
    await this.#query(
      'UPDATE users SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }


  // ============================================================
  // 2. UNIDADES
  // ============================================================
  async selectUnidades() {
    const res = await this.#query('SELECT * FROM unidades ORDER BY nome ASC');
    return res.rows;
  }

  async getUnidadeById(id) {
    const res = await this.#query('SELECT * FROM unidades WHERE id = $1', [id]);
    return res.rows[0];
  }

  async addUnidade(nome, endereco, cidade) {
    const res = await this.#query(
      'INSERT INTO unidades (nome, endereco, cidade) VALUES ($1, $2, $3) RETURNING *',
      [nome, endereco, cidade]
    );
    return res.rows[0];
  }

  async updateUnidade(id, nome, endereco, cidade, ativa) {
    const res = await this.#query(
      `UPDATE unidades SET nome = $1, endereco = $2, cidade = $3, ativa = $4
       WHERE id = $5 RETURNING *`,
      [nome, endereco, cidade, ativa, id]
    );
    return res.rows[0];
  }


  // ============================================================
  // 3. CLIENTES
  // ============================================================
  async selectClientes() {
    const res = await this.#query(
      'SELECT * FROM clientes WHERE ativo = TRUE ORDER BY nome ASC'
    );
    return res.rows;
  }

  async getClienteById(id) {
    const res = await this.#query('SELECT * FROM clientes WHERE id = $1', [id]);
    return res.rows[0];
  }

  async searchClientes(termo) {
    const res = await this.#query(
      `SELECT * FROM clientes
       WHERE ativo = TRUE AND (nome ILIKE $1 OR telefone ILIKE $1)
       ORDER BY nome ASC`,
      [`%${termo}%`]
    );
    return res.rows;
  }

  async clientesAniversarioMes(mes) {
    const res = await this.#query(
      `SELECT * FROM clientes
       WHERE ativo = TRUE AND EXTRACT(MONTH FROM aniversario) = $1
       ORDER BY EXTRACT(DAY FROM aniversario) ASC`,
      [mes]
    );
    return res.rows;
  }

  async addCliente(nome, telefone, aniversario, observacoes) {
    const res = await this.#query(
      `INSERT INTO clientes (nome, telefone, aniversario, observacoes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome, telefone, aniversario, observacoes]
    );
    return res.rows[0];
  }

  async updateCliente(id, nome, telefone, aniversario, observacoes) {
    const res = await this.#query(
      `UPDATE clientes SET nome = $1, telefone = $2, aniversario = $3, observacoes = $4
       WHERE id = $5 RETURNING *`,
      [nome, telefone, aniversario, observacoes, id]
    );
    return res.rows[0];
  }

  async inativarCliente(id) {
    const res = await this.#query(
      'UPDATE clientes SET ativo = FALSE WHERE id = $1 RETURNING id, nome',
      [id]
    );
    return res.rows[0];
  }

  // Clientes sem visita há X dias
  async clientesInativos(dias = 60) {
    const res = await this.#query(
      `SELECT c.*, MAX(a.data_hora_inicio) as ultimo_agendamento
       FROM clientes c
       LEFT JOIN agendamentos a ON a.cliente_id = c.id AND a.status = 'Pago'
       WHERE c.ativo = TRUE
       GROUP BY c.id
       HAVING MAX(a.data_hora_inicio) < NOW() - INTERVAL '1 day' * $1
          OR MAX(a.data_hora_inicio) IS NULL
       ORDER BY ultimo_agendamento ASC NULLS FIRST`,
      [dias]
    );
    return res.rows;
  }


  // ============================================================
  // 4. ANAMNESE
  // ============================================================
  async getAnamnese(cliente_id) {
    const res = await this.#query(
      'SELECT * FROM anamneses WHERE cliente_id = $1',
      [cliente_id]
    );
    return res.rows[0];
  }

  async upsertAnamnese(cliente_id, dados, user_id) {
    const {
      gestante, amamentando, pressao_alta, diabetes,
      problemas_cardiacos, cancer,
      medicamentos, alergias, doencas, cirurgias,
      tratamentos_anteriores, observacoes
    } = dados;

    const res = await this.#query(
      `INSERT INTO anamneses (
         cliente_id, gestante, amamentando, pressao_alta, diabetes,
         problemas_cardiacos, cancer,
         medicamentos, alergias, doencas, cirurgias,
         tratamentos_anteriores, observacoes, preenchida_por
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (cliente_id) DO UPDATE SET
         gestante = EXCLUDED.gestante,
         amamentando = EXCLUDED.amamentando,
         pressao_alta = EXCLUDED.pressao_alta,
         diabetes = EXCLUDED.diabetes,
         problemas_cardiacos = EXCLUDED.problemas_cardiacos,
         cancer = EXCLUDED.cancer,
         medicamentos = EXCLUDED.medicamentos,
         alergias = EXCLUDED.alergias,
         doencas = EXCLUDED.doencas,
         cirurgias = EXCLUDED.cirurgias,
         tratamentos_anteriores = EXCLUDED.tratamentos_anteriores,
         observacoes = EXCLUDED.observacoes,
         preenchida_por = EXCLUDED.preenchida_por,
         atualizado_em = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        cliente_id, gestante, amamentando, pressao_alta, diabetes,
        problemas_cardiacos, cancer,
        medicamentos, alergias, doencas, cirurgias,
        tratamentos_anteriores, observacoes, user_id
      ]
    );
    return res.rows[0];
  }


  // ============================================================
  // 5. CATEGORIAS
  // ============================================================
  async selectCategorias(tipo = null) {
    if (tipo) {
      const res = await this.#query(
        'SELECT * FROM categorias WHERE tipo = $1 ORDER BY nome ASC',
        [tipo]
      );
      return res.rows;
    }
    const res = await this.#query('SELECT * FROM categorias ORDER BY tipo, nome ASC');
    return res.rows;
  }

  async addCategoria(nome, tipo) {
    const res = await this.#query(
      'INSERT INTO categorias (nome, tipo) VALUES ($1, $2) RETURNING *',
      [nome, tipo]
    );
    return res.rows[0];
  }

  async updateCategoria(id, nome, tipo) {
    const res = await this.#query(
      'UPDATE categorias SET nome = $1, tipo = $2 WHERE id = $3 RETURNING *',
      [nome, tipo, id]
    );
    return res.rows[0];
  }


  // ============================================================
  // 6. PROCEDIMENTOS
  // ============================================================
  async selectProcedimentos(apenasAtivos = true) {
    const res = await this.#query(
      `SELECT p.*, c.nome as categoria_nome
       FROM procedimentos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       ${apenasAtivos ? 'WHERE p.ativo = TRUE' : ''}
       ORDER BY p.nome ASC`
    );
    return res.rows;
  }

  async getProcedimentoById(id) {
    const res = await this.#query(
      `SELECT p.*, c.nome as categoria_nome
       FROM procedimentos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    return res.rows[0];
  }

  async addProcedimento(nome, descricao, categoria_id, tempo_min, valor, retorno_dias) {
    const res = await this.#query(
      `INSERT INTO procedimentos (nome, descricao, categoria_id, tempo_min, valor, retorno_dias)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nome, descricao, categoria_id, tempo_min, valor, retorno_dias]
    );
    return res.rows[0];
  }

  async updateProcedimento(id, nome, descricao, categoria_id, tempo_min, valor, retorno_dias, ativo) {
    const res = await this.#query(
      `UPDATE procedimentos
       SET nome = $1, descricao = $2, categoria_id = $3, tempo_min = $4,
           valor = $5, retorno_dias = $6, ativo = $7
       WHERE id = $8 RETURNING *`,
      [nome, descricao, categoria_id, tempo_min, valor, retorno_dias, ativo, id]
    );
    return res.rows[0];
  }


  // ============================================================
  // 7. PROFISSIONAIS
  // ============================================================
  async selectProfissionais(apenasAtivos = true) {
    const res = await this.#query(
      `SELECT p.*, u.nome as unidade_nome
       FROM profissionais p
       LEFT JOIN unidades u ON p.unidade_id = u.id
       ${apenasAtivos ? 'WHERE p.ativo = TRUE' : ''}
       ORDER BY p.nome ASC`
    );
    return res.rows;
  }

  async getProfissionalById(id) {
    const res = await this.#query(
      `SELECT p.*, u.nome as unidade_nome
       FROM profissionais p
       LEFT JOIN unidades u ON p.unidade_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    return res.rows[0];
  }

  // Apenas profissionais aptas a dar cursos
  async selectProfissionaisAptas() {
    const res = await this.#query(
      `SELECT p.*, u.nome as unidade_nome
       FROM profissionais p
       LEFT JOIN unidades u ON p.unidade_id = u.id
       WHERE p.ativo = TRUE AND p.apta_cursos = TRUE
       ORDER BY p.nome ASC`
    );
    return res.rows;
  }

  async addProfissional(nome, telefone, email, unidade_id, apta_cursos = false) {
    const res = await this.#query(
      `INSERT INTO profissionais (nome, telefone, email, unidade_id, apta_cursos)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nome, telefone, email, unidade_id, apta_cursos]
    );
    return res.rows[0];
  }

  async updateProfissional(id, nome, telefone, email, unidade_id, apta_cursos, ativo) {
    const res = await this.#query(
      `UPDATE profissionais
       SET nome = $1, telefone = $2, email = $3, unidade_id = $4,
           apta_cursos = $5, ativo = $6
       WHERE id = $7 RETURNING *`,
      [nome, telefone, email, unidade_id, apta_cursos, ativo, id]
    );
    return res.rows[0];
  }

  // Procedimentos que uma profissional realiza
  async getProcedimentosDaProfissional(profissional_id) {
    const res = await this.#query(
      `SELECT p.* FROM procedimentos p
       JOIN profissional_procedimentos pp ON pp.procedimento_id = p.id
       WHERE pp.profissional_id = $1 AND p.ativo = TRUE
       ORDER BY p.nome ASC`,
      [profissional_id]
    );
    return res.rows;
  }

  async addProcedimentoProfissional(profissional_id, procedimento_id) {
    const res = await this.#query(
      `INSERT INTO profissional_procedimentos (profissional_id, procedimento_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
      [profissional_id, procedimento_id]
    );
    return res.rows[0];
  }

  async removeProcedimentoProfissional(profissional_id, procedimento_id) {
    const res = await this.#query(
      `DELETE FROM profissional_procedimentos
       WHERE profissional_id = $1 AND procedimento_id = $2`,
      [profissional_id, procedimento_id]
    );
    return res.rowCount;
  }


  // ============================================================
  // 8. AUSÊNCIAS DE PROFISSIONAIS
  // ============================================================
  async selectAusencias(profissional_id = null) {
    const res = await this.#query(
      `SELECT a.*, p.nome as profissional_nome
       FROM profissional_ausencias a
       JOIN profissionais p ON a.profissional_id = p.id
       ${profissional_id ? 'WHERE a.profissional_id = $1' : ''}
       ORDER BY a.data_inicio DESC`,
      profissional_id ? [profissional_id] : []
    );
    return res.rows;
  }

  async addAusencia(profissional_id, unidade_id, tipo, data_inicio, data_fim, motivo, aprovado_por) {
    const res = await this.#query(
      `INSERT INTO profissional_ausencias
         (profissional_id, unidade_id, tipo, data_inicio, data_fim, motivo, aprovado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [profissional_id, unidade_id, tipo, data_inicio, data_fim, motivo, aprovado_por]
    );
    return res.rows[0];
  }


  // ============================================================
  // 9. METAS DAS PROFISSIONAIS
  // ============================================================
  async selectMetas(mes, ano) {
    const res = await this.#query(
      `SELECT m.*, p.nome as profissional_nome
       FROM metas_profissionais m
       JOIN profissionais p ON m.profissional_id = p.id
       WHERE m.mes = $1 AND m.ano = $2
       ORDER BY p.nome ASC`,
      [mes, ano]
    );
    return res.rows;
  }

  async upsertMeta(profissional_id, unidade_id, mes, ano, meta_valor, meta_atendimentos) {
    const res = await this.#query(
      `INSERT INTO metas_profissionais
         (profissional_id, unidade_id, mes, ano, meta_valor, meta_atendimentos)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (profissional_id, unidade_id, mes, ano) DO UPDATE SET
         meta_valor = EXCLUDED.meta_valor,
         meta_atendimentos = EXCLUDED.meta_atendimentos
       RETURNING *`,
      [profissional_id, unidade_id, mes, ano, meta_valor, meta_atendimentos]
    );
    return res.rows[0];
  }

  // Relatório: profissionais vs metas no mês
  async relatorioMetasMes(mes, ano) {
    const res = await this.#query(
      `SELECT
         p.id, p.nome,
         m.meta_valor, m.meta_atendimentos,
         COALESCE(SUM(a.valor_final), 0) as faturado,
         COUNT(a.id) as atendimentos_realizados,
         ROUND(COALESCE(SUM(a.valor_final), 0) / NULLIF(m.meta_valor, 0) * 100, 2) as percentual_meta
       FROM profissionais p
       LEFT JOIN metas_profissionais m ON m.profissional_id = p.id AND m.mes = $1 AND m.ano = $2
       LEFT JOIN agendamentos a ON a.profissional_id = p.id
         AND EXTRACT(MONTH FROM a.data_hora_inicio) = $1
         AND EXTRACT(YEAR FROM a.data_hora_inicio) = $2
         AND a.status = 'Pago'
       WHERE p.ativo = TRUE
       GROUP BY p.id, p.nome, m.meta_valor, m.meta_atendimentos
       ORDER BY p.nome ASC`,
      [mes, ano]
    );
    return res.rows;
  }


  // ============================================================
  // 10. COMISSÕES (regras)
  // ============================================================
  async selectComissoes(profissional_id = null) {
    const res = await this.#query(
      `SELECT c.*, p.nome as profissional_nome, pr.nome as procedimento_nome
       FROM comissoes c
       JOIN profissionais p ON c.profissional_id = p.id
       LEFT JOIN procedimentos pr ON c.procedimento_id = pr.id
       ${profissional_id ? 'WHERE c.profissional_id = $1' : ''}
       ORDER BY p.nome ASC`,
      profissional_id ? [profissional_id] : []
    );
    return res.rows;
  }

  async upsertComissao(profissional_id, procedimento_id, porcentagem) {
    const res = await this.#query(
      `INSERT INTO comissoes (profissional_id, procedimento_id, porcentagem)
       VALUES ($1, $2, $3)
       ON CONFLICT (profissional_id, procedimento_id) DO UPDATE SET
         porcentagem = EXCLUDED.porcentagem,
         ativo = TRUE
       RETURNING *`,
      [profissional_id, procedimento_id, porcentagem]
    );
    return res.rows[0];
  }

  // Busca a comissão aplicável: tenta específica, cai na geral
  async getComissaoAplicavel(profissional_id, procedimento_id) {
    const res = await this.#query(
      `SELECT porcentagem FROM comissoes
       WHERE profissional_id = $1
         AND (procedimento_id = $2 OR procedimento_id IS NULL)
         AND ativo = TRUE
       ORDER BY procedimento_id NULLS LAST
       LIMIT 1`,
      [profissional_id, procedimento_id]
    );
    return res.rows[0];
  }


  // ============================================================
  // 11. COMISSÕES GERADAS (histórico real)
  // ============================================================
  async selectComissoesGeradas(profissional_id = null, mes = null, ano = null, pago = null) {
    let where = [];
    let params = [];
    let i = 1;

    if (profissional_id) { where.push(`cg.profissional_id = $${i++}`); params.push(profissional_id); }
    if (mes)  { where.push(`EXTRACT(MONTH FROM a.data_hora_inicio) = $${i++}`); params.push(mes); }
    if (ano)  { where.push(`EXTRACT(YEAR FROM a.data_hora_inicio) = $${i++}`); params.push(ano); }
    if (pago !== null) { where.push(`cg.pago = $${i++}`); params.push(pago); }

    const res = await this.#query(
      `SELECT cg.*, p.nome as profissional_nome, a.data_hora_inicio
       FROM comissoes_geradas cg
       JOIN profissionais p ON cg.profissional_id = p.id
       JOIN agendamentos a ON cg.agendamento_id = a.id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY a.data_hora_inicio DESC`,
      params
    );
    return res.rows;
  }

  async pagarComissoes(ids_comissoes) {
    const res = await this.#query(
      `UPDATE comissoes_geradas
       SET pago = TRUE, data_pagamento = CURRENT_TIMESTAMP
       WHERE id = ANY($1::bigint[])
       RETURNING *`,
      [ids_comissoes]
    );
    return res.rows;
  }


  // ============================================================
  // 12. PACOTES
  // ============================================================
  async selectPacotes(apenasAtivos = true) {
    const res = await this.#query(
      `SELECT p.*, pr.nome as procedimento_nome
       FROM pacotes p
       LEFT JOIN procedimentos pr ON p.procedimento_id = pr.id
       ${apenasAtivos ? 'WHERE p.ativo = TRUE' : ''}
       ORDER BY p.nome ASC`
    );
    return res.rows;
  }

  async addPacote(nome, descricao, procedimento_id, total_sessoes, valor, validade_dias) {
    const res = await this.#query(
      `INSERT INTO pacotes (nome, descricao, procedimento_id, total_sessoes, valor, validade_dias)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nome, descricao, procedimento_id, total_sessoes, valor, validade_dias]
    );
    return res.rows[0];
  }

  async updatePacote(id, nome, descricao, procedimento_id, total_sessoes, valor, validade_dias, ativo) {
    const res = await this.#query(
      `UPDATE pacotes SET nome = $1, descricao = $2, procedimento_id = $3,
         total_sessoes = $4, valor = $5, validade_dias = $6, ativo = $7
       WHERE id = $8 RETURNING *`,
      [nome, descricao, procedimento_id, total_sessoes, valor, validade_dias, ativo, id]
    );
    return res.rows[0];
  }

  // Pacotes de um cliente
  async getClientePacotes(cliente_id) {
    const res = await this.#query(
      `SELECT cp.*, p.nome as pacote_nome, pr.nome as procedimento_nome
       FROM cliente_pacotes cp
       JOIN pacotes p ON cp.pacote_id = p.id
       LEFT JOIN procedimentos pr ON p.procedimento_id = pr.id
       WHERE cp.cliente_id = $1
       ORDER BY cp.data_compra DESC`,
      [cliente_id]
    );
    return res.rows;
  }

  async addClientePacote(cliente_id, pacote_id, unidade_id, sessoes_total, valor_pago, data_validade) {
    const res = await this.#query(
      `INSERT INTO cliente_pacotes
         (cliente_id, pacote_id, unidade_id, sessoes_total, valor_pago, data_validade)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [cliente_id, pacote_id, unidade_id, sessoes_total, valor_pago, data_validade]
    );
    return res.rows[0];
  }

  async usarSessaoPacote(cliente_pacote_id) {
    const res = await this.#query(
      `UPDATE cliente_pacotes
       SET sessoes_usadas = sessoes_usadas + 1,
           status = CASE
             WHEN sessoes_usadas + 1 >= sessoes_total THEN 'Esgotado'
             ELSE status
           END
       WHERE id = $1 AND status = 'Ativo'
       RETURNING *`,
      [cliente_pacote_id]
    );
    return res.rows[0];
  }


  // ============================================================
  // 13. AGENDAMENTOS
  // ============================================================
  async selectAgendamentos(filtros = {}) {
    const { data, profissional_id, cliente_id, unidade_id, status } = filtros;
    let where = [];
    let params = [];
    let i = 1;

    if (data)            { where.push(`DATE(a.data_hora_inicio) = $${i++}`); params.push(data); }
    if (profissional_id) { where.push(`a.profissional_id = $${i++}`); params.push(profissional_id); }
    if (cliente_id)      { where.push(`a.cliente_id = $${i++}`); params.push(cliente_id); }
    if (unidade_id)      { where.push(`a.unidade_id = $${i++}`); params.push(unidade_id); }
    if (status)          { where.push(`a.status = $${i++}`); params.push(status); }

    const res = await this.#query(
      `SELECT
         a.*,
         c.nome as cliente_nome, c.telefone as cliente_telefone,
         p.nome as profissional_nome,
         u.nome as unidade_nome
       FROM agendamentos a
       LEFT JOIN clientes c ON a.cliente_id = c.id
       LEFT JOIN profissionais p ON a.profissional_id = p.id
       LEFT JOIN unidades u ON a.unidade_id = u.id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY a.data_hora_inicio ASC`,
      params
    );
    return res.rows;
  }

  async getAgendamentoById(id) {
    const res = await this.#query(
      `SELECT
         a.*,
         c.nome as cliente_nome, c.telefone as cliente_telefone,
         p.nome as profissional_nome,
         u.nome as unidade_nome
       FROM agendamentos a
       LEFT JOIN clientes c ON a.cliente_id = c.id
       LEFT JOIN profissionais p ON a.profissional_id = p.id
       LEFT JOIN unidades u ON a.unidade_id = u.id
       WHERE a.id = $1`,
      [id]
    );
    return res.rows[0];
  }

  async addAgendamento(dados) {
    const {
      unidade_id, cliente_id, profissional_id, user_id,
      cliente_pacote_id, data_hora_inicio, data_hora_fim,
      valor_total, desconto, gorjeta,
      data_retorno_recomendada, status,
      etiqueta_customizada, observacoes,
      recorrente, recorrencia_pai_id
    } = dados;

    const res = await this.#query(
      `INSERT INTO agendamentos (
         unidade_id, cliente_id, profissional_id, user_id,
         cliente_pacote_id, data_hora_inicio, data_hora_fim,
         valor_total, desconto, gorjeta,
         data_retorno_recomendada, status,
         etiqueta_customizada, observacoes,
         recorrente, recorrencia_pai_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        unidade_id, cliente_id, profissional_id, user_id,
        cliente_pacote_id, data_hora_inicio, data_hora_fim,
        valor_total || 0, desconto || 0, gorjeta || 0,
        data_retorno_recomendada, status || 'Agendado',
        etiqueta_customizada, observacoes,
        recorrente || false, recorrencia_pai_id
      ]
    );
    return res.rows[0];
  }

  async updateAgendamento(id, dados) {
    const {
      unidade_id, cliente_id, profissional_id,
      data_hora_inicio, data_hora_fim,
      valor_total, desconto, gorjeta,
      data_retorno_recomendada,
      etiqueta_customizada, observacoes
    } = dados;

    const res = await this.#query(
      `UPDATE agendamentos SET
         unidade_id = $1, cliente_id = $2, profissional_id = $3,
         data_hora_inicio = $4, data_hora_fim = $5,
         valor_total = $6, desconto = $7, gorjeta = $8,
         data_retorno_recomendada = $9,
         etiqueta_customizada = $10, observacoes = $11
       WHERE id = $12 RETURNING *`,
      [
        unidade_id, cliente_id, profissional_id,
        data_hora_inicio, data_hora_fim,
        valor_total, desconto, gorjeta,
        data_retorno_recomendada,
        etiqueta_customizada, observacoes, id
      ]
    );
    return res.rows[0];
  }

  async updateStatusAgendamento(id, status, motivo_cancelamento = null, user_id = null) {
    return await this.#transaction(async (client) => {
      // Atualiza o status
      const res = await client.query(
        `UPDATE agendamentos SET status = $1, motivo_cancelamento = $2
         WHERE id = $3 RETURNING *`,
        [status, motivo_cancelamento, id]
      );
      // Registra no histórico
      await client.query(
        `INSERT INTO agendamento_historico (agendamento_id, status_novo, user_id)
         VALUES ($1, $2, $3)`,
        [id, status, user_id]
      );
      return res.rows[0];
    });
  }

  // Agendamentos do dia com bloqueios (para a agenda visual)
  async getAgendaDia(data, unidade_id) {
    const agendamentos = await this.selectAgendamentos({ data, unidade_id });
    const bloqueios = await this.#query(
      `SELECT ab.*, p.nome as profissional_nome
       FROM agenda_bloqueios ab
       LEFT JOIN profissionais p ON ab.profissional_id = p.id
       WHERE DATE(ab.data_hora_inicio) = $1
         AND ab.unidade_id = $2`,
      [data, unidade_id]
    );
    return { agendamentos, bloqueios: bloqueios.rows };
  }

  // Próximos agendamentos de um cliente
  async getProximosAgendamentosCliente(cliente_id) {
    const res = await this.#query(
      `SELECT a.*, p.nome as profissional_nome, u.nome as unidade_nome
       FROM agendamentos a
       LEFT JOIN profissionais p ON a.profissional_id = p.id
       LEFT JOIN unidades u ON a.unidade_id = u.id
       WHERE a.cliente_id = $1
         AND a.data_hora_inicio >= NOW()
         AND a.status NOT IN ('Cancelado','Faltou')
       ORDER BY a.data_hora_inicio ASC`,
      [cliente_id]
    );
    return res.rows;
  }


  // ============================================================
  // 14. PROCEDIMENTOS DO AGENDAMENTO
  // ============================================================
  async addAgendamentoProcedimento(agendamento_id, procedimento_id, nome_snapshot, valor_snapshot, tempo_snapshot, desconto = 0) {
    const res = await this.#query(
      `INSERT INTO agendamento_procedimentos
         (agendamento_id, procedimento_id, nome_snapshot, valor_snapshot, tempo_snapshot, desconto)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [agendamento_id, procedimento_id, nome_snapshot, valor_snapshot, tempo_snapshot, desconto]
    );
    return res.rows[0];
  }

  async getProcedimentosAgendamento(agendamento_id) {
    const res = await this.#query(
      `SELECT ap.*, p.nome as procedimento_nome_atual
       FROM agendamento_procedimentos ap
       LEFT JOIN procedimentos p ON ap.procedimento_id = p.id
       WHERE ap.agendamento_id = $1`,
      [agendamento_id]
    );
    return res.rows;
  }


  // ============================================================
  // 15. FOTOS DO AGENDAMENTO
  // ============================================================
  async addFotoAgendamento(agendamento_id, cliente_id, tipo, url, descricao, criado_por) {
    const res = await this.#query(
      `INSERT INTO agendamento_fotos (agendamento_id, cliente_id, tipo, url, descricao, criado_por)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [agendamento_id, cliente_id, tipo, url, descricao, criado_por]
    );
    return res.rows[0];
  }

  async getFotosAgendamento(agendamento_id) {
    const res = await this.#query(
      'SELECT * FROM agendamento_fotos WHERE agendamento_id = $1 ORDER BY tipo, criado_em ASC',
      [agendamento_id]
    );
    return res.rows;
  }

  async getFotosCliente(cliente_id) {
    const res = await this.#query(
      `SELECT af.*, a.data_hora_inicio
       FROM agendamento_fotos af
       JOIN agendamentos a ON af.agendamento_id = a.id
       WHERE af.cliente_id = $1
       ORDER BY a.data_hora_inicio DESC`,
      [cliente_id]
    );
    return res.rows;
  }


  // ============================================================
  // 16. BLOQUEIOS DE AGENDA
  // ============================================================
  async addBloqueio(profissional_id, unidade_id, data_hora_inicio, data_hora_fim, motivo, criado_por) {
    const res = await this.#query(
      `INSERT INTO agenda_bloqueios
         (profissional_id, unidade_id, data_hora_inicio, data_hora_fim, motivo, criado_por)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [profissional_id, unidade_id, data_hora_inicio, data_hora_fim, motivo, criado_por]
    );
    return res.rows[0];
  }


  // ============================================================
  // 17. CURSOS
  // ============================================================
  async selectCursos(apenasAtivos = true) {
    const res = await this.#query(
      `SELECT c.*,
         COALESCE(json_agg(DISTINCT jsonb_build_object('id', p.id, 'nome', p.nome))
           FILTER (WHERE p.id IS NOT NULL), '[]') as profissionais
       FROM cursos c
       LEFT JOIN curso_profissionais cp ON cp.curso_id = c.id
       LEFT JOIN profissionais p ON cp.profissional_id = p.id
       ${apenasAtivos ? 'WHERE c.ativo = TRUE' : ''}
       GROUP BY c.id
       ORDER BY c.nome ASC`
    );
    return res.rows;
  }

  async addCurso(nome, descricao, categoria_id, duracao_horas, valor, vagas_max) {
    const res = await this.#query(
      `INSERT INTO cursos (nome, descricao, categoria_id, duracao_horas, valor, vagas_max)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nome, descricao, categoria_id, duracao_horas, valor, vagas_max]
    );
    return res.rows[0];
  }

  async updateCurso(id, nome, descricao, categoria_id, duracao_horas, valor, vagas_max, ativo) {
    const res = await this.#query(
      `UPDATE cursos SET nome = $1, descricao = $2, categoria_id = $3,
         duracao_horas = $4, valor = $5, vagas_max = $6, ativo = $7
       WHERE id = $8 RETURNING *`,
      [nome, descricao, categoria_id, duracao_horas, valor, vagas_max, ativo, id]
    );
    return res.rows[0];
  }

  async addProfissionalCurso(curso_id, profissional_id) {
    const res = await this.#query(
      `INSERT INTO curso_profissionais (curso_id, profissional_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
      [curso_id, profissional_id]
    );
    return res.rows[0];
  }

  async addAgendamentoCurso(dados) {
    const { curso_id, cliente_id, profissional_id, unidade_id, data_hora_inicio, data_hora_fim, valor_cobrado, descricao_cafe, observacoes } = dados;
    const res = await this.#query(
      `INSERT INTO agendamento_curso
         (curso_id, cliente_id, profissional_id, unidade_id,
          data_hora_inicio, data_hora_fim, valor_cobrado, descricao_cafe, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [curso_id, cliente_id, profissional_id, unidade_id, data_hora_inicio, data_hora_fim, valor_cobrado, descricao_cafe, observacoes]
    );
    return res.rows[0];
  }

  async updateAgendamentoCurso(id, dados) {
    const { curso_id, cliente_id, profissional_id, unidade_id, data_hora_inicio, data_hora_fim, valor_cobrado, status, descricao_cafe, observacoes } = dados;
    const res = await this.#query(
      `UPDATE agendamento_curso SET
         curso_id=$1, cliente_id=$2, profissional_id=$3, unidade_id=$4,
         data_hora_inicio=$5, data_hora_fim=$6, valor_cobrado=$7,
         status=$8, descricao_cafe=$9, observacoes=$10
       WHERE id=$11 RETURNING *`,
      [curso_id, cliente_id, profissional_id, unidade_id, data_hora_inicio, data_hora_fim, valor_cobrado, status, descricao_cafe, observacoes, id]
    );
    return res.rows[0];
  }


  // ============================================================
  // 18. ESTOQUE
  // ============================================================
  async selectEstoque(apenasAtivos = true) {
    const res = await this.#query(
      `SELECT e.*, c.nome as categoria_nome
       FROM estoque e
       LEFT JOIN categorias c ON e.categoria_id = c.id
       ${apenasAtivos ? 'WHERE e.ativo = TRUE' : ''}
       ORDER BY e.nome ASC`
    );
    return res.rows;
  }

  async getEstoqueBaixo() {
    const res = await this.#query(
      `SELECT e.*, c.nome as categoria_nome
       FROM estoque e
       LEFT JOIN categorias c ON e.categoria_id = c.id
       WHERE e.ativo = TRUE AND e.quantidade <= e.quantidade_minima
       ORDER BY e.quantidade ASC`
    );
    return res.rows;
  }

  async getEstoqueVencendo(dias = 30) {
    const res = await this.#query(
      `SELECT * FROM estoque
       WHERE ativo = TRUE
         AND data_validade IS NOT NULL
         AND data_validade <= CURRENT_DATE + INTERVAL '1 day' * $1
       ORDER BY data_validade ASC`,
      [dias]
    );
    return res.rows;
  }

  async addEstoque(nome, descricao, categoria_id, unidade_medida, quantidade, quantidade_minima, preco_custo, preco_venda, codigo_barras, lote, data_validade) {
    const res = await this.#query(
      `INSERT INTO estoque
         (nome, descricao, categoria_id, unidade_medida, quantidade, quantidade_minima,
          preco_custo, preco_venda, codigo_barras, lote, data_validade)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [nome, descricao, categoria_id, unidade_medida, quantidade, quantidade_minima, preco_custo, preco_venda, codigo_barras, lote, data_validade]
    );
    return res.rows[0];
  }

  async updateEstoque(id, nome, descricao, categoria_id, unidade_medida, quantidade_minima, preco_custo, preco_venda, lote, data_validade, ativo) {
    const res = await this.#query(
      `UPDATE estoque SET nome=$1, descricao=$2, categoria_id=$3, unidade_medida=$4,
         quantidade_minima=$5, preco_custo=$6, preco_venda=$7,
         lote=$8, data_validade=$9, ativo=$10
       WHERE id=$11 RETURNING *`,
      [nome, descricao, categoria_id, unidade_medida, quantidade_minima, preco_custo, preco_venda, lote, data_validade, ativo, id]
    );
    return res.rows[0];
  }

  // Entrada de reposição de estoque
  async reporEstoque(estoque_id, quantidade, user_id, observacao = null) {
    return await this.#transaction(async (client) => {
      await client.query(
        'UPDATE estoque SET quantidade = quantidade + $1 WHERE id = $2',
        [quantidade, estoque_id]
      );
      const mov = await client.query(
        `INSERT INTO movimentacoes_estoque (estoque_id, tipo, quantidade, motivo, user_id, observacao)
         VALUES ($1, 'Entrada', $2, 'Reposição', $3, $4) RETURNING *`,
        [estoque_id, quantidade, user_id, observacao]
      );
      return mov.rows[0];
    });
  }

  async getMovimentacoesEstoque(estoque_id) {
    const res = await this.#query(
      `SELECT m.*, u.nome as user_nome
       FROM movimentacoes_estoque m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.estoque_id = $1
       ORDER BY m.criado_em DESC`,
      [estoque_id]
    );
    return res.rows;
  }


  // ============================================================
  // 19. VENDAS
  // ============================================================
  async selectVendas(filtros = {}) {
    const { cliente_id, unidade_id, data_inicio, data_fim } = filtros;
    let where = [];
    let params = [];
    let i = 1;

    if (cliente_id)  { where.push(`v.cliente_id = $${i++}`); params.push(cliente_id); }
    if (unidade_id)  { where.push(`v.unidade_id = $${i++}`); params.push(unidade_id); }
    if (data_inicio) { where.push(`v.data_venda >= $${i++}`); params.push(data_inicio); }
    if (data_fim)    { where.push(`v.data_venda <= $${i++}`); params.push(data_fim); }

    const res = await this.#query(
      `SELECT v.*, c.nome as cliente_nome, u.nome as unidade_nome
       FROM vendas v
       LEFT JOIN clientes c ON v.cliente_id = c.id
       LEFT JOIN unidades u ON v.unidade_id = u.id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY v.data_venda DESC`,
      params
    );
    return res.rows;
  }

  async addVenda(dados, itens) {
    return await this.#transaction(async (client) => {
      const { cliente_id, agendamento_id, unidade_id, user_id, valor_total, desconto, valor_final, observacoes } = dados;

      // Cria a venda
      const venda = await client.query(
        `INSERT INTO vendas (cliente_id, agendamento_id, unidade_id, user_id, valor_total, desconto, valor_final, observacoes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [cliente_id, agendamento_id, unidade_id, user_id, valor_total, desconto, valor_final, observacoes]
      );
      const venda_id = venda.rows[0].id;

      // Insere os itens e baixa o estoque
      for (const item of itens) {
        await client.query(
          `INSERT INTO venda_itens (venda_id, estoque_id, nome_snapshot, quantidade, preco_unit, desconto, subtotal)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [venda_id, item.estoque_id, item.nome_snapshot, item.quantidade, item.preco_unit, item.desconto || 0, item.subtotal]
        );
        await client.query(
          'UPDATE estoque SET quantidade = quantidade - $1 WHERE id = $2',
          [item.quantidade, item.estoque_id]
        );
        await client.query(
          `INSERT INTO movimentacoes_estoque (estoque_id, tipo, quantidade, motivo, venda_id, user_id)
           VALUES ($1, 'Saída', $2, 'Venda', $3, $4)`,
          [item.estoque_id, item.quantidade, venda_id, user_id]
        );
      }

      return venda.rows[0];
    });
  }


  // ============================================================
  // 20. CAIXA
  // ============================================================
  async selectCaixas() {
    const res = await this.#query(
      `SELECT c.*, u.nome as unidade_nome,
         ua.nome as user_abertura_nome, uf.nome as user_fechamento_nome
       FROM caixa c
       JOIN unidades u ON c.unidade_id = u.id
       LEFT JOIN users ua ON c.user_abertura = ua.id
       LEFT JOIN users uf ON c.user_fechamento = uf.id
       ORDER BY c.data_abertura DESC`
    );
    return res.rows;
  }

  async getCaixaAberto(unidade_id) {
    const res = await this.#query(
      `SELECT * FROM caixa WHERE unidade_id = $1 AND status = 'Aberto' LIMIT 1`,
      [unidade_id]
    );
    return res.rows[0];
  }

  async abrirCaixa(unidade_id, valor_inicial, user_id) {
    const res = await this.#query(
      `INSERT INTO caixa (unidade_id, valor_inicial, status, user_abertura)
       VALUES ($1, $2, 'Aberto', $3) RETURNING *`,
      [unidade_id, valor_inicial, user_id]
    );
    return res.rows[0];
  }

  async fecharCaixa(id, valor_final, user_id, observacoes) {
    const res = await this.#query(
      `UPDATE caixa SET valor_final = $1, status = 'Fechado',
         data_fechamento = CURRENT_TIMESTAMP, user_fechamento = $2, observacoes = $3
       WHERE id = $4 RETURNING *`,
      [valor_final, user_id, observacoes, id]
    );
    return res.rows[0];
  }


  // ============================================================
  // 21. MOVIMENTAÇÕES DE CAIXA
  // ============================================================
  async selectMovimentacoes(caixa_id) {
    const res = await this.#query(
      `SELECT m.*, u.nome as user_nome
       FROM movimentacoes_caixa m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.caixa_id = $1
       ORDER BY m.data_movimentacao ASC`,
      [caixa_id]
    );
    return res.rows;
  }

  async addMovimentacao(caixa_id, tipo, origem, forma_pagamento, valor, descricao, user_id, refs = {}) {
    const { agendamento_id, venda_id, agendamento_curso_id } = refs;
    const res = await this.#query(
      `INSERT INTO movimentacoes_caixa
         (caixa_id, tipo, origem, forma_pagamento, valor, descricao,
          agendamento_id, venda_id, agendamento_curso_id, user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [caixa_id, tipo, origem, forma_pagamento, valor, descricao, agendamento_id, venda_id, agendamento_curso_id, user_id]
    );
    return res.rows[0];
  }


  // ============================================================
  // 22. PAGAMENTOS
  // ============================================================
  async addPagamento(dados) {
    return await this.#transaction(async (client) => {
      const {
        agendamento_id, venda_id, caixa_id, unidade_id, cliente_id,
        forma_pagamento, bandeira, nsu, autorizacao, maquininha,
        parcelas, com_juros, valor_parcela,
        chave_pix, txid_pix,
        valor, registrado_por, observacoes
      } = dados;

      const pag = await client.query(
        `INSERT INTO pagamentos (
           agendamento_id, venda_id, caixa_id, unidade_id, cliente_id,
           forma_pagamento, bandeira, nsu, autorizacao, maquininha,
           parcelas, com_juros, valor_parcela,
           chave_pix, txid_pix,
           valor, registrado_por, observacoes
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         RETURNING *`,
        [
          agendamento_id, venda_id, caixa_id, unidade_id, cliente_id,
          forma_pagamento, bandeira, nsu, autorizacao, maquininha,
          parcelas || 1, com_juros || false, valor_parcela,
          chave_pix, txid_pix,
          valor, registrado_por, observacoes
        ]
      );
      const pagamento_id = pag.rows[0].id;

      // Gera as parcelas se for crédito parcelado
      if (forma_pagamento === 'Cartão Crédito' && parcelas > 1) {
        for (let n = 1; n <= parcelas; n++) {
          const data_prevista = new Date();
          data_prevista.setMonth(data_prevista.getMonth() + (n - 1));
          await client.query(
            `INSERT INTO pagamento_parcelas (pagamento_id, numero_parcela, valor, data_prevista)
             VALUES ($1, $2, $3, $4)`,
            [pagamento_id, n, valor_parcela, data_prevista.toISOString().split('T')[0]]
          );
        }
      }

      return pag.rows[0];
    });
  }

  async estornarPagamento(id, motivo, user_id) {
    const res = await this.#query(
      `UPDATE pagamentos SET status = 'Estornado', motivo_estorno = $1,
         data_estorno = CURRENT_TIMESTAMP, estornado_por = $2
       WHERE id = $3 RETURNING *`,
      [motivo, user_id, id]
    );
    return res.rows[0];
  }

  async getPagamentosAgendamento(agendamento_id) {
    const res = await this.#query(
      'SELECT * FROM pagamentos WHERE agendamento_id = $1 ORDER BY data_pagamento ASC',
      [agendamento_id]
    );
    return res.rows;
  }


  // ============================================================
  // 23. CRÉDITOS DO CLIENTE
  // ============================================================
  async addCredito(cliente_id, tipo, origem, valor, agendamento_id, pagamento_id, user_id, observacao) {
    return await this.#transaction(async (client) => {
      // Busca saldo atual
      const clienteRes = await client.query(
        'SELECT saldo_credito FROM clientes WHERE id = $1 FOR UPDATE',
        [cliente_id]
      );
      const saldo_anterior = parseFloat(clienteRes.rows[0].saldo_credito);
      const saldo_posterior = tipo === 'Crédito'
        ? saldo_anterior + parseFloat(valor)
        : saldo_anterior - parseFloat(valor);

      if (saldo_posterior < 0) throw new Error('Saldo insuficiente');

      // Atualiza saldo
      await client.query(
        'UPDATE clientes SET saldo_credito = $1 WHERE id = $2',
        [saldo_posterior, cliente_id]
      );

      // Registra movimentação
      const mov = await client.query(
        `INSERT INTO cliente_creditos
           (cliente_id, tipo, origem, valor, saldo_anterior, saldo_posterior,
            agendamento_id, pagamento_id, user_id, observacao)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [cliente_id, tipo, origem, valor, saldo_anterior, saldo_posterior, agendamento_id, pagamento_id, user_id, observacao]
      );
      return mov.rows[0];
    });
  }

  async getHistoricoCreditos(cliente_id) {
    const res = await this.#query(
      'SELECT * FROM cliente_creditos WHERE cliente_id = $1 ORDER BY criado_em DESC',
      [cliente_id]
    );
    return res.rows;
  }


  // ============================================================
  // 24. RELATÓRIOS
  // ============================================================

  // Faturamento por forma de pagamento (com filtro por bandeira, data, unidade)
  async relatorioFaturamentoPagamentos(filtros = {}) {
    const { data_inicio, data_fim, unidade_id, forma_pagamento, bandeira } = filtros;
    let where = [`p.status = 'Confirmado'`];
    let params = [];
    let i = 1;

    if (data_inicio)      { where.push(`p.data_pagamento >= $${i++}`); params.push(data_inicio); }
    if (data_fim)         { where.push(`p.data_pagamento <= $${i++}`); params.push(data_fim); }
    if (unidade_id)       { where.push(`p.unidade_id = $${i++}`); params.push(unidade_id); }
    if (forma_pagamento)  { where.push(`p.forma_pagamento = $${i++}`); params.push(forma_pagamento); }
    if (bandeira)         { where.push(`p.bandeira = $${i++}`); params.push(bandeira); }

    const res = await this.#query(
      `SELECT
         p.forma_pagamento, p.bandeira,
         COUNT(*) as total_transacoes,
         SUM(p.valor) as total_valor
       FROM pagamentos p
       WHERE ${where.join(' AND ')}
       GROUP BY p.forma_pagamento, p.bandeira
       ORDER BY total_valor DESC`,
      params
    );
    return res.rows;
  }

  // Faturamento por profissional no período
  async relatorioFaturamentoProfissional(mes, ano, unidade_id = null) {
    const res = await this.#query(
      `SELECT
         p.id, p.nome,
         COUNT(a.id) as total_atendimentos,
         SUM(a.valor_final) as total_faturado,
         COALESCE(SUM(cg.valor_comissao), 0) as total_comissao
       FROM profissionais p
       LEFT JOIN agendamentos a ON a.profissional_id = p.id
         AND EXTRACT(MONTH FROM a.data_hora_inicio) = $1
         AND EXTRACT(YEAR FROM a.data_hora_inicio) = $2
         AND a.status = 'Pago'
         ${unidade_id ? 'AND a.unidade_id = $3' : ''}
       LEFT JOIN comissoes_geradas cg ON cg.agendamento_id = a.id
       WHERE p.ativo = TRUE
       GROUP BY p.id, p.nome
       ORDER BY total_faturado DESC NULLS LAST`,
      unidade_id ? [mes, ano, unidade_id] : [mes, ano]
    );
    return res.rows;
  }

  // Agendamentos que foram finalizados mas não pagos
  async agendamentosNaoPagos() {
    const res = await this.#query(
      `SELECT a.*, c.nome as cliente_nome, c.telefone as cliente_telefone,
         p.nome as profissional_nome
       FROM agendamentos a
       JOIN clientes c ON a.cliente_id = c.id
       JOIN profissionais p ON a.profissional_id = p.id
       WHERE a.status = 'Finalizado'
       ORDER BY a.data_hora_inicio ASC`
    );
    return res.rows;
  }

  // Taxa de faltas por profissional
  async relatorioFaltas(mes, ano) {
    const res = await this.#query(
      `SELECT
         p.nome,
         COUNT(*) FILTER (WHERE a.status = 'Faltou') as faltas,
         COUNT(*) FILTER (WHERE a.status = 'Cancelado') as cancelamentos,
         COUNT(*) as total_agendamentos
       FROM profissionais p
       LEFT JOIN agendamentos a ON a.profissional_id = p.id
         AND EXTRACT(MONTH FROM a.data_hora_inicio) = $1
         AND EXTRACT(YEAR FROM a.data_hora_inicio) = $2
       WHERE p.ativo = TRUE
       GROUP BY p.id, p.nome
       ORDER BY faltas DESC`,
      [mes, ano]
    );
    return res.rows;
  }


  // ============================================================
  // 25. AUDIT LOG
  // ============================================================
  async addLog(user_id, acao, tabela, registro_id, dados_antes, dados_depois, ip) {
    await this.#query(
      `INSERT INTO audit_log (user_id, acao, tabela, registro_id, dados_antes, dados_depois, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user_id, acao, tabela, registro_id, dados_antes, dados_depois, ip]
    );
  }


  // ============================================================
  // 26. DELETE GENÉRICO (com whitelist de segurança)
  // ============================================================
  async deleteById(tabela, id) {
    if (!TABELAS_PERMITIDAS.has(tabela)) {
      throw new Error(`Tabela '${tabela}' não permitida para deleção`);
    }
    const res = await this.#query(`DELETE FROM ${tabela} WHERE id = $1`, [id]);
    return res.rowCount;
  }
}

module.exports = new Database();