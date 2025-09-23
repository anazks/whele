
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getServices } from '../api/Services/management';

// Define Service interface for type safety
interface Service {
  id: string;
  vehicle_number: string;
  customer_name: string;
  customer_phone?: string;
  vehicle_model?: string;
  service_type_display: string;
  service_date?: string;
  created_at: string;
  price?: string;
  date_of_entry?: string;
  performed_by_name?: string;
  service_center_name?: string;
  description?: string;
  next_service_due_date?: string;
}

// Utility function to generate a random future date
const generateRandomFutureDate = (minMonths = 3, maxMonths = 12) => {
  const today = new Date();
  const randomMonths = Math.floor(Math.random() * (maxMonths - minMonths + 1)) + minMonths;
  const futureDate = new Date(today);
  futureDate.setMonth(today.getMonth() + randomMonths);
  return futureDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
};

// Function to generate next service date based on service date if available
const generateNextServiceDate = (serviceDate: string | null = null) => {
  if (serviceDate) {
    try {
      const service = new Date(serviceDate);
      const randomMonths = Math.floor(Math.random() * 10) + 3; // 3-12 months from service date
      service.setMonth(service.getMonth() + randomMonths);
      return service.toISOString().split('T')[0];
    } catch (error) {
      console.log('Error parsing service date, using random future date:', error);
    }
  }
  return generateRandomFutureDate();
};

// Utility function to handle service type display
const getServiceTypeDisplay = (serviceType: string | undefined) => {
  return serviceType?.toLowerCase() === 'other' ? 'Alignment and Balancing' : serviceType || 'Service';
};

