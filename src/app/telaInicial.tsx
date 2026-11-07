import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// "CSS"
import { styles } from '../style';
import {
  obterToken,
  requisicaoApi,
  obterUsuario,
  PontoRisco,
  RotaSalva,
  Viagem,
} from '../lib/auth';

export default function TelaInicialScreen() {
  const router = useRouter();

  const [usuarioNome, setUsuarioNome] = useState('Usuário');
  const [pontosRisco, setPontosRisco] = useState<PontoRisco[]>([]);
  const [rotasSalvas, setRotasSalvas] = useState<RotaSalva[]>([]);
  const [carregandoPontos, setCarregandoPontos] = useState(true);

  // Busca e seleção de destino
  const [buscaDestino, setBuscaDestino] = useState('');
  const [buscaFocada, setBuscaFocada] = useState(false);
  const [iniciandoViagem, setIniciandoViagem] = useState(false);
  const [viagemAtiva, setViagemAtiva] = useState<Viagem | null>(null);

  // Ponto de risco selecionado no mapa
  const [pontoSelecionado, setPontoSelecionado] = useState<PontoRisco | null>(null);
  const [filtroRisco, setFiltroRisco] = useState<'todos' | 'alto' | 'medio' | 'baixo'>('todos');

  // Carregar dados iniciais (Perfil, Pontos de Risco e Rotas Salvas)
  useEffect(() => {
    const usuarioSalvo = obterUsuario();
    if (usuarioSalvo?.nome) {
      setUsuarioNome(usuarioSalvo.nome);
    }

    carregarDados();
  }, []);

  const carregarDados = async () => {
    const token = obterToken();
    if (!token) {
      return;
    }

    try {
      setCarregandoPontos(true);

      // Carregar perfil para atualizar nome se necessário
      requisicaoApi('/v1/perfil', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(dados => {
          if (dados?.nome) {
            setUsuarioNome(dados.nome);
          }
        })
        .catch(() => {});

      // Carregar pontos de risco do mapa
      const resPontos = await requisicaoApi('/v1/mapa/pontos-risco', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resPontos.ok) {
        const dadosPontos = await resPontos.json();
        setPontosRisco(Array.isArray(dadosPontos) ? dadosPontos : []);
      }

      // Carregar rotas salvas do usuário para autocomplete
      const resRotas = await requisicaoApi('/v1/rotas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resRotas.ok) {
        const dadosRotas = await resRotas.json();
        setRotasSalvas(Array.isArray(dadosRotas) ? dadosRotas : []);
      }
    } catch (e: any) {
      console.warn('Erro ao carregar dados da tela inicial:', e?.message);
    } finally {
      setCarregandoPontos(false);
    }
  };

  // Filtragem dos pontos de risco no mapa
  const pontosFiltrados = useMemo(() => {
    if (filtroRisco === 'todos') {
      return pontosRisco;
    }
    return pontosRisco.filter(p => p.nivelRisco.toLowerCase() === filtroRisco);
  }, [pontosRisco, filtroRisco]);

  // Rotas salvas filtradas pela busca
  const rotasSugeridas = useMemo(() => {
    const termo = buscaDestino.trim().toLowerCase();
    if (!termo) {
      return rotasSalvas;
    }
    return rotasSalvas.filter(r => {
      const tit = (r.titulo || r.nome || '').toLowerCase();
      const end = (r.endereco || r.destino || '').toLowerCase();
      return tit.includes(termo) || end.includes(termo);
    });
  }, [rotasSalvas, buscaDestino]);

  // Iniciar trajeto / viagem
  const handleIniciarTrajeto = async (destinoEscolhido: string, rotaId?: string) => {
    if (!destinoEscolhido.trim()) {
      Alert.alert('Destino obrigatório', 'Informe para onde deseja ir.');
      return;
    }

    try {
      setIniciandoViagem(true);
      const token = obterToken();

      if (!token) {
        Alert.alert('Atenção', 'Faça login para iniciar um trajeto monitorado.');
        router.replace('/');
        return;
      }

      const resposta = await requisicaoApi('/v1/viagens/iniciar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destino: destinoEscolhido.trim(),
          rotaId: rotaId || null,
        }),
      });

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(dados?.erro || 'Não foi possível iniciar o trajeto.');
      }

      setViagemAtiva(dados.viagem);
      setBuscaDestino('');
      setBuscaFocada(false);

      Alert.alert(
        'Trajeto Iniciado! 🛡️',
        `Destino: ${destinoEscolhido}\nO monitoramento inteligente do Medusa está ativo para este percurso.`,
      );
    } catch (erro: any) {
      Alert.alert('Erro ao iniciar', erro.message || 'Falha ao registrar viagem.');
    } finally {
      setIniciandoViagem(false);
    }
  };

  const handleFinalizarTrajeto = () => {
    Alert.alert(
      'Finalizar trajeto',
      'Você chegou ao seu destino com segurança?',
      [
        { text: 'Ainda em trajeto', style: 'cancel' },
        {
          text: 'Cheguei com segurança',
          onPress: () => {
            setViagemAtiva(null);
            Alert.alert('Sucesso', 'Trajeto concluído com segurança!');
          },
        },
      ],
    );
  };

  // Cores do nível de risco
  const getCorRisco = (nivel: string) => {
    switch (nivel?.toLowerCase()) {
      case 'alto':
        return '#E63946';
      case 'medio':
        return '#F4A261';
      case 'baixo':
        return '#2A9D8F';
      default:
        return '#B00D58';
    }
  };

  // Layout proporcional dos pinos no mapa estilizado
  const calcularPosicaoPino = (index: number, total: number) => {
    // Distribui posições visualmente agradáveis pelo canvas do mapa
    const posicoes = [
      { top: 40, left: 50 },
      { top: 50, right: 60 },
      { top: 110, left: 75 },
      { bottom: 50, left: 45 },
      { bottom: 40, right: 70 },
      { top: 120, right: 45 },
    ];
    return posicoes[index % posicoes.length] || { top: 90, left: 120 };
  };

  return (
    <View style={styles.homeContainer}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Cabeçalho */}
        <View style={styles.homeHeader}>
          <View style={styles.homeHeaderTop}>
            <View>
              <Text style={styles.homeGreeting}>Olá, {usuarioNome}! 👋</Text>
              <Text style={styles.homeSubtitle}>Para onde quer ir hoje com segurança?</Text>
            </View>

            {/* Ícone de perfil no canto superior direito */}
            <TouchableOpacity
              style={styles.homeProfileButton}
              onPress={() => router.push('/perfil')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="account" size={26} color="#B00D58" />
            </TouchableOpacity>
          </View>

          {/* Campo 'Para onde quer ir hoje?' */}
          <View style={styles.homeSearchContainer}>
            <Feather name="search" size={20} color="#B00D58" />
            <TextInput
              style={styles.homeSearchInput}
              placeholder="Para onde quer ir hoje?"
              placeholderTextColor="#A0A0A0"
              value={buscaDestino}
              onChangeText={setBuscaDestino}
              onFocus={() => setBuscaFocada(true)}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (buscaDestino.trim()) {
                  handleIniciarTrajeto(buscaDestino);
                }
              }}
            />
            {buscaDestino.length > 0 && (
              <TouchableOpacity onPress={() => setBuscaDestino('')}>
                <Feather name="x" size={18} color="#A0A0A0" />
              </TouchableOpacity>
            )}
          </View>

          {/* Atalhos para rotas salvas frequentes (Casa, Trabalho, etc.) */}
          {rotasSalvas.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.homeSavedPillsContainer}
            >
              {rotasSalvas.slice(0, 4).map(rota => (
                <TouchableOpacity
                  key={rota.id || rota.titulo}
                  style={styles.homeSavedPill}
                  onPress={() =>
                    handleIniciarTrajeto(rota.endereco || rota.titulo || 'Destino', rota.id)
                  }
                >
                  <Feather
                    name={
                      (rota.icone as any) === 'home'
                        ? 'home'
                        : (rota.icone as any) === 'briefcase'
                        ? 'briefcase'
                        : 'map-pin'
                    }
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.homeSavedPillText}>
                    {rota.titulo || rota.nome || 'Local'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Lista suspensa de rotas sugeridas ao buscar */}
        {buscaFocada && (
          <View style={styles.homeSearchResults}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 12,
                backgroundColor: '#252525',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                {rotasSugeridas.length > 0 ? 'ROTAS SALVAS' : 'INICIAR COM O TEXTO DIGITADO'}
              </Text>
              <TouchableOpacity onPress={() => setBuscaFocada(false)}>
                <Feather name="x" size={16} color="#A0A0A0" />
              </TouchableOpacity>
            </View>

            {rotasSugeridas.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.homeSearchResultItem}
                onPress={() =>
                  handleIniciarTrajeto(item.endereco || item.titulo || '', item.id)
                }
              >
                <Feather name="map-pin" size={18} color="#B00D58" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.homeSearchResultTitle}>{item.titulo || item.nome}</Text>
                  <Text style={styles.homeSearchResultSubtitle} numberOfLines={1}>
                    {item.endereco || item.destino}
                  </Text>
                </View>
                <Feather name="navigation" size={16} color="#A0A0A0" />
              </TouchableOpacity>
            ))}

            {buscaDestino.trim().length > 0 && (
              <TouchableOpacity
                style={[styles.homeSearchResultItem, { backgroundColor: 'rgba(176, 13, 88, 0.1)' }]}
                onPress={() => handleIniciarTrajeto(buscaDestino)}
              >
                <Feather name="arrow-right-circle" size={18} color="#B00D58" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.homeSearchResultTitle}>Ir para "{buscaDestino}"</Text>
                  <Text style={styles.homeSearchResultSubtitle}>Iniciar trajeto com este endereço</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Card de viagem em andamento */}
        {viagemAtiva && (
          <View style={styles.homeActiveTripCard}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="shield-check" size={18} color="#FFFFFF" />
                <Text style={styles.homeActiveTripTitle}>Trajeto em Monitoramento</Text>
              </View>
              <Text style={styles.homeActiveTripSubtitle} numberOfLines={1}>
                Destino: {viagemAtiva.destino}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.homeActiveTripBtn}
              onPress={handleFinalizarTrajeto}
            >
              <Text style={styles.homeActiveTripBtnText}>Cheguei</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seção do Mapa com Pontos de Alerta/Risco */}
        <View style={styles.homeMapSection}>
          <View style={styles.homeMapHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="map-marker-radius" size={22} color="#B00D58" />
              <Text style={styles.homeMapTitle}>Pontos de Risco na Região</Text>
            </View>
            {carregandoPontos && <ActivityIndicator size="small" color="#B00D58" />}
          </View>

          {/* Filtros de Risco */}
          <View style={styles.homeFilterContainer}>
            <TouchableOpacity
              style={[styles.homeFilterPill, filtroRisco === 'todos' && styles.homeFilterPillActive]}
              onPress={() => setFiltroRisco('todos')}
            >
              <Text
                style={[
                  styles.homeFilterPillText,
                  filtroRisco === 'todos' && styles.homeFilterPillTextActive,
                ]}
              >
                Todos ({pontosRisco.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.homeFilterPill, filtroRisco === 'alto' && styles.homeFilterPillActive]}
              onPress={() => setFiltroRisco('alto')}
            >
              <Text
                style={[
                  styles.homeFilterPillText,
                  filtroRisco === 'alto' && styles.homeFilterPillTextActive,
                ]}
              >
                Alto Risco
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.homeFilterPill, filtroRisco === 'medio' && styles.homeFilterPillActive]}
              onPress={() => setFiltroRisco('medio')}
            >
              <Text
                style={[
                  styles.homeFilterPillText,
                  filtroRisco === 'medio' && styles.homeFilterPillTextActive,
                ]}
              >
                Médio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.homeFilterPill, filtroRisco === 'baixo' && styles.homeFilterPillActive]}
              onPress={() => setFiltroRisco('baixo')}
            >
              <Text
                style={[
                  styles.homeFilterPillText,
                  filtroRisco === 'baixo' && styles.homeFilterPillTextActive,
                ]}
              >
                Baixo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Canvas do Mapa */}
          <View style={styles.homeMapCanvas}>
            {/* Linhas de malha viária e grade simuladas */}
            <View style={[styles.homeMapGridH, { top: 60 }]} />
            <View style={[styles.homeMapGridH, { top: 120 }]} />
            <View style={[styles.homeMapGridH, { top: 180 }]} />
            <View style={[styles.homeMapGridV, { left: 90 }]} />
            <View style={[styles.homeMapGridV, { left: 190 }]} />
            <View style={[styles.homeMapGridV, { left: 280 }]} />
            <View style={styles.homeMapRoad1} />
            <View style={styles.homeMapRoad2} />

            {/* Posição atual do usuário */}
            <View style={[styles.homeUserLocationPulse, { top: 100, left: 150 }]} />
            <View style={[styles.homeUserLocationDot, { top: 111, left: 161 }]} />

            {/* Pinos Dinâmicos dos Pontos de Risco */}
            {pontosFiltrados.map((ponto, index) => {
              const posicao = calcularPosicaoPino(index, pontosFiltrados.length);
              const selecionado = pontoSelecionado?.id === ponto.id;
              const cor = getCorRisco(ponto.nivelRisco);

              return (
                <TouchableOpacity
                  key={ponto.id}
                  style={[styles.homeMapPin, posicao as any]}
                  onPress={() => setPontoSelecionado(ponto)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.homeMapPinBadge,
                      { backgroundColor: cor },
                      selecionado && {
                        transform: [{ scale: 1.25 }],
                        borderColor: '#FFD700',
                        borderWidth: 3,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={ponto.nivelRisco === 'baixo' ? 'shield-check' : 'alert'}
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Detalhes do Ponto de Risco selecionado */}
          {pontoSelecionado ? (
            <View style={styles.homeRiskCard}>
              <View style={styles.homeRiskCardHeader}>
                <Text style={styles.homeRiskCardTitle} numberOfLines={1}>
                  {pontoSelecionado.titulo}
                </Text>
                <View
                  style={[
                    styles.homeRiskBadge,
                    { backgroundColor: getCorRisco(pontoSelecionado.nivelRisco) },
                  ]}
                >
                  <Text style={styles.homeRiskBadgeText}>
                    Risco {pontoSelecionado.nivelRisco}
                  </Text>
                </View>
              </View>

              <Text style={styles.homeRiskCardDesc}>{pontoSelecionado.descricao}</Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                <Text style={{ color: '#666666', fontSize: 11 }}>
                  Lat: {pontoSelecionado.latitude.toFixed(4)}, Long:{' '}
                  {pontoSelecionado.longitude.toFixed(4)}
                </Text>
                <TouchableOpacity onPress={() => setPontoSelecionado(null)}>
                  <Text style={{ color: '#B00D58', fontSize: 12, fontWeight: 'bold' }}>
                    Fechar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={{ color: '#666666', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
              Toque nos alertas do mapa para ver os detalhes de segurança.
            </Text>
          )}
        </View>

        {/* Acesso rápido às outras funcionalidades */}
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <TouchableOpacity
            style={styles.homeCard}
            onPress={() => router.push('/rotas')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="map-marker-path"
                size={26}
                color="#B00D58"
                style={{ marginRight: 15 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.homeCardTitle}>Gerenciar Rotas Salvas</Text>
                <Text style={styles.homeCardText}>
                  Acesse seus locais frequentes e histórico de caminhos
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#A0A0A0" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeCard}
            onPress={() => router.push('/conectarDispositivo')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="bluetooth-connect"
                size={26}
                color="#B00D58"
                style={{ marginRight: 15 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.homeCardTitle}>Dispositivo Medusa</Text>
                <Text style={styles.homeCardText}>
                  Conecte seu chaveiro ou colar de proteção inteligente
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#A0A0A0" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de Navegação Inferior */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.bottomNavItem} activeOpacity={0.8}>
          <MaterialCommunityIcons name="home" size={24} color="#B00D58" />
          <Text style={[styles.bottomNavLabel, styles.bottomNavLabelActive]}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => router.push('/rotas')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="map-marker-path" size={24} color="#888888" />
          <Text style={styles.bottomNavLabel}>Rotas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => router.push('/conectarDispositivo')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="bluetooth-connect" size={24} color="#888888" />
          <Text style={styles.bottomNavLabel}>Dispositivo</Text>
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
