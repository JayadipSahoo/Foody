import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Switch,
    ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useUserStore from '../store/userStore';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme color
const THEME_COLOR = '#FF9F6A'; // Coral/Orange accent color

const NotificationsScreen = ({ navigation }) => {
    const {
        notifications,
        notificationSettings,
        notificationCount,
        isLoading,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        updateNotificationSettings,
    } = useUserStore();

    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        // Update the navigation header with a "Mark all read" button if there are unread notifications
        if (notificationCount > 0) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity 
                        style={styles.headerButton} 
                        onPress={markAllNotificationsAsRead}
                    >
                        <Text style={styles.headerButtonText}>Mark all read</Text>
                    </TouchableOpacity>
                ),
            });
        } else {
            navigation.setOptions({
                headerRight: null,
            });
        }
    }, [notificationCount, navigation]);

    const handleNotificationPress = (notification) => {
        // Mark as read when pressed
        if (!notification.read) {
            markNotificationAsRead(notification.id);
        }

        // Handle navigation based on notification type
        if (notification.type === 'new_menu_item' && notification.data?.restaurantId) {
            navigation.navigate('RestaurantDetails', { 
                restaurant: { 
                    _id: notification.data.restaurantId,
                    name: notification.data.restaurantName || 'Restaurant'
                } 
            });
        } else if (notification.type === 'order_status' && notification.data?.orderId) {
            navigation.navigate('OrderDetails', { orderId: notification.data.orderId });
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_menu_item':
                return { name: 'restaurant', color: '#4CAF50' };
            case 'order_status':
                return { name: 'receipt', color: '#2196F3' };
            case 'promotion':
                return { name: 'local-offer', color: '#FF9800' };
            default:
                return { name: 'notifications', color: THEME_COLOR };
        }
    };

    const renderNotificationItem = ({ item }) => {
        const icon = getNotificationIcon(item.type);
        const formattedTime = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });

        return (
            <TouchableOpacity 
                style={[styles.notificationItem, item.read ? styles.readNotification : styles.unreadNotification]} 
                onPress={() => handleNotificationPress(item)}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
                    <MaterialIcons name={icon.name} size={24} color={icon.color} />
                </View>
                <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.notificationTime}>{formattedTime}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    const renderEmptyNotifications = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubText}>
                When you get notifications, they'll appear here
            </Text>
        </View>
    );

    const renderNotificationSettings = () => (
        <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
                <Text style={styles.settingTitle}>New Menu Items</Text>
                <Text style={styles.settingDescription}>
                    Get notified when restaurants add new items
                </Text>
                <Switch
                    value={notificationSettings.newMenuItems}
                    onValueChange={(value) => 
                        updateNotificationSettings({ newMenuItems: value })
                    }
                    trackColor={{ false: '#d1d1d1', true: `${THEME_COLOR}80` }}
                    thumbColor={notificationSettings.newMenuItems ? THEME_COLOR : '#f4f3f4'}
                />
            </View>
            
            <View style={styles.settingItem}>
                <Text style={styles.settingTitle}>Order Status</Text>
                <Text style={styles.settingDescription}>
                    Get notified when your order status changes
                </Text>
                <Switch
                    value={notificationSettings.orderStatus}
                    onValueChange={(value) => 
                        updateNotificationSettings({ orderStatus: value })
                    }
                    trackColor={{ false: '#d1d1d1', true: `${THEME_COLOR}80` }}
                    thumbColor={notificationSettings.orderStatus ? THEME_COLOR : '#f4f3f4'}
                />
            </View>
            
            <View style={styles.settingItem}>
                <Text style={styles.settingTitle}>Promotions</Text>
                <Text style={styles.settingDescription}>
                    Get notified about special offers and promotions
                </Text>
                <Switch
                    value={notificationSettings.promotions}
                    onValueChange={(value) => 
                        updateNotificationSettings({ promotions: value })
                    }
                    trackColor={{ false: '#d1d1d1', true: `${THEME_COLOR}80` }}
                    thumbColor={notificationSettings.promotions ? THEME_COLOR : '#f4f3f4'}
                />
            </View>
            
            {notifications.length > 0 && (
                <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => {
                        clearAllNotifications();
                        setShowSettings(false);
                    }}
                >
                    <Text style={styles.clearButtonText}>Clear All Notifications</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => setShowSettings(!showSettings)}>
                    <MaterialIcons 
                        name={showSettings ? "notifications" : "settings"} 
                        size={24} 
                        color="#000" 
                    />
                </TouchableOpacity>
            </View>
            
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME_COLOR} />
                </View>
            ) : showSettings ? (
                renderNotificationSettings()
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={
                        notifications.length === 0 ? { flex: 1 } : styles.notificationsList
                    }
                    ListEmptyComponent={renderEmptyNotifications}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    settingsButton: {
        padding: 8,
    },
    headerButton: {
        marginRight: 16,
    },
    headerButtonText: {
        color: THEME_COLOR,
        fontWeight: '600',
    },
    notificationsList: {
        paddingVertical: 8,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        position: 'relative',
    },
    unreadNotification: {
        backgroundColor: '#F8F8F8',
    },
    readNotification: {
        backgroundColor: '#fff',
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: THEME_COLOR,
        position: 'absolute',
        top: 16,
        right: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    settingsContainer: {
        padding: 16,
    },
    settingItem: {
        marginBottom: 24,
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 8,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    clearButton: {
        backgroundColor: '#FF5252',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    clearButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default NotificationsScreen; 