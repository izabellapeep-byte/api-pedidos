const AppError = require('../errors/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Erros esperados (validação, não encontrado)
  if (err instanceof AppError) {
    const corpo = { erro: err.message };
    if (err.detalhes) corpo.detalhes = err.detalhes;
    return res.status(err.status).json(corpo);
  }

  // JSON malformado enviado pelo cliente
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }

  // Qualquer outra coisa é erro inesperado: não vazar detalhes internos
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = errorHandler;
