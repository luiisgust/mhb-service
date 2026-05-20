const db = require('../../repository/database.js');

// ============================================================
// ENTIDADE — CATEGORIA
// ============================================================
class Categoria {
    #id; #nome; #tipo;

    constructor(r) {
        this.#id   = r.id;
        this.#nome = r.nome;
        this.#tipo = r.tipo;
    }

    toJSON() {
        return {
            id:   this.#id,
            nome: this.#nome,
            tipo: this.#tipo
        };
    }
}

// ============================================================
// ENTIDADE — PROCEDIMENTO
// ============================================================
class Procedimento {
    #id; #nome; #descricao; #categoria_id; #categoria_nome;
    #tempo_min; #valor; #retorno_dias; #ativo;

    constructor(r) {
        this.#id             = r.id;
        this.#nome           = r.nome;
        this.#descricao      = r.descricao;
        this.#categoria_id   = r.categoria_id;
        this.#categoria_nome = r.categoria_nome;
        this.#tempo_min      = r.tempo_min;
        this.#valor          = r.valor;
        this.#retorno_dias   = r.retorno_dias;
        this.#ativo          = r.ativo;
    }

    toJSON() {
        return {
            id:             this.#id,
            nome:           this.#nome,
            descricao:      this.#descricao,
            categoria_id:   this.#categoria_id,
            categoria_nome: this.#categoria_nome,
            tempo_min:      this.#tempo_min,
            valor:          this.#valor,
            retorno_dias:   this.#retorno_dias,
            ativo:          this.#ativo
        };
    }
}

// ============================================================
// ENTIDADE — PACOTE
// ============================================================
class Pacote {
    #id; #nome; #descricao; #procedimento_id; #procedimento_nome;
    #total_sessoes; #valor; #validade_dias; #ativo; #criado_em;

    constructor(r) {
        this.#id               = r.id;
        this.#nome             = r.nome;
        this.#descricao        = r.descricao;
        this.#procedimento_id  = r.procedimento_id;
        this.#procedimento_nome = r.procedimento_nome;
        this.#total_sessoes    = r.total_sessoes;
        this.#valor            = r.valor;
        this.#validade_dias    = r.validade_dias;
        this.#ativo            = r.ativo;
        this.#criado_em        = r.criado_em;
    }

    toJSON() {
        return {
            id:               this.#id,
            nome:             this.#nome,
            descricao:        this.#descricao,
            procedimento_id:  this.#procedimento_id,
            procedimento_nome: this.#procedimento_nome,
            total_sessoes:    this.#total_sessoes,
            valor:            this.#valor,
            validade_dias:    this.#validade_dias,
            ativo:            this.#ativo,
            criado_em:        this.#criado_em
        };
    }
}

// ============================================================
// ENTIDADE — PACOTE DO CLIENTE
// ============================================================
class ClientePacote {
    #id; #cliente_id; #pacote_id; #pacote_nome; #procedimento_nome;
    #unidade_id; #sessoes_total; #sessoes_usadas; #sessoes_restantes;
    #valor_pago; #data_compra; #data_validade; #status; #observacoes;

    constructor(r) {
        this.#id               = r.id;
        this.#cliente_id       = r.cliente_id;
        this.#pacote_id        = r.pacote_id;
        this.#pacote_nome      = r.pacote_nome;
        this.#procedimento_nome = r.procedimento_nome;
        this.#unidade_id       = r.unidade_id;
        this.#sessoes_total    = r.sessoes_total;
        this.#sessoes_usadas   = r.sessoes_usadas;
        this.#sessoes_restantes = r.sessoes_restantes;
        this.#valor_pago       = r.valor_pago;
        this.#data_compra      = r.data_compra;
        this.#data_validade    = r.data_validade;
        this.#status           = r.status;
        this.#observacoes      = r.observacoes;
    }

    toJSON() {
        return {
            id:               this.#id,
            cliente_id:       this.#cliente_id,
            pacote_id:        this.#pacote_id,
            pacote_nome:      this.#pacote_nome,
            procedimento_nome: this.#procedimento_nome,
            unidade_id:       this.#unidade_id,
            sessoes_total:    this.#sessoes_total,
            sessoes_usadas:   this.#sessoes_usadas,
            sessoes_restantes: this.#sessoes_restantes,
            valor_pago:       this.#valor_pago,
            data_compra:      this.#data_compra,
            data_validade:    this.#data_validade,
            status:           this.#status,
            observacoes:      this.#observacoes
        };
    }
}


// ============================================================
// DAO — CATEGORIAS
// ============================================================
class CategoriaDAO {

    async consultarTodos(tipo = null) {
        const rows = await db.selectCategorias(tipo);
        return rows.map(r => new Categoria(r).toJSON());
    }

    async cadastrar(nome, tipo) {
        if (!nome) throw new Error('O campo nome é obrigatório.');
        if (!tipo) throw new Error('O campo tipo é obrigatório.');

        const row = await db.addCategoria(nome, tipo);
        return row ? new Categoria(row).toJSON() : null;
    }

