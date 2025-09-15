import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { addService, getCustomerVehicles } from '../../api/Services/management';

// Service type choices (restricted to Wheel Alignment and Balancing)
const SERVICE_TYPE_CHOICES = [
  { value: 'alignment', label: 'Wheel Alignment', icon: 'build' },
  { value: 'balancing', label: 'Balancing', icon: 'tune' },
];

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: StatusBar.currentHeight + 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  customerCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 14,
    color: '#555',
  },
  contentContainer: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredStar: {
    color: '#ff0000',
    marginLeft: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  inputFocused: {
    borderBottomColor: '#007bff',
  },
  inputError: {
    borderBottomColor: '#ff0000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
  selector: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorFocused: {
    borderBottomColor: '#007bff',
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedIcon: {
    marginRight: 8,
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
  },
  chevronIcon: {
    padding: 4,
  },
  vehicleSection: {
    maxHeight: 180,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  selectedVehicleItem: {
    borderColor: '#007bff',
    backgroundColor: '#e6f3ff',
  },
  vehicleIcon: {
    marginRight: 12,
  },
  selectedVehicleIcon: {
    backgroundColor: '#e6f3ff',
  },
  vehicleContent: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  checkIcon: {
    backgroundColor: '#28a745',
    padding: 4,
    borderRadius: 12,
  },
  noVehiclesContainer: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  noVehiclesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  nonEditableField: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  nonEditableText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  nonEditableLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  changeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  calculationDisplay: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  calculationText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  intervalSectionCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  intervalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b45309',
    marginBottom: 4,
  },
  intervalText: {
    fontSize: 12,
    color: '#92400e',
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalList: {
    paddingBottom: 16,
  },
  serviceTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  serviceTypeIcon: {
    marginRight: 12,
  },
  serviceTypeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
};

export default function AddService() {
  const { customerId, customerName, customerPhone, customerEmail } = useLocalSearchParams();
  
  const [showServiceTypeSelection, setShowServiceTypeSelection] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [serviceInterval, setServiceInterval] = useState('5000'); // This stores the interval (e.g., 5000 km)
  const [showNextKilometerInput, setShowNextKilometerInput] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const selectedCustomer = {
    id: customerId,
    name: customerName,
    phone: customerPhone,
    email: customerEmail || ''
  };

  const translations = {
    english: {
      addService: "Add Service",
      serviceFor: "Service for",
      vehicleSection: "Select Vehicle",
      serviceDetails: "Service Details", 
      pricing: "Pricing & Tracking",
      serviceType: "Service Type",
      selectServiceType: "Select service type",
      description: "Description",
      enterServiceDescription: "Describe the service performed...",
      kilometers: "Current Kilometers",
      enterKilometers: "Enter current odometer reading",
      nextKilometer: "Next Service Kilometers",
      enterNextKilometer: "Enter next service kilometers",
      price: "Service Price",
      enterServicePrice: "Enter service price (optional)",
      addServiceButton: "Add Service",
      adding: "Adding Service...",
      serviceAdded: "Service added successfully!",
      failedAddService: "Failed to add service. Please try again.",
      vehicleRequired: "Please select a vehicle",
      serviceTypeRequired: "Please select service type",
      nextKilometerRequired: "Next kilometer is required",
      validPrice: "Enter a valid price",
      validKilometers: "Enter valid kilometers",
      validNextKilometer: "Enter valid next kilometers",
      selectServiceTypeTitle: "Choose Service Type",
      close: "Close",
      noVehicles: "No vehicles found",
      noVehiclesMsg: "Add a vehicle first to continue",
      vehicle: "Vehicle",
      fromSettings: "Calculated from Current + Service Interval",
      changeValue: "Change",
      alignment: "Wheel Alignment",
      balancing: "Balancing",
      serviceIntervalTitle: "Service Interval Setting",
      serviceIntervalDesc: "This is added to current kilometers to calculate next service",
    },
    hindi: {
      addService: "सेवा जोड़ें",
      serviceFor: "के लिए सेवा",
      vehicleSection: "वाहन चुनें",
      serviceDetails: "सेवा विवरण",
      pricing: "मूल्य और ट्रैकिंग",
      serviceType: "सेवा प्रकार",
      selectServiceType: "सेवा प्रकार चुनें",
      description: "विवरण",
      enterServiceDescription: "की गई सेवा का विवरण दें...",
      kilometers: "वर्तमान किलोमीटर",
      enterKilometers: "वर्तमान ओडोमीटर रीडिंग दर्ज करें",
      nextKilometer: "अगली सेवा किलोमीटर",
      enterNextKilometer: "अगली सेवा किलोमीटर दर्ज करें",
      price: "सेवा मूल्य",
      enterServicePrice: "सेवा मूल्य दर्ज करें (वैकल्पिक)",
      addServiceButton: "सेवा जोड़ें",
      adding: "सेवा जोड़ी जा रही है...",
      serviceAdded: "सेवा सफलतापूर्वक जोड़ी गई!",
      failedAddService: "सेवा जोड़ने में विफल। कृपया पुनः प्रयास करें।",
      vehicleRequired: "कृपया एक वाहन चुनें",
      serviceTypeRequired: "कृपया सेवा प्रकार चुनें",
      nextKilometerRequired: "अगला किलोमीटर आवश्यक है",
      validPrice: "एक वैध मूल्य दर्ज करें",
      validKilometers: "वैध किलोमीटर दर्ज करें",
      validNextKilometer: "वैध अगला किलोमीटर दर्ज करें",
      selectServiceTypeTitle: "सेवा प्रकार चुनें",
      close: "बंद करें",
      noVehicles: "कोई वाहन नहीं मिला",
      noVehiclesMsg: "जारी रखने के लिए पहले एक वाहन जोड़ें",
      vehicle: "वाहन",
      fromSettings: "वर्तमान + सेवा अंतराल से गणना की गई",
      changeValue: "बदलें",
      alignment: "व्हील अलाइनमेंट",
      balancing: "बैलेंसिंग",
      serviceIntervalTitle: "सेवा अंतराल सेटिंग",
      serviceIntervalDesc: "यह अगली सेवा की गणना के लिए वर्तमान किलोमीटर में जोड़ा जाता है",
    }
  };

  const t = (key) => translations[currentLanguage][key] || key;

  const [serviceForm, setServiceForm] = useState({
    customer: customerId,
    vehicle: '',
    service_type: '',
    description: '',
    price: '',
    kilometers: '',
    next_service_due_date: '',
    next_kilometer_input: ''
  });

  const [errors, setErrors] = useState({});
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) setCurrentLanguage(savedLanguage);
    } catch (error) {
      console.error('Error loading language preference:', error);
      Alert.alert('Error', 'Failed to load language preference.');
    }
  };

  const loadServiceInterval = async () => {
    try {
      // Load the service interval (not the absolute next kilometer)
      const savedServiceInterval = await AsyncStorage.getItem('service_interval');
      if (savedServiceInterval) {
        setServiceInterval(savedServiceInterval);
      } else {
        // Set default service interval to 5000 km
        setServiceInterval('5000');
        await AsyncStorage.setItem('service_interval', '5000');
      }
    } catch (error) {
      console.error('Error loading service interval:', error);
      Alert.alert('Error', 'Failed to load service interval data.');
      setServiceInterval('5000'); // Fallback to default
    }
  };

  const saveServiceInterval = async (value) => {
    try {
      await AsyncStorage.setItem('service_interval', value);
      setServiceInterval(value);
      
      // Recalculate next service km if current km is available
      if (serviceForm.kilometers && !isNaN(serviceForm.kilometers)) {
        const currentKm = parseFloat(serviceForm.kilometers);
        const intervalKm = parseFloat(value);
        const calculatedNextKm = currentKm + intervalKm;
        setServiceForm(prev => ({
          ...prev,
          next_kilometer_input: calculatedNextKm.toString()
        }));
      }
    } catch (error) {
      console.error('Error saving service interval:', error);
      Alert.alert('Error', 'Failed to save service interval data.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await loadLanguagePreference();
        await loadServiceInterval();
        const vehiclesResponse = await getCustomerVehicles(customerId);
        setCustomerVehicles(vehiclesResponse || []);
        if (vehiclesResponse?.length === 1) selectVehicle(vehiclesResponse[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load vehicles or preferences.');
        setCustomerVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerId]);

  const handleServiceChange = (name, value) => {
    setServiceForm(prev => {
      const updatedForm = { ...prev, [name]: value };
      
      if (name === 'kilometers' && value && !isNaN(value) && parseFloat(value) >= 0) {
        const currentKm = parseFloat(value);
        const storedInterval = parseFloat(serviceInterval) || 5000; // Default to 5000 if no stored value
        const calculatedNextKm = currentKm + storedInterval;
        
        updatedForm.next_kilometer_input = calculatedNextKm.toString();
      } else if (name === 'kilometers' && (!value || isNaN(value))) {
        updatedForm.next_kilometer_input = '';
      }
      
      return updatedForm;
    });
    
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleNextKilometerChange = (value) => {
    setServiceForm({ ...serviceForm, next_kilometer_input: value });
    if (errors.next_kilometer) setErrors({ ...errors, next_kilometer: '' });
  };

  // Add this new function to calculate and display the next service kilometers
  const calculateNextServiceKm = () => {
    const currentKm = parseFloat(serviceForm.kilometers) || 0;
    const intervalKm = parseFloat(serviceInterval) || 5000;
    return currentKm + intervalKm;
  };

  const validateServiceForm = () => {
    let valid = true;
    const newErrors = {};
    
    if (!serviceForm.vehicle) {
      newErrors.vehicle = t('vehicleRequired');
      valid = false;
    }
    if (!serviceForm.service_type) {
      newErrors.service_type = t('serviceTypeRequired');
      valid = false;
    }
    
    const nextKilometerValue = serviceForm.next_kilometer_input;
    if (!nextKilometerValue || nextKilometerValue.trim() === '') {
      newErrors.next_kilometer = t('nextKilometerRequired');
      valid = false;
    } else if (isNaN(nextKilometerValue) || parseFloat(nextKilometerValue) < 0) {
      newErrors.next_kilometer = t('validNextKilometer');
      valid = false;
    }
    
    if (serviceForm.price && (isNaN(serviceForm.price) || parseFloat(serviceForm.price) < 0)) {
      newErrors.price = t('validPrice');
      valid = false;
    }
    if (serviceForm.kilometers && (isNaN(serviceForm.kilometers) || parseFloat(serviceForm.kilometers) < 0)) {
      newErrors.kilometers = t('validKilometers');
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleServiceSubmit = async () => {
    if (validateServiceForm()) {
      setLoading(true);
      try {
        const nextKilometerValue = serviceForm.next_kilometer_input;
        
        const priceValue = serviceForm.price ? parseFloat(serviceForm.price) : 0;
        const serviceData = {
          customer: serviceForm.customer,
          vehicle: serviceForm.vehicle,
          service_type: serviceForm.service_type,
          description: serviceForm.description,
          price: priceValue,
          kilometers: serviceForm.kilometers ? parseFloat(serviceForm.kilometers) : null,
          next_service_due_date: serviceForm.next_service_due_date || null,
          next_kilometer: parseFloat(nextKilometerValue)
        };
        
        await addService(serviceData);
        
        Alert.alert(
          'Success!',
          t('serviceAdded'),
          [
            {
              text: 'OK',
              onPress: () => {
                setServiceForm({
                  customer: customerId,
                  vehicle: '',
                  service_type: '',
                  description: '',
                  price: '',
                  kilometers: '',
                  next_service_due_date: '',
                  next_kilometer_input: ''
                });
                setSelectedVehicle(null);
                setShowNextKilometerInput(false);
                router.push('/(tabs)/History');
              }
            }
          ]
        );
      } catch (error) {
        console.error('Error submitting service:', error);
        Alert.alert('Error', t('failedAddService'));
      } finally {
        setLoading(false);
      }
    }
  };

  const selectServiceType = (serviceType) => {
    setServiceForm({ ...serviceForm, service_type: serviceType.value });
    setShowServiceTypeSelection(false);
  };

  const selectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setServiceForm({ ...serviceForm, vehicle: vehicle.id });
  };

  const getTranslatedServiceType = (value) => {
    const serviceType = SERVICE_TYPE_CHOICES.find(st => st.value === value);
    return serviceType ? t(serviceType.value) : value;
  };

  const getServiceTypeIcon = (value) => {
    const serviceType = SERVICE_TYPE_CHOICES.find(st => st.value === value);
    return serviceType ? serviceType.icon : 'build';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('addService')}</Text>
        </View>
        
        <View style={styles.customerCard}>
          <Text style={styles.customerName}>
            {t('serviceFor')}: {selectedCustomer.name}
          </Text>
          <Text style={styles.customerDetail}>
            📱 {selectedCustomer.phone}
          </Text>
          {selectedCustomer.email ? (
            <Text style={styles.customerDetail}>
              ✉️ {selectedCustomer.email}
            </Text>
          ) : null}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Vehicle Selection Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitle}>
              <MaterialIcons name="directions-car" size={20} color="#007bff" style={styles.sectionIcon} />
              <Text>{t('vehicleSection')}</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <MaterialIcons name="hourglass-empty" size={24} color="#888" />
                <Text style={styles.loadingText}>Loading vehicles...</Text>
              </View>
            ) : customerVehicles.length > 0 ? (
              <ScrollView style={styles.vehicleSection} nestedScrollEnabled={true}>
                {customerVehicles.map(vehicle => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleItem,
                      selectedVehicle?.id === vehicle.id && styles.selectedVehicleItem
                    ]}
                    onPress={() => selectVehicle(vehicle)}
                  >
                    <View style={[
                      styles.vehicleIcon,
                      selectedVehicle?.id === vehicle.id && styles.selectedVehicleIcon
                    ]}>
                      <MaterialIcons 
                        name="directions-car" 
                        size={20} 
                        color={selectedVehicle?.id === vehicle.id ? "#007bff" : "#666"} 
                      />
                    </View>
                    <View style={styles.vehicleContent}>
                      <Text style={styles.vehicleTitle}>
                        {vehicle.vehicle_number}
                      </Text>
                      <Text style={styles.vehicleSubtitle}>
                        {vehicle.brand_name} {vehicle.vehicle_model}
                      </Text>
                    </View>
                    {selectedVehicle?.id === vehicle.id && (
                      <View style={styles.checkIcon}>
                        <MaterialIcons name="check" size={16} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noVehiclesContainer}>
                <MaterialIcons name="no-crash" size={32} color="#888" />
                <Text style={styles.noVehiclesText}>{t('noVehicles')}</Text>
                <Text style={[styles.noVehiclesText, { fontSize: 12, marginTop: 4 }]}>
                  {t('noVehiclesMsg')}
                </Text>
              </View>
            )}
            {errors.vehicle ? <Text style={styles.errorText}>{errors.vehicle}</Text> : null}
          </View>

          {/* Service Details Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitle}>
              <MaterialIcons name="build" size={20} color="#28a745" style={styles.sectionIcon} />
              <Text>{t('serviceDetails')}</Text>
            </View>

            {/* Service Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('serviceType')}
                <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.selector,
                  showServiceTypeSelection && styles.selectorFocused,
                  errors.service_type && styles.inputError
                ]}
                onPress={() => setShowServiceTypeSelection(true)}
              >
                {serviceForm.service_type ? (
                  <View style={styles.selectedContent}>
                    <MaterialIcons 
                      name={getServiceTypeIcon(serviceForm.service_type)} 
                      size={20} 
                      color="#007bff" 
                      style={styles.selectedIcon}
                    />
                    <Text style={styles.selectedText}>
                      {getTranslatedServiceType(serviceForm.service_type)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>{t('selectServiceType')}</Text>
                )}
                <View style={styles.chevronIcon}>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </View>
              </TouchableOpacity>
              {errors.service_type ? <Text style={styles.errorText}>{errors.service_type}</Text> : null}
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('description')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    focusedField === 'description' && styles.inputFocused
                  ]}
                  placeholder={t('enterServiceDescription')}
                  placeholderTextColor="#888"
                  value={serviceForm.description}
                  onChangeText={(text) => handleServiceChange('description', text)}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>

          {/* Pricing & Tracking Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitle}>
              <MaterialIcons name="track-changes" size={20} color="#f59e0b" style={styles.sectionIcon} />
              <Text>{t('pricing')}</Text>
            </View>

            {/* Current Kilometers */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('kilometers')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'kilometers' && styles.inputFocused,
                    errors.kilometers && styles.inputError
                  ]}
                  placeholder={t('enterKilometers')}
                  placeholderTextColor="#888"
                  keyboardType="decimal-pad"
                  value={serviceForm.kilometers}
                  onChangeText={(text) => handleServiceChange('kilometers', text)}
                  onFocus={() => setFocusedField('kilometers')}
                  onBlur={() => setFocusedField('kilometers')}
                />
              </View>
              {errors.kilometers ? <Text style={styles.errorText}>{errors.kilometers}</Text> : null}
            </View>

            {/* Next Service Kilometers */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('nextKilometer')}
                <Text style={styles.requiredStar}>*</Text>
              </Text>              
              <View style={styles.inputContainer}>
                <View style={styles.nonEditableField}>
                  <Text style={styles.nonEditableText}>
                    {serviceForm.next_kilometer_input ? 
                      `${serviceForm.next_kilometer_input} km` : 
                      t('enterNextKilometer')
                    }
                  </Text>
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={() => setShowNextKilometerInput(true)}
                  >
                    <Text style={styles.changeButtonText}>{t('changeValue')}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.nonEditableLabel}>
                  {serviceForm.kilometers && serviceInterval ? 
                    t('fromSettings') : 
                    'Enter current kilometers to calculate'
                  }
                </Text>
              </View>
              
              {showNextKilometerInput && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'nextKilometer' && styles.inputFocused,
                      errors.next_kilometer && styles.inputError
                    ]}
                    placeholder={t('enterNextKilometer')}
                    placeholderTextColor="#888"
                    keyboardType="decimal-pad"
                    value={serviceForm.next_kilometer_input}
                    onChangeText={handleNextKilometerChange}
                    onFocus={() => setFocusedField('nextKilometer')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              )}
              {errors.next_kilometer ? <Text style={styles.errorText}>{errors.next_kilometer}</Text> : null}
            </View>

            {/* Price */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('price')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'price' && styles.inputFocused,
                    errors.price && styles.inputError
                  ]}
                  placeholder={t('enterServicePrice')}
                  placeholderTextColor="#888"
                  keyboardType="decimal-pad"
                  value={serviceForm.price}
                  onChangeText={(text) => handleServiceChange('price', text)}
                  onFocus={() => setFocusedField('price')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleServiceSubmit}
            disabled={loading}
          >
            <MaterialIcons 
              name={loading ? "hourglass-empty" : "add-task"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.submitButtonText}>
              {loading ? t('adding') : t('addServiceButton')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Service Type Selection Modal */}
      <Modal
        visible={showServiceTypeSelection}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowServiceTypeSelection(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectServiceTypeTitle')}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowServiceTypeSelection(false)}
              >
                <MaterialIcons name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {SERVICE_TYPE_CHOICES.map((serviceType) => (
                <TouchableOpacity
                  key={serviceType.value}
                  style={styles.serviceTypeItem}
                  onPress={() => selectServiceType(serviceType)}
                >
                  <MaterialIcons 
                    name={serviceType.icon} 
                    size={20} 
                    color="#007bff" 
                    style={styles.serviceTypeIcon}
                  />
                  <Text style={styles.serviceTypeName}>{t(serviceType.value)}</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#888" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}