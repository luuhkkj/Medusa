import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AntDesign, FontAwesome5, Feather } from '@expo/vector-icons';
//"CSS" 
import { styles } from './style';

export default function Pagcadastro({ navigation}: any ) {

//ir para a tela inicial
  const handleEntrar = () => {
    console.log('Indo para a tela inicial');
  };

//ir para a pag login *tá la no final do código*
  const handleIrParaLogin = () => {
    navigation.navigate('Login');
  };

//entrar com as redes sociais *não remover que quebra o código*
  const handleSocialLogin = (rede: string) => {
    console.log(`Clicou para cadastrar com: ${rede}`);
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cadastro</Text>
      </View>

      <View style={styles.formContainer}>

         <TextInput 
          style={styles.input} 
          placeholder="Nome" 
          placeholderTextColor="#A0A0A0" 
        />

        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          placeholderTextColor="#A0A0A0" 
        />
    //senha com o olho para mostrar a senha

        <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Senha" 
          placeholderTextColor="#A0A0A0" 
          secureTextEntry 
        />
        <TouchableOpacity>
            <Feather name="eye-off" size={20} color="#A0A0A0" />
        </TouchableOpacity>
        </View>

    //redes sociais

        <View style={styles.socialContainer}>
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

        <TouchableOpacity style={styles.button} onPress={handleEntrar}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

    //link para a tela de login

        <TouchableOpacity style={styles.linkButton} onPress={handleIrParaLogin}>
          <Text style={styles.linkText}>Já tem conta? Faça Login</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}