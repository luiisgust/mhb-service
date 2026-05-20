require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const app     = express();

// ============================================================
// MIDDLEWARES GLOBAIS
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ============================================================
// CONTROLLERS
// Ordem importa: auth primeiro, pois os demais podem usar
// o authMiddleware exportado pelo authModel
// ============================================================
const controllers = [
    require('./src/controllers/authController'),
    require('./src/controllers/unidadesController'),
    require('./src/controllers/catalogoController'),
    require('./src/controllers/equipeController'),
    require('./src/controllers/clientesController'),
    require('./src/controllers/agendaController'),
    require('./src/controllers/financeiroController'),
    require('./src/controllers/estoqueController'),
    require('./src/controllers/cursosController'),
];

controllers.forEach(controller => controller(app));


// ============================================================
// ROTA RAIZ — health check geral
// ============================================================
app.get('/', (req, res) => {
    res.json({
        sistema:  'Clínica de Estética — API',
        status:   'online',
        versao:   '1.0.0',
        database: 'PostgreSQL / Supabase'
    });
});


// ============================================================
// TRATAMENTO DE ROTA NÃO ENCONTRADA (404)
// ============================================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        msg: `Rota '${req.method} ${req.originalUrl}' não encontrada.`
    });
});


// ============================================================
// TRATAMENTO DE ERROS GLOBAIS (500)
// Captura qualquer erro não tratado nos controllers
// ============================================================
app.use((err, req, res, next) => {
    console.error('❌ Erro não tratado:', err.message);
    res.status(500).json({
        success: false,
        msg: 'Erro interno no servidor.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


// ============================================================
// INICIALIZAÇÃO
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('============================================');
    console.log(`✅ Servidor online na porta ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log('============================================');
});

module.exports = app;