import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AntDesign, FontAwesome5, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
//"CSS" 
import { styles } from '../style';

export default function Pagcadastro() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Cadastrar usuário no backend
  const handleCadastrar = async () => {
    if (!nome.trim() || !email.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    try {
      setCarregando(true);
      const resposta = await fetch('http://127.0.0.1:3333/v1/auth/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          senha,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        Alert.alert(
          'Erro no cadastro',
          dados.erro || 'Não foi possível realizar o cadastro. Tente novamente.',
        );
        return;
      }

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
        {
          text: 'Continuar',
          onPress: () => router.push('/identidade'),
        },
      ]);
      router.push('/identidade');
    } catch (erro) {
      Alert.alert(
        'Erro de conexão',
        'Não foi possível conectar ao servidor. Verifique se o backend está em execução.',
      );
    } finally {
      setCarregando(false);
    }
  };

  // Ir para a pag login
  const handleIrParaLogin = () => {
    router.push('/');
  };

  // Entrar com as redes sociais *não remover que quebra o código*
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
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />

        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          placeholderTextColor="#A0A0A0" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {/* Senha com o olho para mostrar a senha */}

        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.passwordInput} 
            placeholder="Senha" 
            placeholderTextColor="#A0A0A0" 
            secureTextEntry={!mostrarSenha}
            value={senha}
            onChangeText={setSenha}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setMostrarSenha(prev => !prev)}>
            <Feather name={mostrarSenha ? 'eye' : 'eye-off'} size={20} color="#A0A0A0" />
          </TouchableOpacity>
        </View>

        {/* Redes sociais */}

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

        <TouchableOpacity 
          style={[styles.button, carregando && { opacity: 0.7 }]} 
          onPress={handleCadastrar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        {/* Link para a tela de login */}

        <TouchableOpacity style={styles.linkButton} onPress={handleIrParaLogin}>
          <Text style={styles.linkText}>Já tem conta? Faça Login</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}