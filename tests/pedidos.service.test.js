const service = require('../src/services/pedidos.service');

const pedidoValido = {
  cliente: 'Carlos Silva',
  tipo: 'entrega',
  valor: 350,
  prioridade: 'normal',
};

beforeEach(() => service.resetar());

describe('criar', () => {
  test('cria pedido com id incremental e status "recebido"', () => {
    const p1 = service.criar(pedidoValido);
    const p2 = service.criar(pedidoValido);
    expect(p1).toEqual({ id: 1, ...pedidoValido, status: 'recebido' });
    expect(p2.id).toBe(2);
  });

  test('remove espaços das extremidades do cliente', () => {
    expect(service.criar({ ...pedidoValido, cliente: '  Ana  ' }).cliente).toBe('Ana');
  });

  test.each([
    ['cliente vazio', { cliente: '' }],
    ['cliente só com espaços', { cliente: '   ' }],
    ['cliente ausente', { cliente: undefined }],
    ['valor zero', { valor: 0 }],
    ['valor negativo', { valor: -10 }],
    ['valor string', { valor: '350' }],
    ['valor NaN', { valor: NaN }],
    ['tipo desconhecido', { tipo: 'voando' }],
    ['prioridade desconhecida', { prioridade: 'urgentissima' }],
  ])('rejeita %s com 400', (_nome, alteracao) => {
    expect(() => service.criar({ ...pedidoValido, ...alteracao })).toThrow(
      expect.objectContaining({ status: 400 })
    );
  });

  test('rejeita corpo ausente com 400', () => {
    expect(() => service.criar(undefined)).toThrow(expect.objectContaining({ status: 400 }));
  });
});

describe('buscarPorId', () => {
  test('retorna pedido existente', () => {
    service.criar(pedidoValido);
    expect(service.buscarPorId('1').id).toBe(1);
  });

  test.each(['99', 'abc', '1.5', '-1'])('lança 404 para id "%s"', (id) => {
    expect(() => service.buscarPorId(id)).toThrow(expect.objectContaining({ status: 404 }));
  });
});

describe('atualizarStatus', () => {
  test('aceita transição válida', () => {
    service.criar(pedidoValido);
    expect(service.atualizarStatus('1', { status: 'em_preparacao' }).status).toBe('em_preparacao');
  });

  test('percorre o fluxo completo', () => {
    service.criar(pedidoValido);
    service.atualizarStatus('1', { status: 'em_preparacao' });
    service.atualizarStatus('1', { status: 'enviado' });
    expect(service.atualizarStatus('1', { status: 'entregue' }).status).toBe('entregue');
  });

  test('rejeita status desconhecido com 400', () => {
    service.criar(pedidoValido);
    expect(() => service.atualizarStatus('1', { status: 'voando' })).toThrow(
      expect.objectContaining({ status: 400 })
    );
  });

  test('rejeita transição inválida com 400 (recebido -> entregue)', () => {
    service.criar(pedidoValido);
    expect(() => service.atualizarStatus('1', { status: 'entregue' })).toThrow(
      expect.objectContaining({ status: 400 })
    );
  });

  test('pedido cancelado não pode mudar de status', () => {
    service.criar(pedidoValido);
    service.atualizarStatus('1', { status: 'cancelado' });
    expect(() => service.atualizarStatus('1', { status: 'recebido' })).toThrow(
      expect.objectContaining({ status: 400 })
    );
  });

  test('lança 404 para id inexistente', () => {
    expect(() => service.atualizarStatus('99', { status: 'cancelado' })).toThrow(
      expect.objectContaining({ status: 404 })
    );
  });
});
