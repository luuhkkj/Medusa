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

  const local = [
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