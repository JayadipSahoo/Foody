import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import useUserStore from "../store/userStore";
import { THEME } from "../config/config";

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login, loading } = useUserStore();

    const handleLogin = async () => {
        // Basic validation
        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }

        try {
            const result = await login(email, password);

            if (!result.success) {
                setError(result.message);
            }
        } catch (err) {
            setError("Login failed. Please try again.");
            console.error(err);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../../assets/icon.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Meshi Delivery</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.subtitle}>Delivery Partner Login</Text>

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.footerText}>
                        Delivery Partner App v1.0
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: THEME.spacing.lg,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: THEME.spacing.xl,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: THEME.spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: THEME.colors.primary,
    },
    formContainer: {
        padding: THEME.spacing.lg,
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.medium,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    subtitle: {
        fontSize: THEME.fontSizes.xlarge,
        marginBottom: THEME.spacing.lg,
        textAlign: "center",
        color: THEME.colors.dark,
    },
    errorText: {
        color: THEME.colors.error,
        marginBottom: THEME.spacing.md,
        textAlign: "center",
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: THEME.borderRadius.small,
        marginBottom: THEME.spacing.md,
        paddingHorizontal: THEME.spacing.md,
        backgroundColor: THEME.colors.light,
    },
    loginButton: {
        backgroundColor: THEME.colors.primary,
        height: 50,
        borderRadius: THEME.borderRadius.small,
        justifyContent: "center",
        alignItems: "center",
        marginTop: THEME.spacing.md,
    },
    loginButtonText: {
        color: THEME.colors.white,
        fontSize: THEME.fontSizes.large,
        fontWeight: "bold",
    },
    footerText: {
        textAlign: "center",
        marginTop: THEME.spacing.xl,
        color: THEME.colors.dark,
        opacity: 0.7,
    },
});

export default LoginScreen;
