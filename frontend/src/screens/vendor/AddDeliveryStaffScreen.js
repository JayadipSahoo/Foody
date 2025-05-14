import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "../../config/constants";
import { useVendorStore } from "../../store/vendorStore";
import useAuthStore from "../../store/authStore";

const THEME_COLOR = "#FF9F6A";

const AddDeliveryStaffScreen = ({ navigation }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [vendorCode, setVendorCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingVendorData, setIsFetchingVendorData] = useState(false);

    const { vendorData, fetchVendorProfile } = useVendorStore();
    const { token } = useAuthStore();

    // Fetch vendor data when component mounts
    useEffect(() => {
        const getVendorData = async () => {
            setIsFetchingVendorData(true);
            await fetchVendorProfile({ force: true });
            setIsFetchingVendorData(false);
        };

        if (!vendorData || !vendorData._id) {
            getVendorData();
        }
    }, []);

    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter the delivery person's name");
            return false;
        }
        if (!email.trim()) {
            Alert.alert("Error", "Please enter an email address");
            return false;
        }
        if (!mobile.trim()) {
            Alert.alert("Error", "Please enter a mobile number");
            return false;
        }
        if (!vendorCode.trim() || vendorCode.length < 4) {
            Alert.alert(
                "Error",
                "Please enter a vendor code (min. 4 characters)"
            );
            return false;
        }
        return true;
    };

    const handleAddDeliveryStaff = async () => {
        if (!validateForm()) return;

        // Recheck vendor data
        if (!token) {
            Alert.alert(
                "Error",
                "Authentication token is missing. Please log in again."
            );
            return;
        }

        if (!vendorData || !vendorData._id) {
            Alert.alert(
                "Error",
                "Vendor information is missing. Please wait while we retrieve your data or try again later."
            );
            return;
        }

        setIsLoading(true);

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };

            // Only send the vendorId and not any other vendor data
            const response = await axios.post(
                `${API_URL}/delivery/register-by-vendor`,
                {
                    name,
                    email,
                    mobile,
                    vendorCode, // This will be stored only in delivery staff table
                    vendorId: vendorData._id,
                },
                config
            );

            setIsLoading(false);
            Alert.alert("Success", "Delivery staff added successfully!", [
                {
                    text: "OK",
                    onPress: () =>
                        navigation.navigate("VendorDeliveryStaffScreen"),
                },
            ]);
        } catch (error) {
            setIsLoading(false);
            console.error("Error adding delivery staff:", error);
            Alert.alert(
                "Error",
                error.response && error.response.data.message
                    ? error.response.data.message
                    : "Failed to add delivery staff."
            );
        }
    };

    // Show loading indicator if fetching vendor data
    if (isFetchingVendorData) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME_COLOR} />
                    <Text style={styles.loadingText}>
                        Loading vendor data...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <StatusBar backgroundColor={THEME_COLOR} barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
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
                        <Text style={styles.title}>Add Delivery Staff</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={styles.formContainer}>
                        <Text style={styles.formLabel}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter full name"
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.formLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.formLabel}>Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter mobile number"
                            value={mobile}
                            onChangeText={setMobile}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.formLabel}>Vendor Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a code for delivery person to login"
                            value={vendorCode}
                            onChangeText={setVendorCode}
                        />

                        <View style={styles.noteContainer}>
                            <MaterialCommunityIcons
                                name="information"
                                size={20}
                                color={THEME_COLOR}
                            />
                            <Text style={styles.noteText}>
                                This code will be used by the delivery person to
                                login to their account. They will need to enter
                                this code and their email address for login.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddDeliveryStaff}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons
                                        name="account-plus"
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.addButtonText}>
                                        Add Delivery Staff
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingVertical: 15,
        paddingHorizontal: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    formContainer: {
        flex: 1,
        padding: 20,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 8,
    },
    noteContainer: {
        flexDirection: "row",
        backgroundColor: "#FFF5F0",
        borderRadius: 8,
        padding: 12,
        marginVertical: 16,
        alignItems: "flex-start",
    },
    noteText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
    },
    addButton: {
        backgroundColor: THEME_COLOR,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        marginBottom: 30,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#333",
    },
});

export default AddDeliveryStaffScreen;
