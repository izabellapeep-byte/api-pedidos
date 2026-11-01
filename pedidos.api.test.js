const request = require('supertest');
const app = require('../src/app');
const service = require('../src/services/pedidos.service');

const pedidoValido = {
  cliente: 'Carlos Silva',
  tipo: 'entrega',
  valor: 350,
  prioridade: 'normal',
};

beforeEach(() => service.resetar());

describe('POST /pedidos', () => {
  test('201 com pedido criado', async () => {
    const res = await request(app).post('/pedidos').send(pedidoValido);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, ...pedidoValido, status: 'recebido' });
  });

  test('400 com mensagem JSON para dados inválidos', async () => {
    const res = await request(app).post('/pedidos').send({ ...pedidoValido, cliente: '  ', valor: -1 });
    expect(res.status).toBe(400);
    expect(res.body.erro).toBeDefined();
    expect(res.body.detalhes).toHaveLength(2);
  });

  test('400 para JSON malformado', async () => {
    const res = await request(app)
      .post('/pedidos')
      .set('Content-Type', 'application/json')
      .send('{ "cliente": ');
    expect(res.status).toBe(400);
  });

  test('400 para requisição sem corpo', async () => {
    const res = await request(app).post('/pedidos');
    expect(res.status).toBe(400);
  });
});

describe('GET /pedidos', () => {
  test('200 com lista vazia e depois com itens', async () => {
    expect((await request(app).get('/pedidos')).body).toEqual([]);
    await request(app).post('/pedidos').send(pedidoValido);
    const res = await request(app).get('/pedidos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /pedidos/:id', () => {
  test('200 para pedido existente', async () => {
    await request(app).post('/pedidos').send(pedidoValido);
    const res = await request(app).get('/pedidos/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('404 para pedido inexistente', async () => {
    const res = await request(app).get('/pedidos/999');
    expect(res.status).toBe(404);
    expect(res.body.erro).toBeDefined();
  });
});

describe('PATCH /pedidos/:id/status', () => {
  beforeEach(async () => {
    await request(app).post('/pedidos').send(pedidoValido);
  });

  test('200 para atualização válida', async () => {
    const res = await request(app).patch('/pedidos/1/status').send({ status: 'cancelado' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelado');
  });

  test('400 para status inválido', async () => {
    const res = await request(app).patch('/pedidos/1/status').send({ status: 'xyz' });
    expect(res.status).toBe(400);
  });

  test('400 para transição não permitida', async () => {
    const res = await request(app).patch('/pedidos/1/status').send({ status: 'entregue' });
    expect(res.status).toBe(400);
  });

  test('404 para ID inexistente', async () => {
    const res = await request(app).patch('/pedidos/999/status').send({ status: 'cancelado' });
    expect(res.status).toBe(404);
  });
});

describe('rotas desconhecidas', () => {
  test('404 em JSON', async () => {
    const res = await request(app).get('/nada');
    expect(res.status).toBe(404);
    expect(res.body.erro).toBeDefined();
  });
});
