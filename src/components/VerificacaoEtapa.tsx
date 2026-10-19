import React, { useEffect, useRef, useState } from 'react';

import {
  Alert,
  AppState,
  Button,
  Linking,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

import * as api from '../lib/verificacaoApi';

type Props = {
  tipo: 'documento' | 'rosto';
};

export default function VerificacaoEtapa({ tipo }: Props) {
  const camera = useRef<CameraView | null>(null);
  const bloqueado = useRef(false);

  const [permissao, pedirPermissao] = useCameraPermissions();

  const [codigo, setCodigo] = useState('');
  const [confirmado, setConfirmado] = useState(false);

  const [conectado, setConectado] = useState(
    tipo === 'rosto' && api.temSessao(),
  );

  const [indice, setIndice] = useState(0);
  const [cameraAberta, setCameraAberta] = useState(false);
  const [pronta, setPronta] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const [appAtivo, setAppAtivo] = useState(
    AppState.currentState === 'active',
  );

  const partes: api.Parte[] =
    tipo === 'documento' ? ['frente', 'verso'] : ['selfie'];

  const parte = partes[indice];

  useEffect(() => {
    const assinatura = AppState.addEventListener('change', estado => {
      setPronta(false);
      setAppAtivo(estado === 'active');
    });

    return () => assinatura.remove();
  }, []);

  function mostrarErro(erro: unknown) {
    Alert.alert(
      'Não foi possível continuar',
      erro instanceof Error
        ? erro.message
        : 'Confira a conexão e tente novamente.',
    );
  }

  async function parear() {
    if (bloqueado.current || !confirmado) return;

    bloqueado.current = true;
    setOcupado(true);

    try {
      await api.iniciar(codigo);
      setCodigo('');
      setConectado(true);
    } catch (erro) {
      mostrarErro(erro);
    } finally {
      bloqueado.current = false;
      setOcupado(false);
    }
  }

  async function abrirCamera() {
    try {
      const resultado = permissao?.granted
        ? permissao
        : await pedirPermissao();

      if (!resultado.granted) {
        Alert.alert(
          'Permissão necessária',
          'Autorize a câmera nas configurações para continuar.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir configurações',
              onPress: () => { void Linking.openSettings(); },
            },
          ],
        );

        return;
      }

      setPronta(false);
      setCameraAberta(true);
    } catch (erro) {
      mostrarErro(erro);
    }
  }

  async function fotografar() {
    if (!pronta || !camera.current || bloqueado.current) return;

    bloqueado.current = true;
    setOcupado(true);

    let uri: string | undefined;
    let enviada = false;

    try {
      const foto = await camera.current.takePictureAsync({
        quality: 0.6,
        base64: false,
        exif: false,
      });

      if (!foto?.uri) throw new Error('Nenhuma foto foi gerada.');

      uri = foto.uri;

      await api.enviarFoto(parte, uri);
      enviada = true;
    } catch (erro) {
      mostrarErro(erro);
    } finally {
      if (uri) {
        try {
          api.excluirFoto(uri);
        } catch {
          Alert.alert(
            'Cache',
            'Não foi possível remover a foto. Limpe o cache deste app de teste.',
          );
        }
      }

      setCameraAberta(false);
      setPronta(false);

      bloqueado.current = false;
      setOcupado(false);
    }

    if (!enviada) return;

    if (tipo === 'documento') {
      if (indice === 0) {
        setIndice(1);

        Alert.alert(
          'Frente recebida',
          'Agora fotografe o verso do cartão fictício.',
        );
      } else {
        router.push('/rosto');
      }

      return;
    }

    // A foto já chegou. Agora encerra a coleta no servidor.
    Alert.alert(
      'Imagem recebida',
      'Toque em concluir para encerrar a demonstração.',
    );

    setIndice(1);
  }

  async function finalizar() {
    if (bloqueado.current) return;

    bloqueado.current = true;
    setOcupado(true);

    try {
      await api.concluir();

      Alert.alert(
        'Demonstração concluída',
        'Os três arquivos foram recebidos e descartados. '
        + 'Nenhuma identidade foi verificada.',
        [
          {
            text: 'Voltar',
            onPress: () => router.replace('/'),
          },
        ],
      );
    } catch (erro) {
      mostrarErro(erro);
    } finally {
      bloqueado.current = false;
      setOcupado(false);
    }
  }

  const selfieEnviada = tipo === 'rosto' && indice === 1;

  return (
    <View style={s.container}>
      <Text style={s.titulo}>
        {tipo === 'documento'
          ? 'Verificação de identidade'
          : 'Verificação de rosto'}
      </Text>

      <Text style={s.aviso}>
        DEMONSTRAÇÃO: use somente cartões fictícios e desenhos.
        Não fotografe RG, CPF ou rosto de pessoa real.
      </Text>

      {!conectado ? (
        tipo === 'documento' ? (
          <>
            <Text style={s.texto}>
              Digite o código exibido no terminal do backend.
            </Text>

            <TextInput
              style={s.input}
              value={codigo}
              onChangeText={setCodigo}
              placeholder="Código temporário"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            <Text style={s.texto}>
              Confirmo que utilizarei somente dados fictícios.
            </Text>

            <Switch
              value={confirmado}
              onValueChange={setConfirmado}
            />

            <Button
              title={ocupado ? 'Conectando...' : 'Iniciar demonstração'}
              disabled={!confirmado || !codigo.trim() || ocupado}
              onPress={() => void parear()}
              color="#B00D58"
            />
          </>
        ) : (
          <>
            <Text style={s.texto}>
              Comece pela tela de identidade.
            </Text>

            <Button
              title="Ir para identidade"
              onPress={() => router.replace('/identidade')}
            />
          </>
        )
      ) : selfieEnviada ? (
        <Button
          title={ocupado ? 'Concluindo...' : 'Concluir demonstração'}
          disabled={ocupado}
          onPress={() => void finalizar()}
          color="#B00D58"
        />
      ) : cameraAberta ? (
        <>
          {appAtivo && (
            <CameraView
              ref={camera}
              style={s.camera}
              facing={parte === 'selfie' ? 'front' : 'back'}
              mode="picture"
              onCameraReady={() => setPronta(true)}
              onMountError={() => {
                setCameraAberta(false);
                Alert.alert('Câmera', 'Câmera indisponível.');
              }}
            />
          )}

          <Button
            title={ocupado ? 'Enviando...' : 'Fotografar e enviar'}
            disabled={!pronta || ocupado || !appAtivo}
            onPress={() => void fotografar()}
            color="#B00D58"
          />

          <Button
            title="Cancelar captura"
            disabled={ocupado}
            onPress={() => {
              setCameraAberta(false);
              setPronta(false);
            }}
          />
        </>
      ) : (
        <>
          <Text style={s.texto}>
            {parte === 'selfie'
              ? 'Use a câmera frontal para fotografar um desenho de rosto.'
              : `Fotografe ${parte === 'frente' ? 'a frente' : 'o verso'} do cartão fictício.`}
          </Text>

          <Button
            title="Abrir câmera"
            onPress={() => void abrirCamera()}
            color="#B00D58"
          />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
    backgroundColor: '#121212',
    gap: 18,
  },
  titulo: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '700',
  },
  texto: {
    color: '#FFF',
    fontSize: 16,
  },
  aviso: {
    color: '#FFD580',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
  },
  camera: {
    flex: 1,
    minHeight: 200,
  },
});