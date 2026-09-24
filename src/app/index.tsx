import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
//"CSS" 
import { styles } from './style';

export default function LoginScreen({ navigation }: any) {

//ir para a tela inicial
  const handleEntrar = () => {
    console.log('Indo para a tela inicial!');
  };

//ir para a pag cadastro *tá la no final do código*
  const handleIrParaCadastro = () => {
    navigation.navigate('Cadastro');
  };

//entrar com as redes sociais *não remover que quebra o código*
    const handleSocialLogin = (rede: string) => {
        console.log(`Login com ${rede} clicado!`);
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Login</Text>
        </View>

      <View style={styles.formContainer}>

        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
            <AntDesign name="google" size={28} color="#B00D58" />
                </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
            <AntDesign name="apple" size={28} color="#B00D58" />
                </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Facebook')}>
            <FontAwesome5 name="facebook-f" size={24} color="#B00D58" />
                </TouchableOpacity>

        </View>


        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          placeholderTextColor="#A0A0A0" 
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Senha" 
          placeholderTextColor="#A0A0A0" 
          secureTextEntry 
        />
        
        <TouchableOpacity style={styles.button} onPress={handleEntrar}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={handleIrParaCadastro}>
                  <Text style={styles.linkText}>Ainda não cadastrado? Clique aqui</Text>
                </TouchableOpacity>

      </View>


    );
}