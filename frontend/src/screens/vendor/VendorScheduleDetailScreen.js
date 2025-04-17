import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert,
    FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVendorStore } from '../../store/vendorStore';

const THEME_COLOR = '#FF9F6A';

const DAYS_OF_WEEK = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
];

const VendorScheduleDetailScreen = ({ route, navigation }) => {
    const { scheduleId } = route.params;
    const { getMenuSchedule, updateMenuSchedule, deleteMenuSchedule } = useVendorStore();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                setLoading(true);
                const data = await getMenuSchedule(scheduleId);
                setSchedule(data);
            } catch (error) {
                Alert.alert('Error', 'Failed to load schedule details');
            } finally {
                setLoading(false);
            }
        };

        loadSchedule();
    }, [scheduleId]);

    const handleDeleteSchedule = () => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this schedule?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMenuSchedule(scheduleId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete schedule');
                        }
                    }
                }
            ]
        );
    };

    const handleEditItem = (dayId, itemIndex) => {
        // Navigate to edit item screen
        const day = schedule.daySchedule.find(d => d.day === dayId);
        if (day && day.items[itemIndex]) {
            console.log('Editing item:', day.items[itemIndex]);
            
            // Navigate to EditMenuItem with the necessary parameters
            navigation.navigate('EditMenuItem', { 
                menuItem: day.items[itemIndex],
                onSave: (updatedItem) => {
                    console.log('Updated item received:', updatedItem);
                    
                    // Create a copy of the schedule
                    const updatedSchedule = { ...schedule };
                    
                    // Find the day and update the item
                    const dayIndex = updatedSchedule.daySchedule.findIndex(d => d.day === dayId);
                    if (dayIndex !== -1) {
                        updatedSchedule.daySchedule[dayIndex].items[itemIndex] = updatedItem;
                        
                        // Update the schedule in the store
                        updateMenuSchedule(schedule._id, updatedSchedule)
                            .then(() => {
                                // Refresh the local state
                                setSchedule(updatedSchedule);
                                Alert.alert('Success', 'Menu item updated successfully');
                            })
                            .catch(error => {
                                console.error('Error updating menu item:', error);
                                Alert.alert('Error', 'Failed to update menu item');
                            });
                    }
                }
            });
        }
    };

    const handleEditSchedule = () => {
        // Navigate to edit schedule screen
        navigation.navigate('MenuSchedulerScreen', { scheduleId });
    };

    const renderDaySection = ({ item: day }) => {
        const dayData = schedule.daySchedule.find(d => d.day === day.id);
        if (!dayData) {
            return null; // Skip days not in the schedule
        }

        return (
            <View style={styles.daySection}>
                <View style={styles.daySectionHeader}>
                    <Text style={styles.daySectionTitle}>{day.name}</Text>
                    <View style={styles.daySectionBadge}>
                        <Text style={styles.daySectionBadgeText}>
                            {dayData.isAvailable ? 'Available' : 'Closed'}
                        </Text>
                    </View>
                </View>

                {dayData.items && dayData.items.length > 0 ? (
                    dayData.items.map((item, index) => (
                        <View key={index} style={styles.menuItem}>
                            <View style={styles.menuItemHeader}>
                                <Text style={styles.menuItemName}>{item.name}</Text>
                                <TouchableOpacity 
                                    style={styles.editItemButton}
                                    onPress={() => handleEditItem(day.id, index)}
                                >
                                    <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.menuItemDetails}>
                                <Text style={styles.menuItemType}>
                                    {item.mealType ? item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1) : 'Lunch'}
                                </Text>
                                {item.description && (
                                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                                )}
                                <Text style={styles.menuItemPrice}>₹{parseFloat(item.price).toFixed(2)}</Text>
                                <View style={styles.menuItemBadge}>
                                    <Text style={styles.menuItemBadgeText}>
                                        {item.isVeg ? 'Vegetarian' : 'Non-Veg'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No items for this day</Text>
                )}
            </View>
        );
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
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Schedule Details</Text>
                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={handleDeleteSchedule}
                        >
                            <MaterialCommunityIcons name="delete" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Text>Loading schedule details...</Text>
                        </View>
                    ) : schedule ? (
                        <ScrollView style={styles.content}>
                            <View style={styles.scheduleHeader}>
                                <View style={styles.scheduleInfo}>
                                    <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                                    {schedule.description && (
                                        <Text style={styles.scheduleDescription}>{schedule.description}</Text>
                                    )}
                                </View>
                                <View style={[
                                    styles.scheduleBadge,
                                    schedule.isActive ? styles.activeBadge : styles.inactiveBadge
                                ]}>
                                    <Text style={styles.scheduleBadgeText}>
                                        {schedule.isActive ? 'Active' : 'Inactive'}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={styles.editButton}
                                onPress={handleEditSchedule}
                            >
                                <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
                                <Text style={styles.editButtonText}>Edit Schedule</Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
                            
                            <FlatList
                                data={DAYS_OF_WEEK}
                                renderItem={renderDaySection}
                                keyExtractor={item => `day-${item.id}`}
                                scrollEnabled={false}
                            />
                        </ScrollView>
                    ) : (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Failed to load schedule details</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: THEME_COLOR,
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: THEME_COLOR,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    deleteButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#D32F2F',
        textAlign: 'center',
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    scheduleDescription: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    scheduleBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    activeBadge: {
        backgroundColor: '#E8F5E9',
    },
    inactiveBadge: {
        backgroundColor: '#FFEBEE',
    },
    scheduleBadgeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME_COLOR,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '500',
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    daySection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderLeftWidth: 3,
        borderLeftColor: THEME_COLOR,
    },
    daySectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    daySectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    daySectionBadge: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    daySectionBadgeText: {
        fontSize: 12,
        color: '#666',
    },
    menuItem: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    editItemButton: {
        backgroundColor: THEME_COLOR,
        padding: 6,
        borderRadius: 4,
    },
    menuItemDetails: {
        paddingLeft: 8,
    },
    menuItemType: {
        fontSize: 14,
        color: THEME_COLOR,
        fontWeight: '500',
    },
    menuItemDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME_COLOR,
        marginTop: 4,
    },
    menuItemBadge: {
        backgroundColor: '#E8F5E9',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    menuItemBadgeText: {
        fontSize: 12,
        color: '#4CAF50',
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 12,
    },
});

export default VendorScheduleDetailScreen; 