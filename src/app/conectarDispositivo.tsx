import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// "CSS"
import { styles } from '../style';
import { obterToken, requisicaoApi, limparSessao, Dispositivo } from '../lib/auth';

const DISPOSITIVOS_PROXIMOS_MOCK = [
  { id: 'dev-1', nome: 'Chaveiro Medusa Pro', codigo: 'MEDUSA-CH-987' },
  { id: 'dev-2', nome: 'Colar Medusa Smart', codigo: 'MEDUSA-COL-442' },
];

export default function ConectarDispositivoScreen() {
  const router = useRouter();

  const [dispositivo, setDispositivo] = useState<Dispositivo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [acionandoPanico, setAcionandoPanico] = useState(false);

  // Modal de pareamento
  const [modalPareamento, setModalPareamento] = useState(false);
  const [nomeNovoDispositivo, setNomeNovoDispositivo] = useState('');
  const [codigoNovoDispositivo, setCodigoNovoDispositivo] = useState('');
  const [salvandoPareamento, setSalvandoPareamento] = useState(false);

  // Carregar status do dispositivo
  const carregarStatus = async () => {
    try {
      setCarregando(true);
      const token = obterToken();

      if (!token) {
        return;
      }

      const resposta = await requisicaoApi('/v1/dispositivos/status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        if (resposta.status === 401) {
          limparSessao();
          Alert.alert('Sessão expirada', 'Faça login novamente.');
          router.replace('/');
          return;
        }
        throw new Error(dados?.erro || 'Falha ao buscar status do dispositivo.');
      }

      setDispositivo(dados?.dispositivo || null);
    } catch (e: any) {
      console.warn('Erro ao carregar dispositivo:', e?.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarStatus();
  }, []);

  // Parear novo dispositivo
  const handleParearDispositivo = async (nome?: string, codigo?: string) => {
    const nomeFinal = nome || nomeNovoDispositivo.trim() || 'Chaveiro Medusa Pro';
    const codigoFinal = codigo || codigoNovoDispositivo.trim() || 'MEDUSA-CH-PRO';

    try {
      setSalvandoPareamento(true);
      const token = obterToken();

      if (!token) {
        Alert.alert('Erro', 'Sessão indisponível. Faça login novamente.');
        return;
      }

      const resposta = await requisicaoApi('/v1/dispositivos/parear', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nomeFinal,
          codigoIdentificador: codigoFinal,
        }),
      });

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(dados?.erro || 'Não foi possível parear o dispositivo.');
      }

      setDispositivo(dados.dispositivo);
      setModalPareamento(false);
      setNomeNovoDispositivo('');
      setCodigoNovoDispositivo('');

      Alert.alert('Sucesso! 🔗', `Dispositivo "${dados.dispositivo.nome}" pareado e conectado via Bluetooth LE!`);
    } catch (e: any) {
      Alert.alert('Erro ao parear', e.message || 'Falha ao conectar com o chaveiro.');
    } finally {
      setSalvandoPareamento(false);
    }
  };

  // Testar alerta de pânico (POST /v1/dispositivos/alerta-panico)
  const handleTestarPanico = async () => {
    try {
      setAcionandoPanico(true);
      const token = obterToken();

      if (!token) {
        Alert.alert('Erro', 'Faça login para realizar o teste.');
        return;
      }

      const resposta = await requisicaoApi('/v1/dispositivos/alerta-panico', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: -23.55052,
          longitude: -46.633308,
        }),
      });

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(dados?.erro || 'Falha ao registrar alerta de pânico.');
      }

      Alert.alert(
        'SINAL DE PÂNICO TESTADO COM SUCESSO! 🚨',
        'O botão do seu chaveiro acionou o sistema Medusa corretamente.\nEm uma emergência real, a central e seus contatos seriam notificados imediatamente com sua localização GPS.',
      );

      // Atualiza último ping
      if (dados.dispositivo) {
        setDispositivo(dados.dispositivo);
      }
    } catch (e: any) {
      Alert.alert('Erro no teste', e.message || 'Não foi possível disparar o teste.');
    } finally {
      setAcionandoPanico(false);
    }
  };

  // Desparear dispositivo
  const handleDesparear = () => {
    Alert.alert(
      'Desconectar Chaveiro',
      'Deseja desparear este dispositivo Medusa da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = obterToken();
              await requisicaoApi('/v1/dispositivos/desparear', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              });
              setDispositivo(null);
              Alert.alert('Desconectado', 'Chaveiro desvinculado com sucesso.');
            } catch {
              setDispositivo(null);
            }
          },
        },
      ],
    );
  };

  const formatarData = (iso?: string) => {
    if (!iso) return 'Agora';
    try {
      const data = new Date(iso);
      return data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recente';
    }
  };

  return (
    <View style={styles.homeContainer}>
      {/* Cabeçalho */}
      <View style={styles.deviceHeader}>
        <View style={styles.deviceHeaderTop}>
          <TouchableOpacity
            style={styles.rotasIconButton}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/telaInicial');
            }}
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.deviceHeaderTitle}>Dispositivo Medusa</Text>

          <TouchableOpacity
            style={styles.rotasIconButton}
            onPress={() => setModalPareamento(true)}
          >
            <Feather name="plus" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 25 }}>
        {carregando ? (
          <View style={[styles.deviceEmptyCard, { paddingVertical: 50 }]}>
            <ActivityIndicator size="large" color="#B00D58" />
            <Text style={[styles.linkText, { marginTop: 15 }]}>
              Verificando conexão Bluetooth...
            </Text>
          </View>
        ) : dispositivo && dispositivo.conectado ? (
          /* Card do Chaveiro Conectado */
          <View>
            <View style={styles.deviceHeroCard}>
              <View style={styles.deviceHeroHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <MaterialCommunityIcons name="shield-key" size={32} color="#B00D58" />
                  <View>
                    <Text style={styles.deviceHeroTitle}>{dispositivo.nome}</Text>
                    <Text style={styles.deviceHeroCode}>
                      {dispositivo.codigoIdentificador || 'ID: MEDUSA-CH-PRO'}
                    </Text>
                  </View>
                </View>

                <View style={styles.deviceBadgeConnected}>
                  <View style={styles.deviceBadgeConnectedDot} />
                  <Text style={styles.deviceBadgeConnectedText}>Conectado</Text>
                </View>
              </View>

              {/* Bateria do dispositivo */}
              <View style={styles.deviceBatteryRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons
                    name={
                      dispositivo.nivelBateria > 50
                        ? 'battery-high'
                        : dispositivo.nivelBateria > 20
                        ? 'battery-medium'
                        : 'battery-low'
                    }
                    size={22}
                    color={dispositivo.nivelBateria > 20 ? '#2A9D8F' : '#E63946'}
                  />
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
                    Nível da Bateria
                  </Text>
                </View>
                <Text style={{ color: '#2A9D8F', fontSize: 16, fontWeight: 'bold' }}>
                  {dispositivo.nivelBateria}%
                </Text>
              </View>

              <View style={styles.deviceBatteryBarContainer}>
                <View
                  style={[
                    styles.deviceBatteryBarFill,
                    {
                      width: `${Math.min(100, Math.max(0, dispositivo.nivelBateria))}%`,
                      backgroundColor: dispositivo.nivelBateria > 20 ? '#2A9D8F' : '#E63946',
                    },
                  ]}
                />
              </View>

              {/* Metadados: Firmware e Último Sinal */}
              <View style={styles.deviceMetaRow}>
                <View style={styles.deviceMetaItem}>
                  <Text style={styles.deviceMetaLabel}>ÚLTIMO SINAL</Text>
                  <Text style={styles.deviceMetaVal}>
                    Hoje, {formatarData(dispositivo.ultimoPing)}
                  </Text>
                </View>

                <View style={styles.deviceMetaItem}>
                  <Text style={styles.deviceMetaLabel}>FIRMWARE</Text>
                  <Text style={styles.deviceMetaVal}>
                    {dispositivo.versaoFirmware || 'v1.4.2'}
                  </Text>
                </View>

                <View style={styles.deviceMetaItem}>
                  <Text style={styles.deviceMetaLabel}>CONEXÃO</Text>
                  <Text style={styles.deviceMetaVal}>Bluetooth LE</Text>
                </View>
              </View>
            </View>

            {/* Botão de Teste de Sinal e Botão de Pânico */}
            <TouchableOpacity
              style={[styles.devicePanicButton, acionandoPanico && { opacity: 0.7 }]}
              onPress={handleTestarPanico}
              disabled={acionandoPanico}
              activeOpacity={0.8}
            >
              {acionandoPanico ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="alert-octagon" size={24} color="#FFFFFF" />
                  <Text style={styles.devicePanicButtonText}>Testar Botão de Pânico</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Ações secundárias */}
            <TouchableOpacity
              style={styles.deviceSecondaryAction}
              onPress={() => router.push('/bluetoothOff')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialCommunityIcons name="bluetooth-off" size={22} color="#A0A0A0" />
                <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
                  Simular Bluetooth Desligado
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#666666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deviceSecondaryAction}
              onPress={handleDesparear}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialCommunityIcons name="link-variant-off" size={22} color="#E63946" />
                <Text style={{ color: '#E63946', fontSize: 14, fontWeight: 'bold' }}>
                  Desparear Chaveiro
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Estado sem chaveiro pareado */
          <View>
            <View style={styles.deviceEmptyCard}>
              <MaterialCommunityIcons name="key-wireless" size={72} color="#555555" />
              <Text style={styles.rotasEmptyTitle}>Nenhum Chaveiro Pareado</Text>
              <Text style={styles.rotasEmptySubtitle}>
                Conecte seu chaveiro ou colar inteligente de segurança Medusa para
                ativar o botão de pânico físico e rastreamento em emergências.
              </Text>

              <TouchableOpacity
                style={styles.devicePairButton}
                onPress={() => setModalPareamento(true)}
              >
                <Feather name="bluetooth" size={18} color="#FFFFFF" />
                <Text style={styles.devicePairButtonText}>Parear Novo Chaveiro</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de Dispositivos Próximos Detectados */}
            <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>
                DISPOSITIVOS PRÓXIMOS DETECTADOS
              </Text>

              {DISPOSITIVOS_PROXIMOS_MOCK.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.deviceItem}
                  onPress={() => handleParearDispositivo(item.nome, item.codigo)}
                >
                  <MaterialCommunityIcons
                    style={styles.deviceIcon}
                    name="bluetooth"
                    size={26}
                    color="#B00D58"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deviceName}>{item.nome}</Text>
                    <Text style={styles.deviceStatus}>Toque para parear • {item.codigo}</Text>
                  </View>
                  <Feather name="plus-circle" size={20} color="#B00D58" />
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.deviceSecondaryAction, { marginHorizontal: 0, marginTop: 10 }]}
                onPress={() => router.push('/bluetoothOff')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <MaterialCommunityIcons name="bluetooth-off" size={22} color="#A0A0A0" />
                  <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
                    Testar tela de Bluetooth Desligado
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de Pareamento Manual */}
      <Modal
        visible={modalPareamento}
        transparent
        animationType="fade"
        onRequestClose={() => setModalPareamento(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Parear Chaveiro Medusa</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome do Dispositivo (ex: Chaveiro Medusa Pro)"
              placeholderTextColor="#A0A0A0"
              value={nomeNovoDispositivo}
              onChangeText={setNomeNovoDispositivo}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Código Identificador (ex: MEDUSA-CH-987)"
              placeholderTextColor="#A0A0A0"
              value={codigoNovoDispositivo}
              onChangeText={setCodigoNovoDispositivo}
              autoCapitalize="characters"
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setNomeNovoDispositivo('');
                  setCodigoNovoDispositivo('');
                  setModalPareamento(false);
                }}
                disabled={salvandoPareamento}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  salvandoPareamento && { opacity: 0.7 },
                ]}
                onPress={() => handleParearDispositivo()}
                disabled={salvandoPareamento}
              >
                {salvandoPareamento ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Conectar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barra de Navegação Inferior (Item Dispositivo Ativo) */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => router.replace('/telaInicial')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="home" size={24} color="#888888" />
          <Text style={styles.bottomNavLabel}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => router.push('/rotas')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="map-marker-path" size={24} color="#888888" />
          <Text style={styles.bottomNavLabel}>Rotas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} activeOpacity={0.8}>
          <MaterialCommunityIcons name="bluetooth-connect" size={24} color="#B00D58" />
          <Text style={[styles.bottomNavLabel, styles.bottomNavLabelActive]}>
            Dispositivo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => router.push('/perfil')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="account" size={24} color="#888888" />
          <Text style={styles.bottomNavLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
