// screens/ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import CustomTextField from '../components/CustomTextField';
import PrimaryButton from '../components/PrimaryButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

const ProfileScreen = () => {


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text>PROFILE</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        marginTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    backButtonContainer: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: '#F7F7F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    doneButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFAC1C',
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 5,
    },
    changeProfilePicture: {
        fontSize: 14,
        color: '#FFAC1C',
    },
    formContainer: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#2B2B2B',
        marginBottom: 5,
    },
    errorText: {
        fontSize: 12,
        color: '#EB4335',
        marginBottom: 10,
    },
});

export default ProfileScreen;
