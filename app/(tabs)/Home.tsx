import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getProfile } from '../api/Services/AuthService';
import { Dashboard, dashBoardMonthly, getCustomer, upcommingServices } from '../api/Services/management';
import { ExtractToken } from '../api/Services/TokenExtract';
import { translations } from '../Languge/Languages'; // Update this path
import AddVehicle from '../Screen/Owner/AddVehicle';

const { width } = Dimensions.get('window');

interface UserData {
  id?: string;
  name?: string;
  is_trial_active?: boolean;
  is_subscription_active?: boolean;
  can_access_service?: boolean;
  trial_ends_at?: string;
  subscription_valid_until?: string;
  service_center_name?: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  service_center: number;
  service_center_name: string;
  vehicle_count: number;
  date_added: string;
  date_updated: string;
}

interface DashboardData {
  total_services: number;
  total_revenue: number;
  service_types: Array<{
    service_type: string;
    count: number;
  }>;
}

interface UpcomingService {
  id: number;
  customer_name?: string;
  service_type?: string;
  scheduled_date?: string;
  [key: string]: any;
}

export default function Home() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('english');
  
  // New state for dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    total_services: 0,
    total_revenue: 0,
    service_types: []
  });
  const [upcomingServicesData, setUpcomingServicesData] = useState<UpcomingService[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Add Vehicle Modal State
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [selectedCustomerForVehicle, setSelectedCustomerForVehicle] = useState<Customer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [filteredRecentCustomers, setFilteredRecentCustomers] = useState<Customer[]>([]);

  // Translation function
  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  // Load language preference
  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      alert('Failed to load language preference');
    }
  };

  // Filter customers based on search query
  useEffect(() => {
    if (customerSearchQuery) {
      const filtered = recentCustomers.filter(customer => 
        customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.phone.includes(customerSearchQuery)
      );
      setFilteredRecentCustomers(filtered);
    } else {
      setFilteredRecentCustomers(recentCustomers);
    }
  }, [customerSearchQuery, recentCustomers]);

  // Updated stats to use real data
  const stats = {
    totalCustomers: totalCustomers,
    newCustomers: upcomingServicesData.length, // Using upcoming services as "new activity"
    activeCustomers: Math.floor(totalCustomers * 0.7), // Estimate 70% as active
    revenue: dashboardData.total_revenue,
    totalServices: dashboardData.total_services,
  };

  // Function to handle phone call
  const handleCall = useCallback((phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  // Function to handle adding a vehicle for a customer
  const handleAddVehicleForCustomer = (customer: Customer) => {
    setSelectedCustomerForVehicle(customer);
    setShowAddVehicleModal(true);
  };

  // Function to handle vehicle addition completion
  const handleVehicleAdded = (vehicleData: any) => {
    setShowAddVehicleModal(false);
    setSelectedCustomerForVehicle(null);
    // Refresh data to show the new vehicle
    onRefresh();
  };

  const checkSubscriptionStatus = useCallback((profileData: any) => {
    const hasAccess = profileData?.is_trial_active || profileData?.is_subscription_active;
    
    if (!hasAccess) {
      router.replace('/Screen/Constance/PayNow');
      return false;
    }
    return true;
  }, []);

  // New function to fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const response = await Dashboard(); // Changed from dashBoardMonthly to Dashboard
      if (response && response.success) {
        console.log('Dashboard data:', response.data);
        // Update user data with subscription info
        setUserData(prevData => ({
          ...prevData,
          service_center_name: response.data.service_center_name,
          is_trial_active: response.data.is_trial_active,
          is_subscription_active: response.data.is_subscription_active,
          trial_ends_at: response.data.trial_ends_at,
          subscription_valid_until: response.data.subscription_valid_until,
          can_access_service: response.data.can_access_service
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // New function to fetch monthly stats
  const fetchMonthlyStats = useCallback(async () => {
    try {
      const response = await dashBoardMonthly();
      if (response) {
        console.log('Monthly stats:', response);
        setDashboardData(response);
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedFetchStats'));
    }
  }, []);

  // New function to fetch upcoming services
  const fetchUpcomingServices = useCallback(async () => {
    try {
      const response = await upcommingServices();
      if (response && Array.isArray(response)) {
        console.log('Upcoming services:', response);
        setUpcomingServicesData(response);
      }
    } catch (error) {
      console.error('Error fetching upcoming services:', error);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      await loadLanguagePreference(); // Load language preference first
      
      const response = await ExtractToken();
      setRole(response?.role || null);
      if (response?.id) {
        const apiResponse = await getProfile(response.id);
        
        const hasAccess = checkSubscriptionStatus(apiResponse);
        
        if (hasAccess) {
          setUserData({
            id: response.id,
            name: apiResponse?.name || 'LINJU Wheel Service',
            is_trial_active: apiResponse?.is_trial_active,
            is_subscription_active: apiResponse?.is_subscription_active,
            can_access_service: apiResponse?.can_access_service,
            trial_ends_at: apiResponse?.trial_ends_at,
            subscription_valid_until: apiResponse?.subscription_valid_until,
            service_center_name: apiResponse?.service_center_name
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.replace('/Screen/Constance/PayNow');
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [checkSubscriptionStatus]);

  const fetchRecentCustomers = useCallback(async () => {
    try {
      setCustomersLoading(true);
      const response = await getCustomer();
      if (response && Array.isArray(response)) {
        console.log('Fetched customers:', response);
        // Set total customers count
        setTotalCustomers(response.length);
        // Get only the first 5 customers for recent display
        const limitedCustomers = response.slice(0, 5);
        setRecentCustomers(limitedCustomers);
        setFilteredRecentCustomers(limitedCustomers);
      } else {
        console.error('Failed to fetch customers');
        setTotalCustomers(0);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setTotalCustomers(0);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchUserData(),
      fetchRecentCustomers(),
      fetchDashboardData(),
      fetchMonthlyStats(),
      fetchUpcomingServices()
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [fetchUserData, fetchRecentCustomers, fetchDashboardData, fetchMonthlyStats, fetchUpcomingServices]);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchUserData(),
        fetchRecentCustomers(),
        fetchDashboardData(),
        fetchMonthlyStats(),
        fetchUpcomingServices()
      ]);
    };
    
    initializeData();
  }, [fetchUserData, fetchRecentCustomers, fetchDashboardData, fetchMonthlyStats, fetchUpcomingServices]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    scrollY.setValue(contentOffset.y);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} ${diffDays > 1 ? t('days') : t('day')} ${t('ago')}`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours > 1 ? t('hours') : t('hour')} ${t('ago')}`;
    } else {
      return `${diffMinutes} ${diffMinutes > 1 ? t('minutes') : t('minute')} ${t('ago')}`;
    }
  };

  const formatExpiryDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Show loading while checking subscription and fetching initial data
  if (isLoading || dashboardLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>{t('loadingDashboard')}</Text>
      </View>
    );
  }

  // Don't render the home content if user doesn't have access
  if (!userData.is_trial_active && !userData.is_subscription_active) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, {
        opacity: headerOpacity,
        transform: [{ translateY: headerTranslateY }]
      }]}>
        <View>
          <Text style={styles.greeting}>{t('welcomeBack')}</Text>
          <Text style={styles.shopName}>{userData.service_center_name || userData.name || 'LINJU Wheel Service'}</Text>
          
          {/* Subscription Status Display */}
          <View style={styles.subscriptionContainer}>
            {userData.is_trial_active && (
              <View style={styles.subscriptionStatus}>
                <Text style={styles.trialIndicator}>{t('trialActive')}</Text>
                <Text style={styles.expiryText}>
                  {t('expires')}: {formatExpiryDate(userData.trial_ends_at || '')}
                </Text>
              </View>
            )}
            
            {userData.is_subscription_active && (
              <View style={styles.subscriptionStatus}>
                <Text style={styles.subscriptionIndicator}>{t('subscriptionActive')}</Text>
                <Text style={styles.expiryText}>
                  {t('validUntil')}: {formatExpiryDate(userData.subscription_valid_until || '')}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.notificationIcon}>
          <MaterialIcons name="notifications-none" size={26} color="#555" />
          {upcomingServicesData.length > 0 && (
            <View style={styles.notificationBadge} />
          )}
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
      >
        {/* Business Overview - Updated with real data */}
        {
          role === 'centeradmin' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('businessOverview')}</Text>
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
                  <View style={styles.statContent}>
                    <Text style={[styles.statNumber, { color: '#2563eb' }]}>{stats.totalCustomers}</Text>
                    <Text style={styles.statLabel}>{t('totalCustomers')}</Text>
                  </View>
                  <MaterialIcons name="people" size={28} color="#2563eb" />
                </View>
                
                <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
                  <View style={styles.statContent}>
                    <Text style={[styles.statNumber, { color: '#16a34a' }]}>{stats.totalServices}</Text>
                    <Text style={styles.statLabel}>{t('servicesDone')}</Text>
                  </View>
                  <MaterialIcons name="build" size={28} color="#16a34a" />
                </View>
                
                <View style={[styles.statCard, { backgroundColor: '#fefce8' }]}>
                  <View style={styles.statContent}>
                    <Text style={[styles.statNumber, { color: '#ca8a04' }]}>{upcomingServicesData.length}</Text>
                    <Text style={styles.statLabel}>{t('upcomingServices')}</Text>
                  </View>
                  <MaterialIcons name="schedule" size={28} color="#ca8a04" />
                </View>
                
                <View style={[styles.statCard, { backgroundColor: '#faf5ff' }]}>
                  <View style={styles.statContent}>
                    <Text style={[styles.statNumber, { color: '#9333ea', fontSize: 20 }]}>
                      {formatCurrency(stats.revenue)}
                    </Text>
                    <Text style={styles.statLabel}>{t('monthlyRevenue')}</Text>
                  </View>
                  <FontAwesome5 name="rupee-sign" size={24} color="#9333ea" />
                </View>
              </View>
            </View>
          )
        }

        {/* Service Types Breakdown - New section */}
        {dashboardData.service_types && dashboardData.service_types.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('serviceTypesThisMonth')}</Text>
            <View style={styles.serviceTypesContainer}>
              {dashboardData.service_types.map((service, index) => (
                <View key={index} style={styles.serviceTypeCard}>
                  <View style={styles.serviceTypeIcon}>
                    <MaterialIcons 
                      name={
                        service.service_type.toLowerCase().includes('change') ? 'build' :
                        service.service_type.toLowerCase().includes('alignment') ? 'tune' :
                        service.service_type.toLowerCase().includes('balancing') ? 'balance' :
                        'car-repair'
                      } 
                      size={24} 
                      color="#2563eb" 
                    />
                  </View>
                  <View style={styles.serviceTypeInfo}>
                    <Text style={styles.serviceTypeName}>{service.service_type}</Text>
                    <Text style={styles.serviceTypeCount}>{service.count} {t('services')}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Add Customer CTA */}
        <View style={styles.section}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaContent}>
              <View style={styles.ctaIcon}>
                <MaterialIcons name="person-add" size={32} color="#ffffff" />
              </View>
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>{t('addNewCustomer')}</Text>
                <Text style={styles.ctaSubtitle}>{t('registerNewCustomer')}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => {
                router.push('/Screen/Owner/CustomerAdd');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>{t('addCustomer')}</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Customers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recentCustomers')}</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
             
            >
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
              <MaterialIcons name="chevron-right" size={18} color="#2563eb" />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#64748b" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor="#94a3b8"
              value={customerSearchQuery}
              onChangeText={setCustomerSearchQuery}
            />
            {customerSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setCustomerSearchQuery('')}>
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.customersContainer}>
            {customersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingText}>{t('loadingCustomers')}</Text>
              </View>
            ) : filteredRecentCustomers.length > 0 ? (
              filteredRecentCustomers.map((customer, index) => (
                <View key={customer.id} style={styles.customerCardWrapper}>
                  <TouchableOpacity 
                    style={[
                      styles.customerCard,
                      index === filteredRecentCustomers.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    activeOpacity={0.8}
                   
                  >
                    <View style={styles.customerAvatar}>
                      <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerName}>{customer.name}</Text>
                      <Text style={styles.phoneNumber}>{customer.phone}</Text>
                      <Text style={styles.vehicleCount}>{customer.vehicle_count} vehicle{customer.vehicle_count !== 1 ? 's' : ''}</Text>
                      <Text style={styles.addedTime}>{t('added')} {formatDate(customer.date_added)}</Text>
                    </View>
                    <View style={styles.customerActions}>
                      <TouchableOpacity 
                        style={styles.actionIcon}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCall(customer.phone);
                        }}
                      >
                        <MaterialIcons name="phone" size={20} color="#16a34a" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Add Vehicle Button */}
                  <TouchableOpacity
                    style={styles.addVehicleButton}
                    onPress={() => handleAddVehicleForCustomer(customer)}
                  >
                    <MaterialIcons name="directions-car" size={18} color="#ffffff" />
                    <Text style={styles.addVehicleButtonText}>{t('addVehicle')}</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : customerSearchQuery ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={40} color="#ccc" />
                <Text style={styles.emptyText}>{t('noResults')}</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="people-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>{t('noCustomers')}</Text>
                <TouchableOpacity 
                  style={styles.addFirstCustomerBtn}
                  onPress={() => router.push('/Screen/Owner/CustomerAdd')}
                >
                  <Text style={styles.addFirstCustomerText}>{t('addFirstCustomer')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Quick Insights - Updated with real data */}
        {
          role === 'centeradmin' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('quickInsights')}</Text>
              <View style={styles.insightsContainer}>
                <View style={styles.insightCard}>
                  <MaterialIcons name="trending-up" size={24} color="#16a34a" />
                  <Text style={styles.insightText}>
                    {stats.totalServices} {t('servicesCompleted')}
                  </Text>
                </View>
                {upcomingServicesData.length > 0 && (
                  <View style={styles.insightCard}>
                    <MaterialIcons name="schedule" size={24} color="#ca8a04" />
                    <Text style={styles.insightText}>
                      {upcomingServicesData.length} {t('upcomingServicesScheduled')}
                    </Text>
                  </View>
                )}
                {stats.revenue > 0 && (
                  <View style={styles.insightCard}>
                    <FontAwesome5 name="rupee-sign" size={20} color="#9333ea" />
                    <Text style={styles.insightText}>
                      {formatCurrency(stats.revenue)} {t('revenueGenerated')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )
        }

        {/* Empty space at bottom */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Add Vehicle Modal */}
      <Modal
        visible={showAddVehicleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddVehicleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('addVehicleFor')} {selectedCustomerForVehicle?.name}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAddVehicleModal(false)}
              >
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <AddVehicle 
              onVehicleAdded={handleVehicleAdded}
              onCancel={() => setShowAddVehicleModal(false)}
              preselectedCustomer={selectedCustomerForVehicle}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    paddingTop: 160, // Increased to accommodate subscription info
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 140, // Increased height for subscription info
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
  },
  shopName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  subscriptionContainer: {
    marginTop: 8,
  },
  subscriptionStatus: {
    marginTop: 6,
  },
  trialIndicator: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  subscriptionIndicator: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  expiryText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginLeft: 4,
  },
  notificationIcon: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  section: {
    marginTop: 24,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: width / 2 - 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  // New styles for service types
  serviceTypesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  serviceTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  serviceTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceTypeInfo: {
    flex: 1,
  },
  serviceTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  serviceTypeCount: {
    fontSize: 14,
    color: '#64748b',
  },
  ctaCard: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  customersContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    minHeight: 100,
  },
  customerCardWrapper: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  customerCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  vehicleCount: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  addedTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addVehicleButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#2563eb',
    fontWeight: '600',
    marginRight: 4,
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 10,
    color: '#64748b',
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 16,
  },
  addFirstCustomerBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstCustomerText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
});