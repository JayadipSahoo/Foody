import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
} from 'react-native';
import {
    DrawerContentScrollView,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCart } from '../context/CartContext';
import { PreferencesContext } from '../context/PreferencesContext';

export default function CustomDrawer(props) {
    const { getItemCount } = useCart();
    const { isVegOnly, toggleVegMode } = useContext(PreferencesContext);
    const userEmail = "user@example.com"; // Replace with actual user email from auth
    const initials = userEmail.split('@')[0].substring(0, 2).toUpperCase();

    const handleLogout = () => {
        // Add any logout logic here (clear tokens, etc.)
        props.navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }],
        });
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.profilePicture}>
                    <Text style={styles.initials}>{initials}</Text>
                </View>
                <Text style={styles.emailText}>{userEmail}</Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => props.navigation.navigate('Home')}
                >
                    <View style={styles.menuItemContent}>
                        <Ionicons name="home-outline" size={24} color="#2B2B2B" />
                        <Text style={styles.menuItemText}>Home</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => props.navigation.navigate('Orders')}
                >
                    <View style={styles.menuItemContent}>
                        <Ionicons name="receipt-outline" size={24} color="#2B2B2B" />
                        <Text style={styles.menuItemText}>My Orders</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => props.navigation.navigate('Cart')}
                >
                    <View style={styles.menuItemContent}>
                        <Ionicons name="cart-outline" size={24} color="#2B2B2B" />
                        <Text style={styles.menuItemText}>Cart</Text>
                        {getItemCount() > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
                            </View>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>

                <View style={styles.menuItem}>
                    <View style={styles.menuItemContent}>
                        <Ionicons 
                            name={isVegOnly ? "leaf" : "leaf-outline"} 
                            size={24} 
                            color={isVegOnly ? "#4CAF50" : "#2B2B2B"} 
                        />
                        <Text style={[
                            styles.menuItemText,
                            isVegOnly && { color: '#4CAF50' }
                        ]}>Veg Only</Text>
                    </View>
                    <Switch
                        value={isVegOnly}
                        onValueChange={toggleVegMode}
                        trackColor={{ false: "#767577", true: "#4CAF50" }}
                        thumbColor={isVegOnly ? "#fff" : "#f4f3f4"}
                    />
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
                style={[styles.menuItem, styles.logoutButton]}
                onPress={handleLogout}
            >
                <View style={styles.menuItemContent}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                    <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
                </View>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fda535',
    },
    profilePicture: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    initials: {
        fontSize: 32,
        color: '#fda535',
        fontWeight: 'bold',
    },
    emailText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    menuItems: {
        paddingTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: '#2B2B2B',
        marginLeft: 16,
    },
    cartBadge: {
        backgroundColor: '#fda535',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        paddingHorizontal: 6,
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: 'auto',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    logoutText: {
        color: '#FF3B30',
    },
}); 