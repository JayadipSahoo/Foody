import React, { useContext } from 'react';
import { View, Text, TextInput, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScreenWidth } from 'react-native-elements/dist/helpers';
import { PreferencesContext } from '../context/PreferencesContext';

export default function HomeScreen({ navigation }) {
    const { isVegOnly } = useContext(PreferencesContext);

    const restaurants = [
        {
            id: '1',
            name: 'Aunty IIIT Lunch Dinner Service',
            tags: 'Veg, Non-Veg Meals and Tiffin Service',
            rating: 4.7,
            deliveryFee: 'Free',
            deliveryTime: '01:00 PM - 02:00 PM',
            isVegRestaurant: false,
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
            isVegRestaurant: true,
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

    const filteredRestaurants = restaurants;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={28} color="#2B2B2B" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.notificationContainer}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Ionicons name="notifications-outline" size={28} color="#2B2B2B" />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <Text style={styles.welcomeText}>Hey Hungry, Good Afternoon!</Text>

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#A1A1A1" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search dishes, restaurants"
                    placeholderTextColor="#A1A1A1"
                />
            </View>

            {isVegOnly && (
                <View style={styles.vegOnlyBanner}>
                    <Ionicons name="leaf" size={20} color="#4CAF50" />
                    <Text style={styles.vegOnlyText}>Showing Veg Items Only</Text>
                </View>
            )}

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Restaurants Available Near You</Text>
                <Text style={styles.seeAll}>See All</Text>
            </View>

            <FlatList
                data={filteredRestaurants}
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
    vegOnlyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    vegOnlyText: {
        color: '#4CAF50',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