export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchServices = async (retries = 3) => {
    try {
      setLoading(true);
      setRefreshing(false);
      const response = await getServices();
      console.log('Fetched services:', response);

      // Handle different response structures
      let servicesData: Service[] = [];
      if (Array.isArray(response)) {
        servicesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        servicesData = response.data;
      } else if (response && Array.isArray(response.results)) {
        servicesData = response.results;
      } else if (response && response.services && Array.isArray(response.services)) {
        servicesData = response.services;
      } else {
        throw new Error('Invalid response structure');
      }

      // Process services data and always generate next_service_due_date
      servicesData = servicesData.map(service => ({
        ...service,
        next_service_due_date: generateNextServiceDate(service.service_date),
      }));

      setServices(servicesData);
    } catch (error: any) {
      if (retries > 0) {
        console.log(`Retrying fetchServices... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchServices(retries - 1);
      }
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to fetch services: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch services on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchServices();
      return () => {};
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const openModal = (service: Service) => {
    console.log('Opening modal with service:', service);
    const processedService = {
      ...service,
      next_service_due_date: service.next_service_due_date || generateNextServiceDate(service.service_date),
    };
    setSelectedService(processedService);
    setIsModalVisible(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  // Filter and sort services
  const filteredServices = services.filter(service => {
    if (!service) return false;

    const vehicleNumber = service.vehicle_number || '';
    const customerName = service.customer_name || '';
    const searchTerm = searchQuery.toLowerCase();

    const matchesSearch =
      vehicleNumber.toLowerCase().includes(searchTerm) ||
      customerName.toLowerCase().includes(searchTerm);
    return matchesSearch;
  });

  const sortedServices = [...filteredServices].sort(
    (a, b) => new Date(b.service_date || b.created_at).getTime() - new Date(a.service_date || a.created_at).getTime(),
  );

  const handleShare = async () => {
    try {
      if (!selectedService) return;

      const nextServiceDate = selectedService.next_service_due_date
        ? new Date(selectedService.next_service_due_date).toLocaleDateString()
        : new Date(generateNextServiceDate(selectedService.service_date)).toLocaleDateString();

      const serviceDate = selectedService.service_date
        ? new Date(selectedService.service_date).toLocaleDateString()
        : 'N/A';

      const message = `🚗 Service Details:
━━━━━━━━━━━━━━━━━━
🏷️ Vehicle: ${selectedService.vehicle_number || 'N/A'}
👤 Customer: ${selectedService.customer_name || 'N/A'}
🔧 Service: ${getServiceTypeDisplay(selectedService.service_type_display)}
📅 Date: ${serviceDate}
💰 Amount: ₹${selectedService.price || '0'}
✅ Status: Completed
📆 Next Service Due: ${nextServiceDate}
━━━━━━━━━━━━━━━━━━
Thank you for choosing our service! 🙏`;

      const phoneNumber = selectedService.customer_phone;
      if (!phoneNumber) {
        Alert.alert('Error', 'Customer phone number not available');
        return;
      }

      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}&phone=+91${phoneNumber}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);

      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          'WhatsApp Not Installed',
          'Would you like to share via another method?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Share via SMS',
              onPress: () => {
                const smsUrl = `sms:+91${phoneNumber}?body=${encodeURIComponent(message)}`;
                Linking.openURL(smsUrl).catch(() => {
                  Alert.alert('Error', 'Unable to open SMS app');
                });
              },
            },
            {
              text: 'Copy to Clipboard',
              onPress: () => {
                Alert.alert('Service Details', message, [{ text: 'OK', style: 'default' }], {
                  cancelable: true,
                });
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error sharing service details:', error);
      Alert.alert('Error', 'Failed to share service details');
    }
  };

  const renderServiceItem = ({ item }: { item: Service }) => {
    if (!item) return null;

    return (
      <TouchableOpacity style={styles.serviceCard} onPress={() => openModal(item)} activeOpacity={0.8}>
        <View style={styles.serviceHeader}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.customer_name || 'Unknown Customer'}
            </Text>
            <Text style={styles.vehicleNumber} numberOfLines={1}>
              {item.vehicle_number || 'N/A'}
            </Text>
            {item.vehicle_model && (
              <View style={styles.vehicleTypeBadge}>
                <Text style={styles.vehicleTypeText} numberOfLines={1}>
                  {item.vehicle_model}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.completedStatus}>Completed</Text>
        </View>

        <Text style={styles.serviceType} numberOfLines={2}>
          {getServiceTypeDisplay(item.service_type_display)}
        </Text>

        <View style={styles.serviceFooter}>
          <Text style={styles.dateText}>
            {item.service_date ? new Date(item.service_date).toLocaleDateString() : 'N/A'}
          </Text>
          <Text style={styles.amountText}>₹{item.price || '0'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4a7cff" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by vehicle or customer"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Services List */}
      <FlatList
        data={sortedServices}
        renderItem={renderServiceItem}
        keyExtractor={item => (item.id ? item.id.toString() : Math.random().toString())}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4a7cff']}
            tintColor={'#4a7cff'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="history" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No services found matching your search' : 'No services found'}
            </Text>
            {searchQuery && (
              <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
      />

      {/* Service Details Modal */}
      <Modal visible={isModalVisible} transparent={true} onRequestClose={closeModal} animationType="none">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalContent}>
                {selectedService ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Service Details</Text>
                      <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                        <MaterialIcons name="close" size={22} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <DetailRow label="Vehicle Number:" value={selectedService.vehicle_number} />
                    <DetailRow label="Customer Name:" value={selectedService.customer_name} />
                    <DetailRow label="Phone:" value={selectedService.customer_phone} />
                    <DetailRow label="Vehicle Model:" value={selectedService.vehicle_model} />
                    <DetailRow
                      label="Service Type:"
                      value={getServiceTypeDisplay(selectedService.service_type_display)}
                    />
                    <DetailRow
                      label="Service Date:"
                      value={
                        selectedService.service_date
                          ? new Date(selectedService.service_date).toLocaleDateString()
                          : 'N/A'
                      }
                    />
                    <DetailRow
                      label="Date of Entry:"
                      value={
                        selectedService.date_of_entry
                          ? new Date(selectedService.date_of_entry).toLocaleDateString()
                          : 'N/A'
                      }
                    />
                    <DetailRow label="Technician:" value={selectedService.performed_by_name} />
                    <DetailRow label="Service Center:" value={selectedService.service_center_name} />
                    <DetailRow label="Description:" value={selectedService.description} />
                    <DetailRow
                      label="Next Service Due:"
                      value={
                        selectedService.next_service_due_date
                          ? new Date(selectedService.next_service_due_date).toLocaleDateString()
                          : new Date(
                              generateNextServiceDate(selectedService.service_date),
                            ).toLocaleDateString()
                      }
                    />
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount:</Text>
                      <Text style={[styles.detailValue, styles.amountValue]}>
                        ₹{selectedService.price || '0'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text style={styles.completedStatus}>Completed</Text>
                    </View>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
                      <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                      <Text style={styles.shareButtonText}>Share via WhatsApp</Text>
                    </TouchableOpacity>
                  </ScrollView>
                ) : (
                  <Text style={styles.errorText}>No service selected</Text>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string | undefined }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 15,
    color: '#333',
  },
  listContent: {
    paddingBottom: 30,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vehicleInfo: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  vehicleTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#dbeafe',
  },
  vehicleTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1e40af',
  },
  completedStatus: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  serviceType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2e7d32',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#4a7cff',
    borderRadius: 20,
  },
  clearSearchText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 2,
  },
  detailLabel: {
    width: '40%',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  amountValue: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366', // WhatsApp green
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});