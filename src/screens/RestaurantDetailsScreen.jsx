import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function RestaurantDetailsScreen({ route, navigation }) {
    const [selectedCategory, setSelectedCategory] = useState('Dinner'); // Default to Dinner

    const { menu } = route.params?.restaurant; // Get the menu from the restaurant params
    const menuCategories = Object.keys(menu); // Get the categories dynamically

    const renderMenuItem = ({ item }) => (
        <View style={styles.menuItem}>
            <View style={styles.menuItemContent}>
                <View style={styles.menuItemHeader}>
                    <View style={styles.nameContainer}>
                        {item.isVeg ? (
                            <View style={[styles.vegIcon, { borderColor: 'green' }]} >
                                <View style={[styles.vegDot, { backgroundColor: 'green' }]} />
                            </View>
                        ) : (
                            <View style={[styles.vegIcon, { borderColor: 'red' }]} >
                                <View style={[styles.vegDot, { backgroundColor: 'red' }]} />
                            </View>
                        )}
                        <Text style={styles.menuItemName}>{item.name}</Text>
                    </View>
                    <Text style={styles.menuItemPrice}>{item.price}</Text>
                </View>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Restaurant Banner */}
                <View style={styles.bannerContainer}>
                    <Image
                        source={{ uri: 'https://placeholder.com/restaurant-banner' }}
                        style={styles.bannerImage}
                    />
                    <View style={styles.restaurantInfo}>
                        <Text style={styles.restaurantName}>{route.params?.restaurant?.name}</Text>
                        <Text style={styles.restaurantTags}>{route.params?.restaurant?.tags}</Text>
                        <View style={styles.restaurantMeta}>
                            <Text style={styles.rating}>⭐ {route.params?.restaurant?.rating}</Text>
                            <Text style={styles.timing}>{route.params?.restaurant?.deliveryTime}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Categories */}
                <View style={styles.categoriesContainer}>
                    {menuCategories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.selectedCategory,
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === category && styles.selectedCategoryText,
                                ]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Menu Items */}
                <FlatList
                    data={menu[selectedCategory]} // Use the selected category's menu
                    renderItem={renderMenuItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bannerContainer: {
        width: width,
        height: 200,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    restaurantInfo: {
        padding: 15,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    restaurantTags: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    restaurantMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginRight: 16,
        fontSize: 14,
    },
    timing: {
        fontSize: 14,
        color: '#666',
    },
    categoriesContainer: {
        flexDirection: 'row',
        padding: 15,
        marginTop: 80,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    selectedCategory: {
        backgroundColor: '#FFA726',
    },
    categoryText: {
        fontSize: 16,
        color: '#666',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    menuItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vegIcon: {
        width: 16,
        height: 16,
        borderWidth: 1,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vegDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFA726',
    },
    menuItemDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    addButton: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 24,
        borderRadius: 4,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FFA726',
    },
    addButtonText: {
        color: '#FFA726',
        fontWeight: 'bold',
    },
}); 