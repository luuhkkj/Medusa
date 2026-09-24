//Tela inicial//
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },

    header: {
        backgroundColor: '#B00D58',
        height: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },

    socialButton: {
        padding: 10,
    },

    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
        alignItems: 'center',
        gap: 30,
    },

    headerTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },

    formContainer: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
    },
    
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#A0A0A0',
        color: '#FFFFFF',
        marginBottom: 25,
        paddingVertical: 10,
        fontSize: 16,
    },

    button: {
        backgroundColor: '#B00D58',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

//Tela de cadastro//
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#A0A0A0',
        marginBottom: 25,
    },

    passwordInput: {
        flex: 1,
        color: '#FFFFFF',
        paddingVertical: 10,
        fontSize: 16,
    },

    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },

    linkText: {
        color: '#A0A0A0',
        fontSize: 14,
    },


//telas de identidade e rosto//
  containerVerificacao: {
        flex: 1,
        backgroundColor: '#E5E5E5',
    },

    headerVerificacao: {
        backgroundColor: '#B00D58',
        height: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        paddingHorizontal: 20,
    },

  headerTitleVerificacao: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    contentVerificacao: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },

    iconContainerVerificacao: {
        marginBottom: 30,
    },

    descriptionVerificacao: {
        color: '#333333',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 18,
    },

    buttonVerificacao: {
        backgroundColor: '#B00D58',
        paddingVertical: 12,
        paddingHorizontal: 50,
        borderRadius: 25,
    },
    
    
// ============================================
// ADICIONAR estes estilos dentro do StyleSheet.create({...})
// do arquivo style.ts existente, ANTES do "});" final.
// (Telas: Tela Inicial, Rotas, Bluetooth off, Conectar disp., Perfil)
// ============================================

//tela inicial (home)
    homeContainer: {
        flex: 1,
        backgroundColor: '#121212',
    },

    homeHeader: {
        backgroundColor: '#B00D58',
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },

    homeGreeting: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
    },

    homeSubtitle: {
        color: '#E5C4D3',
        fontSize: 14,
        marginTop: 5,
    },

    homeContent: {
        flex: 1,
        padding: 25,
    },

    homeCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },

    homeCardTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    homeCardText: {
        color: '#A0A0A0',
        fontSize: 13,
    },

//tela de rotas (mapa)
    mapContainer: {
        flex: 1,
        backgroundColor: '#121212',
    },

    mapHeader: {
        backgroundColor: '#B00D58',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },

    mapPlaceholder: {
        flex: 1,
        margin: 20,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333333',
    },

    mapPlaceholderText: {
        color: '#A0A0A0',
        fontSize: 14,
        marginTop: 10,
    },

    routeInfoBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1E1E1E',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 15,
        borderRadius: 15,
    },

    routeInfoText: {
        color: '#FFFFFF',
        fontSize: 13,
    },

//tela de conectar dispositivo (lista de dispositivos)
    deviceListContainer: {
        paddingHorizontal: 20,
    },

    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
    },

    deviceIcon: {
        marginRight: 15,
    },

    deviceName: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },

    deviceStatus: {
        color: '#A0A0A0',
        fontSize: 12,
        marginTop: 3,
    },

//tela de perfil
    profileHeader: {
        backgroundColor: '#B00D58',
        paddingTop: 70,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },

    profileAvatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },

    profileName: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },

    profileEmail: {
        color: '#E5C4D3',
        fontSize: 13,
        marginTop: 3,
    },

    profileOptions: {
        padding: 20,
    },

    profileOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A2A',
    },

    profileOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },

    profileOptionText: {
        color: '#FFFFFF',
        fontSize: 15,
    },

});