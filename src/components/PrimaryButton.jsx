import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, Image, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const PrimaryButton = ({ onPress, title, backgroundColor, textColor, icon, marginTop, marginBottom, width }) => (
    <TouchableOpacity style={[styles.button, { backgroundColor, marginTop, marginBottom, width: width || screenWidth - 40 }]} onPress={onPress}>
        <View style={styles.contentContainer}>
            {icon && <Image source={icon} style={styles.icon} />}
            <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        height: 50,
        paddingVertical: 10,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PrimaryButton;
