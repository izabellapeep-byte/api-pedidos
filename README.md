Aluno:Izabella Miranda — RA: 43741401

## Instalação e execução

```bash
npm install
npm start        
npm test        
```

> Os dados ficam em memória: ao reiniciar o servidor, os pedidos são perdidos.

## Rotas

| Método | Rota                    | Sucesso | Erros                                   |
|--------|-------------------------|---------|-----------------------------------------|
| POST   | `/pedidos`              | 201     | 400 (dados inválidos)                   |
| GET    | `/pedidos`              | 200     | —                                       |
| GET    | `/pedidos/:id`          | 200     | 404 (inexistente)                       |
| PATCH  | `/pedidos/:id/status`   | 200     | 400 (status/transição inválidos), 404   |


**POST /pedidos**
```json
{ "cliente": "Carlos Silva", "tipo": "entrega", "valor": 350, "prioridade": "normal" }
```
Resposta `201`:
```json
{ "id": 1, "cliente": "Carlos Silva", "tipo": "entrega", "valor": 350, "prioridade": "normal", "status": "recebido" }
```

**Resposta de erro `400`:**
```json
{
  "erro": "Dados inválidos",
  "detalhes": ["cliente é obrigatório e deve ser um texto não vazio", "valor deve ser um número maior que zero"]
}
```

**PATCH /pedidos/1/status**
```json
{ "status": "em_preparacao" }
```

## Regras de validação

- `cliente`: texto obrigatório; espaços nas extremidades são removidos e o texto não pode ficar vazio.
- `valor`: número (tipo JSON `number`, não string) maior que zero.
- `tipo`: `entrega` ou `retirada`.
- `prioridade`: `baixa`, `normal` ou `alta`.
- ID inexistente (ou não numérico) → `404`.
- JSON malformado ou dados inválidos → `400` com corpo JSON explicativo.
- Erro inesperado → `500` com mensagem genérica (detalhes só no log do servidor).
- No PATCH, a existência do ID é verificada **antes** da validação do corpo (ID inexistente sempre dá 404).


Status: `recebido`, `em_preparacao`, `enviado`, `entregue`, `cancelado`. Todo pedido nasce como `recebido`.

| Status atual     | Próximos status permitidos     |
|------------------|--------------------------------|
| `recebido`       | `em_preparacao`, `cancelado`   |
| `em_preparacao`  | `enviado`, `cancelado`         |
| `enviado`        | `entregue`                     |
| `entregue`       | — (final)                      |
| `cancelado`      | — (final)                      |

Qualquer transição fora da tabela (inclusive repetir o mesmo status) retorna `400`.

Arquitetura em camadas; cada camada tem uma única responsabilidade:

```
src/
├── server.js                 # sobe o servidor (app.listen)
├── app.js                    # monta o Express: middlewares, rotas, 404 e erros
├── routes/pedidos.routes.js  # mapeia método + URL -> controller
├── controllers/              # traduz HTTP <-> service (lê req, devolve status/JSON)
├── services/                 # regras de negócio, validações e armazenamento em memória
├── middlewares/errorHandler.js  # converte erros em respostas HTTP (400/404/500)
└── errors/AppError.js        # erro esperado, com status HTTP
tests/                        # testes unitários (service) e de integração (API)
evidencias/                   # capturas do Postman
```

Fluxo: `request -> routes -> controller -> service -> (erro?) -> errorHandler -> response`.
O service lança `AppError` para erros esperados; qualquer outro erro vira `500`.
`app.js` é separado de `server.js` para os testes importarem a aplicação sem abrir uma porta.


- `tests/pedidos.service.test.js`: regras de negócio (validações, transições, IDs).
- `tests/pedidos.api.test.js`: endpoints via Supertest (códigos HTTP e corpo das respostas).


Capturas do Postman na pasta `evidencias/`:
`01-criacao.png`, `02-validacao.png`, `03-listagem.png`, `04-consulta-inexistente.png`, `05-atualizacao.png`.

# Uso de IA

- **Utilizei IA?** Sim.
- **Para quais tarefas?** Estrutura inicial do projeto (routes, controllers e services), validações e orientação para instalar o Node.js
- **Sugestão aceita:** nenhuma até o momento.
- **Sugestão modificada:** a IA sugeriu fazer os commits pelo terminal com Git. Como o Git não estava instalado e o prazo era curto, enviei os arquivos pelo upload do GitHub e fiz os demais commits editando arquivos pelo site.
- **Sugestão rejeitada:** nenhuma até o momento.
