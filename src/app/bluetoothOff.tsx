import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// "CSS"
import { styles } from '../style';

export default function BluetoothOffScreen() {
  const router = useRouter();
  const [ativando, setAtivando] = useState(false);

  // Simulação de ativação do Bluetooth
  const handleAtivarBluetooth = () => {
    setAtivando(true);

    setTimeout(() => {
      setAtivando(false);
      Alert.alert(
        'Bluetooth Ativado! 🔵',
        'O Bluetooth foi ativado com sucesso. Agora seu dispositivo Medusa pode se conectar.',
        [
          {
            text: 'Continuar',
            onPress: () => router.replace('/conectarDispositivo'),
          },
        ],
      );
    }, 1200);
  };

  const handleVoltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/conectarDispositivo');
    }
  };

  return (
    <View style={styles.homeContainer}>
      {/* Cabeçalho */}
      <View style={styles.deviceHeader}>
        <View style={styles.deviceHeaderTop}>
          <TouchableOpacity style={styles.rotasIconButton} onPress={handleVoltar}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.deviceHeaderTitle}>Conexão Bluetooth</Text>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <View style={styles.contentVerificacao}>
        <View style={styles.iconContainerVerificacao}>
          <MaterialCommunityIcons name="bluetooth-off" size={96} color="#B00D58" />
        </View>

        <Text style={[styles.headerTitleVerificacao, { color: '#FFFFFF', marginBottom: 12 }]}>
          Bluetooth Desligado
        </Text>

        <Text
          style={[
            styles.descriptionVerificacao,
            { color: '#A0A0A0', fontSize: 14, lineHeight: 22, maxWidth: 300 },
          ]}
        >
          O Bluetooth do seu celular precisa estar ativo para manter a comunicação
          constante com o seu chaveiro inteligente Medusa e acionar o botão de pânico.
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { width: '100%', maxWidth: 280, marginTop: 30 },
            ativando && { opacity: 0.7 },
          ]}
          onPress={handleAtivarBluetooth}
          disabled={ativando}
          activeOpacity={0.8}
        >
          {ativando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <MaterialCommunityIcons name="bluetooth" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Ativar Bluetooth</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkButton, { marginTop: 20 }]}
          onPress={handleVoltar}
        >
          <Text style={styles.linkText}>Voltar para Dispositivos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
