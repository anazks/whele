import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
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
import { Dashboard, dashBoardMonthly, getCustomer, getCustomerVehicles, getVehicle, upcommingServices } from '../api/Services/management';
import { ExtractToken } from '../api/Services/TokenExtract';
import { translations } from '../Languge/Languages';
import Banner from '../Screen/Component/Banner';
import AddVehicle from '../Screen/Owner/AddVehicle';
import CustomerAdd from '../Screen/Owner/CustomerAdd';

const { width } = Dimensions.get('window');

interface UserData {
  id?: string;
  name?: string;
  phone?: string;
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
  vehicles?: CustomerVehicle[];
}

interface CustomerVehicle {
  id: number;
  vehicle_number: string;
  vehicle_model: number;
  vehicle_display_name: string;
}

interface Vehicle {
  id: number;
  customer: number;
  customer_name: string;
  customer_phone: string;
  vehicle_type: number;
  vehicle_type_name: string;
  brand_name: string;
  service_center: number;
  service_center_name: string;
  vehicle_model: number;
  vehicle_number: string;
  transport_type: string;
  last_service_date: string | null;
  last_service_info: any;
  next_service_due: any;
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
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    total_services: 0,
    total_revenue: 0,
    service_types: []
  });
  const [upcomingServicesData, setUpcomingServicesData] = useState<UpcomingService[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [selectedCustomerForVehicle, setSelectedCustomerForVehicle] = useState<Customer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [filteredRecentCustomers, setFilteredRecentCustomers] = useState<Customer[]>([]);
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(null);

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerVehicles, setCustomerVehicles] = useState<CustomerVehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  const [isSearchingByVehicle, setIsSearchingByVehicle] = useState(false);
  const [vehicleSearchResults, setVehicleSearchResults] = useState<Customer[]>([]);

  const t = (key: string) => {
    return translations[currentLanguage][key] || key;
  };

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

  const searchByVehicleNumber = async (vehicleNumber: string) => {
    try {
      const response = await getVehicle();
      if (response && Array.isArray(response)) {
        const filteredVehicles = response.filter(vehicle => 
          vehicle.vehicle_number.toLowerCase().includes(vehicleNumber.toLowerCase())
        );
        
        const customerIds = new Set();
        const customerVehiclesMap = new Map();
        
        filteredVehicles.forEach(vehicle => {
          customerIds.add(vehicle.customer);
          if (!customerVehiclesMap.has(vehicle.customer)) {
            customerVehiclesMap.set(vehicle.customer, []);
          }
          customerVehiclesMap.get(vehicle.customer).push(vehicle);
        });
        
        const customersResponse = await getCustomer();
        if (customersResponse && Array.isArray(customersResponse)) {
          const filteredCustomers = customersResponse.filter(customer => 
            customerIds.has(customer.id)
          );
          
          return filteredCustomers.map(customer => ({
            ...customer,
            vehicles: customerVehiclesMap.get(customer.id) || []
          }));
        }
      }
      return [];
    } catch (error) {
      console.log('Error searching by vehicle number:', error);
      return [];
    }
  };

  const fetchCustomerVehicles = async (customerId: number) => {
    try {
      setVehiclesLoading(true);
      const response = await getCustomerVehicles(customerId);
      if (response && Array.isArray(response)) {
        setCustomerVehicles(response);
        setRecentCustomers(prevCustomers => 
          prevCustomers.map(customer => 
            customer.id === customerId 
              ? { ...customer, vehicles: response }
              : customer
          )
        );
      }
    } catch (error) {
      console.log('Error fetching customer vehicles:', error);
      setCustomerVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleNextForCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerVehicles(customer.id);
  };

  const handleBackToCustomerList = () => {
    setSelectedCustomer(null);
    setCustomerVehicles([]);
    setExpandedCustomerId(null);
  };

  const handleVehicleSearch = async (vehicleNumber: string) => {
    try {
      if (vehicleNumber.length < 3) {
        setVehicleSearchResults([]);
        return;
      }
      
      const response = await searchByVehicleNumber(vehicleNumber);
      if (response && Array.isArray(response)) {
        setVehicleSearchResults(response);
      } else {
        setVehicleSearchResults([]);
      }
    } catch (error) {
      console.log('Error searching by vehicle number:', error);
      setVehicleSearchResults([]);
    }
  };

  useEffect(() => {
    if (customerSearchQuery) {
      if (isSearchingByVehicle) {
        handleVehicleSearch(customerSearchQuery);
      } else {
        const filtered = recentCustomers.filter(customer => 
          customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
          customer.phone.includes(customerSearchQuery)
        );
        setFilteredRecentCustomers(filtered);
      }
    } else {
      setFilteredRecentCustomers(recentCustomers);
      setVehicleSearchResults([]);
      setShowAddCustomer(false);
    }
  }, [customerSearchQuery, recentCustomers, isSearchingByVehicle]);

  const getDisplayCustomers = () => {
    if (customerSearchQuery && isSearchingByVehicle) {
      return vehicleSearchResults;
    }
    return filteredRecentCustomers;
  };

  const displayCustomers = getDisplayCustomers();

  const handleCall = useCallback((phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  const handleAddVehicleForCustomer = (customer: Customer) => {
    setSelectedCustomerForVehicle(customer);
    setShowAddVehicleModal(true);
  };

  const handleVehicleAdded = (vehicleData: any) => {
    setShowAddVehicleModal(false);
    setSelectedCustomerForVehicle(null);
    onRefresh();
    if (selectedCustomer) {
      fetchCustomerVehicles(selectedCustomer.id);
    }
  };

  const toggleCustomerExpansion = async (customerId: number) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
    } else {
      setExpandedCustomerId(customerId);
      await fetchCustomerVehicles(customerId);
    }
  };

  const handleCustomerAdded = () => {
    fetchRecentCustomers();
    setShowAddCustomer(false);
    setCustomerSearchQuery('');
  };

  const handleAddCustomerClick = async () => {
    if (isSearchingByVehicle) {
      try {
        await AsyncStorage.setItem('temp_vehicle_number', customerSearchQuery);
      } catch (error) {
        console.log('Error saving vehicle number to AsyncStorage:', error);
      }
    }
    setShowAddCustomer(true);
  };

  const isPhoneNumber = (query: string) => {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phoneRegex.test(query) && query.replace(/\D/g, '').length >= 7;
  };

  const checkSubscriptionStatus = useCallback((profileData: any) => {
    const hasAccess = profileData?.is_trial_active || profileData?.is_subscription_active;
    if (!hasAccess) {
      router.replace('/Screen/Constance/PayNow');
      return false;
    }
    return true;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const response = await Dashboard();
      if (response && response.success) {
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
      console.log(error)
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const fetchMonthlyStats = useCallback(async () => {
    try {
      const response = await dashBoardMonthly();
      if (response) {
        setDashboardData(response);
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedFetchStats'));
    }
  }, []);

  const fetchUpcomingServices = useCallback(async () => {
    try {
      const response = await upcommingServices();
      if (response && Array.isArray(response)) {
        setUpcomingServicesData(response);
      }
    } catch (error) {
      console.log('Error fetching upcoming services:', error);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      await loadLanguagePreference();
      const response = await ExtractToken();
      setRole(response?.role || null);
      if (response?.id) {
        const apiResponse = await getProfile(response.id);
        const hasAccess = checkSubscriptionStatus(apiResponse);
        if (hasAccess) {
          setUserData({
            id: response.id,
            name: apiResponse?.name || 'LINJU Wheel Service',
            phone: apiResponse?.phone || '',
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
      console.log('Error fetching user data:', error);
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
        setTotalCustomers(response.length);
        const limitedCustomers = response.slice(0, 5);
        setRecentCustomers(response);
        setFilteredRecentCustomers(response);
      } else {
        setTotalCustomers(0);
      }
    } catch (error) {
      setTotalCustomers(0);
      setRecentCustomers([]);
      setFilteredRecentCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchUserData(),
        fetchRecentCustomers(),
        fetchDashboardData(),
        fetchMonthlyStats(),
        fetchUpcomingServices()
      ]);
    } catch (error) {
      console.log('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserData, fetchRecentCustomers, fetchDashboardData, fetchMonthlyStats, fetchUpcomingServices]);

  const onRefresh = useCallback(() => {
    refreshAllData();
  }, [refreshAllData]);

  useFocusEffect(
    useCallback(() => {
      refreshAllData();
      return () => {};
    }, [refreshAllData])
  );

  useEffect(() => {
    const initializeData = async () => {
      await refreshAllData();
    };
    initializeData();
  }, []);

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

  const renderSelectedCustomerForm = () => {
    if (!selectedCustomer) return null;

    return (
      <View style={styles.selectedCustomerContainer}>
        <View style={styles.selectedCustomerHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToCustomerList}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
            <Text style={styles.backButtonText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.customerFormCard}>
          <View style={styles.formHeader}>
            <View style={styles.customerFormAvatar}>
              <Text style={styles.avatarText}>
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.formHeaderInfo}>
              <Text style={styles.formCustomerName}>{selectedCustomer.phone}</Text>
              <Text style={styles.formCustomerPhone}>{selectedCustomer.name}</Text>
            </View>
            <TouchableOpacity 
              style={styles.callButton}
              onPress={() => handleCall(selectedCustomer.phone)}
            >
              <MaterialIcons name="phone" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.formDivider} />

          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>{t('customerDetails')}</Text>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>{t('name')}:</Text>
              <Text style={styles.formValue}>{selectedCustomer.name}</Text>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>{t('phone')}:</Text>
              <Text style={styles.formValue}>{selectedCustomer.phone}</Text>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>{t('email')}:</Text>
              <Text style={styles.formValue}>{selectedCustomer.email || 'N/A'}</Text>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>{t('addedDate')}:</Text>
              <Text style={styles.formValue}>{formatDate(selectedCustomer.date_added)}</Text>
            </View>
          </View>

          <View style={styles.formDivider} />

          <View style={styles.formSection}>
            <View style={styles.vehiclesSectionHeader}>
              <Text style={styles.formSectionTitle}>{t('vehicles')} ({customerVehicles.length})</Text>
              <TouchableOpacity
                style={styles.addVehicleIconButton}
                onPress={() => handleAddVehicleForCustomer(selectedCustomer)}
              >
                <MaterialIcons name="add" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {vehiclesLoading ? (
              <View style={styles.vehiclesLoadingContainer}>
                <ActivityIndicator size="small" color="#0052cc" />
                <Text style={styles.loadingText}>{t('loadingVehicles')}</Text>
              </View>
            ) : customerVehicles.length > 0 ? (
              <View style={styles.vehiclesList}>
                {customerVehicles.map((vehicle, index) => (
                  <View key={vehicle.id} style={styles.vehicleFormItem}>
                    <MaterialIcons name="directions-car" size={20} color="#0052cc" />
                    <View style={styles.vehicleFormInfo}>
                      <Text style={styles.vehicleFormName}>
                        {vehicle.vehicle_display_name}
                      </Text>
                      <Text style={styles.vehicleFormDetails}>
                        Model: {vehicle.vehicle_model} • Plate: {vehicle.vehicle_number}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noVehiclesContainer}>
                <MaterialIcons name="directions-car" size={40} color="#b3ccff" />
                <Text style={styles.noVehiclesFormText}>{t('noVehiclesFound')}</Text>
                <TouchableOpacity
                  style={styles.addFirstVehicleButton}
                  onPress={() => handleAddVehicleForCustomer(selectedCustomer)}
                >
                  <MaterialIcons name="add" size={16} color="#ffffff" />
                  <Text style={styles.addFirstVehicleText}>{t('addFirstVehicle')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.addServiceFormButton]}
              onPress={() => {
                router.push({
                  pathname: '/Screen/Owner/AddService',
                  params: { 
                    customerId: selectedCustomer.id.toString(),
                    customerName: selectedCustomer.name,
                    customerPhone: selectedCustomer.phone
                  }
                });
              }}
            >
              <MaterialIcons name="build" size={18} color="#ffffff" />
              <Text style={styles.actionButtonText}>{t('addService')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading || dashboardLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0052cc" />
        <Text style={{ marginTop: 10, color: '#000000' }}>{t('loadingDashboard')}</Text>
      </View>
    );
  }

  if (!userData.is_trial_active && !userData.is_subscription_active) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, {
        opacity: headerOpacity,
        transform: [{ translateY: headerTranslateY }]
      }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerMainInfo}>
            <Text style={styles.shopName}>{userData.service_center_name || userData.name || 'LINJU Wheel Service'}</Text>
          </View>
          
          <View style={styles.subscriptionContainer}>
            {userData.is_trial_active ? (
              <View style={styles.subscriptionStatus}>
                <Text style={styles.trialIndicator}>{t('trialActive')}</Text>
                <Text style={styles.expiryText}>
                  {t('expires')}: {formatExpiryDate(userData.trial_ends_at || '')}
                </Text>
              </View>
            ) : userData.is_subscription_active ? (
              <View style={styles.subscriptionStatus}>
                <Text style={styles.subscriptionIndicator}>{t('subscriptionActive')}</Text>
                <Text style={styles.expiryText}>
                  {t('validUntil')}: {formatExpiryDate(userData.subscription_valid_until || '')}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        
        <TouchableOpacity style={styles.notificationIcon}>
          <MaterialIcons name="notifications-none" size={24} color="#ffffff" />
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
            tintColor="#0052cc"
            colors={['#0052cc']}
          />
        }
      >
          <Banner/>

        {selectedCustomer ? (
          renderSelectedCustomerForm()
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchTypeToggle}>
                <TouchableOpacity 
                  style={[styles.searchTypeButton, !isSearchingByVehicle && styles.activeSearchType]}
                  onPress={() => setIsSearchingByVehicle(false)}
                >
                  <Text style={[styles.searchTypeText, !isSearchingByVehicle && styles.activeSearchTypeText]}>
                    {t('byCustomer')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.searchTypeButton, isSearchingByVehicle && styles.activeSearchType]}
                  onPress={() => setIsSearchingByVehicle(true)}
                >
                  <Text style={[styles.searchTypeText, isSearchingByVehicle && styles.activeSearchTypeText]}>
                    {t('byVehicle')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchInputContainer}>
                <MaterialIcons 
                  name={isSearchingByVehicle ? "directions-car" : "search"} 
                  size={20} 
                  color="#b3ccff" 
                  style={styles.searchIcon} 
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder={isSearchingByVehicle ? t('searchVehiclePlaceholder') : t('searchPlaceholder')}
                  placeholderTextColor="#b3ccff"
                  value={customerSearchQuery}
                  onChangeText={setCustomerSearchQuery}
                />
                {customerSearchQuery.length > 0 ? (
                  <TouchableOpacity onPress={() => setCustomerSearchQuery('')}>
                    <MaterialIcons name="close" size={20} color="#b3ccff" style={styles.clearIcon} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.addCustomerIconButton}
                    onPress={handleAddCustomerClick}
                  >
                    <MaterialIcons name="person-add" size={24} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>

              {customerSearchQuery && displayCustomers.length === 0 && !showAddCustomer && (
                <TouchableOpacity
                  style={styles.inlineAddCustomerButton}
                  onPress={handleAddCustomerClick}
                >
                  <MaterialIcons 
                    name={isSearchingByVehicle ? "directions-car" : "person-add"} 
                    size={18} 
                    color="#ffffff" 
                  />
                  <Text style={styles.inlineAddCustomerButtonText}>
                    {isSearchingByVehicle ? t('addVehicle') : t('addCustomer')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {showAddCustomer && (
              <View style={styles.addCustomerContainer}>
                <CustomerAdd 
                  onCustomerAdded={handleCustomerAdded}
                  prefilledPhone={isPhoneNumber(customerSearchQuery) ? customerSearchQuery : undefined}
                />
              </View>
            )}

            {!customersLoading && !showAddCustomer && displayCustomers.length === 0 && !customerSearchQuery && (
              <View style={styles.addCustomerContainer}>
                <CustomerAdd onCustomerAdded={handleCustomerAdded} />
              </View>
            )}
            
            <View style={styles.customersContainer}>
              {customersLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0052cc" />
                  <Text style={styles.loadingText}>{t('loadingCustomers')}</Text>
                </View>
              ) : displayCustomers.length > 0 ? (
                displayCustomers.map((customer, index) => (
                  <View 
                    key={customer.id} 
                    style={[
                      styles.customerCardWrapper,
                      index === displayCustomers.length - 1 && { marginBottom: 0 }
                    ]}
                  >
                    <TouchableOpacity 
                      style={[
                        styles.customerCard,
                        expandedCustomerId === customer.id && styles.expandedCustomerCard
                      ]}
                      activeOpacity={0.8}
                      onPress={() => toggleCustomerExpansion(customer.id)}
                    >
                      <View style={styles.customerTopRow}>
                        <View style={styles.customerAvatar}>
                          <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.customerInfo}>
                          <Text style={styles.boldPhoneNumber}>{customer.phone}</Text>
                          <Text style={styles.customerName}>{customer.name}</Text>
                          {isSearchingByVehicle && customer.vehicles && customer.vehicles.length > 0 && (
                            <View style={styles.vehicleSearchInfo}>
                              {customer.vehicles.map(vehicle => (
                                <Text key={vehicle.id} style={styles.vehicleNumberText}>
                                  {vehicle.vehicle_number} • {vehicle.vehicle_type_name}
                                </Text>
                              ))}
                            </View>
                          )}
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
                            <MaterialIcons name="phone" size={20} color="#ffffff" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.expandIcon}
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleCustomerExpansion(customer.id);
                            }}
                          >
                            <MaterialIcons 
                              name={expandedCustomerId === customer.id ? "expand-less" : "expand-more"} 
                              size={24} 
                              color="#b3ccff" 
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      {expandedCustomerId === customer.id && (
                        <View style={styles.expandedContent}>
                          <View style={styles.divider} />
                          <View style={styles.vehiclesSection}>
                            <Text style={styles.vehiclesTitle}>{t('vehicles')}</Text>
                            {vehiclesLoading ? (
                              <View style={styles.vehiclesLoadingContainer}>
                                <ActivityIndicator size="small" color="#0052cc" />
                                <Text style={styles.loadingText}>{t('loadingVehicles')}</Text>
                              </View>
                            ) : customer.vehicles && customer.vehicles.length > 0 ? (
                              customer.vehicles.map(vehicle => (
                                <View key={vehicle.id} style={styles.vehicleItem}>
                                  <MaterialIcons name="directions-car" size={16} color="#0052cc" />
                                  <Text style={styles.vehicleText}>
                                    {vehicle.vehicle_display_name} ({vehicle.vehicle_number})
                                  </Text>
                                </View>
                              ))
                            ) : (
                              <Text style={styles.noVehiclesText}>{t('noVehicles')}</Text>
                            )}
                          </View>
                          <View style={styles.customerActionsRow}>
                            <TouchableOpacity
                              style={[styles.addButton, styles.addVehicleButton]}
                              onPress={() => handleAddVehicleForCustomer(customer)}
                            >
                              <MaterialIcons name="directions-car" size={16} color="#ffffff" />
                              <Text style={styles.addButtonText}>{t('addVehicle')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.addButton, styles.nextButton]}
                              onPress={() => handleNextForCustomer(customer)}
                            >
                              <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
                              <Text style={styles.addButtonText}>{t('next')}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ))
              ) : customerSearchQuery && !showAddCustomer ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons 
                    name={isSearchingByVehicle ? "directions-car" : "search-off"} 
                    size={40} 
                    color="#b3ccff" 
                  />
                  <Text style={styles.emptyText}>
                    {isSearchingByVehicle ? t('noVehicleResults') : t('noResults')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

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
                <MaterialIcons name="close" size={24} color="#b3ccff" />
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
    backgroundColor: '#f5faff',
  },
  scrollContainer: {
    paddingTop: 120,
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
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#0052cc',
    borderBottomWidth: 1,
    borderBottomColor: '#003087',
    minHeight: 100,
  },
  headerContent: {
    flex: 1,
  },
  headerMainInfo: {
    marginBottom: 8,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  subscriptionContainer: {
    marginTop: 4,
  },
  subscriptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  trialIndicator: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    backgroundColor: '#003087',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  subscriptionIndicator: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    backgroundColor: '#003087',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  expiryText: {
    fontSize: 11,
    color: '#b3ccff',
  },
  notificationIcon: {
    padding: 6,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4d4f',
  },
  section: {
    marginTop: 24,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchTypeToggle: {
    flexDirection: 'row',
    backgroundColor: '#e6f0fa',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeSearchType: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchTypeText: {
    fontSize: 14,
    color: '#0052cc',
    fontWeight: '500',
  },
  activeSearchTypeText: {
    color: '#003087',
    fontWeight: '600',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#0052cc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  clearIcon: {
    padding: 8,
    backgroundColor: '#e6f0fa',
    borderRadius: 16,
  },
  addCustomerIconButton: {
    padding: 8,
    backgroundColor: '#0052cc',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  inlineAddCustomerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0052cc',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  inlineAddCustomerButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 4,
  },
  addCustomerContainer: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  customerCard: {
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    padding: 16,
  },
  expandedCustomerCard: {
    minHeight: 200,
  },
  customerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0052cc',
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
    marginRight: 16,
  },
  customerName: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '400',
    marginBottom: 2,
  },
  boldPhoneNumber: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '700',
    marginBottom: 4,
  },
  vehicleSearchInfo: {
    marginBottom: 4,
  },
  vehicleNumberText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    backgroundColor: '#003087',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  vehicleCount: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 2,
  },
  addedTime: {
    fontSize: 12,
    color: '#000000',
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#003087',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIcon: {
    padding: 4,
  },
  expandedContent: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#b3ccff',
    marginBottom: 12,
  },
  vehiclesSection: {
    marginBottom: 16,
  },
  vehiclesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  vehicleText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  noVehiclesText: {
    fontSize: 14,
    color: '#000000',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  customerActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  addVehicleButton: {
    backgroundColor: '#0052cc',
  },
  nextButton: {
    backgroundColor: '#003087',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  vehiclesLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 10,
    color: '#000000',
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#000000',
    fontSize: 16,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 82, 204, 0.5)',
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
    borderBottomColor: '#b3ccff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  selectedCustomerContainer: {
    flex: 1,
  },
  selectedCustomerHeader: {
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  customerFormCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customerFormAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0052cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  formHeaderInfo: {
    flex: 1,
  },
  formCustomerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  formCustomerPhone: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#003087',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formDivider: {
    height: 1,
    backgroundColor: '#b3ccff',
    marginVertical: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    width: 80,
    marginRight: 16,
  },
  formValue: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  vehiclesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addVehicleIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#003087',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehiclesList: {
    maxHeight: 200,
  },
  vehicleFormItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0052cc',
  },
  vehicleFormInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleFormName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  vehicleFormDetails: {
    fontSize: 14,
    color: '#000000',
  },
  noVehiclesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  noVehiclesFormText: {
    fontSize: 16,
    color: '#000000',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  addFirstVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0052cc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstVehicleText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  formActions: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#b3ccff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
  },
  addServiceFormButton: {
    backgroundColor: '#003087',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 6,
  },
});