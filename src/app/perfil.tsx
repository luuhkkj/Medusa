import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// "CSS"
import { styles } from '../style';
import { obterToken, requisicaoApi, limparSessao, PerfilUsuario } from '../lib/auth';

export default function PerfilScreen() {
    const router = useRouter();

    const [carregando, setCarregando] = useState(true);
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
    const [erro, setErro] = useState<string | null>(null);

    const carregarPerfil = async () => {
        try {
            setCarregando(true);
            setErro(null);

            const token = obterToken();

            if (!token) {
                setErro('Você não está autenticado. Faça login para acessar seu perfil.');
                return;
            }

            const resposta = await requisicaoApi('/v1/perfil', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                if (resposta.status === 401) {
                    limparSessao();
                    setErro('Sua sessão expirou. Faça login novamente.');
                    return;
                }
                throw new Error(dados.erro || `Falha ao carregar perfil (HTTP ${resposta.status}).`);
            }

            const usuarioRecebido = dados.usuario || dados;
            setPerfil(usuarioRecebido);
        } catch (e: any) {
            setErro(e.message || 'Não foi possível carregar os dados do perfil.');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarPerfil();
    }, []);

    // Sair da conta
    const handleSair = () => {
        Alert.alert('Sair da conta', 'Deseja realmente sair da sua conta?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: () => {
                    limparSessao();
                    router.replace('/');
                },
            },
        ]);
    };

    // Editar perfil
    const handleEditarPerfil = () => {
        console.log('Indo para editar perfil');
    };

    // Navegar para rotas
    const handleVerRotas = () => {
        router.push('/rotas');
    };

    // Voltar para a tela anterior
    const handleVoltar = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/telaInicial');
        }
    };

    // Contadores reais
    const contatosCount = perfil?.contatos ? perfil.contatos.length : 0;
    const rotasCount = perfil?.rotasSalvas
        ? perfil.rotasSalvas.length
        : perfil?.rotas
            ? perfil.rotas.length
            : 0;

    if (carregando) {
        return (
            <View style={[styles.homeContainer, styles.profileLoadingContainer]}>
                <ActivityIndicator size="large" color="#B00D58" />
                <Text style={[styles.linkText, { marginTop: 15 }]}>Carregando perfil...</Text>
            </View>
        );
    }

    if (erro && !perfil) {
        return (
            <View style={[styles.homeContainer, styles.profileErrorContainer]}>
                <MaterialCommunityIcons name="account-alert" size={70} color="#B00D58" />
                <Text style={styles.profileErrorText}>{erro}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={styles.profileRetryButton} onPress={carregarPerfil}>
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
        <ScrollView style={styles.homeContainer} bounces={false}>
            <View style={styles.profileHeader}>
                <TouchableOpacity style={styles.profileBackButton} onPress={handleVoltar}>
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.profileAvatar}>
                    <MaterialCommunityIcons name="account" size={50} color="#B00D58" />
                </View>

                {/* Nome e e-mail reais retornados pela API */}
                <Text style={styles.profileName}>{perfil?.nome || 'Usuário'}</Text>
                <Text style={styles.profileEmail}>{perfil?.email || 'Sem e-mail cadastrado'}</Text>
            </View>

            {/* Contadores reais */}
            <View style={styles.profileStatsContainer}>
                <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatNumber}>{contatosCount}</Text>
                    <Text style={styles.profileStatLabel}>
                        {contatosCount === 1 ? 'Contato' : 'Contatos'}
                    </Text>
                </View>

                <View style={styles.profileStatDivider} />

                <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatNumber}>{rotasCount}</Text>
                    <Text style={styles.profileStatLabel}>
                        {rotasCount === 1 ? 'Rota salva' : 'Rotas salvas'}
                    </Text>
                </View>
            </View>

            <View style={styles.profileOptions}>
                <TouchableOpacity style={styles.profileOptionItem} onPress={handleEditarPerfil}>
                    <View style={styles.profileOptionLeft}>
                        <Feather name="user" size={20} color="#B00D58" />
                        <Text style={styles.profileOptionText}>Editar perfil</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#A0A0A0" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.profileOptionItem}>
                    <View style={styles.profileOptionLeft}>
                        <Feather name="users" size={20} color="#B00D58" />
                        <Text style={styles.profileOptionText}>Contatos de emergência</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.profileOptionBadge}>
                            <Text style={styles.profileOptionBadgeText}>{contatosCount}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#A0A0A0" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.profileOptionItem} onPress={handleVerRotas}>
                    <View style={styles.profileOptionLeft}>
                        <Feather name="map-pin" size={20} color="#B00D58" />
                        <Text style={styles.profileOptionText}>Rotas salvas</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.profileOptionBadge}>
                            <Text style={styles.profileOptionBadgeText}>{rotasCount}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#A0A0A0" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.profileOptionItem}>
                    <View style={styles.profileOptionLeft}>
                        <Feather name="settings" size={20} color="#B00D58" />
                        <Text style={styles.profileOptionText}>Configurações</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#A0A0A0" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.profileOptionItem} onPress={handleSair}>
                    <View style={styles.profileOptionLeft}>
                        <Feather name="log-out" size={20} color="#B00D58" />
                        <Text style={styles.profileOptionText}>Sair</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
