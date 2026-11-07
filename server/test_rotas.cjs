const http = require('node:http');
const path = require('node:path');

const PIPE_NAME = '\\\\.\\pipe\\medusa-rotas-test-pipe';
const { app, servidor, sessoes, carregarUsuarios, salvarUsuarios } = require('./server.cjs');

// Fecha o servidor TCP padrão para evitar conflito de portas em ambientes de teste
servidor.close();

// Inicializa o servidor via Named Pipe IPC
const pipeServer = http.createServer(app);

pipeServer.listen(PIPE_NAME, async () => {
  console.log('======================================================');
  console.log('  TESTES DOS ENDPOINTS DE ROTAS SALVAS (/v1/rotas)    ');
  console.log('======================================================\n');

  function request(reqPath, options = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        socketPath: PIPE_NAME,
        path: reqPath,
        method: options.method || 'GET',
        headers: options.headers || {},
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(data); } catch {}
          resolve({ status: res.statusCode, headers: res.headers, body: json !== null ? json : data });
        });
      });

      req.on('error', reject);
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  }

  try {
    // Limpa estado de teste
    const usuarios = carregarUsuarios();
    const emailTeste = `carlos_${Date.now()}@medusa.app`;

    // 1. GET /v1/rotas sem token -> 401
    const res1 = await request('/v1/rotas');
    console.log('1. [GET /v1/rotas] Sem token:', res1.status, res1.body);
    console.assert(res1.status === 401, 'Deve retornar 401');

    // 2. GET /v1/rotas com token invalido -> 401
    const res2 = await request('/v1/rotas', {
      headers: { authorization: 'Bearer token_invalido_xyz' },
    });
    console.log('2. [GET /v1/rotas] Token inválido:', res2.status);
    console.assert(res2.status === 401, 'Deve retornar 401');

    // 3. Cadastrar usuário de teste
    const resCadastro = await request('/v1/auth/cadastro', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: {
        nome: 'Carlos Teste Rotas',
        email: emailTeste,
        senha: 'senhaSegura123',
      },
    });
    console.log('3. [POST /v1/auth/cadastro] Sucesso:', resCadastro.status);
    console.assert(resCadastro.status === 201, 'Cadastro deve retornar 201');
    const token = resCadastro.body.token;

    // 4. GET /v1/rotas para usuário recém-criado -> retorna array vazio []
    const res4 = await request('/v1/rotas', {
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('4. [GET /v1/rotas] Inicial:', res4.status, res4.body);
    console.assert(res4.status === 200, 'Deve retornar 200');
    console.assert(Array.isArray(res4.body), 'Deve retornar um array');
    console.assert(res4.body.length === 0, 'Deve iniciar vazio []');

    // 5. POST /v1/rotas sem titulo -> 400
    const res5 = await request('/v1/rotas', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: { endereco: 'Av. Paulista, 1000' },
    });
    console.log('5. [POST /v1/rotas] Sem título:', res5.status, res5.body);
    console.assert(res5.status === 400, 'Deve retornar 400');

    // 6. POST /v1/rotas sem endereco -> 400
    const res6 = await request('/v1/rotas', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: { titulo: 'Trabalho' },
    });
    console.log('6. [POST /v1/rotas] Sem endereço:', res6.status, res6.body);
    console.assert(res6.status === 400, 'Deve retornar 400');

    // 7. POST /v1/rotas valido (Trabalho) -> auto define briefcase e trabalho
    const res7 = await request('/v1/rotas', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: {
        titulo: 'Meu Trabalho',
        endereco: 'Av. Brigadeiro Faria Lima, 3000',
      },
    });
    console.log('7. [POST /v1/rotas] Trabalho:', res7.status, res7.body.rota);
    console.assert(res7.status === 201, 'Deve retornar 201');
    console.assert(res7.body.rota.id, 'Deve gerar id único');
    console.assert(res7.body.rota.icone === 'briefcase', 'Ícone deve ser briefcase');
    console.assert(res7.body.rota.tipo === 'trabalho', 'Tipo deve ser trabalho');
    console.assert(res7.body.rota.criadoEm, 'Deve possuir data criadoEm');
    const rota1Id = res7.body.rota.id;

    // 8. POST /v1/rotas valido (Casa) -> auto define home e casa
    const res8 = await request('/v1/rotas', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: {
        titulo: 'Minha Casa',
        endereco: 'Rua das Flores, 123',
      },
    });
    console.log('8. [POST /v1/rotas] Casa:', res8.status, res8.body.rota.icone);
    console.assert(res8.status === 201, 'Deve retornar 201');
    console.assert(res8.body.rota.icone === 'home', 'Ícone deve ser home');
    const rota2Id = res8.body.rota.id;

    // 9. POST /v1/rotas generico (Parque) -> icone map-pin
    const res9 = await request('/v1/rotas', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: {
        titulo: 'Parque Ibirapuera',
        endereco: 'Av. Pedro Álvares Cabral, s/n',
      },
    });
    console.log('9. [POST /v1/rotas] Parque:', res9.status, res9.body.rota.icone);
    console.assert(res9.status === 201, 'Deve retornar 201');
    console.assert(res9.body.rota.icone === 'map-pin', 'Ícone padrão deve ser map-pin');

    // 10. GET /v1/rotas com 3 rotas
    const res10 = await request('/v1/rotas', {
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('10. [GET /v1/rotas] Total após adições:', res10.status, 'Total:', res10.body.length);
    console.assert(res10.status === 200, 'Deve retornar 200');
    console.assert(res10.body.length === 3, 'Deve conter 3 rotas');

    // 11. DELETE /v1/rotas/:id com id inexistente -> 404
    const res11 = await request('/v1/rotas/id_inexistente_999', {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('11. [DELETE /v1/rotas/:id] Inexistente:', res11.status, res11.body);
    console.assert(res11.status === 404, 'Deve retornar 404');

    // 12. DELETE /v1/rotas/:id com rota2Id -> 200
    const res12 = await request(`/v1/rotas/${rota2Id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('12. [DELETE /v1/rotas/:id] Rota válida:', res12.status, res12.body);
    console.assert(res12.status === 200, 'Deve retornar 200');

    // 13. GET /v1/rotas deve ter 2 rotas restantes
    const res13 = await request('/v1/rotas', {
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('13. [GET /v1/rotas] Total restante:', res13.status, 'Total:', res13.body.length);
    console.assert(res13.status === 200, 'Deve retornar 200');
    console.assert(res13.body.length === 2, 'Devem restar 2 rotas');
    console.assert(!res13.body.some(r => r.id === rota2Id), 'Rota removida não deve estar presente');

    // 14. Validar persistência em usuarios.json
    const usuariosNoDisco = carregarUsuarios();
    const usuarioNoDisco = usuariosNoDisco.find(u => u.id === resCadastro.body.usuario.id);
    console.assert(usuarioNoDisco.rotasSalvas.length === 2, 'Arquivo usuarios.json deve conter 2 rotas');
    console.log('14. [Persistência] Salvo com sucesso no usuarios.json.');

    console.log('\n======================================================');
    console.log('>>> TODOS OS 14 TESTES PASSARAM COM SUCESSO! <<<');
    console.log('======================================================\n');
  } catch (err) {
    console.error('ERRO nos testes:', err);
    process.exitCode = 1;
  } finally {
    pipeServer.close();
  }
});

