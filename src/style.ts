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

    profileBackButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 8,
    },

    profileStatsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
        paddingVertical: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },

    profileStatItem: {
        alignItems: 'center',
        flex: 1,
    },

    profileStatNumber: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
    },

    profileStatLabel: {
        color: '#A0A0A0',
        fontSize: 13,
        marginTop: 4,
    },

    profileStatDivider: {
        width: 1,
        height: 35,
        backgroundColor: '#2A2A2A',
    },

    profileOptionBadge: {
        backgroundColor: '#B00D58',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 6,
    },

    profileOptionBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },

    profileLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    profileErrorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },

    profileErrorText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 20,
    },

    profileRetryButton: {
        backgroundColor: '#B00D58',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },

    profileRetryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },

//tela de rotas (lista de locais salvos)
    rotasHeader: {
        backgroundColor: '#B00D58',
        paddingTop: 60,
        paddingBottom: 22,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },

    rotasHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    rotasHeaderTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
    },

    rotasHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    rotasIconButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    rotasSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 46,
        borderWidth: 1,
        borderColor: '#333333',
    },

    rotasSearchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#FFFFFF',
        fontSize: 14,
    },

    rotasListContent: {
        padding: 20,
        paddingBottom: 40,
    },

    rotasCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },

    rotasIconContainer: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(176, 13, 88, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    rotasInfo: {
        flex: 1,
    },

    rotasTitulo: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    rotasEndereco: {
        color: '#A0A0A0',
        fontSize: 13,
        marginTop: 4,
    },

    rotasDeleteButton: {
        padding: 8,
        marginLeft: 8,
    },

    rotasEmptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 30,
    },

    rotasEmptyTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        textAlign: 'center',
    },

    rotasEmptySubtitle: {
        color: '#A0A0A0',
        fontSize: 13,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 18,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        padding: 20,
    },

    modalContent: {
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 22,
        borderWidth: 1,
        borderColor: '#333333',
    },

    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },

    modalInput: {
        backgroundColor: '#121212',
        borderRadius: 12,
        padding: 14,
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#333333',
    },

    modalButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 6,
    },

    modalButton: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 25,
        alignItems: 'center',
    },

    modalButtonConfirm: {
        backgroundColor: '#B00D58',
    },

    modalButtonCancel: {
        backgroundColor: '#2A2A2A',
    },

    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },

//tela inicial (mapa, busca 'para onde quer ir hoje' e barra de navegação)
    homeHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    homeProfileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },

    homeSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 48,
        marginTop: 14,
        borderWidth: 1,
        borderColor: '#333333',
    },

    homeSearchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#FFFFFF',
        fontSize: 14,
    },

    homeSavedPillsContainer: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },

    homeSavedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },

    homeSavedPillText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },

    homeSearchResults: {
        backgroundColor: '#1E1E1E',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333333',
        overflow: 'hidden',
        maxHeight: 220,
    },

    homeSearchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A2A',
    },

    homeSearchResultTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },

    homeSearchResultSubtitle: {
        color: '#A0A0A0',
        fontSize: 12,
        marginTop: 2,
    },

    homeActiveTripCard: {
        backgroundColor: '#B00D58',
        marginHorizontal: 20,
        marginTop: 14,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    homeActiveTripTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },

    homeActiveTripSubtitle: {
        color: '#FFD3E3',
        fontSize: 12,
        marginTop: 3,
    },

    homeActiveTripBtn: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
    },

    homeActiveTripBtnText: {
        color: '#B00D58',
        fontSize: 12,
        fontWeight: 'bold',
    },

    homeMapSection: {
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 10,
    },

    homeMapHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    homeMapTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    homeFilterContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },

    homeFilterPill: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 15,
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: '#333333',
    },

    homeFilterPillActive: {
        backgroundColor: '#B00D58',
        borderColor: '#B00D58',
    },

    homeFilterPillText: {
        color: '#A0A0A0',
        fontSize: 12,
        fontWeight: '600',
    },

    homeFilterPillTextActive: {
        color: '#FFFFFF',
    },

    homeMapCanvas: {
        height: 240,
        backgroundColor: '#151515',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2A2A2A',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },

    homeMapGridH: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#222222',
    },

    homeMapGridV: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: '#222222',
    },

    homeMapRoad1: {
        position: 'absolute',
        top: 70,
        left: -20,
        right: -20,
        height: 14,
        backgroundColor: '#262626',
        transform: [{ rotate: '-12deg' }],
    },

    homeMapRoad2: {
        position: 'absolute',
        top: -20,
        bottom: -20,
        left: 120,
        width: 12,
        backgroundColor: '#242424',
        transform: [{ rotate: '25deg' }],
    },

    homeMapPin: {
        position: 'absolute',
        alignItems: 'center',
        zIndex: 5,
    },

    homeMapPinBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 3,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },

    homeUserLocationDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#2196F3',
        borderWidth: 2.5,
        borderColor: '#FFFFFF',
        position: 'absolute',
        zIndex: 6,
    },

    homeUserLocationPulse: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        position: 'absolute',
        zIndex: 5,
    },

    homeRiskCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 14,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#333333',
    },

    homeRiskCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    homeRiskCardTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },

    homeRiskBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },

    homeRiskBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    homeRiskCardDesc: {
        color: '#A0A0A0',
        fontSize: 12,
        marginTop: 6,
        lineHeight: 17,
    },

    bottomNavBar: {
        flexDirection: 'row',
        backgroundColor: '#181818',
        paddingVertical: 10,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#262626',
        justifyContent: 'space-around',
        alignItems: 'center',
    },

    bottomNavItem: {
        alignItems: 'center',
        flex: 1,
    },

    bottomNavLabel: {
        fontSize: 11,
        marginTop: 4,
        color: '#888888',
    },

    bottomNavLabelActive: {
        color: '#B00D58',
        fontWeight: 'bold',
    },

});