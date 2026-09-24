import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//colocar as pag que já foram criadas aqui//
import Paglogin from './index';
import Pagcadastro from './cadastro';
import IdentidadeScreen from './identidade';
import RostoScreen from './rosto';

//telas da Larissa//
import TelaInicialScreen from './telaInicial';
import RotasScreen from './rotas';
import BluetoothOffScreen from './bluetoothOff';
import ConectarDispositivoScreen from './conectarDispositivo';
import PerfilScreen from './perfil';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>

         //telas *voce coloca na ordem do app//
                <Stack.Screen name="Cadastro" component={Pagcadastro} />
                <Stack.Screen name="Login" component={Paglogin} />
                <Stack.Screen name="Identidade" component={IdentidadeScreen} />
                <Stack.Screen name="Rosto" component={RostoScreen} />

         //telas da Larissa//
                <Stack.Screen name="TelaInicial" component={TelaInicialScreen} />
                <Stack.Screen name="Rotas" component={RotasScreen} />
                <Stack.Screen name="BluetoothOff" component={BluetoothOffScreen} />
                <Stack.Screen name="ConectarDispositivo" component={ConectarDispositivoScreen} />
                <Stack.Screen name="Perfil" component={PerfilScreen} />

            </Stack.Navigator>
        </NavigationContainer>
    );
}
