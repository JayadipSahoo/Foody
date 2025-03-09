import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function OrdersScreen({ navigation }) {
    // Sample orders data - in a real app, this would come from an API or local storage
    const orders = [
        {
            id: '1',
            restaurantName: 'Aunty IIIT Lunch Dinner Service',
            date: '2024-03-07',
            status: 'Delivered',
            total: '₹160',
            items: [
                { name: 'Veg Thali', quantity: 2 }
            ]
        },
        // Add more sample orders as needed
    ];

    const renderOrderItem = ({ item }) => (
        <TouchableOpacity style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'Delivered' ? '#4CAF50' : '#FFA726' }
                ]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            
            <Text style={styles.dateText}>{item.date}</Text>
            
            <View style={styles.itemsList}>
                {item.items.map((orderItem, index) => (
                    <Text key={index} style={styles.itemText}>
                        {orderItem.quantity}x {orderItem.name}
                    </Text>
                ))}
            </View>
            
            <View style={styles.orderFooter}>
                <Text style={styles.totalText}>Total: {item.total}</Text>
                <TouchableOpacity style={styles.reorderButton}>
                    <Text style={styles.reorderButtonText}>Reorder</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={{ width: 24 }} /> {/* Empty view for spacing */}
            </View>

            <FlatList
                data={orders}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.ordersList}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    ordersList: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B2B2B',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    itemsList: {
        marginBottom: 12,
    },
    itemText: {
        fontSize: 14,
        color: '#2B2B2B',
        marginBottom: 4,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    reorderButton: {
        backgroundColor: '#FFA726',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    reorderButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
}); 