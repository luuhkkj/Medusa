import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
//"CSS"
import { styles } from './style';

export default function PerfilScreen({ navigation }: any) {

//sair da conta *sem lógica real ainda*
    const handleSair = () => {
        console.log('Saindo da conta');
    };

//editar perfil *sem lógica real ainda*
    const handleEditarPerfil = () => {
        console.log('Indo para editar perfil');
    };

    return (
        <View style={styles.homeContainer}>

            <View style={styles.profileHeader}>
                <View style={styles.profileAvatar}>
                    <MaterialCommunityIcons name="account" size={50} color="#B00D58" />
                </View>
                <Text style={styles.profileName}>Nome do Usuário</Text>
                <Text style={styles.profileEmail}>usuario@email.com</Text>
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

        </View>
    );
}
