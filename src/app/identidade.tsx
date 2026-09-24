import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
//"CSS"
import { styles } from './style';

export default function IdentidadeScreen() {

    const handleVerificar = () => {
        console.log('Indo para a tela de verificação de identidade');
    };

    return (
        <View style={styles.containerVerificacao}>

            <View style={styles.headerVerificacao}>
                <Text style={styles.headerTitleVerificacao}>Verificação de{'/n'} Identidade
                    </Text>
            </View>

        <View style={styles.contentVerificacao}>
            <View style={styles.iconContainerVerificacao}>
          <MaterialCommunityIcons  size={100} color="#B00D58"/> //name="*"
        </View>

        <Text style={styles.descriptionVerificacao}>
            Para continuar, precisamos verificar sua identidade. Por favor, siga as instruções para capturar uma foto do seu rosto.
        </Text>

        <TouchableOpacity style={styles.buttonVerificacao} onPress={handleVerificar}>
            <Text style={styles.buttonText}>Verificar</Text>
        </TouchableOpacity>

        </View>

    </View>
    );
}