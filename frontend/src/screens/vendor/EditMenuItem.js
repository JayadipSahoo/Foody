import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
    StatusBar,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define theme color
const THEME_COLOR = '#FF9F6A';

const EditMenuItem = ({ route, navigation }) => {
    const { menuItem, onSave } = route.params || {};
    const isEditing = !!menuItem;

    const [name, setName] = useState(menuItem?.name || '');
    const [description, setDescription] = useState(menuItem?.description || '');
    const [price, setPrice] = useState(menuItem?.price ? String(menuItem.price) : '');
    const [isVeg, setIsVeg] = useState(menuItem?.isVeg || false);
    const [isAvailable, setIsAvailable] = useState(menuItem?.isAvailable !== false);
    const [mealType, setMealType] = useState(menuItem?.mealType || 'lunch');

    const handleSave = () => {
        // Validate required fields
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        if (!price.trim() || isNaN(parseFloat(price))) {
            Alert.alert('Error', 'Valid price is required');
            return;
        }

        // Create updated/new item object
        const updatedItem = {
            ...(menuItem || {}),
            name,
            description,
            price: parseFloat(price),
            isVeg,
            isAvailable,
            mealType
        };

        // Call the onSave callback passed from the parent screen
        if (onSave && typeof onSave === 'function') {
            onSave(updatedItem);
        }
        
        // Navigate back
        navigation.goBack();
    };

    const mealTypes = [
        { id: 'breakfast', label: 'Breakfast' },
        { id: 'lunch', label: 'Lunch' },
        { id: 'dinner', label: 'Dinner' },
    ];

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
                        <Text style={styles.title}>{isEditing ? 'Edit Item' : 'Add Item'}</Text>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Item name"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Description of the dish"
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Price (₹) *</Text>
                            <TextInput
                                style={styles.input}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="₹0.00"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Meal Type</Text>
                            <View style={styles.mealTypeContainer}>
                                {mealTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.mealTypeButton,
                                            mealType === type.id && styles.mealTypeButtonSelected
                                        ]}
                                        onPress={() => setMealType(type.id)}
                                    >
                                        <Text 
                                            style={[
                                                styles.mealTypeText,
                                                mealType === type.id && styles.mealTypeTextSelected
                                            ]}
                                        >
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.switchGroup}>
                            <Text style={styles.label}>Vegetarian</Text>
                            <Switch
                                value={isVeg}
                                onValueChange={setIsVeg}
                                trackColor={{ false: "#767577", true: "#81C784" }}
                                thumbColor={isVeg ? "#4CAF50" : "#f4f3f4"}
                            />
                        </View>

                        <View style={styles.switchGroup}>
                            <Text style={styles.label}>Available</Text>
                            <Switch
                                value={isAvailable}
                                onValueChange={setIsAvailable}
                                trackColor={{ false: "#767577", true: THEME_COLOR }}
                                thumbColor={isAvailable ? THEME_COLOR : "#f4f3f4"}
                            />
                        </View>
                    </ScrollView>
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
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 16,
        backgroundColor: THEME_COLOR,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    saveButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    switchGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 12,
    },
    mealTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mealTypeButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
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
});

export default EditMenuItem; 