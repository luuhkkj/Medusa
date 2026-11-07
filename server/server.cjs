const fs = require('node:fs');
const path = require('node:path');
const {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} = require('node:crypto');
const express = require('express');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const sharp = require('sharp');

if (process.env.NODE_ENV === 'production') {
  throw new Error(
    'Demonstração local: uso em produção bloqueado.',
  );
}

const USUARIOS_FILE = path.join(__dirname, 'usuarios.json');

function inicializarArquivoUsuarios() {
  try {
    if (!fs.existsSync(USUARIOS_FILE)) {
      fs.writeFileSync(USUARIOS_FILE, '[]\n', 'utf-8');
    } else {
      const conteudo = fs.readFileSync(USUARIOS_FILE, 'utf-8').trim();
      if (!conteudo) {
        fs.writeFileSync(USUARIOS_FILE, '[]\n', 'utf-8');
      }
    }
  } catch (erro) {
    console.error('Erro ao inicializar usuarios.json:', erro);
  }
}

function carregarUsuarios() {
  try {
    if (!fs.existsSync(USUARIOS_FILE)) {
      inicializarArquivoUsuarios();
      return [];
    }
    const conteudo = fs.readFileSync(USUARIOS_FILE, 'utf-8');
    return JSON.parse(conteudo || '[]');
  } catch (erro) {
    console.error('Erro ao ler usuarios.json:', erro);
    return [];
  }
}

function salvarUsuarios(usuarios) {
  fs.writeFileSync(USUARIOS_FILE, JSON.stringify(usuarios, null, 2), 'utf-8');
}

// Inicializa o arquivo de persistência
inicializarArquivoUsuarios();

function hashSenha(senha) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verificarSenha(senha, hashArmazenado) {
  if (typeof senha !== 'string' || typeof hashArmazenado !== 'string') {
    return false;
  }
  const partesHash = hashArmazenado.split(':');
  if (partesHash.length !== 2) {
    return false;
  }
  const [salt, chaveOriginal] = partesHash;
  const hashBuffer = Buffer.from(chaveOriginal, 'hex');
  const testeBuffer = scryptSync(senha, salt, hashBuffer.length);
  if (hashBuffer.length !== testeBuffer.length) {
    return false;
  }
  return timingSafeEqual(hashBuffer, testeBuffer);
}

const app = express();
const sessoes = new Map();

const partes = ['frente', 'verso', 'selfie'];

app.disable('x-powered-by');
app.use(helmet());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');

  const ip = req.socket.remoteAddress;

  const local = !ip || [
    '127.0.0.1',
    '::1',
    '::ffff:127.0.0.1',
  ].includes(ip);

  const origin = req.get('origin');
  const originValida = !origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  if (!local || !originValida) {
    return res.status(403).json({
      erro: 'API disponível somente para demonstração local.',
    });
  }

  if (origin) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
  }

  next();
});

app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 60,
    message: {
      erro: 'Muitas solicitações. Aguarde um minuto.',
    },
  }),
);

setInterval(() => {
  for (const [token, sessao] of sessoes) {
    if (sessao.expiraEm <= Date.now()) {
      sessoes.delete(token);
    }
  }
}, 30_000).unref();

// Sessão exclusiva da demonstração local.
// Não representa cadastro ou autenticação de uma pessoa.
app.post(
  '/demo/sessao',
  express.json({ limit: '2kb' }),
  (req, res) => {
    if (req.body?.somenteDadosFicticios !== true) {
      return res.status(400).json({
        erro: 'Esta demonstração aceita somente dados fictícios.',
      });
    }

    if (sessoes.size >= 20) {
      return res.status(429).json({
        erro: 'Limite de sessões da demonstração atingido.',
      });
    }

    const token = randomBytes(32).toString('base64url');

    sessoes.set(token, {
      expiraEm: Date.now() + 30 * 60_000,
      recebidos: {
        frente: false,
        verso: false,
        selfie: false,
      },
      finalizada: false,
    });

    return res.status(201).json({ token });
  },
);

