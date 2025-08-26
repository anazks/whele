import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SubscriptionPlan {
  id: string;
  duration: string;
  price: number;
  originalPrice?: number;
  isPopular?: boolean;
  savings?: string;
  features: string[];
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: '1',
    duration: '1 Year',
    price: 1499,
    originalPrice: 2388,
    savings: 'Save 37%',
    isPopular: true,
    features: ['All Premium Features', '2 Months Free', 'Priority Support', 'Exclusive Content']
  },
  {
    id: '2',
    duration: '3 Year',
    price: 3999,
    originalPrice: 7164,
    savings: 'Save 44%',
    features: ['All Premium Features', '8 Months Free', 'VIP Support', 'Early Access', 'Lifetime Updates']
  }
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [selectedPlan, setSelectedPlan] = useState<string>('1');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubscriptionPress = (plan: SubscriptionPlan) => {
    router.push({
      pathname: './Pay',
      params: {
        amount: plan.price.toString(),
        duration: plan.duration,
      }
    });
  };

  const renderPlan = (plan: SubscriptionPlan, index: number) => {
    const isSelected = selectedPlan === plan.id;
    const planAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(planAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        key={plan.id}
        style={[
          styles.planContainer,
          isSelected && styles.selectedPlan,
          plan.isPopular && styles.popularPlan,
          {
            opacity: planAnim,
            transform: [{
              translateY: planAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            }],
          },
        ]}
      >
        {plan.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}
        
        {plan.savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{plan.savings}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.planButton, isSelected && styles.selectedPlanButton]}
          onPress={() => setSelectedPlan(plan.id)}
          activeOpacity={0.8}
        >
          <View style={styles.planHeader}>
            <Text style={[styles.durationText, isSelected && styles.selectedText]}>
              {plan.duration}
            </Text>
            <View style={styles.priceContainer}>
              {plan.originalPrice && (
                <Text style={styles.originalPriceText}>₹{plan.originalPrice}</Text>
              )}
              <Text style={[styles.priceText, isSelected && styles.selectedPriceText]}>
                ₹{plan.price}
              </Text>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            {plan.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={[styles.featureText, isSelected && styles.selectedFeatureText]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
      
      {/* Gradient Background */}
      <View style={styles.gradientBackground} />
      
      {/* Semi-transparent overlay */}
      <View style={styles.overlay} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.subscriptionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              Unlock all features and enjoy unlimited access
            </Text>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>What you'll get:</Text>
            <View style={styles.benefitsList}>
              <Text style={styles.benefitItem}>Unlimited Access</Text>
              <Text style={styles.benefitItem}>Premium Features</Text>
              <Text style={styles.benefitItem}>Ad-Free Experience</Text>
              <Text style={styles.benefitItem}>Priority Support</Text>
            </View>
          </View>

          {/* Subscription Plans */}
          <View style={styles.plansContainer}>
            {subscriptionPlans.map((plan, index) => renderPlan(plan, index))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              const plan = subscriptionPlans.find(p => p.id === selectedPlan);
              if (plan) handleSubscriptionPress(plan);
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.continueButtonText}>Continue with Premium</Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.termsText}>
            Cancel anytime. Auto-renewal can be turned off in account settings.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradientBackground: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  overlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 0,
  },
  subscriptionContainer: {
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 0,
    padding: 32,
    paddingTop: 60,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    backdropFilter: 'blur(10px)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsContainer: {
    backgroundColor: '#f8f9ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 15,
    color: '#555',
    lineHeight: 20,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planContainer: {
    position: 'relative',
  },
  planButton: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedPlan: {
    transform: [{ scale: 1.02 }],
  },
  selectedPlanButton: {
    borderColor: '#4285f4',
    backgroundColor: '#f0f7ff',
    shadowOpacity: 0.2,
  },
  popularPlan: {
    borderColor: '#ff9800',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    backgroundColor: '#ff9800',
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  savingsBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  savingsText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  durationText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  selectedText: {
    color: '#4285f4',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPriceText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
  },
  selectedPriceText: {
    color: '#4285f4',
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkmark: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '700',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  selectedFeatureText: {
    color: '#333',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
});