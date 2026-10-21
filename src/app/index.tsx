import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
//"CSS" 
import { styles } from '../style';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Ir para a tela inicial após login com sucesso
  const handleEntrar = async () => {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Informe seu e-mail e senha para entrar.');
      return;
    }

    try {
      setCarregando(true);
      const resposta = await fetch('http://127.0.0.1:3333/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          senha,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        Alert.alert(
          'Erro no login',
          dados.erro || 'Falha ao autenticar. Verifique suas credenciais.',
        );
        return;
      }

      // Se o login der certo, navegue para a próxima tela (/telaInicial)
      router.replace('/telaInicial');
    } catch (erro) {
      Alert.alert(
        'Erro de conexão',
        'Não foi possível conectar ao servidor. Verifique se o backend está em execução.',
      );
    } finally {
      setCarregando(false);
    }
  };

  // Ir para a pag cadastro *tá la no final do código*
  const handleIrParaCadastro = () => {
    router.push('/cadastro');
  };

  // Entrar com as redes sociais *não remover que quebra o código*
  const handleSocialLogin = (rede: string) => {
    console.log(`Login com ${rede} clicado!`);
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      <View style={styles.formContainer}>

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

        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          placeholderTextColor="#A0A0A0" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Senha" 
          placeholderTextColor="#A0A0A0" 
          secureTextEntry 
          value={senha}
          onChangeText={setSenha}
          autoCapitalize="none"
        />
        
        <TouchableOpacity 
          style={[styles.button, carregando && { opacity: 0.7 }]} 
          onPress={handleEntrar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={handleIrParaCadastro}>
          <Text style={styles.linkText}>Ainda não cadastrado? Clique aqui</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}