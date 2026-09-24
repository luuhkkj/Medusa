import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
//"CSS"
import { styles } from './style';

export default function RostoScreen() {

    const handleVerificar = () => {
        console.log('Indo para a tela de verificação de rosto');
    };

    return (
        <View style={styles.containerVerificacao}>

            <View style={styles.headerVerificacao}>
                <Text style={styles.headerTitleVerificacao}>Verificação de{'/n'} Rosto
                    </Text>
            </View>

        <View style={styles.contentVerificacao}>
            <View style={styles.iconContainerVerificacao}>
          <MaterialCommunityIcons  size={100} color="#B00D58"/> //name="*"
        </View>

        <Text style={styles.descriptionVerificacao}>
            Para continuar, precisamos verificar seu rosto. Por favor, siga as instruções para capturar uma foto do seu rosto.
        </Text>

        <TouchableOpacity style={styles.buttonVerificacao} onPress={handleVerificar}>
            <Text style={styles.buttonText}>Verificar</Text>
        </TouchableOpacity>

        </View>

    </View>
    );
}