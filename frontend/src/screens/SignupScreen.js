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

// Define the theme color for consistency
const THEME_COLOR = '#FDA535';

const SignupScreen = ({ navigation, route }) => {
    // Common fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Customer specific fields
    const [mobile, setMobile] = useState("");
    const [defaultLocation, setDefaultLocation] = useState("");

    // Vendor specific fields
    const [businessName, setBusinessName] = useState("");
    const [address, setAddress] = useState("");
    const [contactNumber, setContactNumber] = useState("");

    // Get userType from route params or default to customer
    const [userType, setUserType] = useState(
        route.params?.userType || "customer"
    );

    const { signup, isLoading } = useAuthStore();

    useEffect(() => {
        // Update userType if changed in route params
        if (route.params?.userType) {
            setUserType(route.params.userType);
        }
    }, [route.params]);

    const handleSignup = async () => {
        // Common validation
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        // Prepare user data based on user type
        let userData = {
            name,
            email,
            password,
        };

        if (userType === "customer") {
            userData = {
                ...userData,
                mobile,
                defaultLocation,
            };
        } else {
            // Vendor specific validation
            if (!businessName) {
                Alert.alert("Error", "Business name is required for vendors");
                return;
            }

            userData = {
                ...userData,
                businessName,
                address,
                contactNumber,
            };
        }

        try {
            await signup(userData, userType);
        } catch (error) {
            Alert.alert(
                "Signup Failed",
                error.message || "An error occurred during signup"
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
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join Meshi today</Text>
                    </View>

                    {/* User Type Toggle */}
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
                        {/* Common Fields */}
                        <Text style={styles.formLabel}>
                            Full Name <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.formLabel}>
                            Email <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.formLabel}>
                            Password <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Text style={styles.formLabel}>
                            Confirm Password{" "}
                            <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        {userType === "customer" ? (
                            // Customer-specific fields
                            <>
                                <Text style={styles.formLabel}>
                                    Mobile Number
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your mobile number"
                                    value={mobile}
                                    onChangeText={setMobile}
                                    keyboardType="phone-pad"
                                />

                                <Text style={styles.formLabel}>
                                    Default Delivery Location
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your default location"
                                    value={defaultLocation}
                                    onChangeText={setDefaultLocation}
                                />
                            </>
                        ) : (
                            // Vendor-specific fields
                            <>
                                <Text style={styles.formLabel}>
                                    Business Name{" "}
                                    <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your business name"
                                    value={businessName}
                                    onChangeText={setBusinessName}
                                />

                                <Text style={styles.formLabel}>
                                    Business Address
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your business address"
                                    value={address}
                                    onChangeText={setAddress}
                                />

                                <Text style={styles.formLabel}>
                                    Contact Number
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter contact number"
                                    value={contactNumber}
                                    onChangeText={setContactNumber}
                                    keyboardType="phone-pad"
                                />
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.signupButton}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.signupButtonText}>
                                    Create Account
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>
                                Already have an account?{" "}
                            </Text>
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate("Login", { userType })
                                }
                            >
                                <Text style={styles.loginLink}>Log In</Text>
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
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginVertical: 30,
    },
    title: {
        fontSize: 28,
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
    required: {
        color: "red",
    },
    input: {
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        padding: 15,
        marginBottom: 16,
        fontSize: 16,
    },
    signupButton: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    signupButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        marginBottom: 30,
    },
    loginText: {
        color: "#666",
        fontSize: 16,
    },
    loginLink: {
        color: THEME_COLOR,
        fontSize: 16,
        fontWeight: "600",
    },
});

export default SignupScreen;
