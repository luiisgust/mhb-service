require('dotenv').config();
const { Pool } = require('pg');

class Database {
  #connection;

  constructor() {
    this.#connection = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  // --- CRUD UNIDADES ---

  async selectUnidades() {
    const query = await this.#connection.query('SELECT * FROM unidades ORDER BY id ASC');
    return query.rows;
  }

  async selectUnidadeId(id) {
    const query = await this.#connection.query('SELECT * FROM unidades WHERE id = $1', [id]);
    return query.rows[0];
  }

  async addUnidade(localidade, nome) {
    const sql = 'INSERT INTO unidades (localidade, nome) VALUES ($1) RETURNING *';
    const query = await this.#connection.query(sql, [localidade, nome]);
    return query.rows[0];
  }

  async deleteUnidade(id) {
    const sql = 'DELETE FROM unidades WHERE id = $1';
    const query = await this.#connection.query(sql, [id]);
    return query.rowCount; // Retorna quantas linhas foram deletadas
  }

  async updateUnidade(id, localidade, nome) {
    const sql = 'UPDATE unidades SET localidade = $1, nome = $2 WHERE id = $3 RETURNING *';
    const query = await this.#connection.query(sql, [localidade, nome, id]);
    return query.rows[0];
  }
}

module.exports = new Database(); // Já exporta a instância pronta