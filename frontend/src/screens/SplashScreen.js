import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useAuthStore from '../store/authStore';

// Define theme color
const THEME_COLOR = '#FDA535';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated, userType, isInitialized } = useAuthStore();
  
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const quoteAnim = new Animated.Value(0);

  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]),
      Animated.timing(quoteAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Navigate after animation completes
    const timer = setTimeout(() => {
      // Check authentication state to determine where to navigate
      if (isInitialized) {
        if (isAuthenticated) {
          // For authenticated users, navigate to their main dashboard
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }]
          });
        } else {
          // For non-authenticated users, go to welcome screen
          navigation.navigate('Welcome');
        }
      } else {
        // If auth not initialized yet, default to welcome
        navigation.navigate('Welcome');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigation, isAuthenticated, isInitialized]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={THEME_COLOR} barStyle="light-content" />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>Meshi</Text>
          <Ionicons name="restaurant" size={40} color={THEME_COLOR} />
        </View>
      </Animated.View>
      
      <Animated.View style={{ opacity: quoteAnim }}>
        <Text style={styles.tagline}>Every Meal with Homely Feel</Text>
      </Animated.View>
      
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FFFFFF" style={styles.loader} />
        <Text style={styles.footerText}>Good food is coming your way</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: THEME_COLOR,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  loader: {
    marginBottom: 10,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  }
});

export default SplashScreen; 