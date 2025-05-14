import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    RefreshControl,
    StatusBar,
    Modal,
    TextInput,
    Clipboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVendorStore } from "../../store/vendorStore";
import useAuthStore from "../../store/authStore";
import axios from "axios";
import { API_URL } from "../../config/constants";
import { useFocusEffect } from "@react-navigation/native";

const THEME_COLOR = "#FF9F6A";

const VendorDeliveryStaffScreen = ({ navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deliveryStaff, setDeliveryStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [generatedCode, setGeneratedCode] = useState("");
    const [codeCopied, setCodeCopied] = useState(false);

    // Get vendor data from store
    const { vendorData, isLoading: vendorLoading } = useVendorStore();
    const { token } = useAuthStore();

    // Fetch delivery staff
    const fetchDeliveryStaff = useCallback(async () => {
        if (!vendorData || !vendorData._id || !token) {
            setIsLoading(false);
            setError(
                "Vendor information not available. Please try again later."
            );
            setIsRefreshing(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Set a timeout to prevent indefinite loading
        const timeoutId = setTimeout(() => {
            setIsLoading(false);
            setIsRefreshing(false);
            setError(
                "Request timed out. Please check your connection and try again."
            );
        }, 15000); // 15 seconds timeout

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.get(
                `${API_URL}/delivery/vendor/${vendorData._id}`,
                config
            );

            clearTimeout(timeoutId); // Clear the timeout on success
            setDeliveryStaff(response.data);
        } catch (err) {
            clearTimeout(timeoutId); // Clear the timeout on error
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
        } finally {
            clearTimeout(timeoutId); // Ensure timeout is cleared
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [vendorData, token]);

    // Generate vendor code for delivery staff
    const generateVendorCode = useCallback(async () => {
        if (!token) return;

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.post(
                `${API_URL}/delivery/code`,
                {},
                config
            );

            setGeneratedCode(response.data.code);
            setModalVisible(true);
            setCodeCopied(false);
        } catch (err) {
            Alert.alert(
                "Error",
                err.response && err.response.data.message
                    ? err.response.data.message
                    : "Failed to generate code."
            );
        }
    }, [token]);

    // Update delivery staff status
    const updateDeliveryStaffStatus = useCallback(
        async (id, status) => {
            if (!token) return;

            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };

                await axios.patch(
                    `${API_URL}/delivery/${id}/status`,
                    { status },
                    config
                );

                // Refresh the staff list
                fetchDeliveryStaff();

                Alert.alert(
                    "Success",
                    `Delivery staff ${
                        status === "active" ? "activated" : "deactivated"
                    } successfully.`
                );
            } catch (err) {
                Alert.alert(
                    "Error",
                    err.response && err.response.data.message
                        ? err.response.data.message
                        : "Failed to update status."
                );
            }
        },
        [token, fetchDeliveryStaff]
    );

    // Handle refresh
    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchDeliveryStaff();
    }, [fetchDeliveryStaff]);

    // Load delivery staff when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchDeliveryStaff();
        }, [fetchDeliveryStaff])
    );

    // Render delivery staff item
    const renderDeliveryStaffItem = ({ item }) => (
        <View style={styles.staffItem}>
            <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{item.name}</Text>
                <Text style={styles.staffEmail}>{item.email}</Text>
                <Text style={styles.staffMobile}>{item.mobile}</Text>
                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                item.status === "active"
                                    ? "#4CAF50"
                                    : item.status === "pending"
                                    ? "#FFC107"
                                    : "#F44336",
                        },
                    ]}
                >
                    <Text style={styles.statusText}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.actionsContainer}>
                {item.status === "pending" && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() =>
                            updateDeliveryStaffStatus(item._id, "active")
                        }
                    >
                        <MaterialCommunityIcons
                            name="check"
                            size={18}
                            color="#fff"
                        />
                        <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                )}
                {item.status === "active" && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deactivateButton]}
                        onPress={() =>
                            updateDeliveryStaffStatus(item._id, "inactive")
                        }
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={18}
                            color="#fff"
                        />
                        <Text style={styles.actionButtonText}>Deactivate</Text>
                    </TouchableOpacity>
                )}
                {item.status === "inactive" && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() =>
                            updateDeliveryStaffStatus(item._id, "active")
                        }
                    >
                        <MaterialCommunityIcons
                            name="refresh"
                            size={18}
                            color="#fff"
                        />
                        <Text style={styles.actionButtonText}>Activate</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    // Handle copy code to clipboard
    const copyToClipboard = () => {
        Clipboard.setString(generatedCode);
        setCodeCopied(true);
    };

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
                        <Text style={styles.title}>Delivery Staff</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {isLoading && !isRefreshing ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator
                                size="large"
                                color={THEME_COLOR}
                            />
                            <Text style={styles.loadingText}>
                                Loading delivery staff information...
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <MaterialCommunityIcons
                                name="alert-circle-outline"
                                size={60}
                                color="#F44336"
                            />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={fetchDeliveryStaff}
                            >
                                <Text style={styles.refreshButtonText}>
                                    Try Again
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={styles.contentContainer}>
                                <TouchableOpacity
                                    style={styles.generateCodeButton}
                                    onPress={generateVendorCode}
                                >
                                    <MaterialCommunityIcons
                                        name="key-plus"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text style={styles.generateCodeButtonText}>
                                        Generate Vendor Code
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.addStaffButton}
                                    onPress={() =>
                                        navigation.navigate(
                                            "AddDeliveryStaffScreen"
                                        )
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name="account-plus"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text style={styles.addStaffButtonText}>
                                        Add Delivery Staff
                                    </Text>
                                </TouchableOpacity>

                                <Text style={styles.sectionTitle}>
                                    {deliveryStaff.length > 0
                                        ? "Your Delivery Staff"
                                        : "No Delivery Staff Yet"}
                                </Text>

                                {deliveryStaff.length === 0 && (
                                    <View style={styles.emptyContainer}>
                                        <MaterialCommunityIcons
                                            name="account-group"
                                            size={80}
                                            color="#ddd"
                                        />
                                        <Text style={styles.emptyText}>
                                            You don't have any delivery staff
                                            yet
                                        </Text>
                                        <Text style={styles.emptySubText}>
                                            Generate a vendor code and share it
                                            with your delivery staff to register
                                        </Text>
                                    </View>
                                )}

                                <FlatList
                                    data={deliveryStaff}
                                    keyExtractor={(item) => item._id}
                                    renderItem={renderDeliveryStaffItem}
                                    contentContainerStyle={styles.listContainer}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={isRefreshing}
                                            onRefresh={onRefresh}
                                            colors={[THEME_COLOR]}
                                        />
                                    }
                                />
                            </View>
                        </>
                    )}
                </View>

                {/* Modal for displaying generated code */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>
                                Vendor Code Generated
                            </Text>
                            <Text style={styles.modalDescription}>
                                Share this code with your delivery staff to
                                register:
                            </Text>
                            <View style={styles.codeContainer}>
                                <Text style={styles.codeText}>
                                    {generatedCode}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={copyToClipboard}
                            >
                                <MaterialCommunityIcons
                                    name={codeCopied ? "check" : "content-copy"}
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.copyButtonText}>
                                    {codeCopied ? "Copied!" : "Copy Code"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>
                                    Close
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
    contentContainer: {
        flex: 1,
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: "#555",
        textAlign: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        margin: 15,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    errorText: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
        marginTop: 10,
    },
    refreshButton: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    generateCodeButton: {
        backgroundColor: THEME_COLOR,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    generateCodeButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 8,
    },
    addStaffButton: {
        backgroundColor: "#4CAF50",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    addStaffButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginTop: 15,
        textAlign: "center",
    },
    emptySubText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 8,
    },
    listContainer: {
        paddingBottom: 20,
    },
    staffItem: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    staffInfo: {
        marginBottom: 10,
    },
    staffName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    staffEmail: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    staffMobile: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginTop: 8,
    },
    statusText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 12,
    },
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 5,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginLeft: 8,
    },
    approveButton: {
        backgroundColor: "#4CAF50",
    },
    deactivateButton: {
        backgroundColor: "#F44336",
    },
    actionButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 12,
        marginLeft: 4,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    modalDescription: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
        color: "#555",
    },
    codeContainer: {
        backgroundColor: "#f0f0f0",
        padding: 15,
        borderRadius: 8,
        width: "100%",
        alignItems: "center",
        marginBottom: 15,
    },
    codeText: {
        fontSize: 24,
        fontWeight: "bold",
        letterSpacing: 2,
        color: "#333",
    },
    copyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: THEME_COLOR,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginBottom: 15,
    },
    copyButtonText: {
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8,
    },
    closeButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    closeButtonText: {
        color: "#666",
        fontWeight: "bold",
    },
});

export default VendorDeliveryStaffScreen;