// Rotas de autenticação de usuários
app.post(
  '/v1/auth/cadastro',
  express.json({ limit: '10kb' }),
  (req, res) => {
    const { nome, email, senha } = req.body || {};

    if (
      !nome ||
      !email ||
      !senha ||
      typeof nome !== 'string' ||
      typeof email !== 'string' ||
      typeof senha !== 'string' ||
      !nome.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        erro: 'Preencha todos os campos obrigatórios (nome, email e senha).',
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        erro: 'A senha deve conter no mínimo 6 caracteres.',
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuarios = carregarUsuarios();

    const usuarioExistente = usuarios.find(
      u => u.email.toLowerCase() === emailNormalizado,
    );

    if (usuarioExistente) {
      return res.status(409).json({
        erro: 'Este e-mail já está cadastrado.',
      });
    }

    const id = randomBytes(16).toString('hex');
    const novoUsuario = {
      id,
      nome: nome.trim(),
      email: emailNormalizado,
      senhaHash: hashSenha(senha),
      contatos: [],
      rotasSalvas: [],
      viagens: [],
      dispositivo: null,
      alertasPanico: [],
      criadoEm: new Date().toISOString(),
    };

    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    const token = randomBytes(32).toString('base64url');

    sessoes.set(token, {
      usuarioId: novoUsuario.id,
      expiraEm: Date.now() + 24 * 60 * 60_000,
      recebidos: {
        frente: false,
        verso: false,
        selfie: false,
      },
      finalizada: false,
    });

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      token,
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
      },
    });
  },
);

