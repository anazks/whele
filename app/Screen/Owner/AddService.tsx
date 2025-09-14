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

// Service type choices
const SERVICE_TYPE_CHOICES = [
  { value: 'alignment', label: 'Alignment', icon: 'build' },
  { value: 'balancing', label: 'Balancing', icon: 'tune' },
  { value: 'rotation', label: 'Rotation', icon: 'refresh' },
  { value: 'change', label: 'Change', icon: 'swap-horiz' },
  { value: 'repair', label: 'Repair', icon: 'handyman' },
  { value: 'inspection', label: 'Inspection', icon: 'search' },
  { value: 'other', label: 'Other', icon: 'more-horiz' },
];

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: StatusBar.currentHeight + 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  customerCard: {
    backgroundColor: '#e0f2fe',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 14,
    color: '#0369a1',
    marginBottom: 2,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 24,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 12,
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredStar: {
    color: '#ef4444',
    marginLeft: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: '#3b82f6',
    backgroundColor: '#f8faff',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
    marginLeft: 4,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    minHeight: 56,
  },
  selectorFocused: {
    borderColor: '#3b82f6',
    backgroundColor: '#f8faff',
    elevation: 2,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedIcon: {
    marginRight: 12,
    backgroundColor: '#dbeafe',
    padding: 8,
    borderRadius: 10,
  },
  selectedText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  chevronIcon: {
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 6,
  },
  vehicleSection: {
    maxHeight: 200,
    marginTop: 8,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  selectedVehicleItem: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
    elevation: 2,
  },
  vehicleIcon: {
    marginRight: 16,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
  },
  selectedVehicleIcon: {
    backgroundColor: '#dbeafe',
  },
  vehicleContent: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  checkIcon: {
    backgroundColor: '#10b981',
    padding: 4,
    borderRadius: 12,
  },
  noVehiclesContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fafbfc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  noVehiclesText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
  },
  nextKmCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  nextKmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextKmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  nextKmValue: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 2,
  },
  changeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    maxHeight: '70%',
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalList: {
    paddingBottom: 24,
  },
  serviceTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  serviceTypeIcon: {
    marginRight: 16,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
  },
  serviceTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
    fontWeight: '500',
  },
  nonEditableField: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nonEditableText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  nonEditableLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
};

