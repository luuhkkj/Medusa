import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
//"CSS"
import { styles } from './style';

export default function TelaInicialScreen({ navigation }: any) {

//ir para a tela de rotas
  const handleVerRotas = () => {
    navigation.navigate('Rotas');
  };

//ir para a tela de conectar dispositivo
  const handleConectarDispositivo = () => {
    navigation.navigate('ConectarDispositivo');
  };

  return (
    <View style={styles.homeContainer}>

      <View style={styles.homeHeader}>
        <Text style={styles.homeGreeting}>Olá! 👋</Text>
        <Text style={styles.homeSubtitle}>Bem-vindo(a) de volta ao Medusa</Text>
      </View>

      <ScrollView style={styles.homeContent}>

        <TouchableOpacity style={styles.homeCard} onPress={handleVerRotas}>
          <MaterialCommunityIcons name="map-marker-path" size={28} color="#B00D58" />
          <Text style={styles.homeCardTitle}>Suas rotas</Text>
          <Text style={styles.homeCardText}>Veja o histórico e as rotas em andamento</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeCard} onPress={handleConectarDispositivo}>
          <MaterialCommunityIcons name="bluetooth-connect" size={28} color="#B00D58" />
          <Text style={styles.homeCardTitle}>Dispositivo</Text>
          <Text style={styles.homeCardText}>Conecte ou gerencie seu dispositivo Medusa</Text>
        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}
