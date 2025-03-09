import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScreenWidth } from 'react-native-elements/dist/helpers';

export default function HomeScreen({ navigation }) {
   
    const restaurants = [
        {
            id: '1',
            name: 'Aunty IIIT Lunch Dinner Service',
            tags: 'Veg,Non-Veg Meals and Tiffin Service',
            rating: 4.7,
            deliveryFee: 'Free',
            deliveryTime: '01:00 PM - 02:00 PM',
            menu: {
                Lunch: [
                    {
                        id: '1',
                        name: 'Veg Thali',
                        description: 'Rice, 2 Rotis, Dal, 2 Sabzi, Salad, Papad',
                        price: '₹80',
                        isVeg: true,
                    },
                    {
                        id: '2',
                        name: 'Non-Veg Thali',
                        description: 'Rice, 2 Rotis, Dal, Chicken Curry, Salad, Papad',
                        price: '₹80',
                        isVeg: false,
                    },
                ],
                Dinner: [
                    {
                        id: '3',
                        name: 'Veg Thali',
                        description: '4 Rotis, Dal Fry',
                        price: '₹70',
                        isVeg: true,
                    },
                    {
                        id: '4',
                        name: 'Non-Veg Thali',
                        description: '4 Rotis, Butter Chicken',
                        price: '₹80',
                        isVeg: false,
                    },
                ],
            },
        },
        {
            id: '2',
            name: 'Chai Lelo Paratha',
            tags: 'Dinner Veg',
            rating: 4.5,
            deliveryFee: 'Free',
            deliveryTime: '09:00 PM - 09:30 PM',
            menu: {
                Dinner: [
                    {
                        id: '1',
                        name: 'Aloo Paratha',
                        description: 'Stuffed with spiced potatoes',
                        price: '₹50',
                        isVeg: true,
                    },
                    {
                        id: '2',
                        name: 'Gobi Paratha',
                        description: 'Stuffed with spiced cauliflower',
                        price: '₹60',
                        isVeg: true,
                    },
                    {
                        id: '3',
                        name: 'Paneer Paratha',
                        description: 'Stuffed with spiced paneer',
                        price: '₹70',
                        isVeg: true,
                    },
                ],
            },
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="menu-outline" size={28} color="#2B2B2B" />
                
                <TouchableOpacity style={styles.notificationContainer}>
                    <Ionicons name="notifications-outline" size={28} color="#2B2B2B" />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Welcome Text */}
            <Text style={styles.welcomeText}>Hey Hungry, Good Afternoon!</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#A1A1A1" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search dishes, restaurants"
                    placeholderTextColor="#A1A1A1"
                />
            </View>

            {/* Restaurants */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Restaurants Available Near You</Text>
                <Text style={styles.seeAll}>See All</Text>
            </View>
            <FlatList
                data={restaurants}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.restaurantCard}
                        onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
                    >
                        <View style={styles.restaurantImage} />
                        <View style={styles.restaurantInfo}>
                            <Text style={styles.restaurantName}>{item.name}</Text>
                            <Text style={styles.restaurantTags}>{item.tags}</Text>
                            <View style={styles.restaurantMeta}>
                                <Text style={styles.restaurantRating}>⭐ {item.rating}</Text>
                                <Text style={styles.restaurantFee}>{item.deliveryFee}</Text>
                                <Text style={styles.restaurantTime}>{item.deliveryTime}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    deliveryText: {
        fontSize: 12,
        color: '#FFA726',
        fontWeight: 'bold',
    },
    deliveryLocation: {
        fontSize: 14,
        color: '#2B2B2B',
        fontWeight: 'bold',
    },
    notificationContainer: {
        position: 'relative',
        
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF3D00',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#2B2B2B',
        marginLeft: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    seeAll: {
        fontSize: 14,
        color: '#FFA726',
    },
    categoryContainer: {
        marginBottom: 20,
    },
    categoryButton: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    activeCategory: {
        backgroundColor: '#FFA726',
    },
    categoryText: {
        fontSize: 14,
        color: '#A1A1A1',
    },
    activeCategoryText: {
        color: '#FFFFFF',
    },
    restaurantCard: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
    },
    restaurantImage: {
        width: 80,
        height: 80,
        backgroundColor: '#D9D9D9',
    },
    restaurantInfo: {
        flex: 1,
        padding: 10,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 5,
    },
    restaurantTags: {
        fontSize: 12,
        color: '#A1A1A1',
        marginBottom: 10,
    },
    restaurantMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    restaurantRating: {
        fontSize: 12,
        color: '#2B2B2B',
    },
    restaurantFee: {
        fontSize: 12,
        color: '#FFA726',
    },
    restaurantTime: {
        fontSize: 12,
        color: '#A1A1A1',
    },
});
