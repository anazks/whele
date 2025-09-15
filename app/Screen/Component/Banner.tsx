import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function Banner() {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textBounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for banner background
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bounce animation for heading text
    Animated.loop(
      Animated.sequence([
        Animated.timing(textBounceAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textBounceAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Parallel animations for fade, slide, and scale
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Delayed button animation
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, buttonAnim, pulseAnim, textBounceAnim]);

  const handleContactUs = () => {
    Alert.alert('Learn', 'Type Mobile Number or Vehicle Number to Start');
  };

  const handleExplore = () => {
    Alert.alert('Explore', 'More information about WheelSync services would be shown here!');
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.banner,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Content */}
        <View style={styles.content}>
          <Animated.Text
            style={[
              styles.heading,
              {
                transform: [{ scale: textBounceAnim }],
              },
            ]}
          >
            Wheel Alignment
          </Animated.Text>
          <Text style={styles.subHeading}>Precision Solutions</Text>
          <Text style={styles.description}>
            Keep Your Ride Smooth & Safe
          </Text>

          {/* Button Container */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleContactUs}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Learn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleExplore}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Explore</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
  },
  banner: {
    backgroundColor: '#1D4ED8',
    borderRadius: 20,
    padding: 15,
    width: width * 0.92,
    maxHeight: 200,
    alignItems: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DFE4EA',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  description: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    maxWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  primaryButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});