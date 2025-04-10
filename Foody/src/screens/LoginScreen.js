import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import useAuthStore from "../store/authStore";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("customer");
    const { login, isLoading, error, clearError } = useAuthStore();

    const handleLogin = async () => {
        // Simple validation
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        try {
            await login(email, password, userType);
        } catch (error) {
            Alert.alert(
                "Login Failed",
                error.message || "Please check your credentials"
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Meshi</Text>
                        <Text style={styles.subtitle}>
                            Your campus food delivery app
                        </Text>
                    </View>

                    <View style={styles.userTypeContainer}>
                        <TouchableOpacity
                            style={[
                                styles.userTypeButton,
                                userType === "customer" &&
                                    styles.activeUserType,
                            ]}
                            onPress={() => setUserType("customer")}
                        >
                            <Text
                                style={[
                                    styles.userTypeText,
                                    userType === "customer" &&
                                        styles.activeUserTypeText,
                                ]}
                            >
                                Customer
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.userTypeButton,
                                userType === "vendor" && styles.activeUserType,
                            ]}
                            onPress={() => setUserType("vendor")}
                        >
                            <Text
                                style={[
                                    styles.userTypeText,
                                    userType === "vendor" &&
                                        styles.activeUserTypeText,
                                ]}
                            >
                                Vendor
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.formLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.formLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>
                                    Login
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>
                                Don't have an account?{" "}
                            </Text>
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate("Signup", { userType })
                                }
                            >
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 42,
        fontWeight: "bold",
        color: "#4361ee",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    userTypeContainer: {
        flexDirection: "row",
        marginBottom: 20,
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    userTypeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    activeUserType: {
        backgroundColor: "#4361ee",
    },
    userTypeText: {
        fontWeight: "600",
        color: "#666",
    },
    activeUserTypeText: {
        color: "#fff",
    },
    formContainer: {
        width: "100%",
    },
    formLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        color: "#333",
    },
    input: {
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: "#4361ee",
        borderRadius: 8,
        padding: 15,
        alignItems: "center",
        marginTop: 10,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    signupText: {
        color: "#666",
        fontSize: 16,
    },
    signupLink: {
        color: "#4361ee",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default LoginScreen;
