import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
    TouchableOpacity,
    ScrollView,
  FlatList,
    TextInput,
    Switch,
  ActivityIndicator,
  Alert,
    RefreshControl,
    StatusBar,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVendorStore } from '../../store/vendorStore';

const THEME_COLOR = '#fda535';

const DAYS_OF_WEEK = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
];

const mealTypes = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
];

const VendorMenuScheduleScreen = ({ route, navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' or 'create'
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [expandedScheduleId, setExpandedScheduleId] = useState(null);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);
    const [daySchedules, setDaySchedules] = useState([]);
    const [specialSchedules, setSpecialSchedules] = useState([]);
    
    // Current items being edited for a particular day
    const [dayItems, setDayItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({
        name: '',
        description: '',
        price: '',
        isVeg: false,
        mealType: 'lunch'
    });
    
    // Get functions from vendor store
    const { 
        fetchMenuSchedules,
        createMenuSchedule,
        updateMenuSchedule,
        toggleMenuScheduleStatus,
        deleteMenuSchedule,
        getMenuSchedule,
        menuSchedules,
        isLoadingMenuSchedules,
        menuScheduleError
    } = useVendorStore();
    
    // Load schedules on initial render
  useEffect(() => {
        const loadData = async () => {
            await fetchMenuSchedules();
        };
        
    loadData();
  }, []);
  
    // Handle scheduleId from route params (for editing from VendorScheduleDetailScreen)
    useEffect(() => {
        const loadScheduleForEdit = async () => {
            if (route.params?.scheduleId) {
                try {
                    console.log('Loading schedule for edit, ID:', route.params.scheduleId);
                    const scheduleData = await getMenuSchedule(route.params.scheduleId);
                    if (scheduleData) {
                        console.log('Schedule data loaded:', scheduleData);
                        handleEditSchedule(scheduleData);
                    }
                } catch (error) {
                    console.error('Error loading schedule for edit:', error);
                    Alert.alert('Error', 'Failed to load schedule details for editing');
                }
            }
        };
        
        loadScheduleForEdit();
    }, [route.params?.scheduleId, getMenuSchedule, handleEditSchedule]);
    
    // Handler for refreshing data
    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await fetchMenuSchedules({ force: true });
        } catch (error) {
            console.error("Error refreshing menu schedules:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchMenuSchedules]);
    
    // Reset form to create new schedule
    const resetForm = useCallback(() => {
        setTitle('');
        setDescription('');
        setIsActive(true);
        setDaySchedules([]);
        setSpecialSchedules([]);
        setSelectedDay(null);
        setDayItems([]);
        setCurrentItem({
            name: '',
            description: '',
            price: '',
            isVeg: false,
            mealType: 'lunch'
        });
        setEditMode(false);
        setSelectedSchedule(null);
    }, []);
    
    // Load schedule details for editing
    const handleEditSchedule = useCallback((schedule) => {
        setSelectedSchedule(schedule);
        setTitle(schedule.title);
        setDescription(schedule.description || '');
        setIsActive(schedule.isActive);
        setDaySchedules(schedule.daySchedule || []);
        setSpecialSchedules(schedule.specialSchedules || []);
        setEditMode(true);
        setActiveTab('create');
    }, []);
    
    // Toggle schedule active status
    const handleToggleActive = useCallback(async (id) => {
        try {
            await toggleMenuScheduleStatus(id);
        } catch (error) {
            Alert.alert('Error', 'Failed to toggle schedule status');
        }
    }, [toggleMenuScheduleStatus]);
    
    // Delete schedule
    const handleDeleteSchedule = useCallback((id) => {
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
                            await deleteMenuSchedule(id);
                            resetForm();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete schedule');
                        }
                    }
                }
            ]
        );
    }, [deleteMenuSchedule, resetForm]);
    
    // Add/edit day schedule
    const handleAddDaySchedule = useCallback((day) => {
        setSelectedDay(day);
        
        // Check if day already exists in schedules
        const existingDaySchedule = daySchedules.find(s => s.day === day.id);
        if (existingDaySchedule) {
            setDayItems(existingDaySchedule.items || []);
        } else {
            setDayItems([]);
        }
    }, [daySchedules]);
    
    // Save current item to day items
    const handleSaveItem = useCallback(() => {
        // Validate item
        if (!currentItem.name || !currentItem.price) {
            Alert.alert('Error', 'Name and price are required');
            return;
        }
        
        // Check if price is a valid number
        const price = parseFloat(currentItem.price);
        if (isNaN(price) || price <= 0) {
            Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    
        // Add item to day items
        setDayItems([...dayItems, {
            ...currentItem,
            price: parseFloat(currentItem.price)
        }]);
        
        // Reset current item
        setCurrentItem({
            name: '',
            description: '',
            price: '',
            isVeg: false,
            mealType: 'lunch'
        });
    }, [currentItem, dayItems]);
    
    // Remove item from day items
    const handleRemoveItem = useCallback((index) => {
        const newItems = [...dayItems];
        newItems.splice(index, 1);
        setDayItems(newItems);
    }, [dayItems]);
    
    // Save day schedule
    const handleSaveDaySchedule = useCallback(() => {
        if (!selectedDay) return;
        
        // Create new day schedule object
        const newDaySchedule = {
            day: selectedDay.id,
            items: dayItems,
            isAvailable: true
        };
        
        // Check if day already exists in schedules
        const existingIndex = daySchedules.findIndex(s => s.day === selectedDay.id);
        
        if (existingIndex >= 0) {
            // Update existing day schedule
            const newSchedules = [...daySchedules];
            newSchedules[existingIndex] = newDaySchedule;
            setDaySchedules(newSchedules);
        } else {
            // Add new day schedule
            setDaySchedules([...daySchedules, newDaySchedule]);
        }
        
        // Reset selection
        setSelectedDay(null);
        setDayItems([]);
    }, [selectedDay, dayItems, daySchedules]);
    
    // Save schedule
    const handleSaveSchedule = useCallback(async () => {
        // Validate form
        if (!title) {
            Alert.alert('Error', 'Title is required');
            return;
        }
        
        if (!daySchedules.length && !specialSchedules.length) {
            Alert.alert('Error', 'At least one schedule is required');
            return;
        }
        
        // Create schedule object
        const scheduleData = {
            title,
            description,
            isActive,
            daySchedule: daySchedules,
            specialSchedules
        };
        
        try {
            if (editMode && selectedSchedule) {
                // Update existing schedule
                await updateMenuSchedule(selectedSchedule._id, scheduleData);
            } else {
                // Create new schedule
                await createMenuSchedule(scheduleData);
            }
            
            // Reset form and go back to schedules tab
            resetForm();
            setActiveTab('schedules');
        } catch (error) {
            Alert.alert('Error', 'Failed to save schedule');
        }
    }, [title, description, isActive, daySchedules, specialSchedules, editMode, selectedSchedule, updateMenuSchedule, createMenuSchedule, resetForm]);
    
    // Render schedule items
    const renderScheduleItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity
                style={styles.scheduleItem}
                onPress={() => navigation.navigate('VendorScheduleDetailScreen', { scheduleId: item._id })}
            >
                <View style={styles.scheduleHeader}>
                    <View style={styles.scheduleInfo}>
                        <Text style={styles.scheduleTitle}>{item.title}</Text>
                        <Text style={styles.scheduleDescription}>{item.description}</Text>
                    </View>
                    <View style={styles.scheduleActions}>
                        <TouchableOpacity
                            style={[
                                styles.scheduleStatusBadge,
                                item.isActive ? styles.activeStatus : styles.inactiveStatus
                            ]}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleToggleActive(item._id);
                            }}
                        >
                            <Text style={styles.scheduleStatusText}>
                                {item.isActive ? 'Active' : 'Inactive'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.scheduleDetails}>
                    <Text style={styles.scheduleSubtitle}>Days available:</Text>
                    <View style={styles.daysList}>
                        {item.daySchedule && item.daySchedule.map(day => (
                            <View key={day.day} style={styles.dayBadge}>
                                <Text style={styles.dayBadgeText}>
                                    {DAYS_OF_WEEK.find(d => d.id === day.day)?.name}
                                </Text>
            </View>
                        ))}
                        {(!item.daySchedule || item.daySchedule.length === 0) && (
                            <Text style={styles.emptyText}>No regular days set</Text>
          )}
          </View>
        </View>
        
                <View style={[styles.scheduleFooter, { justifyContent: 'space-between' }]}>
                    <View style={styles.expandIndicator}>
          <MaterialCommunityIcons
                            name="chevron-right" 
                            size={20} 
                            color={THEME_COLOR} 
                        />
                        <Text style={styles.expandText}>
                            View details
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteSchedule(item._id);
                        }}
                    >
                        <MaterialCommunityIcons name="delete" size={16} color="#fff" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
    }, [handleToggleActive, handleDeleteSchedule, navigation]);
    
    // Render day items
    const renderDayItem = useCallback(({ item, index }) => (
        <View style={styles.dayItem}>
            <View style={styles.dayItemInfo}>
                <Text style={styles.dayItemName}>{item.name}</Text>
                <Text style={styles.dayItemType}>
                    {item.mealType ? item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1) : 'Lunch'}
                </Text>
                <Text style={styles.dayItemDescription}>{item.description}</Text>
                <Text style={styles.dayItemPrice}>₹{parseFloat(item.price).toFixed(2)}</Text>
                <View style={styles.dayItemBadge}>
                    <Text style={styles.dayItemBadgeText}>
                        {item.isVeg ? 'Vegetarian' : 'Non-Veg'}
      </Text>
                </View>
        </View>
      <TouchableOpacity
                style={styles.removeItemButton}
                onPress={() => handleRemoveItem(index)}
      >
                <MaterialCommunityIcons name="close" size={20} color="#fda535" />
      </TouchableOpacity>
    </View>
    ), [handleRemoveItem]);
    
    // Render day selection buttons
    const renderDayButton = useCallback((day) => {
        const isInSchedule = daySchedules.some(s => s.day === day.id);
        const isSelected = selectedDay && selectedDay.id === day.id;
        
        return (
            <TouchableOpacity
                key={day.id}
                style={[
                    styles.dayButton,
                    isInSchedule && styles.dayInSchedule,
                    isSelected && styles.daySelected
                ]}
                onPress={() => handleAddDaySchedule(day)}
            >
                <Text
                    style={[
                        styles.dayButtonText,
                        isInSchedule && styles.dayInScheduleText,
                        isSelected && styles.daySelectedText
                    ]}
                >
                    {day.name}
                </Text>
            </TouchableOpacity>
        );
    }, [daySchedules, selectedDay, handleAddDaySchedule]);
  
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
                        <Text style={styles.title}>Menu Schedule</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === 'schedules' && styles.activeTabButton
                            ]}
                            onPress={() => {
                                setActiveTab('schedules');
                                if (editMode) {
                                    resetForm();
                                }
                            }}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === 'schedules' && styles.activeTabButtonText
                                ]}
                            >
                                My Schedules
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === 'create' && styles.activeTabButton
                            ]}
                            onPress={() => {
                                setActiveTab('create');
                                if (!editMode) {
                                    resetForm();
                                }
                            }}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === 'create' && styles.activeTabButtonText
                                ]}
                            >
                                {editMode ? 'Edit Schedule' : 'Create New'}
                            </Text>
        </TouchableOpacity>
      </View>
      
                    {activeTab === 'schedules' ? (
                        <View style={styles.content}>
                            {isLoadingMenuSchedules && !isRefreshing ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={THEME_COLOR} />
                                    <Text style={styles.loadingText}>Loading schedules...</Text>
                                </View>
                            ) : menuScheduleError ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{menuScheduleError}</Text>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={onRefresh}
                                    >
                                        <Text style={styles.retryButtonText}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : menuSchedules.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons
                                        name="calendar-clock"
                                        size={80}
                                        color="#ddd"
                                    />
                                    <Text style={styles.emptyText}>
                                        No schedules found. Create your first menu schedule!
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.createButton}
                                        onPress={() => setActiveTab('create')}
                                    >
                                        <Text style={styles.createButtonText}>Create Schedule</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
      <FlatList
                                    data={menuSchedules}
                                    renderItem={renderScheduleItem}
                                    keyExtractor={(item) => item._id}
                                    contentContainerStyle={styles.schedulesList}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={isRefreshing}
                                            onRefresh={onRefresh}
                                        />
                                    }
                                />
                            )}
                        </View>
                    ) : (
                        <ScrollView style={styles.content}>
                            <View style={styles.formContainer}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Schedule Title *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={title}
                                        onChangeText={setTitle}
                                        placeholder="E.g. Weekly Menu"
                                    />
                                </View>
                                
                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Description</Text>
                                    <TextInput
                                        style={[styles.formInput, styles.textArea]}
                                        value={description}
                                        onChangeText={setDescription}
                                        placeholder="Describe this menu schedule"
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>
                                
                                <View style={styles.switchContainer}>
                                    <Text style={styles.formLabel}>Active</Text>
                                    <Switch
                                        value={isActive}
                                        onValueChange={setIsActive}
                                        trackColor={{ false: "#767577", true: THEME_COLOR }}
                                        thumbColor={isActive ? THEME_COLOR : "#f4f3f4"}
                                    />
                                </View>
                                
                                <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>Day Schedules</Text>
                                    <Text style={styles.sectionDescription}>
                                        Select which days this menu is available
                                    </Text>
                                    
                                    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
                                        style={styles.daysScrollView}
                                    >
                                        {DAYS_OF_WEEK.map(day => renderDayButton(day))}
                                    </ScrollView>
                                    
                                    {selectedDay && (
                                        <View style={styles.dayScheduleContainer}>
                                            <Text style={styles.dayScheduleTitle}>
                                                Menu for {selectedDay.name}
                                            </Text>
                                            
                                            <View style={styles.itemFormContainer}>
                                                <View style={styles.formGroup}>
                                                    <Text style={styles.formLabel}>Item Name *</Text>
                                                    <TextInput
                                                        style={styles.formInput}
                                                        value={currentItem.name}
                                                        onChangeText={(text) => 
                                                            setCurrentItem({...currentItem, name: text})
                                                        }
                                                        placeholder="E.g. Chicken Curry"
                                                    />
                                                </View>
                                                
                                                <View style={styles.formGroup}>
                                                    <Text style={styles.formLabel}>Description</Text>
                                                    <TextInput
                                                        style={[styles.formInput, styles.shortTextArea]}
                                                        value={currentItem.description}
                                                        onChangeText={(text) => 
                                                            setCurrentItem({...currentItem, description: text})
                                                        }
                                                        placeholder="Describe this item"
                                                        multiline
                                                        numberOfLines={2}
                                                    />
                                                </View>
                                                
                                                <View style={styles.formRowContainer}>
                                                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                                                        <Text style={styles.formLabel}>Price (₹) *</Text>
                                                        <TextInput
                                                            style={styles.formInput}
                                                            value={currentItem.price}
                                                            onChangeText={(text) => 
                                                                setCurrentItem({...currentItem, price: text})
                                                            }
                                                            placeholder="₹0.00"
                                                            keyboardType="numeric"
                                                        />
                                                    </View>
                                                    
                                                    <View style={[styles.switchContainer, { flex: 1, marginLeft: 8 }]}>
                                                        <Text style={styles.formLabel}>Vegetarian</Text>
                                                        <Switch
                                                            value={currentItem.isVeg}
                                                            onValueChange={(value) => 
                                                                setCurrentItem({...currentItem, isVeg: value})
                                                            }
                                                            trackColor={{ false: "#767577", true: "#81C784" }}
                                                            thumbColor={currentItem.isVeg ? "#4CAF50" : "#f4f3f4"}
                                                        />
                                                    </View>
                                                </View>
                                                
                                                <View style={styles.formGroup}>
                                                    <Text style={styles.formLabel}>Meal Type</Text>
                                                    <View style={styles.mealTypeContainer}>
                                                        {mealTypes.map((type) => (
            <TouchableOpacity 
                                                                key={type.id}
                                                                style={[
                                                                    styles.mealTypeButton,
                                                                    currentItem.mealType === type.id && styles.mealTypeButtonSelected
                                                                ]}
                                                                onPress={() => setCurrentItem({...currentItem, mealType: type.id})}
                                                            >
                                                                <Text 
                                                                    style={[
                                                                        styles.mealTypeText,
                                                                        currentItem.mealType === type.id && styles.mealTypeTextSelected
                                                                    ]}
                                                                >
                                                                    {type.label}
                                                                </Text>
            </TouchableOpacity>
                                                        ))}
          </View>
        </View>
        
                                                <TouchableOpacity
                                                    style={styles.addItemButton}
                                                    onPress={handleSaveItem}
                                                >
                                                    <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                                                    <Text style={styles.addItemButtonText}>Add Item</Text>
                                                </TouchableOpacity>
          </View>
                                            
                                            <View style={styles.dayItemsContainer}>
                                                <Text style={styles.dayItemsTitle}>Items for {selectedDay.name}</Text>
                                                
                                                {dayItems.length === 0 ? (
                                                    <Text style={styles.emptyText}>No items added yet</Text>
                                                ) : (
            <FlatList
                                                        data={dayItems}
                                                        renderItem={renderDayItem}
                                                        keyExtractor={(_, index) => index.toString()}
                                                        scrollEnabled={false}
                                                    />
                                                )}
                                            </View>
                                            
                                            <TouchableOpacity
                                                style={styles.saveDayButton}
                                                onPress={handleSaveDaySchedule}
                                            >
                                                <Text style={styles.saveDayButtonText}>Save Day Schedule</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                                
                                <View style={styles.formActions}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            resetForm();
                                            setActiveTab('schedules');
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
                                        onPress={handleSaveSchedule}
            >
              <Text style={styles.saveButtonText}>
                                            {editMode ? 'Update Schedule' : 'Create Schedule'}
              </Text>
            </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
  container: {
    flex: 1,
        backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
        backgroundColor: THEME_COLOR,
        paddingTop: 0,
        paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
        padding: 8,
  },
  title: {
        fontSize: 24,
    fontWeight: 'bold',
        color: '#fff',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
    alignItems: 'center',
  },
    activeTabButton: {
        borderBottomWidth: 2,
        borderBottomColor: THEME_COLOR,
  },
    tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
        color: '#666',
  },
    activeTabButtonText: {
        color: THEME_COLOR,
    fontWeight: 'bold',
  },
    content: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginBottom: 16,
        color: '#fda535',
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    retryButtonText: {
        color: '#fff',
    fontWeight: 'bold',
  },
    emptyContainer: {
    flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginVertical: 16,
        color: '#666',
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 4,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    schedulesList: {
        padding: 16,
    },
    scheduleItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderLeftWidth: 3,
        borderLeftColor: THEME_COLOR,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
        alignItems: 'flex-start',
    marginBottom: 12,
  },
    scheduleInfo: {
        flex: 1,
    },
    scheduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
    scheduleDescription: {
        marginTop: 4,
        fontSize: 16,
        color: '#666',
  },
  scheduleActions: {
    flexDirection: 'row',
  },
    scheduleStatusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    activeStatus: {
        backgroundColor: '#E8F5E9',
    },
    inactiveStatus: {
        backgroundColor: '#FFEBEE',
    },
    scheduleStatusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    scheduleDetails: {
        marginVertical: 8,
    },
    scheduleSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#555',
        marginBottom: 8,
    },
    daysList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayBadge: {
        backgroundColor: '#FFF8E1',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    dayBadgeText: {
        fontSize: 12,
        color: '#fda535',
    },
    scheduleFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    expandIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expandText: {
        marginLeft: 4,
        color: '#666',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fda535',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    deleteButtonText: {
        marginLeft: 4,
        color: '#fff',
    fontWeight: '500',
  },
    formContainer: {
        padding: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    formLabel: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    formInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    shortTextArea: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
        marginBottom: 16,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    marginBottom: 8,
    },
    sectionDescription: {
        marginBottom: 16,
        fontSize: 16,
        color: '#666',
    },
    daysScrollView: {
        marginBottom: 16,
    },
    dayButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        marginRight: 8,
    },
    dayInSchedule: {
        backgroundColor: '#FFF5F0',
    },
    daySelected: {
        backgroundColor: THEME_COLOR,
    },
    dayButtonText: {
        color: '#555',
        fontSize: 16,
    },
    dayInScheduleText: {
        color: THEME_COLOR,
    },
    daySelectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    dayScheduleContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    dayScheduleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    itemFormContainer: {
        marginBottom: 16,
    },
    formRowContainer: {
        flexDirection: 'row',
    },
    addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
        backgroundColor: THEME_COLOR,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignSelf: 'flex-end',
    },
    addItemButtonText: {
        marginLeft: 4,
        color: '#fff',
        fontWeight: '500',
    },
    dayItemsContainer: {
        marginTop: 16,
    },
    dayItemsTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    dayItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
  },
    dayItemInfo: {
    flex: 1,
  },
    dayItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
    dayItemType: {
        fontSize: 14,
        color: THEME_COLOR,
        fontWeight: '500',
        marginTop: 2,
    },
    dayItemDescription: {
    fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    dayItemPrice: {
    fontSize: 16,
        fontWeight: 'bold',
        color: THEME_COLOR,
    marginTop: 2,
  },
    dayItemBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        marginTop: 4,
    },
    dayItemBadgeText: {
        fontSize: 10,
        color: '#4CAF50',
    },
    removeItemButton: {
        padding: 8,
    },
    saveDayButton: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 16,
    },
    saveDayButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    formActions: {
    flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        paddingVertical: 12,
        borderRadius: 4,
    alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '500',
  },
  saveButton: {
        flex: 2,
        backgroundColor: THEME_COLOR,
        paddingVertical: 12,
        borderRadius: 4,
    alignItems: 'center',
        marginLeft: 8,
  },
  saveButtonText: {
        color: '#fff',
    fontWeight: 'bold',
  },
    mealTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    mealTypeButton: {
    flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        backgroundColor: '#f1f1f1',
        borderRadius: 4,
    alignItems: 'center',
  },
    mealTypeButtonSelected: {
        backgroundColor: THEME_COLOR,
    },
    mealTypeText: {
        color: '#333',
        fontWeight: '500',
    },
    mealTypeTextSelected: {
        color: '#fff',
    fontWeight: 'bold',
  },
    expandedContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    editNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F0',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: THEME_COLOR,
    },
    editNoticeText: {
        marginLeft: 8,
        color: '#666',
        flex: 1,
    },
    editInlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME_COLOR,
    paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    editButtonText: {
        marginLeft: 4,
        color: '#fff',
        fontWeight: '500',
  },
});

export default VendorMenuScheduleScreen; 