import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const PrimaryButton = ({
    onPress,
    title,
    backgroundColor = '#FFA726',
    textColor = '#FFFFFF',
    marginTop = 0,
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor, marginTop }]}
            onPress={onPress}
        >
            <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PrimaryButton; 