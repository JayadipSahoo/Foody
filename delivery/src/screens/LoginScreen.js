import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { API_URL } from "../config/constants";
import { useUserStore } from "../store/userStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
    // State for form
    const [email, setEmail] = useState("");
    const [vendorCode, setVendorCode] = useState("");
    const [selectedVendorId, setSelectedVendorId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [isLoadingVendors, setIsLoadingVendors] = useState(true);
    const [error, setError] = useState("");
    const [apiStatus, setApiStatus] = useState("");

    // Get login function from store
    const { loginDeliveryStaff } = useUserStore();

    // Fetch vendors for dropdown
    useEffect(() => {
        const fetchVendors = async () => {
            setIsLoadingVendors(true);
            try {
                setApiStatus("Fetching vendors from API...");
                const response = await axios.get(`${API_URL}/delivery/vendors`);
                setVendors(response.data);
                setApiStatus(
                    `Loaded ${response.data.length} vendors successfully`
                );
            } catch (error) {
                console.error("Error fetching vendors:", error);
                setApiStatus(`Error: ${error.message}`);
                Alert.alert(
                    "Error",
                    `Failed to load vendors: ${error.message}`
                );
            } finally {
                setIsLoadingVendors(false);
            }
        };

        fetchVendors();
    }, []);

    // Handle login
    const handleLogin = async () => {
        // Validate form fields
        if (!email.trim() || !vendorCode.trim() || !selectedVendorId) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        setError("");
        setApiStatus("Attempting login...");

        try {
            const loginResult = await loginDeliveryStaff(
                email,
                vendorCode,
                selectedVendorId
            );

            if (loginResult.success) {
                setApiStatus("Login successful, navigating to main app");
                // Navigate to main app
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Main" }],
                });
            } else {
                setApiStatus(`Login failed: ${loginResult.message}`);
                setError(
                    loginResult.message ||
                        "Login failed. Please check your credentials."
                );
            }
        } catch (error) {
            console.error("Login error:", error);
            setApiStatus(`Login error: ${error.message}`);
            setError(`Login failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Navigate to signup screen
    const handleSignupPress = () => {
        navigation.navigate("SignupRequest");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Image
                    source={require("../../assets/delivery-logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>Delivery Staff Login</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {apiStatus ? (
                    <Text style={styles.apiStatus}>{apiStatus}</Text>
                ) : null}

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                        name="email-outline"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                        name="key-outline"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Vendor Code"
                        value={vendorCode}
                        onChangeText={setVendorCode}
                        autoCapitalize="characters"
                    />
                </View>

                <View style={styles.pickerContainer}>
                    <MaterialCommunityIcons
                        name="store-outline"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                    />
                    {isLoadingVendors ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#FF6B6B" />
                            <Text style={styles.loadingText}>
                                Loading vendors...
                            </Text>
                        </View>
                    ) : (
                        <Picker
                            selectedValue={selectedVendorId}
                            onValueChange={(itemValue) =>
                                setSelectedVendorId(itemValue)
                            }
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Vendor" value="" />
                            {vendors.map((vendor) => (
                                <Picker.Item
                                    key={vendor._id}
                                    label={vendor.businessName || vendor.name}
                                    value={vendor._id}
                                />
                            ))}
                        </Picker>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>
                        Don't have an account?
                    </Text>
                    <TouchableOpacity onPress={handleSignupPress}>
                        <Text style={styles.signupLink}>Request Access</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 50,
        paddingBottom: 30,
        alignItems: "center",
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 30,
        textAlign: "center",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: 50,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: "100%",
        fontSize: 16,
    },
    pickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: 50,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
    },
    picker: {
        flex: 1,
        height: 50,
    },
    loadingContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginLeft: 10,
        color: "#666",
    },
    loginButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#FF6B6B",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    signupContainer: {
        flexDirection: "row",
        marginTop: 20,
    },
    signupText: {
        color: "#666",
    },
    signupLink: {
        color: "#FF6B6B",
        fontWeight: "bold",
        marginLeft: 5,
    },
    errorText: {
        color: "#FF6B6B",
        marginBottom: 15,
        textAlign: "center",
    },
    apiStatus: {
        color: "#666",
        fontSize: 12,
        marginBottom: 15,
        textAlign: "center",
        fontStyle: "italic",
    },
});

export default LoginScreen;
