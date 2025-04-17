import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomTextField = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    isValid,
    showIcon,
    iconName,
    onIconPress,
}) => {
    return (
        <View style={[
            styles.container,
            isValid === false && styles.invalid,
            isValid === true && styles.valid
        ]}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                placeholderTextColor="#999"
            />
            {showIcon && (
                <TouchableOpacity onPress={onIconPress} style={styles.iconContainer}>
                    <Ionicons name={iconName} size={20} color="#666" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2B2B2B',
    },
    iconContainer: {
        padding: 8,
    },
    invalid: {
        borderColor: '#FF3B30',
    },
    valid: {
        borderColor: '#4CAF50',
    },
});

export default CustomTextField; 