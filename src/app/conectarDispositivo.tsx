import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
//"CSS"
import { styles } from './style';

//lista de dispositivos *mockada, sem busca real ainda*
const dispositivosEncontrados = [
    { id: '1', nome: 'Medusa - Chaveiro' },
    { id: '2', nome: 'Medusa - Colar' },
];

export default function ConectarDispositivoScreen({ navigation }: any) {

//conectar ao dispositivo escolhido *sem lógica real ainda*
    const handleConectar = (nome: string) => {
        console.log(`Conectando ao dispositivo: ${nome}`);
    };

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Conectar{'\n'}Dispositivo</Text>
            </View>

            <View style={styles.deviceListContainer}>
                <FlatList
                    data={dispositivosEncontrados}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.deviceItem} onPress={() => handleConectar(item.nome)}>
                            <MaterialCommunityIcons style={styles.deviceIcon} name="bluetooth" size={26} color="#B00D58" />
                            <View>
                                <Text style={styles.deviceName}>{item.nome}</Text>
                                <Text style={styles.deviceStatus}>Disponível para conexão</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>

        </View>
    );
}
