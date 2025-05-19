import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";

const THEME_COLOR = '#fda535';

const DashboardCard = ({ title, icon, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <MaterialCommunityIcons name={icon} size={40} color={THEME_COLOR} />
        <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
);

const VendorDashboardScreen = ({ navigation }) => {
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            // Perform logout
            await logout();

            // Navigate to login without using RESET
            navigation.navigate("Login");
        } catch (error) {
            console.error("Logout error:", error);
            // Still try to navigate even if logout has an error
            navigation.navigate("Login");
        }
    };

    return (
        <>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Dashboard</Text>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <MaterialCommunityIcons
                                name="logout"
                                size={24}
                                color={THEME_COLOR}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.welcomeText}>Welcome, Vendor!</Text>

                        <Text style={styles.sectionTitle}>Quick Access</Text>

                        <View style={styles.cardsContainer}>
                            <DashboardCard
                                title="Menu"
                                icon="food-variant"
                                onPress={() =>
                                    navigation.navigate("VendorMenuScreen")
                                }
                            />
                            <DashboardCard
                                title="Orders"
                                icon="receipt"
                                onPress={() =>
                                    navigation.navigate("VendorOrdersScreen")
                                }
                            />
                            <DashboardCard
                                title="Schedule"
                                icon="calendar"
                                onPress={() =>
                                    navigation.navigate("VendorScheduleScreen")
                                }
                            />
                            <DashboardCard
                                title="Menu Scheduler"
                                icon="calendar-clock"
                                onPress={() =>
                                    navigation.navigate("MenuSchedulerScreen")
                                }
                            />
                            <DashboardCard
                                title="Delivery Staff"
                                icon="account-group"
                                onPress={() =>
                                    navigation.navigate(
                                        "DeliveryStaffOptionsScreen"
                                    )
                                }
                            />
                        </View>

                        <View style={styles.messageBox}>
                            <MaterialCommunityIcons
                                name="information"
                                size={24}
                                color={THEME_COLOR}
                            />
                            <Text style={styles.messageText}>
                                This dashboard is in development mode. Some
                                features are currently being implemented.
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        padding: 20,
        paddingTop: 0,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    logoutButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#555",
        marginBottom: 16,
    },
    cardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    card: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginTop: 12,
    },
    messageBox: {
        backgroundColor: "#FFF5F0",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FFEEE5",
    },
    messageText: {
        fontSize: 14,
        color: "#333",
        marginLeft: 12,
        flex: 1,
    },
});

export default VendorDashboardScreen;
