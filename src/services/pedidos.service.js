const AppError = require('../errors/AppError');

// ---- Regras de negócio (documentadas no README) ----
const TIPOS = ['entrega', 'retirada'];
const PRIORIDADES = ['baixa', 'normal', 'alta'];
const STATUS = ['recebido', 'em_preparacao', 'enviado', 'entregue', 'cancelado'];

// Transições permitidas: status atual -> próximos status possíveis
const TRANSICOES = {
  recebido: ['em_preparacao', 'cancelado'],
  em_preparacao: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: [],
};

// ---- Armazenamento em memória ----
let pedidos = [];
let proximoId = 1;

function resetar() {
  pedidos = [];
  proximoId = 1;
}

function validarNovoPedido(dados) {
  const erros = [];
  const { cliente, tipo, valor, prioridade } = dados;

  if (typeof cliente !== 'string' || cliente.trim() === '') {
    erros.push('cliente é obrigatório e deve ser um texto não vazio');
  }
  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) {
    erros.push('valor deve ser um número maior que zero');
  }
  if (!TIPOS.includes(tipo)) {
    erros.push(`tipo inválido. Valores aceitos: ${TIPOS.join(', ')}`);
  }
  if (!PRIORIDADES.includes(prioridade)) {
    erros.push(`prioridade inválida. Valores aceitos: ${PRIORIDADES.join(', ')}`);
  }

  if (erros.length > 0) {
    throw new AppError(400, 'Dados inválidos', erros);
  }
}

function criar(dados) {
  const corpo = dados && typeof dados === 'object' ? dados : {};
  validarNovoPedido(corpo);

  const pedido = {
    id: proximoId++,
    cliente: corpo.cliente.trim(),
    tipo: corpo.tipo,
    valor: corpo.valor,
    prioridade: corpo.prioridade,
    status: 'recebido',
  };
  pedidos.push(pedido);
  return pedido;
}

function listar() {
  return pedidos;
}

function buscarPorId(id) {
  // IDs não numéricos (ex.: "abc", "1.5") nunca existem -> 404
  const pedido = /^\d+$/.test(String(id))
    ? pedidos.find((p) => p.id === Number(id))
    : undefined;

  if (!pedido) {
    throw new AppError(404, 'Pedido não encontrado');
  }
  return pedido;
}

function atualizarStatus(id, dados) {
  const pedido = buscarPorId(id); // 404 se não existir
  const novoStatus = dados && typeof dados === 'object' ? dados.status : undefined;

  if (!STATUS.includes(novoStatus)) {
    throw new AppError(400, 'Dados inválidos', [
      `status inválido. Valores aceitos: ${STATUS.join(', ')}`,
    ]);
  }

  if (!TRANSICOES[pedido.status].includes(novoStatus)) {
    const permitidos = TRANSICOES[pedido.status];
    throw new AppError(400, 'Transição de status não permitida', [
      `não é possível mudar de "${pedido.status}" para "${novoStatus}". ` +
        (permitidos.length
          ? `Transições permitidas: ${permitidos.join(', ')}`
          : 'Este pedido está em estado final'),
    ]);
  }

  pedido.status = novoStatus;
  return pedido;
}

module.exports = {
  TIPOS,
  PRIORIDADES,
  STATUS,
  TRANSICOES,
  criar,
  listar,
  buscarPorId,
  atualizarStatus,
  resetar,
};
