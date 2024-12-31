import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CustomTextField from '../components/CustomTextField';
import PrimaryButton from '../components/PrimaryButton';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SignIn({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailValid, setEmailValid] = useState(null);
    const [passwordValid, setPasswordValid] = useState(null);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSignIn = () => {
        const isEmailValid = validateEmail(email);
        const isPasswordValid = password.length >= 8;
        setEmailValid(isEmailValid);
        setPasswordValid(isPasswordValid);

        if (isEmailValid && isPasswordValid) {
            navigation.navigate('BottomTabs');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Log In</Text>
            <Text style={styles.subHeader}>Please sign in to your existing account</Text>

            <Text style={styles.label}>Email</Text>
            <CustomTextField
                value={email}
                onChangeText={setEmail}
                placeholder="example@gmail.com"
                onBlur={() => setEmailValid(validateEmail(email))}
                isValid={emailValid}
            />
            {emailValid === false && <Text style={styles.errorText}>Invalid email address</Text>}

            <Text style={styles.label}>Password</Text>
            <CustomTextField
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                secureTextEntry={!passwordVisible}
                onBlur={() => setPasswordValid(password.length >= 8)}
                isValid={passwordValid}
                showIcon={true}
                iconName={passwordVisible ? "eye" : "eye-off"}
                onIconPress={() => setPasswordVisible(!passwordVisible)}
            />
            {passwordValid === false && <Text style={styles.errorText}>Password must be at least 8 characters</Text>}

            <View style={styles.row}>
                <TouchableOpacity>
                    <Text style={styles.rememberMe}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot Password</Text>
                </TouchableOpacity>
            </View>

            <PrimaryButton
                onPress={handleSignIn}
                title="Log In"
                backgroundColor="#FFA726"
                textColor="#FFFFFF"
                marginTop={20}
            />

            <Text style={styles.footerText}>
                Don’t have an account?{' '}
                <Text onPress={() => navigation.navigate('SignUp')} style={styles.footerLink}>
                    SIGN UP
                </Text>
            </Text>

            <Text style={styles.orText}>Or</Text>

            <View style={styles.socialIcons}>
                <Ionicons name="logo-facebook" size={32} color="#4267B2" />
                <Ionicons name="logo-twitter" size={32} color="#1DA1F2" />
                <Ionicons name="logo-apple" size={32} color="#000000" />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        backgroundColor: '#2B2B2B', // Dark background
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF', // White header text
        textAlign: 'center',
        marginBottom: 5,
    },
    subHeader: {
        fontSize: 16,
        color: '#A1A1A1', // Light gray for subheader
        textAlign: 'center',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        color: '#FFFFFF', // White label text
        marginBottom: 10,
    },
    errorText: {
        color: '#FF5252', // Red for error text
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    rememberMe: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    forgotPassword: {
        fontSize: 14,
        color: '#FFA726', // Orange for forgot password
    },
    footerText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#FFFFFF',
        marginTop: 20,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFA726', // Orange for sign-up link
    },
    orText: {
        fontSize: 16,
        color: '#FFFFFF', // White for 'Or' text
        textAlign: 'center',
        marginVertical: 20,
    },
    socialIcons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 10,
    },
});
