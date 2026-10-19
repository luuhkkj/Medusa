import { fetch } from 'expo/fetch';
import { File } from 'expo-file-system';

export type Parte = 'frente' | 'verso' | 'selfie';

// Exclusivamente para o teste local por USB.
const API = 'http://127.0.0.1:3333';

// Existe somente na memória do app.
let token: string | null = null;

async function requisicao(
  caminho: string,
  metodo: string,
  corpo?: string | File,
  tipo?: string,
): Promise<void> {
  const abortar = new AbortController();
  const timer = setTimeout(() => abortar.abort(), 30_000);

  try {
    const resposta = await fetch(`${API}${caminho}`, {
      method: metodo,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tipo ? { 'Content-Type': tipo } : {}),
      },
      body: corpo,
      signal: abortar.signal,
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      if (resposta.status === 401) token = null;

      throw new Error(
        dados.erro ?? 'Não foi possível completar a solicitação.',
      );
    }
  } finally {
    clearTimeout(timer);
  }
}

export function temSessao() {
  return token !== null;
}

export async function iniciar(codigo: string) {
  token = null;

  const abortar = new AbortController();
  const timer = setTimeout(() => abortar.abort(), 15_000);

  try {
    const resposta = await fetch(`${API}/demo/sessao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: codigo.trim(),
        somenteDadosFicticios: true,
      }),
      signal: abortar.signal,
    });

    const dados = await resposta.json();

    if (!resposta.ok || typeof dados.token !== 'string') {
      throw new Error(dados.erro ?? 'Falha no pareamento.');
    }

    token = dados.token;
  } finally {
    clearTimeout(timer);
  }
}

export async function enviarFoto(parte: Parte, uri: string) {
  const arquivo = new File(uri);

  if (!arquivo.exists || arquivo.size > 5 * 1024 * 1024) {
    throw new Error('Foto indisponível ou maior que 5 MiB.');
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

  if (arquivo.exists) arquivo.delete();
}