const express = require('express');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const sharp = require('sharp');

const {
  randomBytes,
  timingSafeEqual,
} = require('node:crypto');

if (process.env.NODE_ENV === 'production') {
  throw new Error('Demonstração local: uso em produção bloqueado.');
}

const app = express();
const sessoes = new Map();

const codigoLocal = randomBytes(16).toString('hex');
const partes = ['frente', 'verso', 'selfie'];

app.disable('x-powered-by');
app.use(helmet());

// Somente conexão local. Não liberar na rede.
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');

  const ip = req.socket.remoteAddress;
  const local = [
    '127.0.0.1',
    '::1',
    '::ffff:127.0.0.1',
  ].includes(ip);

  if (!local || req.get('origin')) {
    return res.status(403).json({
      erro: 'API disponível somente para demonstração local.',
    });
  }

  next();
});

app.use(rateLimit({
  windowMs: 60_000,
  limit: 60,
  message: { erro: 'Muitas solicitações. Aguarde um minuto.' },
}));

function codigoValido(valor) {
  if (typeof valor !== 'string') return false;

  const recebido = Buffer.from(valor);
  const esperado = Buffer.from(codigoLocal);

  return recebido.length === esperado.length
    && timingSafeEqual(recebido, esperado);
}

setInterval(() => {
  for (const [token, sessao] of sessoes) {
    if (sessao.expiraEm <= Date.now()) {
      sessoes.delete(token);
    }
  }
}, 30_000).unref();

// Pareamento de desenvolvimento, NÃO é login de usuário.
app.post(
  '/demo/sessao',
  express.json({ limit: '2kb' }),
  (req, res) => {
    if (
      !codigoValido(req.body?.codigo)
      || req.body?.somenteDadosFicticios !== true
    ) {
      return res.status(401).json({
        erro: 'Código incorreto ou aviso não confirmado.',
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

    res.status(201).json({ token });
  },
);

app.use('/v1', (req, res, next) => {
  const token = req.get('authorization')
    ?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1];

  const sessao = token ? sessoes.get(token) : undefined;

  if (!sessao || sessao.expiraEm <= Date.now()) {
    return res.status(401).json({
      erro: 'Sessão expirada. Volte e inicie novamente.',
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
        return res.status(400).json({ erro: 'Parte inválida.' });
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

      // Guarda somente se o arquivo foi recebido.
      // NÃO guarda a foto e NÃO verifica identidade.
      sessao.recebidos[parte] = true;

      res.json({
        recebidos: sessao.recebidos,
        imagemArmazenada: false,
        identidadeVerificada: false,
      });
    } catch {
      res.status(422).json({
        erro: 'Não foi possível processar a imagem.',
      });
    } finally {
      if (Buffer.isBuffer(req.body)) req.body.fill(0);
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

  res.json({
    status: 'demo_recebida',
    identidadeVerificada: false,
  });
});

app.use((erro, req, res, next) => {
  if (Buffer.isBuffer(req.body)) req.body.fill(0);

  if (res.headersSent) return next(erro);

  const status =
    erro.type === 'entity.too.large' ? 413
    : erro.type === 'entity.parse.failed' ? 400
    : 500;

  res.status(status).json({
    erro: status === 413
      ? 'A imagem ultrapassou 5 MiB.'
      : 'Solicitação inválida ou erro de processamento.',
  });
});

const servidor = app.listen(3333, '127.0.0.1', () => {
  console.log('DEMO LOCAL: não use documentos ou rostos reais.');
  console.log('API: http://127.0.0.1:3333');
  console.log(`Código temporário para digitar no app: ${codigoLocal}`);
});

servidor.requestTimeout = 30_000;
servidor.headersTimeout = 10_000;