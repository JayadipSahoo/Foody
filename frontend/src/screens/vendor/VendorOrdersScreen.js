import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const VendorOrdersScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Orders</Text>
                <View style={styles.rightPlaceholder} />
            </View>

            <View style={styles.content}>
                <View style={styles.messageContainer}>
                    <MaterialCommunityIcons 
                        name="clipboard-text-clock" 
                        size={80} 
                        color="#4361ee" 
                        style={styles.icon}
                    />
                    <Text style={styles.messageTitle}>Orders Coming Soon</Text>
                    <Text style={styles.messageText}>
                        We're currently setting up the order management system.
                        You'll be able to view and manage your customer orders soon.
                    </Text>
                    <TouchableOpacity 
                        style={styles.backToHomeButton}
                        onPress={() => navigation.navigate('VendorDashboardScreen')}
                    >
                        <Text style={styles.backToHomeText}>Back to Dashboard</Text>
                        </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#4361ee',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    rightPlaceholder: {
        width: 40,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    messageContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    icon: {
        marginBottom: 16,
    },
    messageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    messageText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    backToHomeButton: {
        backgroundColor: '#4361ee',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backToHomeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default VendorOrdersScreen;
