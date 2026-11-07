const http = require('node:http');

const PIPE_NAME = '\\\\.\\pipe\\medusa-dispositivos-pipe';
const { app, servidor, sessoes, carregarUsuarios, salvarUsuarios } = require('./server.cjs');

// Fecha o servidor TCP padrão para evitar conflito de portas
servidor.close();

// Inicializa servidor de teste via Named Pipe IPC
const pipeServer = http.createServer(app);

pipeServer.listen(PIPE_NAME, async () => {
  console.log('======================================================');
  console.log('  TESTES DOS ENDPOINTS DE DISPOSITIVOS E CHAVEIRO     ');
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
    const emailTeste = `usuario_disp_${Date.now()}@medusa.app`;

    // 1. GET /v1/dispositivos/status sem token -> 401
    const res1 = await request('/v1/dispositivos/status');
    console.log('1. [GET /v1/dispositivos/status] Sem token:', res1.status, res1.body);
    console.assert(res1.status === 401, 'Deve retornar 401');

    // 2. GET /v1/dispositivos/status com token inválido -> 401
    const res2 = await request('/v1/dispositivos/status', {
      headers: { authorization: 'Bearer token_invalido_xyz' },
    });
    console.log('2. [GET /v1/dispositivos/status] Token inválido:', res2.status);
    console.assert(res2.status === 401, 'Deve retornar 401');

    // 3. Cadastrar usuário de teste
    const resCadastro = await request('/v1/auth/cadastro', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: {
        nome: 'Laura Chaveiro Teste',
        email: emailTeste,
        senha: 'senhaSegura123',
      },
    });
    console.log('3. [POST /v1/auth/cadastro] Sucesso:', resCadastro.status);
    console.assert(resCadastro.status === 201, 'Deve retornar 201');
    const token = resCadastro.body.token;
    const usuarioId = resCadastro.body.usuario.id;

    // 4. GET /v1/dispositivos/status para usuário sem dispositivo -> { dispositivo: null, conectado: false }
    const res4 = await request('/v1/dispositivos/status', {
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('4. [GET /v1/dispositivos/status] Sem dispositivo:', res4.status, res4.body);
    console.assert(res4.status === 200, 'Deve retornar 200');
    console.assert(res4.body.dispositivo === null, 'dispositivo deve ser null');
    console.assert(res4.body.conectado === false, 'conectado deve ser false');

    // 5. POST /v1/dispositivos/alerta-panico sem dispositivo conectado -> 400
    const res5 = await request('/v1/dispositivos/alerta-panico', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: {},
    });
    console.log('5. [POST alerta-panico sem disp]:', res5.status, res5.body);
    console.assert(res5.status === 400, 'Deve retornar 400 pois não há dispositivo');

    // 6. POST /v1/dispositivos/parear -> 201
    const res6 = await request('/v1/dispositivos/parear', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: {
        nome: 'Chaveiro Medusa Pro Max',
        codigoIdentificador: 'MEDUSA-CH-999',
      },
    });
    console.log('6. [POST /v1/dispositivos/parear] Sucesso:', res6.status, res6.body.dispositivo);
    console.assert(res6.status === 201, 'Deve retornar 201');
    console.assert(res6.body.dispositivo.id, 'Dispositivo deve conter id');
    console.assert(res6.body.dispositivo.conectado === true, 'conectado deve ser true');
    console.assert(res6.body.dispositivo.nome === 'Chaveiro Medusa Pro Max', 'Nome correto');
    console.assert(res6.body.dispositivo.codigoIdentificador === 'MEDUSA-CH-999', 'Código correto');
    console.assert(typeof res6.body.dispositivo.nivelBateria === 'number', 'nivelBateria numérico');
    console.assert(res6.body.dispositivo.ultimoPing, 'ultimoPing presente');
    console.assert(res6.body.dispositivo.versaoFirmware, 'versaoFirmware presente');

    // 7. GET /v1/dispositivos/status com dispositivo pareado -> retorna dados e conectado: true
    const res7 = await request('/v1/dispositivos/status', {
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('7. [GET status pareado]:', res7.status, res7.body.dispositivo.nome, 'Bateria:', res7.body.dispositivo.nivelBateria);
    console.assert(res7.status === 200, 'Deve retornar 200');
    console.assert(res7.body.conectado === true, 'conectado deve ser true');
    console.assert(res7.body.dispositivo.id === res6.body.dispositivo.id, 'Id do dispositivo confere');

    // 8. POST /v1/dispositivos/alerta-panico com dispositivo conectado -> 201
    const res8 = await request('/v1/dispositivos/alerta-panico', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: {
        latitude: -23.55052,
        longitude: -46.633308,
      },
    });
    console.log('8. [POST alerta-panico acionado]:', res8.status, res8.body.alerta);
    console.assert(res8.status === 201, 'Deve retornar 201');
    console.assert(res8.body.alerta.id, 'Alerta deve ter id');
    console.assert(res8.body.alerta.tipo === 'botao_panico_chaveiro', 'Tipo de alerta correto');
    console.assert(res8.body.alerta.status === 'acionado', 'Status acionado');
    console.assert(res8.body.alerta.localizacao.latitude === -23.55052, 'Latitude confere');

    // 9. Validar persistência do alerta em usuarios.json
    const usuarios = carregarUsuarios();
    const usuarioNoDisco = usuarios.find(u => u.id === usuarioId);
    console.assert(usuarioNoDisco.dispositivo.conectado === true, 'Dispositivo persistido como conectado');
    console.assert(Array.isArray(usuarioNoDisco.alertasPanico), 'Array alertasPanico existe');
    console.assert(usuarioNoDisco.alertasPanico.length === 1, 'Deve conter 1 alerta registrado');
    console.log('9. [Persistência] Dispositivo e alerta persistidos em usuarios.json.');

    // 10. POST /v1/dispositivos/desparear -> 200
    const res10 = await request('/v1/dispositivos/desparear', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('10. [POST /v1/dispositivos/desparear]:', res10.status, res10.body);
    console.assert(res10.status === 200, 'Deve retornar 200');
    console.assert(res10.body.dispositivo === null, 'Dispositivo deve ser null');
    console.assert(res10.body.conectado === false, 'Conectado deve ser false');

    // 11. GET status após despareamento -> { dispositivo: null, conectado: false }
    const res11 = await request('/v1/dispositivos/status', {
      headers: { authorization: `Bearer ${token}` },
    });
    console.log('11. [GET status após desparear]:', res11.status, res11.body);
    console.assert(res11.status === 200, 'Deve retornar 200');
    console.assert(res11.body.dispositivo === null, 'Dispositivo null');
    console.assert(res11.body.conectado === false, 'Conectado false');

    console.log('\n======================================================');
    console.log('>>> TODOS OS 11 TESTES PASSARAM COM SUCESSO!       <<<');
    console.log('======================================================\n');
  } catch (err) {
    console.error('ERRO nos testes:', err);
    process.exitCode = 1;
  } finally {
    pipeServer.close();
  }
});

