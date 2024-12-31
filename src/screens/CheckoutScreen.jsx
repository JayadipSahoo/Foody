import React, { useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
// import RazorpayCheckout from 'react-native-razorpay';
import CartContext from '../services/CartContext';
import PrimaryButton from '../components/PrimaryButton';
import CustomDialog from '../components/CustomDialogue';

const CheckoutScreen = () => {

    return (
        <View style={styles.container}>
            <Text>CHECKOUT DISPLAY SCREEN</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F9',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 30,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
        textAlign: 'center',
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginVertical: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    infoText: {
        flex: 1,
        fontSize: 16,
        color: '#2B2B2B',
        marginLeft: 10,
    },
    mapContainer: {
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        overflow: 'hidden',
    },
    mapImage: {
        width: '100%',
        height: 150,
    },
    mapText: {
        position: 'absolute',
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    paymentIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    paymentMethodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioText: {
        fontSize: 16,
        color: '#2B2B2B',
        marginLeft: 5,
    },
    summaryContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#ddd',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F7F7F9',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    summaryText: {
        fontSize: 16,
        color: '#2B2B2B',
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 20,
    },
});

export default CheckoutScreen;
