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
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SignupRequestScreen = ({ navigation }) => {
    // State for form
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [selectedVendorId, setSelectedVendorId] = useState("");
    const [vendorCode, setVendorCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [isLoadingVendors, setIsLoadingVendors] = useState(true);
    const [error, setError] = useState("");

    // Fetch vendors for dropdown
    useEffect(() => {
        const fetchVendors = async () => {
            setIsLoadingVendors(true);
            try {
                const response = await axios.get(`${API_URL}/delivery/vendors`);
                setVendors(response.data);
            } catch (error) {
                console.error("Error fetching vendors:", error);
                Alert.alert(
                    "Error",
                    "Failed to load vendors. Please try again."
                );
            } finally {
                setIsLoadingVendors(false);
            }
        };

        fetchVendors();
    }, []);

    // Handle signup
    const handleSignup = async () => {
        // Validate form fields
        if (
            !name.trim() ||
            !email.trim() ||
            !password.trim() ||
            !confirmPassword.trim() ||
            !mobile.trim() ||
            !selectedVendorId ||
            !vendorCode.trim()
        ) {
            setError("Please fill in all fields");
            return;
        }

        // Validate email format
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        // Validate mobile number (basic validation)
        if (mobile.length < 10) {
            setError("Please enter a valid mobile number");
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Check password length
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post(`${API_URL}/delivery/signup`, {
                name,
                email,
                password,
                mobile,
                vendorId: selectedVendorId,
                vendorCode,
            });

            Alert.alert(
                "Signup Successful",
                "Your account has been created and is pending approval from the vendor.",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("Login"),
                    },
                ]
            );
        } catch (error) {
            const errorMessage =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : "Registration failed. Please try again.";

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
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
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color="#333"
                        />
                    </TouchableOpacity>
                </View>

                <Image
                    source={require("../../assets/delivery-logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>Delivery Staff Registration</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                        name="account-outline"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

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
                        name="phone-outline"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Mobile Number"
                        value={mobile}
                        onChangeText={setMobile}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                        name="lock-outline"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <MaterialCommunityIcons
                            name={showPassword ? "eye-off" : "eye"}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                        name="lock-outline"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
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

                <Text style={styles.infoText}>
                    Note: You need a valid vendor code from the restaurant you
                    work for. Your account will be pending until approved by the
                    vendor.
                </Text>

                <TouchableOpacity
                    style={styles.signupButton}
                    onPress={handleSignup}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.signupButtonText}>Register</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>
                        Already have an account?
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={styles.loginLink}>Login</Text>
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
        paddingTop: 20,
        paddingBottom: 30,
        alignItems: "center",
    },
    header: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
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
    passwordToggle: {
        padding: 5,
    },
    pickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: 50,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginBottom: 15,
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
    infoText: {
        textAlign: "center",
        color: "#666",
        marginBottom: 20,
        fontSize: 12,
        fontStyle: "italic",
    },
    signupButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#FF6B6B",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    signupButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    loginContainer: {
        flexDirection: "row",
        marginTop: 20,
    },
    loginText: {
        color: "#666",
    },
    loginLink: {
        color: "#FF6B6B",
        fontWeight: "bold",
        marginLeft: 5,
    },
    errorText: {
        color: "#FF6B6B",
        marginBottom: 15,
        textAlign: "center",
    },
});

export default SignupRequestScreen;
