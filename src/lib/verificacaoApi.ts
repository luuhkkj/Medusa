import { fetch } from 'expo/fetch';
import { File } from 'expo-file-system';

export type Parte = 'frente' | 'verso' | 'selfie';

// Configuração da demonstração no emulador Android.
const API = 'http://10.0.2.2:3333';

// Existe somente na memória do app.
let token: string | null = null;

type RespostaApi = {
  token?: string;
  erro?: string;
};

async function requisicao(
  caminho: string,
  metodo: string,
  corpo?: string | File,
  tipo?: string,
  exigeSessao = true,
): Promise<RespostaApi> {
  if (exigeSessao && !token) {
    throw new Error(
      'Sessão indisponível. Inicie novamente pela identidade.',
    );
  }

  const abortar = new AbortController();
  const timer = setTimeout(() => abortar.abort(), 30_000);

  try {
    const resposta = await fetch(`${API}${caminho}`, {
      method: metodo,
      headers: {
        ...(exigeSessao && token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...(tipo ? { 'Content-Type': tipo } : {}),
      },
      body: corpo,
      signal: abortar.signal,
    });

    if (resposta.status === 401) {
      token = null;
    }

    const texto = await resposta.text();
    let dados: RespostaApi = {};

    if (texto) {
      try {
        dados = JSON.parse(texto);
      } catch {
        throw new Error(
          `Resposta inválida do servidor (HTTP ${resposta.status}).`,
        );
      }
    }

    if (!resposta.ok) {
      throw new Error(
        dados.erro
          ?? `Não foi possível continuar (HTTP ${resposta.status}).`,
      );
    }

    return dados;
  } finally {
    clearTimeout(timer);
  }
}

export function temSessao() {
  return token !== null;
}

export async function iniciar() {
  token = null;

  const dados = await requisicao(
    '/demo/sessao',
    'POST',
    JSON.stringify({
      somenteDadosFicticios: true,
    }),
    'application/json',
    false,
  );

  if (typeof dados.token !== 'string' || !dados.token) {
    throw new Error(
      'Não foi possível iniciar a demonstração.',
    );
  }

  token = dados.token;
}

export async function enviarFoto(parte: Parte, uri: string) {
  const arquivo = new File(uri);

  if (!arquivo.exists || arquivo.size > 5 * 1024 * 1024) {
    throw new Error(
      'Foto indisponível ou maior que 5 MiB.',
    );
  }

  await requisicao(
    `/v1/verificacao/${parte}`,
    'PUT',
    arquivo,
    'image/jpeg',
  );
}

export async function concluir() {
  await requisicao('/v1/verificacao/concluir', 'POST');
  token = null;
}

export function excluirFoto(uri: string) {
  const arquivo = new File(uri);

  if (arquivo.exists) {
    arquivo.delete();
  }
}