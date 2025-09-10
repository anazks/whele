import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { addService, getCustomerVehicles } from '../../api/Services/management';

// Service type choices
const SERVICE_TYPE_CHOICES = [
  { value: 'alignment', label: 'Alignment' },
  { value: 'balancing', label: 'Balancing' },
  { value: 'rotation', label: 'Rotation' },
  { value: 'change', label: 'Change' },
  { value: 'repair', label: 'Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'other', label: 'Other' },
];

// Form Styles
const FormStyles = {
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  customerInfo: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  customerDetail: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  selectedText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  vehicleList: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  vehicleItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedVehicleItem: {
    backgroundColor: '#dbeafe',
  },
  vehicleText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  noVariantsText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    paddingTop: 20,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  modalList: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  modalItemDetail: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  closeButton: {
    backgroundColor: '#6b7280',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
};

export default function AddService() {
  const { customerId, customerName, customerPhone, customerEmail } = useLocalSearchParams();
  
  const [showServiceTypeSelection, setShowServiceTypeSelection] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [nextKilometer, setNextKilometer] = useState('');
  const [showNextKilometerInput, setShowNextKilometerInput] = useState(false);

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
      serviceType: "Service Type *",
      selectServiceType: "Select service type",
      description: "Description",
      enterServiceDescription: "Enter service description",
      kilometers: "Kilometers",
      enterKilometers: "Enter kilometers",
      nextKilometer: "Next Kilometer *",
      enterNextKilometer: "Enter next kilometer",
      price: "Price",
      enterServicePrice: "Enter service price",
      nextServiceDueDate: "Next Service Due Date",
      selectDueDate: "Select due date",
      addServiceButton: "Add Service",
      serviceAdded: "Service added successfully!",
      failedAddService: "Failed to add service. Please try again.",
      vehicleRequired: "Vehicle is required",
      serviceTypeRequired: "Service type is required",
      nextKilometerRequired: "Next kilometer is required",
      validPrice: "Enter a valid price",
      validKilometers: "Enter a valid kilometers value",
      validNextKilometer: "Enter a valid next kilometer value",
      selectServiceTypeTitle: "Select Service Type",
      close: "Close",
      noVehicles: "No vehicles found for this customer",
      vehicle: "Vehicle *",
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
      serviceType: "सेवा प्रकार *",
      selectServiceType: "सेवा प्रकार चुनें",
      description: "विवरण",
      enterServiceDescription: "सेवा विवरण दर्ज करें",
      kilometers: "किलोमीटर",
      enterKilometers: "किलोमीटर दर्ज करें",
      nextKilometer: "अगला किलोमीटर *",
      enterNextKilometer: "अगला किलोमीटर दर्ज करें",
      price: "मूल्य",
      enterServicePrice: "सेवा मूल्य दर्ज करें",
      nextServiceDueDate: "अगली सेवा नियत तिथि",
      selectDueDate: "नियत तिथि चुनें",
      addServiceButton: "सेवा जोड़ें",
      serviceAdded: "सेवा सफलतापूर्वक जोड़ी गई!",
      failedAddService: "सेवा जोड़ने में विफल। कृपया पुनः प्रयास करें।",
      vehicleRequired: "वाहन आवश्यक है",
      serviceTypeRequired: "सेवा प्रकार आवश्यक है",
      nextKilometerRequired: "अगला किलोमीटर आवश्यक है",
      validPrice: "एक वैध मूल्य दर्ज करें",
      validKilometers: "एक वैध किलोमीटर मान दर्ज करें",
      validNextKilometer: "एक वैध अगला किलोमीटर मान दर्ज करें",
      selectServiceTypeTitle: "सेवा प्रकार चुनें",
      close: "बंद करें",
      noVehicles: "इस ग्राहक के लिए कोई वाहन नहीं मिला",
      vehicle: "वाहन *",
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
        setCustomerVehicles(vehiclesResponse);
        if (vehiclesResponse.length === 1) selectVehicle(vehiclesResponse[0]);
      } catch (error) {
        alert('Failed to load vehicles');
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
        alert(t('serviceAdded'));
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
      } catch (error) {
        alert(t('failedAddService'));
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

  return (
    <SafeAreaView style={FormStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={FormStyles.contentContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={FormStyles.formContainer}>
            <Text style={FormStyles.formTitle}>{t('addService')}</Text>

            <View style={FormStyles.customerInfo}>
              <Text style={FormStyles.customerName}>{t('serviceFor')}: {selectedCustomer.name}</Text>
              <Text style={FormStyles.customerDetail}>Phone: {selectedCustomer.phone}</Text>
              {selectedCustomer.email ? (
                <Text style={FormStyles.customerDetail}>Email: {selectedCustomer.email}</Text>
              ) : null}
            </View>

            <View style={FormStyles.formGroup}>
              <Text style={FormStyles.label}>{t('vehicle')}</Text>
              {customerVehicles.length > 0 ? (
                <ScrollView style={FormStyles.vehicleList} nestedScrollEnabled={true}>
                  {customerVehicles.map(vehicle => (
                    <TouchableOpacity
                      key={vehicle.id}
                      style={[
                        FormStyles.vehicleItem,
                        selectedVehicle?.id === vehicle.id && FormStyles.selectedVehicleItem
                      ]}
                      onPress={() => selectVehicle(vehicle)}
                    >
                      <Text style={FormStyles.vehicleText}>
                        {vehicle.vehicle_number} - {vehicle.brand_name} ({vehicle.vehicle_model})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={FormStyles.noVariantsText}>{t('noVehicles')}</Text>
              )}
              {errors.vehicle ? <Text style={FormStyles.errorText}>{errors.vehicle}</Text> : null}
            </View>

            <View style={FormStyles.formGroup}>
              <Text style={FormStyles.label}>{t('serviceType')}</Text>
              <TouchableOpacity
                style={[FormStyles.selector, errors.service_type && FormStyles.inputError]}
                onPress={() => setShowServiceTypeSelection(true)}
              >
                {serviceForm.service_type ? (
                  <Text style={FormStyles.selectedText}>
                    {getTranslatedServiceType(serviceForm.service_type)}
                  </Text>
                ) : (
                  <Text style={FormStyles.placeholderText}>{t('selectServiceType')}</Text>
                )}
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
              {errors.service_type ? <Text style={FormStyles.errorText}>{errors.service_type}</Text> : null}
            </View>

            <View style={FormStyles.formGroup}>
              <Text style={FormStyles.label}>{t('description')}</Text>
              <TextInput
                style={[FormStyles.input, FormStyles.textArea]}
                placeholder={t('enterServiceDescription')}
                placeholderTextColor="#94a3b8"
                value={serviceForm.description}
                onChangeText={(text) => handleServiceChange('description', text)}
                multiline={true}
                numberOfLines={4}
              />
            </View>

            <View style={FormStyles.formGroup}>
              <Text style={FormStyles.label}>{t('kilometers')}</Text>
              <TextInput
                style={[FormStyles.input, errors.kilometers && FormStyles.inputError]}
                placeholder={t('enterKilometers')}
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                value={serviceForm.kilometers}
                onChangeText={(text) => handleServiceChange('kilometers', text)}
              />
              {errors.kilometers ? <Text style={FormStyles.errorText}>{errors.kilometers}</Text> : null}
            </View>

            {showNextKilometerInput ? (
              <View style={FormStyles.formGroup}>
                <Text style={FormStyles.label}>{t('nextKilometer')}</Text>
                <TextInput
                  style={[FormStyles.input, errors.next_kilometer && FormStyles.inputError]}
                  placeholder={t('enterNextKilometer')}
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                  value={serviceForm.next_kilometer_input}
                  onChangeText={handleNextKilometerChange}
                />
                {errors.next_kilometer ? <Text style={FormStyles.errorText}>{errors.next_kilometer}</Text> : null}
              </View>
            ) : (
              <View style={FormStyles.formGroup}>
                <Text style={FormStyles.label}>{t('nextKilometer')}</Text>
                <View style={[FormStyles.input, { justifyContent: 'center' }]}>
                  <Text style={{ color: '#1e293b', fontSize: 16, fontWeight: '500' }}>
                    {nextKilometer} (from settings)
                  </Text>
                </View>
                <TouchableOpacity
                  style={FormStyles.linkButton}
                  onPress={() => setShowNextKilometerInput(true)}
                >
                  <Text style={FormStyles.linkButtonText}>Change Next Kilometer</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={FormStyles.formGroup}>
              <Text style={FormStyles.label}>{t('price')}</Text>
              <TextInput
                style={[FormStyles.input, errors.price && FormStyles.inputError]}
                placeholder={t('enterServicePrice')}
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                value={serviceForm.price}
                onChangeText={(text) => handleServiceChange('price', text)}
              />
              {errors.price ? <Text style={FormStyles.errorText}>{errors.price}</Text> : null}
            </View>

            <TouchableOpacity
              style={[FormStyles.submitButton, loading && FormStyles.submitButtonDisabled]}
              onPress={handleServiceSubmit}
              disabled={loading}
            >
              <Text style={FormStyles.submitButtonText}>
                {loading ? 'Adding...' : t('addServiceButton')}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            visible={showServiceTypeSelection}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowServiceTypeSelection(false)}
          >
            <View style={FormStyles.modalContainer}>
              <View style={FormStyles.modalContent}>
                <Text style={FormStyles.modalTitle}>{t('selectServiceTypeTitle')}</Text>
                <ScrollView style={FormStyles.modalList}>
                  {SERVICE_TYPE_CHOICES.map((serviceType) => (
                    <TouchableOpacity
                      key={serviceType.value}
                      style={FormStyles.modalItem}
                      onPress={() => selectServiceType(serviceType)}
                    >
                      <Text style={FormStyles.modalItemName}>{t(serviceType.value)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={FormStyles.closeButton}
                  onPress={() => setShowServiceTypeSelection(false)}
                >
                  <Text style={FormStyles.closeButtonText}>{t('close')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}