export default function AddService() {
  const { customerId, customerName, customerPhone, customerEmail } = useLocalSearchParams();
  
  const [showServiceTypeSelection, setShowServiceTypeSelection] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [nextKilometer, setNextKilometer] = useState('');
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
      fromSettings: "from settings",
      changeValue: "Change",
      alignment: "Alignment",
      balancing: "Balancing", 
      rotation: "Rotation",
      change: "Change",
      repair: "Repair",
      inspection: "Inspection",
      other: "Other"
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
      fromSettings: "सेटिंग्स से",
      changeValue: "बदलें",
      alignment: "अलाइनमेंट",
      balancing: "बैलेंसिंग",
      rotation: "रोटेशन", 
      change: "बदलना",
      repair: "मरम्मत",
      inspection: "निरीक्षण",
      other: "अन्य"
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
      console.log('Error loading language preference:', error);
    }
  };

  const loadNextKilometer = async () => {
    try {
      const savedNextKilometer = await AsyncStorage.getItem('next_kilometer');
      if (savedNextKilometer) {
        setNextKilometer(savedNextKilometer);
        setShowNextKilometerInput(false);
      } else {
        setShowNextKilometerInput(true);
      }
    } catch (error) {
      console.log('Error loading next_kilometer:', error);
      setShowNextKilometerInput(true);
    }
  };

  const saveNextKilometer = async (value) => {
    try {
      await AsyncStorage.setItem('next_kilometer', value);
      setNextKilometer(value);
      setShowNextKilometerInput(false);
    } catch (error) {
      console.log('Error saving next_kilometer:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadLanguagePreference();
      await loadNextKilometer();
      try {
        setLoading(true);
        const vehiclesResponse = await getCustomerVehicles(customerId);
        console.log(vehiclesResponse,"vehcile")
        setCustomerVehicles(vehiclesResponse);
        if (vehiclesResponse.length === 1) selectVehicle(vehiclesResponse[0]);
      } catch (error) {
        Alert.alert('Error', 'Failed to load vehicles');
        setCustomerVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerId]);

  const handleServiceChange = (name, value) => {
    setServiceForm({ ...serviceForm, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleNextKilometerChange = (value) => {
    setServiceForm({ ...serviceForm, next_kilometer_input: value });
    if (errors.next_kilometer) setErrors({ ...errors, next_kilometer: '' });
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
    
    const nextKilometerValue = showNextKilometerInput ? serviceForm.next_kilometer_input : nextKilometer;
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
      try {
        setLoading(true);
        const nextKilometerValue = showNextKilometerInput ? serviceForm.next_kilometer_input : nextKilometer;
        
        if (showNextKilometerInput && serviceForm.next_kilometer_input) {
          await saveNextKilometer(serviceForm.next_kilometer_input);
        }
        
        const priceValue = serviceForm.price ? parseFloat(serviceForm.price) : 0;
        const serviceData = {
          customer: serviceForm.customer,
          vehicle: serviceForm.vehicle,
          service_type: serviceForm.service_type,
          description: serviceForm.description,
          price: priceValue,
          kilometers: serviceForm.kilometers || null,
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
                router.push('/(tabs)/History');
              }
            }
          ]
        );
      } catch (error) {
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748b" />
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
              <View style={styles.sectionIcon}>
                <MaterialIcons name="directions-car" size={20} color="#3b82f6" />
              </View>
              <Text>{t('vehicleSection')}</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <MaterialIcons name="hourglass-empty" size={32} color="#94a3b8" />
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
                        color={selectedVehicle?.id === vehicle.id ? "#0284c7" : "#64748b"} 
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
                        <MaterialIcons name="check" size={16} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noVehiclesContainer}>
                <MaterialIcons name="no-crash" size={48} color="#94a3b8" />
                <Text style={styles.noVehiclesText}>{t('noVehicles')}</Text>
                <Text style={[styles.noVehiclesText, { fontSize: 14, marginTop: 4 }]}>
                  {t('noVehiclesMsg')}
                </Text>
              </View>
            )}
            {errors.vehicle ? <Text style={styles.errorText}>{errors.vehicle}</Text> : null}
          </View>

          {/* Service Details Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitle}>
              <View style={styles.sectionIcon}>
                <MaterialIcons name="build" size={20} color="#10b981" />
              </View>
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
                    <View style={styles.selectedIcon}>
                      <MaterialIcons 
                        name={getServiceTypeIcon(serviceForm.service_type)} 
                        size={20} 
                        color="#3b82f6" 
                      />
                    </View>
                    <Text style={styles.selectedText}>
                      {getTranslatedServiceType(serviceForm.service_type)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>{t('selectServiceType')}</Text>
                )}
                <View style={styles.chevronIcon}>
                  <Ionicons name="chevron-down" size={16} color="#64748b" />
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
                  placeholderTextColor="#94a3b8"
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
              <View style={styles.sectionIcon}>
                <MaterialIcons name="track-changes" size={20} color="#f59e0b" />
              </View>
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
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                  value={serviceForm.kilometers}
                  onChangeText={(text) => handleServiceChange('kilometers', text)}
                  onFocus={() => setFocusedField('kilometers')}
                  onBlur={() => setFocusedField(null)}
                />
                <View style={styles.inputIcon}>
                  <MaterialIcons 
                    name="speed" 
                    size={20} 
                    color={focusedField === 'kilometers' ? '#3b82f6' : '#94a3b8'} 
                  />
                </View>
              </View>
              {errors.kilometers ? <Text style={styles.errorText}>{errors.kilometers}</Text> : null}
            </View>

            {/* Next Service Kilometers */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('nextKilometer')}
                <Text style={styles.requiredStar}>*</Text>
              </Text>
              
              {showNextKilometerInput ? (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'nextKilometer' && styles.inputFocused,
                      errors.next_kilometer && styles.inputError
                    ]}
                    placeholder={t('enterNextKilometer')}
                    placeholderTextColor="#94a3b8"
                    keyboardType="decimal-pad"
                    value={serviceForm.next_kilometer_input}
                    onChangeText={handleNextKilometerChange}
                    onFocus={() => setFocusedField('nextKilometer')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <View style={styles.inputIcon}>
                    <MaterialIcons 
                      name="schedule" 
                      size={20} 
                      color={focusedField === 'nextKilometer' ? '#3b82f6' : '#94a3b8'} 
                    />
                  </View>
                </View>
              ) : (
                <View style={[styles.nextKmCard, {shadowOpacity: 0, elevation: 0}]}>
                  <View style={styles.nextKmHeader}>
                    <View>
                      <Text style={[styles.nextKmText, {fontSize: 16, fontWeight: '600'}]}>
                        {nextKilometer} km
                      </Text>
                      <Text style={[styles.nextKmValue, {fontSize: 12, marginTop: 2}]}>
                        {t('fromSettings')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.changeButton, {backgroundColor: '#3b82f6'}]}
                      onPress={() => setShowNextKilometerInput(true)}
                    >
                      <Text style={styles.changeButtonText}>{t('changeValue')}</Text>
                    </TouchableOpacity>
                  </View>
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
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                  value={serviceForm.price}
                  onChangeText={(text) => handleServiceChange('price', text)}
                  onFocus={() => setFocusedField('price')}
                  onBlur={() => setFocusedField(null)}
                />
                <View style={styles.inputIcon}>
                  <MaterialIcons 
                    name="currency-rupee" 
                    size={20} 
                    color={focusedField === 'price' ? '#3b82f6' : '#94a3b8'} 
                  />
                </View>
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
              color="#ffffff" 
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
                <MaterialIcons name="close" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {SERVICE_TYPE_CHOICES.map((serviceType) => (
                <TouchableOpacity
                  key={serviceType.value}
                  style={styles.serviceTypeItem}
                  onPress={() => selectServiceType(serviceType)}
                >
                  <View style={styles.serviceTypeIcon}>
                    <MaterialIcons 
                      name={serviceType.icon} 
                      size={20} 
                      color="#3b82f6" 
                    />
                  </View>
                  <Text style={styles.serviceTypeName}>{t(serviceType.value)}</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}