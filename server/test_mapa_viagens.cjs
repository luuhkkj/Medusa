const http = require('node:http');

const PIPE_NAME = '\\\\.\\pipe\\medusa-mapa-viagens-pipe';
const { app, servidor, sessoes, carregarUsuarios, salvarUsuarios } = require('./server.cjs');

// Fecha o servidor TCP padrão para evitar conflito de portas
servidor.close();

// Inicializa servidor de teste via Named Pipe IPC
const pipeServer = http.createServer(app);

pipeServer.listen(PIPE_NAME, async () => {
  console.log('======================================================');
  console.log('  TESTES DOS ENDPOINTS DE MAPA E VIAGENS             ');
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
    const emailTeste = `usuario_mapa_${Date.now()}@medusa.app`;

    // 1. GET /v1/mapa/pontos-risco sem token -> 401
    const res1 = await request('/v1/mapa/pontos-risco');
    console.log('1. [GET /v1/mapa/pontos-risco] Sem token:', res1.status, res1.body);
    console.assert(res1.status === 401, 'Deve retornar 401');

    // 2. GET /v1/mapa/pontos-risco com token inválido -> 401
    const res2 = await request('/v1/mapa/pontos-risco', {
      headers: { authorization: 'Bearer token_invalido_xyz' },
    });
    console.log('2. [GET /v1/mapa/pontos-risco] Token inválido:', res2.status);
    console.assert(res2.status === 401, 'Deve retornar 401');

    // 3. Cadastrar usuário de teste
    const resCadastro = await request('/v1/auth/cadastro', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: {
        nome: 'Maria Viagens',
        email: emailTeste,
        senha: 'senhaSegura123',
      },
    });
    console.log('3. [POST /v1/auth/cadastro] Sucesso:', resCadastro.status);
    console.assert(resCadastro.status === 201, 'Deve retornar 201');
    const token = resCadastro.body.token;
    const usuarioId = resCadastro.body.usuario.id;

    // 4. GET /v1/mapa/pontos-risco com usuário autenticado -> 200 e lista de pontos
    const res4 = await request('/v1/mapa/pontos-risco', {
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('4. [GET /v1/mapa/pontos-risco] Sucesso:', res4.status, 'Total pontos:', res4.body.length);
    console.assert(res4.status === 200, 'Deve retornar 200');
    console.assert(Array.isArray(res4.body), 'Deve ser um array');
    console.assert(res4.body.length > 0, 'Deve conter pontos de risco');

    // Validar estrutura dos pontos de risco
    const primeiroPonto = res4.body[0];
    console.assert(primeiroPonto.id, 'Ponto deve ter id');
    console.assert(primeiroPonto.titulo, 'Ponto deve ter titulo');
    console.assert(primeiroPonto.descricao, 'Ponto deve ter descricao');
    console.assert(['baixo', 'medio', 'alto'].includes(primeiroPonto.nivelRisco), 'nivelRisco válido');
    console.assert(typeof primeiroPonto.latitude === 'number', 'latitude numérica');
    console.assert(typeof primeiroPonto.longitude === 'number', 'longitude numérica');
    console.log('   Exemplo de ponto retornado:', primeiroPonto);

    // 5. GET /v1/mapa/pontos-risco com filtro de nivelRisco=alto
    const res5 = await request('/v1/mapa/pontos-risco?nivelRisco=alto', {
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('5. [GET com filtro nivelRisco=alto]:', res5.status, 'Total:', res5.body.length);
    console.assert(res5.status === 200, 'Deve retornar 200');
    console.assert(res5.body.every(p => p.nivelRisco === 'alto'), 'Todos devem ser nível alto');

    // 6. POST /v1/viagens/iniciar sem token -> 401
    const res6 = await request('/v1/viagens/iniciar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { destino: 'Trabalho' },
    });
    console.log('6. [POST /v1/viagens/iniciar] Sem token:', res6.status);
    console.assert(res6.status === 401, 'Deve retornar 401');

    // 7. POST /v1/viagens/iniciar sem destino -> 400
    const res7 = await request('/v1/viagens/iniciar', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: {},
    });
    console.log('7. [POST /v1/viagens/iniciar] Sem destino:', res7.status, res7.body);
    console.assert(res7.status === 400, 'Deve retornar 400');

    // 8. POST /v1/viagens/iniciar com destino válido -> 201
    const res8 = await request('/v1/viagens/iniciar', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: {
        destino: 'Av. Paulista, 1000 - Bela Vista',
        origem: 'Rua Augusta, 500',
        latitude: -23.5651,
        longitude: -46.6529,
      },
    });
    console.log('8. [POST /v1/viagens/iniciar] Sucesso:', res8.status, res8.body.viagem);
    console.assert(res8.status === 201, 'Deve retornar 201');
    console.assert(res8.body.viagem.id, 'Viagem deve ter id');
    console.assert(res8.body.viagem.destino === 'Av. Paulista, 1000 - Bela Vista', 'Destino correto');
    console.assert(res8.body.viagem.status === 'em_andamento', 'Status em_andamento');
    console.assert(res8.body.viagem.iniciadoEm, 'Deve conter data iniciadoEm');

    // 9. Validar persistência da viagem no usuarios.json
    const usuarios = carregarUsuarios();
    const usuarioNoDisco = usuarios.find(u => u.id === usuarioId);
    console.assert(Array.isArray(usuarioNoDisco.viagens), 'Usuário deve conter array viagens');
    console.assert(usuarioNoDisco.viagens.length === 1, 'Deve conter 1 viagem registrada');
    console.assert(usuarioNoDisco.viagens[0].id === res8.body.viagem.id, 'Id da viagem confere no disco');
    console.log('9. [Persistência] Viagem persistida com sucesso em usuarios.json.');

    console.log('\n======================================================');
    console.log('>>> TODOS OS TESTES PASSARAM COM SUCESSO!          <<<');
    console.log('======================================================\n');
  } catch (err) {
    console.error('ERRO nos testes:', err);
    process.exitCode = 1;
  } finally {
    pipeServer.close();
  }
});

