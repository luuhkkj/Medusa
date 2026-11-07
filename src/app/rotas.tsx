import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// "CSS"
import { styles } from '../style';
import { obterToken, requisicaoApi, limparSessao, RotaSalva } from '../lib/auth';

export default function RotasScreen() {
  const router = useRouter();

  const [rotas, setRotas] = useState<RotaSalva[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estado do Modal de Nova Rota
  const [modalVisivel, setModalVisivel] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoEndereco, setNovoEndereco] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Carregar rotas salvas do usuário
  const carregarRotas = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const token = obterToken();

      if (!token) {
        setErro('Você não está autenticado. Faça login para acessar suas rotas.');
        return;
      }

      const resposta = await requisicaoApi('/v1/rotas', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        if (resposta.status === 401) {
          limparSessao();
          setErro('Sua sessão expirou. Faça login novamente.');
          return;
        }
        throw new Error(dados?.erro || `Falha ao carregar rotas (HTTP ${resposta.status}).`);
      }

      const lista = Array.isArray(dados) ? dados : dados?.rotasSalvas || dados?.rotas || [];
      setRotas(lista);
    } catch (e: any) {
      setErro(e.message || 'Não foi possível carregar as rotas salvas.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarRotas();
  }, []);

  // Filtragem em tempo real (por título ou endereço)
  const rotasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return rotas;
    }
    return rotas.filter(item => {
      const titulo = (item.titulo || item.nome || '').toLowerCase();
      const endereco = (item.endereco || item.destino || '').toLowerCase();
      return titulo.includes(termo) || endereco.includes(termo);
    });
  }, [rotas, busca]);

  // Ação ao tocar em uma rota salva
  const handleSelecionarRota = (item: RotaSalva) => {
    const titulo = item.titulo || item.nome || 'Destino';
    const endereco = item.endereco || item.destino || 'Sem endereço informado';
    Alert.alert(
      titulo,
      `Endereço: ${endereco}`,
      [
        { text: 'Fechar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleConfirmarExclusao(item),
        },
      ],
    );
  };

  // Excluir rota
  const handleConfirmarExclusao = (item: RotaSalva) => {
    if (!item.id) return;
    Alert.alert(
      'Remover rota',
      `Deseja realmente remover a rota "${item.titulo || item.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => executarExclusao(item.id!),
        },
      ],
    );
  };

  const executarExclusao = async (id: string) => {
    try {
      const token = obterToken();
      if (!token) {
        Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
        return;
      }

      const resposta = await requisicaoApi(`/v1/rotas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);
        throw new Error(dados?.erro || 'Não foi possível remover a rota.');
      }

      // Atualização otimista
      setRotas(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao remover rota.');
    }
  };

  // Adicionar nova rota via POST
  const handleSalvarNovaRota = async () => {
    if (!novoTitulo.trim() || !novoEndereco.trim()) {
      Alert.alert('Atenção', 'Preencha o título e o endereço da rota.');
      return;
    }

    try {
      setSalvando(true);
      const token = obterToken();

      if (!token) {
        Alert.alert('Erro', 'Você precisa estar logado para salvar uma rota.');
        return;
      }

      const resposta = await requisicaoApi('/v1/rotas', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: novoTitulo.trim(),
          endereco: novoEndereco.trim(),
        }),
      });

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(dados?.erro || 'Falha ao salvar rota.');
      }

      if (dados?.rota) {
        setRotas(prev => [...prev, dados.rota]);
      } else {
        await carregarRotas();
      }

      setNovoTitulo('');
      setNovoEndereco('');
      setModalVisivel(false);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível salvar a rota.');
    } finally {
      setSalvando(false);
    }
  };

  // Voltar tela
  const handleVoltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/telaInicial');
    }
  };

  // Renderizador do ícone temático
  const renderIcone = (item: RotaSalva) => {
    const icone = (item.icone || item.tipo || '').toLowerCase();
    const titulo = (item.titulo || item.nome || '').toLowerCase();

    if (icone === 'home' || /\b(casa|lar|home|ap|apto|apartamento)\b/i.test(titulo)) {
      return <Feather name="home" size={22} color="#B00D58" />;
    }
    if (icone === 'briefcase' || /\b(trabalho|servico|serviço|trampo|office)\b/i.test(titulo)) {
      return <Feather name="briefcase" size={22} color="#B00D58" />;
    }
    if (icone === 'book' || /\b(faculdade|universidade|escola|curso)\b/i.test(titulo)) {
      return <Feather name="book" size={22} color="#B00D58" />;
    }
    if (icone === 'activity' || /\b(academia|treino|crossfit)\b/i.test(titulo)) {
      return <Feather name="activity" size={22} color="#B00D58" />;
    }
    return <Feather name="map-pin" size={22} color="#B00D58" />;
  };

  // Tela de carregamento
  if (carregando) {
    return (
      <View style={[styles.mapContainer, styles.profileLoadingContainer]}>
        <ActivityIndicator size="large" color="#B00D58" />
        <Text style={[styles.linkText, { marginTop: 15 }]}>Carregando rotas...</Text>
      </View>
    );
  }

  // Tela de erro de autenticação ou conexão
  if (erro && rotas.length === 0) {
    return (
      <View style={[styles.mapContainer, styles.profileErrorContainer]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={70} color="#B00D58" />
        <Text style={styles.profileErrorText}>{erro}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={styles.profileRetryButton} onPress={carregarRotas}>
            <Text style={styles.profileRetryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.profileRetryButton, { backgroundColor: '#333333' }]}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.profileRetryButtonText}>Ir para o Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      {/* Cabeçalho */}
      <View style={styles.rotasHeader}>
        <View style={styles.rotasHeaderTop}>
          <TouchableOpacity style={styles.rotasIconButton} onPress={handleVoltar}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.rotasHeaderTitle}>Rotas Salvas</Text>

          <TouchableOpacity
            style={styles.rotasIconButton}
            onPress={() => setModalVisivel(true)}
          >
            <Feather name="plus" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Barra de Busca em tempo real */}
        <View style={styles.rotasSearchContainer}>
          <Feather name="search" size={18} color="#A0A0A0" />
          <TextInput
            style={styles.rotasSearchInput}
            placeholder="Buscar por título ou endereço..."
            placeholderTextColor="#A0A0A0"
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Feather name="x" size={18} color="#A0A0A0" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de Rotas */}
      <FlatList
        data={rotasFiltradas}
        keyExtractor={item => item.id || String(Math.random())}
        contentContainerStyle={styles.rotasListContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.rotasCard}
            activeOpacity={0.7}
            onPress={() => handleSelecionarRota(item)}
          >
            <View style={styles.rotasIconContainer}>
              {renderIcone(item)}
            </View>

            <View style={styles.rotasInfo}>
              <Text style={styles.rotasTitulo} numberOfLines={1}>
                {item.titulo || item.nome || 'Local sem título'}
              </Text>
              <Text style={styles.rotasEndereco} numberOfLines={2}>
                {item.endereco || item.destino || 'Endereço não cadastrado'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.rotasDeleteButton}
              onPress={() => handleConfirmarExclusao(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="trash-2" size={18} color="#666666" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.rotasEmptyContainer}>
            <MaterialCommunityIcons
              name={busca.trim() ? 'magnify-close' : 'map-marker-off'}
              size={64}
              color="#555555"
            />
            <Text style={styles.rotasEmptyTitle}>
              {busca.trim()
                ? 'Nenhuma rota encontrada'
                : 'Nenhuma rota salva ainda'}
            </Text>
            <Text style={styles.rotasEmptySubtitle}>
              {busca.trim()
                ? `Nenhum resultado corresponde a "${busca}".`
                : 'Toque no botão "+" no topo para cadastrar locais frequentes como Casa ou Trabalho.'}
            </Text>
          </View>
        }
      />

      {/* Modal para adicionar nova rota */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Rota</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Título (ex: Trabalho, Casa, Faculdade)"
              placeholderTextColor="#A0A0A0"
              value={novoTitulo}
              onChangeText={setNovoTitulo}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Endereço (ex: Av. Paulista, 1000)"
              placeholderTextColor="#A0A0A0"
              value={novoEndereco}
              onChangeText={setNovoEndereco}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setNovoTitulo('');
                  setNovoEndereco('');
                  setModalVisivel(false);
                }}
                disabled={salvando}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, salvando && { opacity: 0.7 }]}
                onPress={handleSalvarNovaRota}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
