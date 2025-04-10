import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const VendorMenuScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Menu</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.placeholderContainer}>
                        <MaterialCommunityIcons
                            name="food-variant"
                            size={80}
                            color="#d1d9e6"
                        />
                        <Text style={styles.placeholderText}>
                            Menu Management
                        </Text>
                        <Text style={styles.placeholderDescription}>
                            This section will allow you to manage your restaurant's menu items.
                            You'll be able to add, edit, or remove items, set prices, and organize them into categories.
                        </Text>
                    </View>
                </View>
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
        padding: 20,
        backgroundColor: "#4361ee",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    placeholderContainer: {
        alignItems: "center",
        padding: 30,
    },
    placeholderText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginTop: 15,
        marginBottom: 10,
    },
    placeholderDescription: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
    },
});

export default VendorMenuScreen;