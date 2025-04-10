import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import useAuthStore from "../store/authStore";

const HomeScreen = () => {
    const { user, userType, logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            Alert.alert(
                "Logout Failed",
                "Failed to log out. Please try again."
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Meshi</Text>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeText}>
                        Welcome, {user?.name || "User"}!
                    </Text>
                    <Text style={styles.welcomeDescription}>
                        You are logged in as a {userType || "user"}. The full
                        Meshi app functionality will be implemented in
                        subsequent steps.
                    </Text>
                </View>

                {userType === "customer" ? (
                    // Customer-specific content
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>
                            Your Account Details
                        </Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name:</Text>
                            <Text style={styles.infoValue}>
                                {user?.name || "Not available"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>
                                {user?.email || "Not available"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Mobile:</Text>
                            <Text style={styles.infoValue}>
                                {user?.mobile || "Not available"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>
                                Default Location:
                            </Text>
                            <Text style={styles.infoValue}>
                                {user?.defaultLocation || "Not set"}
                            </Text>
                        </View>
                    </View>
                ) : (
                    // Vendor-specific content
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>
                            Your Business Details
                        </Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name:</Text>
                            <Text style={styles.infoValue}>
                                {user?.name || "Not available"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>
                                {user?.email || "Not available"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Business Name:</Text>
                            <Text style={styles.infoValue}>
                                {user?.businessName || "Not available"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Address:</Text>
                            <Text style={styles.infoValue}>
                                {user?.address || "Not available"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>
                                Contact Number:
                            </Text>
                            <Text style={styles.infoValue}>
                                {user?.contactNumber || "Not available"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Status:</Text>
                            <Text
                                style={[
                                    styles.infoValue,
                                    user?.isAcceptingOrders
                                        ? styles.accepting
                                        : styles.notAccepting,
                                ]}
                            >
                                {user?.isAcceptingOrders
                                    ? "Accepting Orders"
                                    : "Not Accepting Orders"}
                            </Text>
                        </View>
                    </View>
                )}

                {userType === "vendor" && (
                    <TouchableOpacity style={styles.toggleButton}>
                        <Text style={styles.toggleButtonText}>
                            {user?.isAcceptingOrders
                                ? "Stop Accepting Orders"
                                : "Start Accepting Orders"}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#4361ee",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
    },
    logoutButton: {
        backgroundColor: "#fff",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    logoutText: {
        color: "#4361ee",
        fontWeight: "600",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    welcomeCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    welcomeDescription: {
        fontSize: 16,
        color: "#666",
        lineHeight: 22,
    },
    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: "row",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 10,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#555",
        width: 120,
    },
    infoValue: {
        fontSize: 16,
        color: "#333",
        flex: 1,
    },
    accepting: {
        color: "green",
        fontWeight: "600",
    },
    notAccepting: {
        color: "red",
        fontWeight: "600",
    },
    toggleButton: {
        backgroundColor: "#4361ee",
        borderRadius: 8,
        padding: 15,
        alignItems: "center",
        marginBottom: 20,
    },
    toggleButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default HomeScreen;
