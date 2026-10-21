import React, { useEffect, useRef, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  Alert,
  AppState,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

import * as api from '../lib/verificacaoApi';

type Props = {
  tipo: 'documento' | 'rosto';
};

type BotaoProps = {
  titulo: string;
  onPress: () => void;
  desabilitado?: boolean;
  secundario?: boolean;
};

function Botao({
  titulo,
  onPress,
  desabilitado = false,
  secundario = false,
}: BotaoProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      activeOpacity={0.8}
      disabled={desabilitado}
      onPress={onPress}
      style={[
        s.botao,
        secundario && s.botaoSecundario,
        desabilitado && s.botaoDesabilitado,
      ]}
    >
      <Text style={s.botaoTexto}>{titulo}</Text>
    </TouchableOpacity>
  );
}

export default function VerificacaoEtapa({ tipo }: Props) {
  const camera = useRef<CameraView | null>(null);
  const scroll = useRef<ScrollView | null>(null);
  const bloqueado = useRef(false);

  const { width, height } = useWindowDimensions();
  const [permissao, pedirPermissao] = useCameraPermissions();

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

  const documento = tipo === 'documento';
  const selfieEnviada = !documento && indice === 1;

  const parte: api.Parte = documento
    ? indice === 0
      ? 'frente'
      : 'verso'
    : 'selfie';

  const compacto = height < 700 || width < 360;
  const margemHorizontal = width < 360 ? 16 : 28;

  const larguraDisponivel = Math.max(
    0,
    Math.min(width - margemHorizontal * 2, 460),
  );

  const tamanhoImagem = Math.min(
    larguraDisponivel,
    compacto ? 150 : 200,
  );

  const alturaCamera = Math.max(
    180,
    Math.min(height * 0.45, 360),
  );

  const descricao = documento
    ? 'Fotografe a frente e o verso do cartão fictício. '
      + 'Escolha um ambiente iluminado e mantenha todas as bordas '
      + 'visíveis para que a imagem fique nítida.'
    : 'Posicione um desenho de rosto no centro da câmera frontal. '
      + 'Evite reflexos e mantenha o aparelho firme durante a captura.';

  useEffect(() => {
    const assinatura = AppState.addEventListener('change', estado => {
      setPronta(false);
      setAppAtivo(estado === 'active');
    });

    return () => assinatura.remove();
  }, []);

  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: true });
  }, [tipo, indice]);

  function mostrarErro(erro: unknown) {
    Alert.alert(
      'Não foi possível continuar',
      erro instanceof Error
        ? erro.message
        : 'Confira a conexão e tente novamente.',
    );
  }

  function tratarErro(erro: unknown) {
    if (!api.temSessao()) {
      setConectado(false);
      setIndice(0);
    }

    mostrarErro(erro);
  }

  async function prepararCamera() {
    const resultado = permissao?.granted
      ? permissao
      : await pedirPermissao();

    if (!resultado.granted) {
      Alert.alert(
        'Permissão necessária',
        'Autorize a câmera nas configurações para continuar.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Abrir configurações',
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
      );

      return false;
    }

    return true;
  }

  async function abrirCamera() {
    if (bloqueado.current) return;

    bloqueado.current = true;
    setOcupado(true);

    try {
      const autorizada = await prepararCamera();

      if (!autorizada) return;

      // Só cria uma nova sessão ao começar pela identidade.
      if (!api.temSessao()) {
        if (!documento) {
          setConectado(false);

          throw new Error(
            'Inicie novamente pela etapa de identidade.',
          );
        }

        await api.iniciar();
        setIndice(0);
      }

      setConectado(true);
      setPronta(false);
      setCameraAberta(true);
    } catch (erro) {
      tratarErro(erro);
    } finally {
      bloqueado.current = false;
      setOcupado(false);
    }
  }

  function verificar() {
    if (bloqueado.current) return;

    if (!conectado || !api.temSessao()) {
      Alert.alert(
        'Antes de começar',
        'Esta é uma demonstração. Use somente um cartão fictício '
          + 'e um desenho de rosto. As imagens serão enviadas ao '
          + 'servidor local para processamento e descarte. '
          + 'Nenhuma identidade será verificada.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Continuar',
            onPress: () => {
              void abrirCamera();
            },
          },
        ],
      );

      return;
    }

    void abrirCamera();
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

      if (!foto?.uri) {
        throw new Error('Nenhuma foto foi gerada.');
      }

      uri = foto.uri;

      await api.enviarFoto(parte, uri);
      enviada = true;
    } catch (erro) {
      tratarErro(erro);
    } finally {
      if (uri) {
        try {
          api.excluirFoto(uri);
        } catch {
          Alert.alert(
            'Cache',
            'Não foi possível remover a foto. '
              + 'Limpe o cache deste app de teste.',
          );
        }
      }

      setCameraAberta(false);
      setPronta(false);

      bloqueado.current = false;
      setOcupado(false);
    }

    if (!enviada) return;

    if (documento) {
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

    setIndice(1);

    Alert.alert(
      'Imagem recebida',
      'Toque em concluir para encerrar a demonstração.',
    );
  }

  async function finalizar() {
    if (bloqueado.current) return;

    bloqueado.current = true;
    setOcupado(true);

    try {
      await api.concluir();

      setConectado(false);
      setIndice(0);

      Alert.alert(
        'Demonstração concluída',
        'Os três arquivos foram recebidos e descartados. '
          + 'Nenhuma identidade foi verificada.',
        [
          {
            text: 'Voltar',
            onPress: () => router.replace('/telaInicial'),
          },
        ],
      );
    } catch (erro) {
      tratarErro(erro);
    } finally {
      bloqueado.current = false;
      setOcupado(false);
    }
  }

  const precisaIdentidade = !documento && !conectado;

  return (
    <View style={s.container}>
      <ScrollView
        ref={scroll}
        style={s.scroll}
        contentContainerStyle={s.scrollConteudo}
        showsVerticalScrollIndicator
      >
        <View
          style={[
            s.header,
            compacto && s.headerCompacto,
          ]}
        >
          <Text
            style={[
              s.titulo,
              compacto && s.tituloCompacto,
            ]}
          >
            {documento
              ? 'Verificação de identidade'
              : 'Verificação de rosto'}
          </Text>
        </View>

        <View
          style={[
            s.conteudo,
            {
              paddingHorizontal: margemHorizontal,
              paddingTop: compacto ? 20 : 28,
            },
          ]}
        >
          <View style={s.coluna}>
            <Text style={s.etapa}>
              {documento ? 'ETAPA 1 DE 2' : 'ETAPA 2 DE 2'}
            </Text>

            {!cameraAberta && (
              <>
                <View
                  style={[
                    s.ilustracao,
                    {
                      width: tamanhoImagem,
                      height: tamanhoImagem,
                    },
                  ]}
                >
                  <Image
                    source={
                      documento
                        ? require('../../assets/images/IconIdentidade.png')
                        : require('../../assets/images/IconFace.png')
                    }
                    style={s.imagemVerificacao}
                    resizeMode="contain"
                    accessibilityLabel={
                      documento
                        ? 'Ilustração de identificação'
                        : 'Ilustração de rosto'
                    }
                  />
                </View>

                <Text style={s.descricao}>{descricao}</Text>
              </>
            )}

            <View style={s.avisoContainer}>
              <Text style={s.aviso}>
                Demonstração: use somente cartões fictícios e desenhos.
                Não envie documentos ou rostos reais.
              </Text>
            </View>

            {precisaIdentidade ? (
              <View style={s.acoes}>
                <Text style={s.instrucao}>
                  Para continuar, complete primeiro a etapa de identidade.
                </Text>

                <Botao
                  titulo="Ir para identidade"
                  onPress={() => router.replace('/identidade')}
                />
              </View>
            ) : selfieEnviada ? (
              <View style={s.acoes}>
                <View style={s.recebida}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={28}
                    color="#69D19C"
                  />

                  <Text style={s.recebidaTexto}>
                    Imagem recebida com sucesso.
                  </Text>
                </View>

                <Botao
                  titulo={
                    ocupado
                      ? 'Concluindo...'
                      : 'Concluir demonstração'
                  }
                  desabilitado={ocupado}
                  onPress={() => void finalizar()}
                />
              </View>
            ) : cameraAberta ? (
              <View style={s.acoes}>
                <Text style={s.instrucao}>
                  {documento
                    ? parte === 'frente'
                      ? 'Enquadre a frente do cartão fictício.'
                      : 'Enquadre o verso do cartão fictício.'
                    : 'Enquadre o desenho de rosto na câmera frontal.'}
                </Text>

                <View
                  style={[
                    s.cameraContainer,
                    { height: alturaCamera },
                  ]}
                >
                  {appAtivo && (
                    <CameraView
                      ref={camera}
                      style={s.camera}
                      facing={
                        parte === 'selfie' ? 'front' : 'back'
                      }
                      mode="picture"
                      onCameraReady={() => setPronta(true)}
                      onMountError={() => {
                        setCameraAberta(false);
                        setPronta(false);

                        Alert.alert(
                          'Câmera',
                          'Câmera indisponível.',
                        );
                      }}
                    />
                  )}
                </View>

                <Botao
                  titulo={
                    ocupado
                      ? 'Enviando...'
                      : 'Fotografar e enviar'
                  }
                  desabilitado={
                    !pronta || ocupado || !appAtivo
                  }
                  onPress={() => void fotografar()}
                />

                <Botao
                  titulo="Cancelar captura"
                  secundario
                  desabilitado={ocupado}
                  onPress={() => {
                    setCameraAberta(false);
                    setPronta(false);
                  }}
                />
              </View>
            ) : (
              <View style={s.acoes}>
                {documento && (
                  <View style={s.progresso}>
                    <View style={s.progressoItem}>
                      <View
                        style={[
                          s.marcador,
                          indice === 0
                            ? s.marcadorAtivo
                            : s.marcadorConcluido,
                        ]}
                      >
                        {indice === 0 ? (
                          <Text style={s.marcadorTexto}>1</Text>
                        ) : (
                          <MaterialCommunityIcons
                            name="check"
                            size={18}
                            color="#FFFFFF"
                          />
                        )}
                      </View>

                      <Text style={s.progressoTexto}>
                        Frente
                      </Text>
                    </View>

                    <View style={s.linhaProgresso} />

                    <View style={s.progressoItem}>
                      <View
                        style={[
                          s.marcador,
                          indice === 1 && s.marcadorAtivo,
                        ]}
                      >
                        <Text style={s.marcadorTexto}>2</Text>
                      </View>

                      <Text style={s.progressoTexto}>
                        Verso
                      </Text>
                    </View>
                  </View>
                )}

                <Text style={s.instrucao}>
                  {documento
                    ? indice === 0
                      ? 'Comece fotografando a frente do cartão fictício.'
                      : 'Frente recebida! Agora fotografe o verso.'
                    : 'Tudo pronto! Abra a câmera para capturar o desenho.'}
                </Text>

                <Botao
                  titulo={
                    ocupado
                      ? 'Preparando...'
                      : documento
                        ? indice === 0
                          ? 'Verificar frente'
                          : 'Verificar verso'
                        : 'Verificar rosto'
                  }
                  desabilitado={ocupado}
                  onPress={verificar}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  scroll: {
    flex: 1,
  },

  scrollConteudo: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  header: {
    width: '100%',
    backgroundColor: '#B00D58',
    paddingTop: 64,
    paddingBottom: 42,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },

  headerCompacto: {
    paddingTop: 44,
    paddingBottom: 30,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  titulo: {
    width: '100%',
    maxWidth: 360,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },

  tituloCompacto: {
    fontSize: 25,
  },

  conteudo: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 24,
  },

  coluna: {
    width: '100%',
    maxWidth: 460,
    alignItems: 'center',
  },

  etapa: {
    width: '100%',
    color: '#BDBDBD',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },

  ilustracao: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  imagemVerificacao: {
    width: '100%',
    height: '100%',
  },

  descricao: {
    width: '100%',
    color: '#E0E0E0',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 22,
  },

  avisoContainer: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#251E14',
    marginBottom: 24,
  },

  aviso: {
    color: '#EBC88C',
    fontSize: 12,
    textAlign: 'center',
  },

  acoes: {
    width: '100%',
    gap: 16,
  },

  instrucao: {
    width: '100%',
    color: '#C8C8C8',
    fontSize: 14,
    textAlign: 'center',
  },

  botao: {
    width: '100%',
    minHeight: 50,
    backgroundColor: '#B00D58',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  botaoTexto: {
    width: '100%',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },

  botaoSecundario: {
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#555555',
  },

  botaoDesabilitado: {
    opacity: 0.45,
  },

  cameraContainer: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444444',
  },

  camera: {
    flex: 1,
  },

  progresso: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  progressoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },

  marcador: {
    minWidth: 34,
    minHeight: 34,
    padding: 6,
    borderRadius: 24,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },

  marcadorAtivo: {
    backgroundColor: '#B00D58',
  },

  marcadorConcluido: {
    backgroundColor: '#288653',
  },

  marcadorTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  progressoTexto: {
    width: '100%',
    color: '#C8C8C8',
    fontSize: 12,
    textAlign: 'center',
  },

  linhaProgresso: {
    flex: 0.6,
    height: 2,
    backgroundColor: '#444444',
    marginHorizontal: 8,
  },

  recebida: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  recebidaTexto: {
    color: '#69D19C',
    fontSize: 14,
    flexShrink: 1,
  },
});