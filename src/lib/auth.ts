import { Platform } from 'react-native';

export interface Contato {
  id?: string;
  nome: string;
  telefone?: string;
  parentesco?: string;
  [key: string]: any;
}

export interface RotaSalva {
  id?: string;
  nome: string;
  origem?: string;
  destino?: string;
  distancia?: string;
  [key: string]: any;
}

export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  contatos: Contato[];
  rotasSalvas: RotaSalva[];
  rotas?: RotaSalva[];
  criadoEm?: string;
}

// Armazenamento em memória (persiste durante a sessão do app)
let tokenAtual: string | null = null;
let usuarioAtual: PerfilUsuario | null = null;

export const BASE_API_URL = 'http://127.0.0.1:3333';
export const EMULATOR_API_URL = 'http://10.0.2.2:3333';

export function salvarToken(token: string | null) {
  tokenAtual = token;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    if (token) {
      window.localStorage.setItem('medusa_token', token);
    } else {
      window.localStorage.removeItem('medusa_token');
    }
  }
}

export function obterToken(): string | null {
  if (tokenAtual) {
    return tokenAtual;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    const salvo = window.localStorage.getItem('medusa_token');
    if (salvo) {
      tokenAtual = salvo;
      return salvo;
    }
  }
  return null;
}

export function salvarUsuario(usuario: PerfilUsuario | null) {
  usuarioAtual = usuario;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    if (usuario) {
      window.localStorage.setItem('medusa_usuario', JSON.stringify(usuario));
    } else {
      window.localStorage.removeItem('medusa_usuario');
    }
  }
}

export function obterUsuario(): PerfilUsuario | null {
  if (usuarioAtual) {
    return usuarioAtual;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    const salvo = window.localStorage.getItem('medusa_usuario');
    if (salvo) {
      try {
        usuarioAtual = JSON.parse(salvo);
        return usuarioAtual;
      } catch {}
    }
  }
  return null;
}

export function limparSessao() {
  salvarToken(null);
  salvarUsuario(null);
}

export async function requisicaoApi(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const urlPadrao = Platform.OS === 'android' ? `${EMULATOR_API_URL}${endpoint}` : `${BASE_API_URL}${endpoint}`;
  try {
    return await fetch(urlPadrao, options);
  } catch {
    const urlAlternativa = urlPadrao.includes('10.0.2.2')
      ? `${BASE_API_URL}${endpoint}`
      : `${EMULATOR_API_URL}${endpoint}`;
    return await fetch(urlAlternativa, options);
  }
}

