import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CustomTextField from '../components/CustomTextField';
import PrimaryButton from '../components/PrimaryButton';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SignUp({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSignUp = () => {
        if (validateEmail(email) && password === confirmPassword && password.length >= 8 && name.trim().length > 0) {
            navigation.navigate('BottomTabs');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Header */}
            <Text style={styles.header}>Sign Up</Text>
            <Text style={styles.subHeader}>Please sign up to get started</Text>

            {/* Input Fields */}
            <Text style={styles.label}>Name</Text>
            <CustomTextField
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                showIcon={false}
            />

            <Text style={styles.label}>Email</Text>
            <CustomTextField
                value={email}
                onChangeText={setEmail}
                placeholder="example@gmail.com"
                showIcon={false}
            />

            <Text style={styles.label}>Password</Text>
            <CustomTextField
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                secureTextEntry={!passwordVisible}
                onIconPress={() => setPasswordVisible(!passwordVisible)}
                iconName={passwordVisible ? "eye" : "eye-off"}
            />

            <Text style={styles.label}>Re-type Password</Text>
            <CustomTextField
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="********"
                secureTextEntry={!passwordVisible}
                onIconPress={() => setPasswordVisible(!passwordVisible)}
                iconName={passwordVisible ? "eye" : "eye-off"}
            />

            {/* Sign Up Button */}
            <PrimaryButton
                onPress={handleSignUp}
                title="Sign Up"
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
        backgroundColor: '#1D1D27',
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
        marginBottom: 5,
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
