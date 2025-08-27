import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getPaymentPlans } from '../../api/Services/Payment';

export default function PayNow() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchPaymentPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPaymentPlans();
      console.log("payment plans", response);
      
      if (response && response.data) {
        setPlans(response.data);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.log("error", error);
      setError("Failed to fetch payment plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentPlans();
  }, []);

  const handleSubscribe = (plan) => {
    router.push({
      pathname: './Pay',
      params: {
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        currency: plan.currency,
        duration: plan.duration_months,
        planType: plan.plan_type,
        description: plan.description
      }
    });
  };

  const getBadgeColor = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'premium':
        return '#FFD700';
      case 'basic':
        return '#87CEEB';
      case 'pro':
        return '#FF6B6B';
      default:
        return '#98D8C8';
    }
  };

  const renderPlanItem = ({ item }) => (
    <View style={styles.planCard}>
      {/* Header Section */}
      <View style={styles.cardHeader}>
        <View style={styles.planNameContainer}>
          <Text style={styles.planName}>{item.name}</Text>
          <View style={[styles.typeBadge, { backgroundColor: getBadgeColor(item.plan_type) }]}>
            <Text style={styles.typeBadgeText}>{item.plan_type}</Text>
          </View>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: item.is_active ? '#4CAF50' : '#F44336' }]} />
      </View>

      {/* Price Section */}
      <View style={styles.priceSection}>
        <Text style={styles.currency}>{item.currency}</Text>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.duration}>/ {item.duration_months} months</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Features/Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{item.duration_months} months</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text style={[styles.detailValue, { color: item.is_active ? '#4CAF50' : '#F44336' }]}>
            {item.is_active ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      {/* Subscribe Button */}
      <TouchableOpacity 
        style={[
          styles.subscribeButton,
          !item.is_active && styles.disabledButton
        ]}
        onPress={() => handleSubscribe(item)}
        disabled={!item.is_active}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.subscribeButtonText,
          !item.is_active && styles.disabledButtonText
        ]}>
          {item.is_active ? 'Choose Plan' : 'Not Available'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading payment plans...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPaymentPlans}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Select the perfect plan for your needs</Text>
      </View>
      
      {plans.length > 0 ? (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPlanItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centerContainer}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Plans Available</Text>
            <Text style={styles.emptyText}>Check back later for new payment plans</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planNameContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A202C',
    textTransform: 'uppercase',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366F1',
    marginRight: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  duration: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A202C',
    fontWeight: '600',
  },
  subscribeButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  disabledButtonText: {
    color: '#94A3B8',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: 300,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});