app.post(
  '/v1/auth/login',
  express.json({ limit: '10kb' }),
  (req, res) => {
    const { email, senha } = req.body || {};

    if (
      !email ||
      !senha ||
      typeof email !== 'string' ||
      typeof senha !== 'string' ||
      !email.trim()
    ) {
      return res.status(400).json({
        erro: 'Informe o e-mail e a senha.',
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuarios = carregarUsuarios();

    const usuario = usuarios.find(
      u => u.email.toLowerCase() === emailNormalizado,
    );

    if (!usuario || !verificarSenha(senha, usuario.senhaHash)) {
      return res.status(401).json({
        erro: 'E-mail ou senha incorretos.',
      });
    }

    const token = randomBytes(32).toString('base64url');

    sessoes.set(token, {
      usuarioId: usuario.id,
      expiraEm: Date.now() + 24 * 60 * 60_000,
      recebidos: {
        frente: false,
        verso: false,
        selfie: false,
      },
      finalizada: false,
    });

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  },
);

// Middleware de autenticação por Bearer Token
function autenticarUsuario(req, res, next) {
  const authHeader = req.get('authorization');
  const token = authHeader?.match(/^Bearer\s+([A-Za-z0-9_-]+)$/i)?.[1];

  if (!token) {
    return res.status(401).json({
      erro: 'Token de autenticação não fornecido ou inválido.',
    });
  }

  const sessao = sessoes.get(token);

  if (!sessao || sessao.expiraEm <= Date.now() || !sessao.usuarioId) {
    return res.status(401).json({
      erro: 'Sessão expirada ou não autorizada. Faça login novamente.',
    });
  }

  const usuarios = carregarUsuarios();
  const usuario = usuarios.find(u => u.id === sessao.usuarioId);

  if (!usuario) {
    return res.status(404).json({
      erro: 'Usuário não encontrado.',
    });
  }

  req.usuarioLogado = usuario;
  req.usuarioId = sessao.usuarioId;
  req.sessao = sessao;
  req.token = token;
  next();
}

// Endpoint protegido de perfil do usuário autenticado
app.get('/v1/perfil', autenticarUsuario, (req, res) => {
  const usuario = req.usuarioLogado;
  const contatos = Array.isArray(usuario.contatos) ? usuario.contatos : [];
  const rotasSalvas = Array.isArray(usuario.rotasSalvas)
    ? usuario.rotasSalvas
    : Array.isArray(usuario.rotas)
      ? usuario.rotas
      : [];

  const dadosPerfil = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    contatos,
    rotasSalvas,
    rotas: rotasSalvas,
    criadoEm: usuario.criadoEm,
  };

  return res.status(200).json({
    ...dadosPerfil,
    usuario: dadosPerfil,
  });
});

// Endpoints de Rotas Salvas do Usuário

// Listar rotas salvas
app.get('/v1/rotas', autenticarUsuario, (req, res) => {
  const usuario = req.usuarioLogado;
  const rotasSalvas = Array.isArray(usuario.rotasSalvas)
    ? usuario.rotasSalvas
    : Array.isArray(usuario.rotas)
      ? usuario.rotas
      : [];

  return res.status(200).json(rotasSalvas);
});

// Adicionar nova rota salva
app.post(
  '/v1/rotas',
  express.json({ limit: '10kb' }),
  autenticarUsuario,
  (req, res) => {
    const { titulo, endereco, tipo, icone } = req.body || {};

    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
      return res.status(400).json({
        erro: 'O campo título é obrigatório.',
      });
    }

    if (!endereco || typeof endereco !== 'string' || !endereco.trim()) {
      return res.status(400).json({
        erro: 'O campo endereço é obrigatório.',
      });
    }

    const tituloNorm = titulo.trim().toLowerCase();
    let iconeResolvido = icone || tipo;
    let tipoResolvido = tipo;

    if (!iconeResolvido) {
      if (
        /\b(trabalho|servico|serviço|trampo|office|work)\b/i.test(tituloNorm)
      ) {
        iconeResolvido = 'briefcase';
        tipoResolvido = tipoResolvido || 'trabalho';
      } else if (
        /\b(casa|home|lar|ap|apto|apartamento|residencia|residência)\b/i.test(tituloNorm)
      ) {
        iconeResolvido = 'home';
        tipoResolvido = tipoResolvido || 'casa';
      } else if (
        /\b(faculdade|universidade|escola|curso|colegio|colégio|estudo)\b/i.test(tituloNorm)
      ) {
        iconeResolvido = 'book';
        tipoResolvido = tipoResolvido || 'estudo';
      } else if (
        /\b(academia|treino|crossfit|gym|fitness)\b/i.test(tituloNorm)
      ) {
        iconeResolvido = 'activity';
        tipoResolvido = tipoResolvido || 'saude';
      } else {
        iconeResolvido = 'map-pin';
        tipoResolvido = tipoResolvido || 'outro';
      }
    }

    const id = randomBytes(16).toString('hex');
    const novaRota = {
      id,
      titulo: titulo.trim(),
      endereco: endereco.trim(),
      tipo: tipoResolvido || 'outro',
      icone: iconeResolvido,
      criadoEm: new Date().toISOString(),
    };

    const usuarios = carregarUsuarios();
    const index = usuarios.findIndex(u => u.id === req.usuarioId);

    if (index === -1) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.',
      });
    }

    if (!Array.isArray(usuarios[index].rotasSalvas)) {
      usuarios[index].rotasSalvas = [];
    }

    usuarios[index].rotasSalvas.push(novaRota);
    salvarUsuarios(usuarios);

    return res.status(201).json({
      mensagem: 'Rota salva com sucesso!',
      rota: novaRota,
    });
  },
);

// Remover rota salva
app.delete('/v1/rotas/:id', autenticarUsuario, (req, res) => {
  const { id } = req.params;
  const usuarios = carregarUsuarios();
  const index = usuarios.findIndex(u => u.id === req.usuarioId);

  if (index === -1) {
    return res.status(404).json({
      erro: 'Usuário não encontrado.',
    });
  }

  const rotas = Array.isArray(usuarios[index].rotasSalvas)
    ? usuarios[index].rotasSalvas
    : [];

  const rotaExiste = rotas.some(r => r.id === id);
  if (!rotaExiste) {
    return res.status(404).json({
      erro: 'Rota não encontrada.',
    });
  }

  usuarios[index].rotasSalvas = rotas.filter(r => r.id !== id);
  salvarUsuarios(usuarios);

  return res.status(200).json({
    mensagem: 'Rota removida com sucesso!',
    id,
  });
});

