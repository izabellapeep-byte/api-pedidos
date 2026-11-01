const express = require('express');
const pedidosRoutes = require('./routes/pedidos.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use('/pedidos', pedidosRoutes);

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use(errorHandler);

module.exports = app;
