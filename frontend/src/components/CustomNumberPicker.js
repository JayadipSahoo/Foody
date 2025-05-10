import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const THEME_COLOR = '#fda535';

const CustomNumberPicker = ({ initialValue = 0, minValue = 0, maxValue = 59, onChange }) => {
    const [value, setValue] = useState(initialValue);
    
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);
    
    const increment = () => {
        if (value < maxValue) {
            const newValue = value + 1;
            setValue(newValue);
            onChange?.(newValue);
        }
    };
    
    const decrement = () => {
        if (value > minValue) {
            const newValue = value - 1;
            setValue(newValue);
            onChange?.(newValue);
        }
    };
    
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.button}
                onPress={decrement}
                disabled={value <= minValue}
            >
                <MaterialCommunityIcons 
                    name="minus" 
                    size={20} 
                    color={value <= minValue ? '#ccc' : THEME_COLOR} 
                />
            </TouchableOpacity>
            
            <View style={styles.valueContainer}>
                <Text style={styles.valueText}>{String(value).padStart(2, '0')}</Text>
            </View>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={increment}
                disabled={value >= maxValue}
            >
                <MaterialCommunityIcons 
                    name="plus" 
                    size={20} 
                    color={value >= maxValue ? '#ccc' : THEME_COLOR} 
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    valueContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderLeftColor: '#ddd',
        borderRightColor: '#ddd',
    },
    valueText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        minWidth: 30,
        textAlign: 'center',
    }
});

export default CustomNumberPicker; 