// Lista de pontos de risco/alerta da região para exibição no mapa
const PONTOS_RISCO_PADRAO = [
  {
    id: 'pr-1',
    titulo: 'Praça da Sé - Entorno',
    descricao: 'Baixa iluminação noturna e histórico de ocorrências frequentes.',
    nivelRisco: 'alto',
    latitude: -23.55052,
    longitude: -46.633308,
  },
  {
    id: 'pr-2',
    titulo: 'Passarela Metrô Anhangabaú',
    descricao: 'Passagem estreita com baixa visibilidade e pontos cegos.',
    nivelRisco: 'alto',
    latitude: -23.54890,
    longitude: -46.63880,
  },
  {
    id: 'pr-3',
    titulo: 'Rua Augusta (Baixo Augusta)',
    descricao: 'Movimentação intensa: risco moderado de furtos em aglomerações.',
    nivelRisco: 'medio',
    latitude: -23.55320,
    longitude: -46.65210,
  },
  {
    id: 'pr-4',
    titulo: 'Viaduto do Chá',
    descricao: 'Área com monitoramento por câmeras, porém requer atenção após as 21h.',
    nivelRisco: 'medio',
    latitude: -23.54670,
    longitude: -46.63720,
  },
  {
    id: 'pr-5',
    titulo: 'Av. Paulista x Al. Campinas',
    descricao: 'Região com boa iluminação pública e patrulhamento constante.',
    nivelRisco: 'baixo',
    latitude: -23.56510,
    longitude: -46.65290,
  },
  {
    id: 'pr-6',
    titulo: 'Parque Ibirapuera - Portão 3',
    descricao: 'Vias de acesso amplas e movimento regular durante o dia.',
    nivelRisco: 'baixo',
    latitude: -23.58741,
    longitude: -46.65763,
  },
];

// Endpoint autenticado: Obter pontos de alerta/risco mapeados
app.get('/v1/mapa/pontos-risco', autenticarUsuario, (req, res) => {
  const { nivelRisco } = req.query || {};
  let pontos = PONTOS_RISCO_PADRAO;

  if (nivelRisco && typeof nivelRisco === 'string') {
    pontos = pontos.filter(
      p => p.nivelRisco.toLowerCase() === nivelRisco.toLowerCase(),
    );
  }

  return res.status(200).json(pontos);
});

// Endpoint autenticado: Iniciar trajeto / viagem
app.post(
  '/v1/viagens/iniciar',
  express.json({ limit: '10kb' }),
  autenticarUsuario,
  (req, res) => {
    const { destino, origem, rotaId, latitude, longitude, titulo, endereco } =
      req.body || {};

    const destinoFinal = destino || titulo || endereco;

    if (!destinoFinal || typeof destinoFinal !== 'string' || !destinoFinal.trim()) {
      return res.status(400).json({
        erro: 'Informe o destino do trajeto.',
      });
    }

    const novaViagem = {
      id: randomBytes(16).toString('hex'),
      destino: destinoFinal.trim(),
      origem:
        origem && typeof origem === 'string' && origem.trim()
          ? origem.trim()
          : 'Localização atual',
      rotaId: rotaId || null,
      status: 'em_andamento',
      latitude: typeof latitude === 'number' ? latitude : null,
      longitude: typeof longitude === 'number' ? longitude : null,
      iniciadoEm: new Date().toISOString(),
    };

    const usuarios = carregarUsuarios();
    const index = usuarios.findIndex(u => u.id === req.usuarioId);

    if (index === -1) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.',
      });
    }

    if (!Array.isArray(usuarios[index].viagens)) {
      usuarios[index].viagens = [];
    }

    usuarios[index].viagens.push(novaViagem);
    salvarUsuarios(usuarios);

    return res.status(201).json({
      mensagem: 'Trajeto iniciado com sucesso!',
      viagem: novaViagem,
    });
  },
);

// Endpoints do Chaveiro Inteligente / Dispositivo de Proteção Física

