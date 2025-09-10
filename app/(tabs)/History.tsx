import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
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
  View
} from 'react-native';
import { getServices } from '../api/Services/management';

export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchServices();
  }, []);

  // Add this useEffect to handle screen focus
  useEffect(() => {
    if (isFocused) {
      fetchServices();
    }
  }, [isFocused]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getServices();
      
      // Handle different response structures
      let servicesData = [];
      if (Array.isArray(response)) {
        servicesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        servicesData = response.data;
      } else if (response && Array.isArray(response.results)) {
        servicesData = response.results;
      } else if (response && response.services && Array.isArray(response.services)) {
        servicesData = response.services;
      }
      
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to fetch services: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const openModal = (service) => {
    setSelectedService(service);
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
    
    const matchesSearch = vehicleNumber.toLowerCase().includes(searchTerm) || 
                         customerName.toLowerCase().includes(searchTerm);
    return matchesSearch;
  });

  const sortedServices = [...filteredServices].sort((a, b) => 
    new Date(b.service_date || b.created_at) - new Date(a.service_date || a.created_at)
  );

  const handleShare = async () => {
    try {
      if (!selectedService) return;
      
      const message = `Service Details:
      Vehicle: ${selectedService.vehicle_number}
      Customer: ${selectedService.customer_name}
      Service: ${selectedService.service_type_display}
      Date: ${selectedService.service_date}
      Amount: ₹${selectedService.price}
      Status: Completed`;
      
      // Correct WhatsApp URL format
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}&phone=+91${selectedService.customer_phone}`;
      
      // Try to open WhatsApp
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // If WhatsApp is not installed, show an alert
        Alert.alert(
          'WhatsApp Not Installed',
          'Would you like to share via another method?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Share via SMS',
              onPress: () => {
                const smsUrl = `sms:+91${selectedService.customer_phone}?body=${encodeURIComponent(message)}`;
                Linking.openURL(smsUrl);
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share service details');
    }
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => openModal(item)}
      activeOpacity={0.8}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.customerName}>{item.customer_name}</Text>
          <Text style={styles.vehicleNumber}>{item.vehicle_number}</Text>
          <View style={styles.vehicleTypeBadge}>
            <Text style={styles.vehicleTypeText}>
              {item.vehicle_model}
            </Text>
          </View>
        </View>
        <Text style={styles.completedStatus}>
          Completed
        </Text>
      </View>
      
      <Text style={styles.serviceType}>{item.service_type_display}</Text>
      
      <View style={styles.serviceFooter}>
        <Text style={styles.dateText}>
          {item.service_date ? new Date(item.service_date).toLocaleDateString() : 'N/A'}
        </Text>
        <Text style={styles.amountText}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

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
        />
      </View>

      {/* Services List */}
      <FlatList
        data={sortedServices}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id.toString()}
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
            <MaterialIcons name="history" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No services found</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Service Details Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View 
            style={[
              styles.modalContainer, 
              { 
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1]
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalContent}>
                {selectedService && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Service Details</Text>
                      <TouchableOpacity onPress={closeModal}>
                        <MaterialIcons name="close" size={22} color="#666" />
                      </TouchableOpacity>
                    </View>
                    
                    <DetailRow label="Vehicle Number:" value={selectedService.vehicle_number} />
                    <DetailRow label="Customer Name:" value={selectedService.customer_name} />
                    <DetailRow label="Phone:" value={selectedService.customer_phone} />
                    <DetailRow label="Vehicle Model:" value={selectedService.vehicle_model} />
                    <DetailRow label="Service Type:" value={selectedService.service_type_display} />
                    <DetailRow label="Service Date:" value={selectedService.service_date ? new Date(selectedService.service_date).toLocaleDateString() : 'N/A'} />
                    <DetailRow label="Date of Entry:" value={selectedService.date_of_entry ? new Date(selectedService.date_of_entry).toLocaleDateString() : 'N/A'} />
                    <DetailRow label="Technician:" value={selectedService.performed_by_name} />
                    <DetailRow label="Service Center:" value={selectedService.service_center_name} />
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount:</Text>
                      <Text style={[styles.detailValue, styles.amountValue]}>₹{selectedService.price}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text style={styles.completedStatus}>
                        Completed
                      </Text>
                    </View>
                    
                    <DetailRow label="Description:" value={selectedService.description} />
                    <DetailRow label="Next Service Due:" value={selectedService.next_service_due_date ? new Date(selectedService.next_service_due_date).toLocaleDateString() : 'N/A'} />
                    
                    <TouchableOpacity 
                      style={styles.shareButton}
                      onPress={handleShare}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                      <Text style={styles.shareButtonText}>Share via WhatsApp</Text>
                    </TouchableOpacity>
                  </ScrollView>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const DetailRow = ({ label, value }) => (
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
  listContent: {
    paddingBottom: 30,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vehicleInfo: {
    flex: 1,
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
    color: '#333',
  },
  completedStatus: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '500',
  },
  serviceType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#999',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
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
    borderRadius: 12,
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
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
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
  },
  amountValue: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366', // WhatsApp green
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
});