import React, { useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import CartContext from '../services/CartContext';

const ProductDetailsScreen = ({ route }) => {


    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TEXT>PRDS</TEXT>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 30
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F7F7F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    cartButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F7F7F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadge: {
        position: 'absolute',
        top: -7,
        right: -2,
        backgroundColor: '#EB4335',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    productImage: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
    },
    featuresContainer: {
        paddingLeft: 20,
    },
    detailsContainer: {
        padding: 20,
    },
    productTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    productCategory: {
        fontSize: 16,
        color: '#707070',
        marginVertical: 5,
    },
    productPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginVertical: 5,
    },
    thumbnailContainer: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
    },
    productDescription: {
        fontSize: 16,
        color: '#707070',
        marginVertical: 10,
    },
    readMore: {
        fontSize: 16,
        color: '#007AFF',
        marginVertical: 10,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginVertical: 20,
    },
    wishlistButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F7F7F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 15,
        paddingVertical: 15,
        paddingHorizontal: 60,
    },
    addToCartButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default ProductDetailsScreen;