    async atualizar(id, nome, tipo) {
        if (!nome) throw new Error('O campo nome é obrigatório.');
        if (!tipo) throw new Error('O campo tipo é obrigatório.');

        const row = await db.updateCategoria(id, nome, tipo);
        return row ? new Categoria(row).toJSON() : null;
    }

    async excluir(id) {
        return await db.deleteById('categorias', id);
    }
}


// ============================================================
// DAO — PROCEDIMENTOS
// ============================================================
class ProcedimentoDAO {

    async consultarTodos(apenasAtivos = true) {
        const rows = await db.selectProcedimentos(apenasAtivos);
        return rows.map(r => new Procedimento(r).toJSON());
    }

    async consultarUm(id) {
        const row = await db.getProcedimentoById(id);
        return row ? new Procedimento(row).toJSON() : null;
    }

    async cadastrar(dados) {
        const { nome, descricao, categoria_id, tempo_min, valor, retorno_dias } = dados;

        if (!nome)   throw new Error('O campo nome é obrigatório.');
        if (!valor && valor !== 0) throw new Error('O campo valor é obrigatório.');
        if (valor < 0)  throw new Error('O valor não pode ser negativo.');
        if (tempo_min <= 0) throw new Error('O tempo deve ser maior que zero.');

        const row = await db.addProcedimento(nome, descricao, categoria_id, tempo_min || 30, valor, retorno_dias);
        return row ? new Procedimento(row).toJSON() : null;
    }

    async atualizar(id, dados) {
        const { nome, descricao, categoria_id, tempo_min, valor, retorno_dias, ativo } = dados;

        if (!nome)  throw new Error('O campo nome é obrigatório.');
        if (valor < 0) throw new Error('O valor não pode ser negativo.');

        const row = await db.updateProcedimento(id, nome, descricao, categoria_id, tempo_min, valor, retorno_dias, ativo);
        return row ? new Procedimento(row).toJSON() : null;
    }

    async excluir(id) {
        return await db.deleteById('procedimentos', id);
    }
}


// ============================================================
// DAO — PACOTES
// ============================================================
class PacoteDAO {

    async consultarTodos(apenasAtivos = true) {
        const rows = await db.selectPacotes(apenasAtivos);
        return rows.map(r => new Pacote(r).toJSON());
    }

    async cadastrar(dados) {
        const { nome, descricao, procedimento_id, total_sessoes, valor, validade_dias } = dados;

        if (!nome)          throw new Error('O campo nome é obrigatório.');
        if (!total_sessoes) throw new Error('O total de sessões é obrigatório.');
        if (total_sessoes <= 0) throw new Error('O total de sessões deve ser maior que zero.');
        if (valor < 0)      throw new Error('O valor não pode ser negativo.');

        const row = await db.addPacote(nome, descricao, procedimento_id, total_sessoes, valor, validade_dias);
        return row ? new Pacote(row).toJSON() : null;
    }

    async atualizar(id, dados) {
        const { nome, descricao, procedimento_id, total_sessoes, valor, validade_dias, ativo } = dados;

        if (!nome) throw new Error('O campo nome é obrigatório.');

        const row = await db.updatePacote(id, nome, descricao, procedimento_id, total_sessoes, valor, validade_dias, ativo);
        return row ? new Pacote(row).toJSON() : null;
    }

    // Pacotes de um cliente específico
    async consultarDoCliente(cliente_id) {
        const rows = await db.getClientePacotes(cliente_id);
        return rows.map(r => new ClientePacote(r).toJSON());
    }

    async adquirir(dados) {
        const { cliente_id, pacote_id, unidade_id, sessoes_total, valor_pago, data_validade } = dados;

        if (!cliente_id)   throw new Error('A cliente é obrigatória.');
        if (!pacote_id)    throw new Error('O pacote é obrigatório.');
        if (!sessoes_total || sessoes_total <= 0) throw new Error('O total de sessões deve ser maior que zero.');
        if (!valor_pago || valor_pago < 0) throw new Error('O valor pago é obrigatório.');

        const row = await db.addClientePacote(cliente_id, pacote_id, unidade_id, sessoes_total, valor_pago, data_validade);
        return row ? new ClientePacote(row).toJSON() : null;
    }

    async usarSessao(cliente_pacote_id) {
        if (!cliente_pacote_id) throw new Error('O pacote da cliente é obrigatório.');

        const row = await db.usarSessaoPacote(cliente_pacote_id);
        if (!row) throw new Error('Pacote não encontrado ou não está ativo.');
        return new ClientePacote(row).toJSON();
    }

    async excluir(id) {
        return await db.deleteById('pacotes', id);
    }
}


// ============================================================
// EXPORTS
// ============================================================
module.exports = {
    CategoriaDAO:   new CategoriaDAO(),
    ProcedimentoDAO: new ProcedimentoDAO(),
    PacoteDAO:      new PacoteDAO()
};