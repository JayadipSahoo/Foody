import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const THEME_COLOR = "#FF9F6A";

const DeliveryStaffOptionsScreen = ({ navigation }) => {
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
                        <Text style={styles.title}>
                            Delivery Staff Management
                        </Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.subtitle}>
                            Select an option to manage your delivery staff
                        </Text>

                        <TouchableOpacity
                            style={styles.optionCard}
                            onPress={() =>
                                navigation.navigate("AddDeliveryStaffScreen")
                            }
                        >
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons
                                    name="account-plus"
                                    size={50}
                                    color={THEME_COLOR}
                                />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>
                                    Register Delivery Person
                                </Text>
                                <Text style={styles.optionDescription}>
                                    Add a new delivery person by filling out
                                    their details
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionCard}
                            onPress={() =>
                                navigation.navigate("VendorDeliveryStaffScreen")
                            }
                        >
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons
                                    name="account-group"
                                    size={50}
                                    color={THEME_COLOR}
                                />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>
                                    View All Delivery Staff
                                </Text>
                                <Text style={styles.optionDescription}>
                                    See all your delivery personnel and manage
                                    their accounts
                                </Text>
                            </View>
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
    content: {
        flex: 1,
        padding: 20,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 25,
        textAlign: "center",
    },
    optionCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    iconContainer: {
        marginRight: 20,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    optionDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
});

export default DeliveryStaffOptionsScreen;
