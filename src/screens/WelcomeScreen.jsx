import React, { useRef, useState } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions, ScrollView, Text } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const slides = [
    {
        image: require('../../assets/Onboard1.jpg'),
    },
    {
        image: require('../../assets/Onboard2.jpg'),
    },
];

export default function WelcomeScreen({ navigation }) {
    const scrollViewRef = useRef();
    const [currentPage, setCurrentPage] = useState(0);

    const handleNext = (index) => {
        if (index === slides.length - 1) {
            navigation.replace('SignIn');
        } else {
            scrollViewRef.current.scrollTo({ x: (index + 1) * screenWidth, animated: true });
        }
    };

    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / screenWidth);
        setCurrentPage(index);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {slides.map((slide, index) => (
                    <View key={index} style={styles.slide}>
                        <ImageBackground source={slide.image} style={styles.backgroundImage}>
                            <View style={styles.indicatorContainer}>
                                {slides.map((_, idx) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.indicator,
                                            currentPage === idx ? styles.activeIndicator : styles.inactiveIndicator,
                                        ]}
                                    />
                                ))}
                            </View>
                            <PrimaryButton
                                onPress={() => handleNext(index)}
                                title={index === 0 ? 'Get Started' : 'Next'}
                                backgroundColor={'white'}
                                textColor={'#2B2B2B'}
                                marginBottom={50}
                            />
                        </ImageBackground>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: screenWidth,
        height: screenHeight + 40,
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 80,
    },
    indicator: {
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    inactiveIndicator: {
        width: 30,
        height: 7,
        backgroundColor: '#FFB21A',
    },
    activeIndicator: {
        width: 50,
        height: 7,
        backgroundColor: 'white',
    },
    button: {
        marginBottom: 50,
        paddingVertical: 10,
        width: screenWidth - 40,
        backgroundColor: '#fff',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#2B2B2B',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
