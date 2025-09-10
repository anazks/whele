import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import aligment from '../assets/images/aligment.png';

const { width, height } = Dimensions.get('window');

// Color palette
const colors = {
  primary: '#6366f1',
  secondary: '#10b981',
  accent: '#f59e0b',
  text: {
    primary: '#111827',
    secondary: '#374151',
    light: '#6b7280',
  },
};

export default function GetStartedScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Enhanced animation with scale for the main image
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('./Screen/Owner/Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.content}>
        {/* Small Logo in top corner */}
        <Animated.View style={[
          styles.topLogo,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}>
          <Image 
            source={require('../assets/images/logo.jpg')}
            style={styles.smallLogo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Main Alignment Image - Center Attraction */}
        <Animated.View style={[
          styles.mainImageContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideUpAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <View style={styles.imageWrapper}>
            <Image 
              source={aligment}
              style={styles.alignmentImage}
              resizeMode="contain"
            />
            {/* Decorative background circle */}
            <View style={styles.backgroundCircle} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={[
          styles.titleContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}>
          <Text style={styles.title}>Professional</Text>
          <Text style={styles.titleHighlight}>Wheel Alignment</Text>
          <Text style={styles.subtitle}>Management System</Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[
          styles.featureContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
              <MaterialIcons name="speed" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Quick Service</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.secondary + '20' }]}>
              <FontAwesome5 name="chart-line" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.featureText}>Track Progress</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="car-sport" size={24} color={colors.accent} />
            </View>
            <Text style={styles.featureText}>Manage Fleet</Text>
          </View>
        </Animated.View>

        {/* Call to Action */}
        <Animated.View style={[
          styles.bottomSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Get Started Now</Text>
              <MaterialIcons name="arrow-forward" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            Precision alignment for every vehicle
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topLogo: {
    alignItems: 'flex-end',
    paddingTop: 20,
    paddingRight: 10,
  },
  smallLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  mainImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 20,
  },
  imageWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignmentImage: {
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 280,
    maxHeight: 280,
    zIndex: 2,
  },
  backgroundCircle: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 240,
    maxHeight: 240,
    borderRadius: width * 0.3,
    backgroundColor: colors.primary + '10',
    borderWidth: 2,
    borderColor: colors.primary + '20',
    zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  titleHighlight: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.light,
    textAlign: 'center',
  },
  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 80,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSection: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
  footerText: {
    fontSize: 13,
    color: colors.text.light,
    textAlign: 'center',
    fontWeight: '500',
  },
});