import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Switch,
    Alert,
    ActivityIndicator,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "../store/userStore";
import { usePreferences } from "../context/PreferencesContext";
import { THEME } from "../config/config";

const ProfileScreen = ({ navigation }) => {
    const { user, updateProfile, logout, loading } = useUserStore();
    const { preferences, updatePreferences } = usePreferences();

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        vehicleType: user?.vehicleType || "Bike",
        vehicleNumber: user?.vehicleNumber || "",
    });

    // Handle profile updates
    const handleUpdateProfile = async () => {
        // Basic validation
        if (
            !profileData.name ||
            !profileData.email ||
            !profileData.phoneNumber
        ) {
            Alert.alert("Error", "Name, email and phone number are required");
            return;
        }

        try {
            const result = await updateProfile(profileData);

            if (result.success) {
                Alert.alert("Success", "Profile updated successfully");
                setIsEditing(false);
            } else {
                Alert.alert(
                    "Error",
                    result.message || "Failed to update profile"
                );
            }
        } catch (error) {
            console.error("Profile update error:", error);
            Alert.alert("Error", "An unexpected error occurred");
        }
    };

    // Handle logout
    const handleLogout = async () => {
        Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Logout",
                onPress: async () => {
                    await logout();
                },
                style: "destructive",
            },
        ]);
    };

    // Toggle notification preference
    const toggleNotifications = (value) => {
        updatePreferences({ notificationsEnabled: value });
    };

    // Toggle location tracking preference
    const toggleLocationTracking = (value) => {
        updatePreferences({ locationTrackingEnabled: value });
    };

    // Toggle sound preference
    const toggleSound = (value) => {
        updatePreferences({ soundEnabled: value });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={require("../../assets/icon.png")}
                        style={styles.profileImage}
                    />
                    <View style={styles.editIconContainer}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </View>
                </View>
                <Text style={styles.profileName}>
                    {user?.name || "Delivery Partner"}
                </Text>
                <Text style={styles.profileEmail}>
                    {user?.email || "No email"}
                </Text>
            </View>

            {/* Profile Form */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Personal Information</Text>
                    {!isEditing ? (
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Ionicons
                                name="create-outline"
                                size={24}
                                color={THEME.colors.primary}
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditing(false)}>
                            <Ionicons
                                name="close"
                                size={24}
                                color={THEME.colors.error}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={[
                            styles.input,
                            !isEditing && styles.disabledInput,
                        ]}
                        value={profileData.name}
                        onChangeText={(text) =>
                            setProfileData({ ...profileData, name: text })
                        }
                        editable={isEditing}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[
                            styles.input,
                            !isEditing && styles.disabledInput,
                        ]}
                        value={profileData.email}
                        onChangeText={(text) =>
                            setProfileData({ ...profileData, email: text })
                        }
                        keyboardType="email-address"
                        editable={isEditing}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={[
                            styles.input,
                            !isEditing && styles.disabledInput,
                        ]}
                        value={profileData.phoneNumber}
                        onChangeText={(text) =>
                            setProfileData({
                                ...profileData,
                                phoneNumber: text,
                            })
                        }
                        keyboardType="phone-pad"
                        editable={isEditing}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Vehicle Type</Text>
                    <TextInput
                        style={[
                            styles.input,
                            !isEditing && styles.disabledInput,
                        ]}
                        value={profileData.vehicleType}
                        onChangeText={(text) =>
                            setProfileData({
                                ...profileData,
                                vehicleType: text,
                            })
                        }
                        editable={isEditing}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Vehicle Number</Text>
                    <TextInput
                        style={[
                            styles.input,
                            !isEditing && styles.disabledInput,
                        ]}
                        value={profileData.vehicleNumber}
                        onChangeText={(text) =>
                            setProfileData({
                                ...profileData,
                                vehicleNumber: text,
                            })
                        }
                        editable={isEditing}
                    />
                </View>

                {isEditing && (
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdateProfile}
                    >
                        <Text style={styles.updateButtonText}>
                            Save Changes
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Preferences */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Preferences</Text>

                <View style={styles.preferenceItem}>
                    <View style={styles.preferenceTextContainer}>
                        <Ionicons
                            name="notifications"
                            size={24}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.preferenceText}>Notifications</Text>
                    </View>
                    <Switch
                        value={preferences.notificationsEnabled}
                        onValueChange={toggleNotifications}
                        trackColor={{
                            false: "#d3d3d3",
                            true: THEME.colors.primary,
                        }}
                    />
                </View>

                <View style={styles.preferenceItem}>
                    <View style={styles.preferenceTextContainer}>
                        <Ionicons
                            name="location"
                            size={24}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.preferenceText}>
                            Location Tracking
                        </Text>
                    </View>
                    <Switch
                        value={preferences.locationTrackingEnabled}
                        onValueChange={toggleLocationTracking}
                        trackColor={{
                            false: "#d3d3d3",
                            true: THEME.colors.primary,
                        }}
                    />
                </View>

                <View style={styles.preferenceItem}>
                    <View style={styles.preferenceTextContainer}>
                        <Ionicons
                            name="volume-high"
                            size={24}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.preferenceText}>Sound</Text>
                    </View>
                    <Switch
                        value={preferences.soundEnabled}
                        onValueChange={toggleSound}
                        trackColor={{
                            false: "#d3d3d3",
                            true: THEME.colors.primary,
                        }}
                    />
                </View>
            </View>

            {/* App Info */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>App Information</Text>

                <TouchableOpacity style={styles.infoItem}>
                    <View style={styles.infoTextContainer}>
                        <Ionicons
                            name="help-circle"
                            size={24}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.infoText}>Help & Support</Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={THEME.colors.dark}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoItem}>
                    <View style={styles.infoTextContainer}>
                        <Ionicons
                            name="document-text"
                            size={24}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.infoText}>Terms of Service</Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={THEME.colors.dark}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoItem}>
                    <View style={styles.infoTextContainer}>
                        <Ionicons
                            name="shield-checkmark"
                            size={24}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.infoText}>Privacy Policy</Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={THEME.colors.dark}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoItem}>
                    <View style={styles.infoTextContainer}>
                        <Ionicons
                            name="information-circle"
                            size={24}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.infoText}>About</Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={THEME.colors.dark}
                    />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Ionicons name="log-out" size={20} color="#fff" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        backgroundColor: THEME.colors.primary,
        paddingVertical: THEME.spacing.xl,
        alignItems: "center",
    },
    profileImageContainer: {
        position: "relative",
        marginBottom: THEME.spacing.md,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: THEME.colors.white,
    },
    editIconContainer: {
        position: "absolute",
        right: 0,
        bottom: 0,
        backgroundColor: THEME.colors.secondary,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: THEME.colors.white,
    },
    profileName: {
        color: THEME.colors.white,
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: THEME.spacing.xs,
    },
    profileEmail: {
        color: THEME.colors.white,
        opacity: 0.8,
    },
    card: {
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.medium,
        padding: THEME.spacing.md,
        margin: THEME.spacing.md,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: THEME.spacing.md,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: THEME.colors.dark,
        marginBottom: THEME.spacing.md,
    },
    formGroup: {
        marginBottom: THEME.spacing.md,
    },
    label: {
        marginBottom: THEME.spacing.xs,
        color: THEME.colors.dark,
        opacity: 0.8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: THEME.borderRadius.small,
        padding: THEME.spacing.sm,
        color: THEME.colors.dark,
    },
    disabledInput: {
        backgroundColor: THEME.colors.light,
        color: THEME.colors.dark,
        opacity: 0.8,
    },
    updateButton: {
        backgroundColor: THEME.colors.primary,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.small,
        alignItems: "center",
        marginTop: THEME.spacing.md,
    },
    updateButtonText: {
        color: THEME.colors.white,
        fontWeight: "bold",
    },
    preferenceItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: THEME.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.light,
    },
    preferenceTextContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    preferenceText: {
        marginLeft: THEME.spacing.md,
        fontSize: 16,
        color: THEME.colors.dark,
    },
    infoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: THEME.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.light,
    },
    infoTextContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoText: {
        marginLeft: THEME.spacing.md,
        fontSize: 16,
        color: THEME.colors.dark,
    },
    logoutButton: {
        flexDirection: "row",
        backgroundColor: THEME.colors.error,
        margin: THEME.spacing.md,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.medium,
        justifyContent: "center",
        alignItems: "center",
    },
    logoutText: {
        color: THEME.colors.white,
        fontWeight: "bold",
        marginLeft: THEME.spacing.sm,
        fontSize: 16,
    },
    versionContainer: {
        alignItems: "center",
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.lg,
    },
    versionText: {
        color: THEME.colors.dark,
        opacity: 0.5,
    },
});

export default ProfileScreen;
