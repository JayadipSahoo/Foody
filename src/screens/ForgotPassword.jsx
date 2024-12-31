import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CustomTextField from '../components/CustomTextField';
import PrimaryButton from '../components/PrimaryButton';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ForgotPassword({ navigation }) {
    const [email, setEmail] = useState('');
    const [emailValid, setEmailValid] = useState(null);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSendCode = () => {
        const isEmailValid = validateEmail(email);
        setEmailValid(isEmailValid);

        if (isEmailValid) {
            navigation.navigate('Verification'); // Navigate to Verification screen
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Header */}
            <Text style={styles.header}>Forgot Password</Text>
            <Text style={styles.subHeader}>Please sign in to your existing account</Text>

            {/* Input Field */}
            <Text style={styles.label}>Email</Text>
            <CustomTextField
                value={email}
                onChangeText={setEmail}
                placeholder="example@gmail.com"
                onBlur={() => setEmailValid(validateEmail(email))}
                isValid={emailValid}
            />
            {emailValid === false && <Text style={styles.errorText}>Invalid email address</Text>}

            {/* Button */}
            <PrimaryButton
                onPress={handleSendCode}
                title="Send Code"
                backgroundColor="#FFA726"
                textColor="#FFFFFF"
                marginTop={20}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#1D1D27', // Dark background
    },
    backButton: {
        marginTop: 20,
        marginBottom: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 14,
        color: '#A9A9A9',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#A9A9A9',
        marginBottom: 10,
    },
    errorText: {
        color: '#FF5252',
        fontSize: 12,
        marginBottom: 10,
    },
});
