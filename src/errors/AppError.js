// Erro "esperado" da aplicação (validação, não encontrado etc.).
// Qualquer outro tipo de erro é tratado como erro inesperado (HTTP 500).
class AppError extends Error {
  constructor(status, message, detalhes) {
    super(message);
    this.status = status;
    this.detalhes = detalhes;
  }
}

module.exports = AppError;
