const express = require('express');
const app = express()
const consign = require('consign')
const path = require('path')
const cors = require('cors')

app.use(cors())

consign()
    .include('src/controllers')
    .into(app)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Servidor Online na porta ${PORT}`))

module.exports = app