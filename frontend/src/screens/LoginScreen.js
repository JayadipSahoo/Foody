import React, { useState, useEffect } from "react";
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
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomTextField from "../components/CustomTextField";
import PrimaryButton from "../components/PrimaryButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config";

// Define the theme color for consistency
const THEME_COLOR = "#FDA535";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailValid, setEmailValid] = useState(null);
    const [passwordValid, setPasswordValid] = useState(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [userType, setUserType] = useState("customer");
    const { login, isLoading, error, clearError, user, logout } =
        useAuthStore();
    const [loading, setLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState({
        checked: false,
        available: false,
    });

    // Check if the backend is available on component mount
    useEffect(() => {
        checkBackendStatus();
    }, []);

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = await AsyncStorage.getItem("userToken");

            if (token) {
                console.log("Found existing token, checking validity...");

                // Get stored user type
                const storedUserType = await AsyncStorage.getItem("userType");
                console.log("Retrieved stored userType:", storedUserType);

                try {
                    // Try to access a protected endpoint
                    const response = await axios.get(
                        `${API_URL}/vendor/profile`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    console.log("Token is valid, user already logged in");

                    // Navigate based on user type
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Main" }],
                    });
                } catch (error) {
                    console.log("Token validation failed:", error);

                    // If it's a 401 or other error, clear the token
                    await logout();
                }
            }
        };

        checkLoginStatus();
    }, []);

    console.log("LoginScreen rendered with user:", user);

    useEffect(() => {
        console.log("Auth state changed:", { user, error, isLoading });
        if (user) {
            console.log(
                "User authenticated in LoginScreen, userType:",
                user.userType
            );
        }
    }, [user, error, isLoading]);

    const checkBackendStatus = async () => {
        try {
            console.log("Checking backend status...");
            // Use the base API URL instead of the non-existent /health endpoint
            const response = await axios
                .get(API_URL, { timeout: 5000 })
                .catch((error) => {
                    if (error.code === "ECONNABORTED") {
                        throw new Error("Backend connection timed out");
                    }

                    // Even a 404 from the base API URL means the server is running
                    if (
                        error.response &&
                        (error.response.status === 404 ||
                            error.response.status === 401)
                    ) {
                        // This is actually a good sign - the server responded, just not with the endpoint we expected
                        console.log(
                            "Server responded with 404/401 - server is running but endpoint not found/unauthorized"
                        );
                        return {
                            status: 200,
                            data: { message: "Server is running" },
                        };
                    }
                    throw error;
                });

            console.log("Backend is available:", response.status);
            setBackendStatus({ checked: true, available: true });
        } catch (error) {
            console.error("Backend is not available:", error);
            setBackendStatus({ checked: true, available: false });

            // Show an alert about backend unavailability
            Alert.alert(
                "Server Connection Issue",
                "Unable to connect to the server. Please check your internet connection and try again.",
                [{ text: "OK" }]
            );
        }
    };

    const validateEmail = (email) => {
        console.log("Validating email:", email);
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = regex.test(email);
        console.log("Email validation result:", isValid);
        return isValid;
    };

    const handleLogin = async () => {
        if (!validateEmail(email)) {
            setEmailValid(false);
            return;
        } else {
            setEmailValid(true);
        }

        if (password.length < 6) {
            setPasswordValid(false);
            return;
        } else {
            setPasswordValid(true);
        }

        // Check backend status before attempting login
        if (!backendStatus.checked) {
            await checkBackendStatus();
        }

        if (!backendStatus.available) {
            // If backend is not available, show alert
            Alert.alert(
                "Server Connection Issue",
                "Cannot connect to the server. Please check your internet connection and try again.",
                [{ text: "OK" }]
            );
            return;
        }

        try {
            setLoading(true);
            console.log(
                `Login attempted with email: ${email}, userType: ${userType}`
            );

            const userData = await login(email, password, userType);
            console.log(
                "Login successful, received userData:",
                JSON.stringify(userData)
            );

            // Check for token
            if (!userData.token) {
                console.error("No token in login response");
                Alert.alert(
                    "Login Error",
                    "Authentication failed. Please try again."
                );
                return;
            }

            // Store token separately for debugging
            try {
                await AsyncStorage.setItem("userToken", userData.token);
                console.log(
                    "Token stored successfully:",
                    userData.token.substring(0, 10) + "..."
                );

                // Make sure userType is properly set in storage
                if (userType === "vendor") {
                    await AsyncStorage.setItem("userType", "vendor");
                    console.log("Explicitly set userType to vendor in storage");
                }

                // Verify token and userType were stored
                const [storedToken, storedType] = await Promise.all([
                    AsyncStorage.getItem("userToken"),
                    AsyncStorage.getItem("userType"),
                ]);

                console.log(
                    "Verified stored token:",
                    storedToken
                        ? storedToken.substring(0, 10) + "..."
                        : "No token found"
                );
                console.log("Verified stored userType:", storedType);
            } catch (storageError) {
                console.error("Error storing token:", storageError);
            }

            // Navigate to the appropriate screen based on user type
            navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
            });
        } catch (error) {
            console.error("Login error:", error);

            let errorMessage = "Please check your credentials and try again.";
            if (error.message && typeof error.message === "string") {
                if (error.message.includes("Network Error")) {
                    errorMessage =
                        "Network error. Please check your internet connection.";
                } else if (error.response && error.response.status === 401) {
                    errorMessage = "Invalid email or password.";
                } else if (error.response && error.response.status === 404) {
                    errorMessage =
                        "Login service not available. Please try again later.";
                }
            }

            Alert.alert("Login Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        console.log("Showing loading state");
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFA726" />
                <Text style={styles.loadingText}>Logging in...</Text>
            </View>
        );
    }

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
                            onPress={() => {
                                console.log("User type changed to: customer");
                                setUserType("customer");
                            }}
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
                            onPress={() => {
                                console.log("User type changed to: vendor");
                                setUserType("vendor");
                            }}
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
                        <CustomTextField
                            value={email}
                            onChangeText={(text) => {
                                console.log("Email changed:", text);
                                setEmail(text);
                            }}
                            placeholder="example@gmail.com"
                            onBlur={() => {
                                const isValid = validateEmail(email);
                                console.log(
                                    "Email validation on blur:",
                                    isValid
                                );
                                setEmailValid(isValid);
                            }}
                            isValid={emailValid}
                        />
                        {emailValid === false && (
                            <Text style={styles.errorText}>
                                Invalid email address
                            </Text>
                        )}

                        <Text style={styles.formLabel}>Password</Text>
                        <CustomTextField
                            value={password}
                            onChangeText={(text) => {
                                console.log("Password changed");
                                setPassword(text);
                            }}
                            placeholder="********"
                            secureTextEntry={!passwordVisible}
                            onBlur={() => {
                                const isValid = password.length >= 8;
                                console.log(
                                    "Password validation on blur:",
                                    isValid
                                );
                                setPasswordValid(isValid);
                            }}
                            isValid={passwordValid}
                            showIcon={true}
                            iconName={passwordVisible ? "eye" : "eye-off"}
                            onIconPress={() => {
                                console.log("Password visibility toggled");
                                setPasswordVisible(!passwordVisible);
                            }}
                        />
                        {passwordValid === false && (
                            <Text style={styles.errorText}>
                                Password must be at least 8 characters
                            </Text>
                        )}

                        <View style={styles.row}>
                            <TouchableOpacity>
                                <Text style={styles.rememberMe}>
                                    Remember me
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text style={styles.forgotPassword}>
                                    Forgot Password
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <PrimaryButton
                            onPress={handleLogin}
                            title="Log In"
                            backgroundColor={THEME_COLOR}
                            textColor="#FFFFFF"
                            marginTop={20}
                        />

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>
                                Don't have an account?{" "}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    console.log("Navigating to Signup screen");
                                    navigation.navigate("Signup", { userType });
                                }}
                            >
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.orText}>Or</Text>

                    <View style={styles.socialIcons}>
                        <Ionicons
                            name="logo-facebook"
                            size={32}
                            color="#4267B2"
                        />
                        <Ionicons
                            name="logo-twitter"
                            size={32}
                            color="#1DA1F2"
                        />
                        <Ionicons name="logo-apple" size={32} color="#000000" />
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
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
        color: THEME_COLOR,
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
        backgroundColor: THEME_COLOR,
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
    errorText: {
        color: "#FF3B30",
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
    },
    rememberMe: {
        color: "#666",
        fontSize: 14,
    },
    forgotPassword: {
        color: THEME_COLOR,
        fontSize: 14,
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
        color: THEME_COLOR,
        fontSize: 16,
        fontWeight: "600",
    },
    orText: {
        textAlign: "center",
        marginTop: 24,
        marginBottom: 24,
        color: "#666",
        fontSize: 14,
    },
    socialIcons: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 24,
    },
});

export default LoginScreen;
