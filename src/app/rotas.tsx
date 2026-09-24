import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
//"CSS"
import { styles } from './style';

//OBS: mapa ainda é um placeholder visual — falta integrar uma lib de mapa
//(ex: react-native-maps) que ainda não está instalada no projeto

export default function RotasScreen() {

  return (
    <View style={styles.mapContainer}>

      <View style={styles.mapHeader}>
        <Text style={styles.headerTitle}>Rotas</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <MaterialCommunityIcons name="map-outline" size={70} color="#555555" />
        <Text style={styles.mapPlaceholderText}>Mapa em breve</Text>
      </View>

      <View style={styles.routeInfoBar}>
        <Text style={styles.routeInfoText}>Distância: --</Text>
        <Text style={styles.routeInfoText}>Tempo: --</Text>
      </View>

    </View>
  );
}