// Obter status do dispositivo pareado
app.get('/v1/dispositivos/status', autenticarUsuario, (req, res) => {
  const usuario = req.usuarioLogado;
  const dispositivo = usuario.dispositivo;

  if (!dispositivo || typeof dispositivo !== 'object') {
    return res.status(200).json({
      dispositivo: null,
      conectado: false,
    });
  }

  return res.status(200).json({
    dispositivo: {
      id: dispositivo.id,
      nome: dispositivo.nome || 'Chaveiro Medusa Pro',
      conectado: dispositivo.conectado === true,
      nivelBateria: typeof dispositivo.nivelBateria === 'number' ? dispositivo.nivelBateria : 88,
      ultimoPing: dispositivo.ultimoPing || new Date().toISOString(),
      versaoFirmware: dispositivo.versaoFirmware || 'v1.4.2',
      codigoIdentificador: dispositivo.codigoIdentificador || 'MEDUSA-CH-PRO',
      pareadoEm: dispositivo.pareadoEm || dispositivo.criadoEm || new Date().toISOString(),
    },
    conectado: dispositivo.conectado === true,
  });
});

// Parear novo dispositivo inteligente
app.post(
  '/v1/dispositivos/parear',
  express.json({ limit: '10kb' }),
  autenticarUsuario,
  (req, res) => {
    const { nome, codigoIdentificador } = req.body || {};

    const nomeFinal =
      nome && typeof nome === 'string' && nome.trim()
        ? nome.trim()
        : 'Chaveiro Medusa Pro';

    const codigoFinal =
      codigoIdentificador &&
      typeof codigoIdentificador === 'string' &&
      codigoIdentificador.trim()
        ? codigoIdentificador.trim().toUpperCase()
        : `MEDUSA-CH-${Math.floor(1000 + Math.random() * 9000)}`;

    const novoDispositivo = {
      id: randomBytes(16).toString('hex'),
      nome: nomeFinal,
      codigoIdentificador: codigoFinal,
      conectado: true,
      nivelBateria: 88,
      ultimoPing: new Date().toISOString(),
      versaoFirmware: 'v1.4.2',
      pareadoEm: new Date().toISOString(),
    };

    const usuarios = carregarUsuarios();
    const index = usuarios.findIndex(u => u.id === req.usuarioId);

    if (index === -1) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.',
      });
    }

    usuarios[index].dispositivo = novoDispositivo;
    salvarUsuarios(usuarios);

    return res.status(201).json({
      mensagem: 'Dispositivo pareado com sucesso!',
      dispositivo: novoDispositivo,
      conectado: true,
    });
  },
);

// Acionar alerta de pânico pelo chaveiro
app.post(
  '/v1/dispositivos/alerta-panico',
  express.json({ limit: '10kb' }),
  autenticarUsuario,
  (req, res) => {
    const usuarios = carregarUsuarios();
    const index = usuarios.findIndex(u => u.id === req.usuarioId);

    if (index === -1) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.',
      });
    }

    const dispositivo = usuarios[index].dispositivo;

    if (!dispositivo || !dispositivo.conectado) {
      return res.status(400).json({
        erro: 'Nenhum dispositivo conectado para acionamento do botão de pânico.',
      });
    }

    // Atualiza o último ping do dispositivo
    dispositivo.ultimoPing = new Date().toISOString();

    const novoAlerta = {
      id: randomBytes(16).toString('hex'),
      tipo: 'botao_panico_chaveiro',
      dispositivoId: dispositivo.id,
      dispositivoNome: dispositivo.nome,
      dataHora: new Date().toISOString(),
      status: 'acionado',
      localizacao: {
        latitude: req.body?.latitude || -23.55052,
        longitude: req.body?.longitude || -46.633308,
      },
    };

    if (!Array.isArray(usuarios[index].alertasPanico)) {
      usuarios[index].alertasPanico = [];
    }

    usuarios[index].alertasPanico.push(novoAlerta);
    salvarUsuarios(usuarios);

    return res.status(201).json({
      mensagem: 'Alerta de pânico registrado com sucesso!',
      alerta: novoAlerta,
      dispositivo,
    });
  },
);

// Desparear dispositivo
app.post('/v1/dispositivos/desparear', autenticarUsuario, (req, res) => {
  const usuarios = carregarUsuarios();
  const index = usuarios.findIndex(u => u.id === req.usuarioId);

  if (index === -1) {
    return res.status(404).json({
      erro: 'Usuário não encontrado.',
    });
  }

  usuarios[index].dispositivo = null;
  salvarUsuarios(usuarios);

  return res.status(200).json({
    mensagem: 'Dispositivo despareado com sucesso!',
    dispositivo: null,
    conectado: false,
  });
});

