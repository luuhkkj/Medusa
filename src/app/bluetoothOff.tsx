import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
//"CSS"
import { styles } from './style';

export default function BluetoothOffScreen() {

//tentar ativar o bluetooth *sem lógica real ainda*
    const handleAtivarBluetooth = () => {
        console.log('Tentando ativar o Bluetooth');
    };

    return (
        <View style={styles.containerVerificacao}>

            <View style={styles.headerVerificacao}>
                <Text style={styles.headerTitleVerificacao}>Bluetooth{'\n'} Desligado</Text>
            </View>

            <View style={styles.contentVerificacao}>
                <View style={styles.iconContainerVerificacao}>
                    <MaterialCommunityIcons name="bluetooth-off" size={100} color="#B00D58" />
                </View>

                <Text style={styles.descriptionVerificacao}>
                    Seu Bluetooth está desligado. Ative-o para conectar ao seu dispositivo Medusa.
                </Text>

                <TouchableOpacity style={styles.buttonVerificacao} onPress={handleAtivarBluetooth}>
                    <Text style={styles.buttonText}>Ativar Bluetooth</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}
