import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const slideDownAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  // Individual feature animations
  const feature1Anim = useRef(new Animated.Value(0)).current;
  const feature2Anim = useRef(new Animated.Value(0)).current;
  const feature3Anim = useRef(new Animated.Value(0)).current;
  
  // Button pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequential animations
    const animationSequence = Animated.sequence([
      // Logo appears with scale and rotation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
      ]),
      
      // Title slides down
      Animated.spring(slideDownAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      
      // Features appear with stagger effect
      Animated.stagger(200, [
        Animated.spring(feature1Anim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(feature2Anim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(feature3Anim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      
      // Main content slides up
      Animated.spring(slideUpAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();

    // Continuous bounce animation for logo
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.sin,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.sin,
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();

    // Button pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      bounceAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const handleGetStarted = () => {
    // Add exit animation before navigation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('./Screen/Owner/Register');
    });
  };

  const logoRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoTranslateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ImageBackground 
        source={require('../assets/images/logo.jpg')}
        style={styles.backgroundImage}
        blurRadius={15}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.98)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.content}>
            {/* Animated Header with Logo */}
            <Animated.View style={[
              styles.header, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: logoTranslateY }]
              }
            ]}>
              <Animated.View style={[
                styles.logoContainer,
                {
                  transform: [
                    { scale: scaleAnim },
                    { rotate: logoRotation }
                  ]
                }
              ]}>
                <View style={styles.logoInner}>
                  <Image 
                    source={require('../assets/images/logo.jpg')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                
                {/* Animated rings around logo */}
                <Animated.View style={[
                  styles.logoRing,
                  {
                    transform: [{ rotate: logoRotation }]
                  }
                ]} />
                <Animated.View style={[
                  styles.logoRingOuter,
                  {
                    transform: [{ rotate: logoRotation }]
                  }
                ]} />
              </Animated.View>
            </Animated.View>

            {/* Animated Title */}
            <Animated.View style={[
              styles.titleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideDownAnim }]
              }
            ]}>
              <Text style={styles.title}>Welcome to</Text>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.titleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.titleHighlight}>Wheel Alignment</Text>
              </LinearGradient>
              <Text style={styles.titleSubtext}>Info</Text>
            </Animated.View>

            {/* Animated Features */}
            <View style={styles.featureContainer}>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: feature1Anim,
                  transform: [{
                    translateY: feature1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }, {
                    scale: feature1Anim
                  }]
                }
              ]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                  <MaterialIcons name="speed" size={28} color={colors.primary} />
                </View>
                <Text style={styles.featureText}>Quick Service</Text>
              </Animated.View>
              
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: feature2Anim,
                  transform: [{
                    translateY: feature2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }, {
                    scale: feature2Anim
                  }]
                }
              ]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.secondary + '20' }]}>
                  <FontAwesome5 name="chart-line" size={24} color={colors.secondary} />
                </View>
                <Text style={styles.featureText}>Track Progress</Text>
              </Animated.View>
              
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: feature3Anim,
                  transform: [{
                    translateY: feature3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }, {
                    scale: feature3Anim
                  }]
                }
              ]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons name="car-sport" size={28} color={colors.accent} />
                </View>
                <Text style={styles.featureText}>Manage Fleet</Text>
              </Animated.View>
            </View>

            {/* Animated Description */}
            <Animated.View style={[
              styles.descriptionContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }]
              }
            ]}>
              <Text style={styles.description}>
                Professional wheel alignment service management at your fingertips
              </Text>
            </Animated.View>

            {/* Animated Call to Action */}
            <Animated.View style={[
              styles.bottomSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }]
              }
            ]}>
              <Animated.View style={[
                styles.buttonContainer,
                { transform: [{ scale: pulseAnim }] }
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
              </Animated.View>
              
              <Text style={styles.footerText}>
                Join professional wheel alignment services
              </Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: 30,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 3,
    borderColor: colors.primary + '20',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    borderTopColor: colors.primary,
    borderRightColor: 'transparent',
  },
  logoRingOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: colors.secondary + '20',
    borderBottomColor: colors.secondary,
    borderLeftColor: 'transparent',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    marginBottom: 8,
  },
  titleHighlight: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleSubtext: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 100,
  },
  featureIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  featureText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  description: {
    fontSize: 16,
    color: colors.text.light,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 50,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.light,
    textAlign: 'center',
    fontWeight: '500',
  },
});