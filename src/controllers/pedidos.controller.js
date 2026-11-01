const service = require('../services/pedidos.service');

// Controllers só traduzem HTTP <-> service. Nenhuma regra de negócio aqui.
function criar(req, res) {
  const pedido = service.criar(req.body);
  res.status(201).json(pedido);
}

function listar(req, res) {
  res.status(200).json(service.listar());
}

function buscarPorId(req, res) {
  res.status(200).json(service.buscarPorId(req.params.id));
}

function atualizarStatus(req, res) {
  const pedido = service.atualizarStatus(req.params.id, req.body);
  res.status(200).json(pedido);
}

module.exports = { criar, listar, buscarPorId, atualizarStatus };
