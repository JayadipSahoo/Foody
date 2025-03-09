import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

export default function SplashScreen({ navigation }) {
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.delay(1500)
        ]).start(() => {
            navigation.replace('Welcome');
        });
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
                <Text style={styles.logo}>🍽️</Text>
                <Text style={styles.appName}>Meshi</Text>
                <Text style={styles.tagline}>Delicious food at your doorstep</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFA726',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        fontSize: 80,
        marginBottom: 20,
    },
    appName: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    tagline: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
    },
});