app.use('/v1/verificacao', (req, res, next) => {
  const token = req
    .get('authorization')
    ?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1];

  const sessao = token ? sessoes.get(token) : undefined;

  if (!sessao || sessao.expiraEm <= Date.now()) {
    return res.status(401).json({
      erro: 'Sessão expirada. Inicie novamente pela identidade.',
    });
  }

  req.tokenDemo = token;
  req.sessaoDemo = sessao;

  next();
});

app.put(
  '/v1/verificacao/:parte',
  express.raw({
    type: 'image/jpeg',
    limit: '5mb',
  }),
  async (req, res) => {
    let imagemProcessada;

    try {
      const parte = req.params.parte;
      const sessao = req.sessaoDemo;

      if (!partes.includes(parte)) {
        return res.status(400).json({
          erro: 'Parte inválida.',
        });
      }

      if (sessao.finalizada) {
        return res.status(409).json({
          erro: 'Esta coleta já foi encerrada.',
        });
      }

      const arquivo = req.body;

      const jpegValido =
        Buffer.isBuffer(arquivo)
        && arquivo.length >= 3
        && arquivo[0] === 0xff
        && arquivo[1] === 0xd8
        && arquivo[2] === 0xff;

      if (!jpegValido) {
        return res.status(415).json({
          erro: 'Envie uma imagem JPEG válida.',
        });
      }

      const opcoes = {
        limitInputPixels: 20_000_000,
        failOn: 'warning',
      };

      const dados = await sharp(arquivo, opcoes).metadata();

      if (
        dados.format !== 'jpeg'
        || !dados.width
        || !dados.height
        || dados.width < 200
        || dados.height < 200
      ) {
        return res.status(422).json({
          erro: 'Imagem inválida ou pequena demais.',
        });
      }

      imagemProcessada = await sharp(arquivo, opcoes)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      if (
        sessao.expiraEm <= Date.now()
        || sessoes.get(req.tokenDemo) !== sessao
      ) {
        return res.status(401).json({
          erro: 'A sessão expirou durante o envio.',
        });
      }

      if (sessao.finalizada) {
        return res.status(409).json({
          erro: 'Coleta já encerrada.',
        });
      }

      // Somente registra o recebimento; não salva a imagem.
      sessao.recebidos[parte] = true;

      return res.json({
        recebidos: sessao.recebidos,
        imagemArmazenada: false,
        identidadeVerificada: false,
      });
    } catch {
      return res.status(422).json({
        erro: 'Não foi possível processar a imagem.',
      });
    } finally {
      if (Buffer.isBuffer(req.body)) {
        req.body.fill(0);
      }

      imagemProcessada?.fill(0);
    }
  },
);

app.post('/v1/verificacao/concluir', (req, res) => {
  const sessao = req.sessaoDemo;

  if (!partes.every(parte => sessao.recebidos[parte])) {
    return res.status(409).json({
      erro: 'Ainda faltam imagens.',
    });
  }

  sessao.finalizada = true;

  // A sessão deixa de ser necessária após a conclusão.
  sessoes.delete(req.tokenDemo);

  return res.json({
    status: 'demo_recebida',
    identidadeVerificada: false,
  });
});

app.use((erro, req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    req.body.fill(0);
  }

  if (res.headersSent) {
    return next(erro);
  }

  const status =
    erro.type === 'entity.too.large' ? 413
      : erro.type === 'entity.parse.failed' ? 400
        : 500;

  return res.status(status).json({
    erro:
      status === 413
        ? 'A imagem ultrapassou 5 MiB.'
        : 'Solicitação inválida ou erro de processamento.',
  });
});

const servidor = app.listen(3333, '127.0.0.1', () => {
  console.log('DEMO LOCAL: não use documentos ou rostos reais.');
  console.log('API: http://127.0.0.1:3333');
  console.log('Sessões iniciadas automaticamente pelo app.');
});

servidor.requestTimeout = 30_000;
servidor.headersTimeout = 10_000;

module.exports = { app, servidor, sessoes, carregarUsuarios, salvarUsuarios };
