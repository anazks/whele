import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { getProfile } from '../../api/Services/AuthService';
import { createOrder, verifyPayment } from '../../api/Services/Payment';
import { ExtractToken } from '../../api/Services/TokenExtract';
const { width } = Dimensions.get('window');

export default function Pay() {
  const router = useRouter();
  
  // Get all parameters passed from PayNow component
  const { 
    planId,
    planName,
    amount, 
    currency,
    duration, 
    planType,
    description 
  } = useLocalSearchParams();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTrialPlan, setIsTrialPlan] = useState(false);

  console.log('Received payment parameters:', {
    planId,
    planName,
    amount,
    currency,
    duration,
    planType,
    description
  });

  // Check if this is a trial plan (amount is 0)
  useEffect(() => {
    const planAmount = parseInt(amount || 0);
    if (planAmount === 0) {
      setIsTrialPlan(true);
      Alert.alert(
        'Trial Plan',
        'Trial plans don\'t require payment. You will be redirected to activate your trial.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [amount]);

  const checkSubscriptionStatus = (profileData) => {
    return profileData?.can_access_service || false;
  };

  useEffect(() => {
    // Don't proceed if it's a trial plan
    if (isTrialPlan) return;

    const fetchUserData = async () => {
      try {
        const response = await ExtractToken();
        if (response?.id) {
          const apiResponse = await getProfile(response.id);
          console.log('Fetched profile data:', apiResponse);
          const hasAccess = checkSubscriptionStatus(apiResponse);
          
          setUserData({
            id: response.id,
            name: apiResponse?.name || 'Service Center',
            email: apiResponse?.email || 'contact@linjuwheel.com',
            address: apiResponse?.address || '123 Main Street, Thiruvananthapuram, Kerala',
            phone: apiResponse?.phone || '+91 9876543210',
            shopName: apiResponse?.shopName || 'Service Center',
            businessType: apiResponse?.businessType || 'Automobile Service',
            is_trial_active: apiResponse?.is_trial_active || false,
            is_subscription_active: apiResponse?.is_subscription_active || false,
            can_access_service: apiResponse?.can_access_service || false
          });
        }
      } catch (error) {
        // Set demo data on error for testing
        setUserData({
          id: 'demo',
          name: 'LINJU Wheel Service',
          email: 'contact@linjuwheel.com',
          address: '123 Main Street, Thiruvananthapuram, Kerala',
          phone: '+91 9876543210',
          shopName: 'LINJU Wheel Service Center',
          businessType: 'Automobile Service',
          is_trial_active: false,
          is_subscription_active: false,
          can_access_service: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isTrialPlan]);

  const handlePayment = async () => {
    // Don't proceed if it's a trial plan
    if (isTrialPlan) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      
      // Validate required data before proceeding
      if (!amount || !userData) {
        alert('Payment details are incomplete. Please try again.');
        setLoading(false);
        return;
      }

      const numericAmount = parseInt(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        alert('Invalid amount. Please check the payment details.');
        setLoading(false);
        return;
      }
      
      const paymentData = {
        planId,
        planName,
        amount: numericAmount,
        currency: currency || 'INR',
        duration,
        planType,
        description,
        userData
      };
      
      console.log('Processing payment with data:', paymentData);
      
      // Create order first
      const response = await createOrder(numericAmount);
      console.log('Order creation response:---', response);
      
      if (!response?.data?.order_id) {
        alert('Failed to create order. Please try again.');
        setLoading(false);
        return;
      }
      
      // Extract order details from response
      const { 
        order_id, 
        amount: orderAmount, 
        currency: orderCurrency, 
        key_id
      } = response.data.data;
      
      // Validate order response
      if (!order_id || !key_id) {
        alert('Invalid order response. Please contact support.');
        setLoading(false);
        return;
      }

      // Clean phone number (remove any non-numeric characters except +)
      const cleanPhone = userData.phone?.replace(/[^\d+]/g, '') || '';
      
      // Razorpay checkout options
      const options = {
        description: `${planName || 'Premium Plan'} - ${duration} month subscription`,
        image: 'https://your-logo-url.com/logo.png', // Replace with your actual logo URL
        order_id: order_id, // This is the most critical field
        key: key_id, // Use the key from your backend response
        amount: Math.round(orderAmount * 100), // Amount in paise
        currency: orderCurrency || 'INR',
        name: 'Wheel Alignment Service', // Your business name
        prefill: {
          name: userData.name || '',
          email: userData.email || '',
          contact: cleanPhone
        },
        theme: { 
          color: '#4285f4' 
        },
        modal: {
          ondismiss: () => {
            console.log('Razorpay modal dismissed');
            setLoading(false);
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };
      
      console.log('Opening Razorpay checkout with options:', options);
      
      // Open Razorpay checkout
      const data = await RazorpayCheckout.open(options);
      console.log('Razorpay checkout completed with data:', data);
      
      // Payment successful
      if (data.razorpay_payment_id) {
        console.log('Payment successful:', data);
        let response = await verifyPayment(data)
        console.log('Payment verification response:', response);
        if(response?.data?.success == true && response.status == 200){
          alert('Payment verified successfully!');
          router.push('/(tabs)/Home')
          return;
        }else{
          alert('Payment verification failed. Please contact support.');
          return;
        }
      }
      
    } catch (error) {
     
      // Handle different types of errors
      if (error.code) {
        switch (error.code) {
          case 'BAD_REQUEST_ERROR':
            alert('Invalid request. Please check payment details.');
            break;
          case 'GATEWAY_ERROR':
            alert('Payment gateway error. Please try again.');
            break;
          case 'NETWORK_ERROR':
            alert('Network error. Please check your connection.');
            break;
          case 'SERVER_ERROR':
            alert('Server error. Please try again later.');
            break;
          default:
            alert(`Payment Error: ${error.description || error.message || 'Unknown error'}`);
        }
      } else {
        // Generic error handling
        alert('Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getSubscriptionBenefits = () => {
    // Use planType or duration to determine benefits
    if (planType === 'yearly' || duration === '12') {
      return [
        'All Premium Features',
        'Priority Support',
        'Exclusive Content',
        'Annual Discount Applied'
      ];
    } else {
      return [
        'All Premium Features',
        'Standard Support',
        'Regular Updates'
      ];
    }
  };

  const calculateTax = () => {
    return Math.round(parseInt(amount || 0) * 0.18);
  };

  const calculateTotal = () => {
    return Math.round(parseInt(amount || 0));
  };

  // Don't render the payment screen if it's a trial plan
  if (isTrialPlan) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>
            Redirecting from trial plan...
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>
            {userData ? 'Processing payment...' : 'Loading payment details...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButtonHeader} onPress={handleBack}>
              <Text style={styles.backButtonHeaderText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Details</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Shop/Business Details Card */}
          {userData && (
            <View style={styles.shopDetailsCard}>
              <Text style={styles.sectionTitle}>Business Information</Text>
              
              <View style={styles.shopInfoContainer}>
                <View style={styles.shopHeader}>
                  <Text style={styles.shopName}>{userData.shopName}</Text>
                  <View style={styles.businessTypeBadge}>
                    <Text style={styles.businessTypeText}>{userData.businessType}</Text>
                  </View>
                </View>
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Owner Name</Text>
                    <Text style={styles.detailValue}>{userData.name}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{userData.email}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{userData.phone}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={[styles.detailValue, styles.addressText]}>{userData.address}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Subscription Details Card */}
          <View style={styles.subscriptionCard}>
            <Text style={styles.sectionTitle}>Subscription Details</Text>
            
            <View style={styles.subscriptionHeader}>
              <View style={styles.planInfo}>
                <Text style={styles.subscriptionPlan}>
                  {planName || `${duration} Premium Plan`}
                </Text>
                {planType && (
                  <Text style={styles.planTypeText}>
                    {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan
                  </Text>
                )}
              </View>
              <Text style={styles.subscriptionAmount}>
                {currency || '₹'}{amount}
              </Text>
            </View>

            {description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>{description}</Text>
              </View>
            )}
            
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>What's included:</Text>
              {getSubscriptionBenefits().map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {duration && (
              <View style={styles.durationContainer}>
                <Text style={styles.durationText}>
                  Duration: {duration} month{duration > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Payment Summary Card */}
          <View style={styles.paymentSummaryCard}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {planName || 'Subscription'} ({duration} month{duration > 1 ? 's' : ''})
              </Text>
              <Text style={styles.summaryValue}>
                {currency || '₹'}{amount}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                {currency || '₹'}{calculateTotal()}
              </Text>
            </View>
          </View>

          {/* Payment Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.payButton, loading && styles.payButtonDisabled]} 
              onPress={handlePayment}
              disabled={loading}
            >
              <Text style={styles.payButtonText}>
                {loading ? 'Processing...' : `Pay ${currency || '₹'}${calculateTotal()} Now`}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.securePaymentText}>
              🔒 Secure payment powered by Razorpay
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonHeaderText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  shopDetailsCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  shopInfoContainer: {
    gap: 16,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  businessTypeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  businessTypeText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  addressText: {
    textAlign: 'right',
    lineHeight: 18,
  },
  subscriptionCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planInfo: {
    flex: 1,
  },
  subscriptionPlan: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  planTypeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  subscriptionAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4285f4',
  },
  descriptionContainer: {
    backgroundColor: '#f0f4ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  benefitsContainer: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '700',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  durationContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  paymentSummaryCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4285f4',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  payButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  securePaymentText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});