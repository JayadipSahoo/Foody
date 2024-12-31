import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DrawerContent = ({ drawerAnim, toggleDrawer }) => {
    const insets = useSafeAreaInsets();

    return (
        <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: drawerAnim }] }]}>
            <View style={[styles.content, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Image source={require('../../assets/profile.jpg')} style={styles.profileImage} />
                    <Text style={styles.profileName}>Priyanshu Mallick</Text>
                </View>
                <TouchableOpacity style={styles.drawerItem}>
                    <Image source={require('../../assets/user.png')} style={styles.drawerIcon} />
                    <Text style={styles.drawerText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem}>
                    <Image source={require('../../assets/add-to-cart.png')} style={styles.drawerIcon} />
                    <Text style={styles.drawerText}>My Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem}>
                    <Image source={require('../../assets/heart.png')} style={styles.drawerIcon} />
                    <Text style={styles.drawerText}>Favorite</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem}>
                    <Image source={require('../../assets/orders.png')} style={styles.drawerIcon} />
                    <Text style={styles.drawerText}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem}>
                    <Image source={require('../../assets/notification.png')} style={styles.drawerIcon} />
                    <Text style={styles.drawerText}>Notifications</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem}>
                    <Image source={require('../../assets/settings.png')} style={styles.drawerIcon} />
                    <Text style={styles.drawerText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem}>
                    <Image source={require('../../assets/signout.png')} style={styles.drawerIcon} />
                    <Text style={styles.drawerText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '100%',
        backgroundColor: '#FFAC1C',
        zIndex: 1000,
    },
    content: {
        marginTop: 50,
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    profileName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    drawerIcon: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
        marginRight: 20,
    },
    drawerText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});

export default DrawerContent;
