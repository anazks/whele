import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addCustomer, addService, getCustomer, getCustomerVehicles } from '../../api/Services/management';
import { FormStyles } from './Add'; // Adjust the path as needed

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

export default function CustomerAdd() {
  const [activeForm, setActiveForm] = useState('addCustomer');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showServiceTypeSelection, setShowServiceTypeSelection] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [customerFormHeight] = useState(new Animated.Value(0));
  const [serviceFormHeight] = useState(new Animated.Value(0));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [nextKilometer, setNextKilometer] = useState('');
  const [showNextKilometerInput, setShowNextKilometerInput] = useState(false);

  // Translations for the customer add screen
  const translations = {
    english: {
      addCustomer: "Add Customer",
      addService: "Add Service",
      addNewCustomer: "Add New Customer",
      fullName: "Full Name *",
      enterCustomerName: "Enter customer name",
      phoneNumber: "Phone Number *",
      enterPhoneNumber: "Enter phone number",
      email: "Email",
      enterEmailAddress: "Enter email address",
      addCustomerButton: "Add Customer",
      adding: "Adding...",
      customerAdded: "Customer added successfully!",
      failedAddCustomer: "Failed to add customer. Please try again.",
      nameRequired: "Name is required",
      phoneRequired: "Phone number is required",
      validPhone: "Enter a valid phone number (10-15 digits)",
      validEmail: "Enter a valid email address",
      addServiceTitle: "Add Service",
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
      selectCustomerTitle: "Select Customer",
      searchCustomer: "Search by name, phone or email",
      selectServiceTypeTitle: "Select Service Type",
      close: "Close",
      noVehicles: "No vehicles found for this customer",
      alignment: "Alignment",
      balancing: "Balancing",
      rotation: "Rotation",
      change: "Change",
      repair: "Repair",
      inspection: "Inspection",
      other: "Other"
    },
    hindi: {
      addCustomer: "ग्राहक जोड़ें",
      addService: "सेवा जोड़ें",
      addNewCustomer: "नया ग्राहक जोड़ें",
      fullName: "पूरा नाम *",
      enterCustomerName: "ग्राहक का नाम दर्ज करें",
      phoneNumber: "फोन नंबर *",
      enterPhoneNumber: "फोन नंबर दर्ज करें",
      email: "ईमेल",
      enterEmailAddress: "ईमेल पता दर्ज करें",
      addCustomerButton: "ग्राहक जोड़ें",
      adding: "जोड़ा जा रहा है...",
      customerAdded: "ग्राहक सफलतापूर्वक जोड़ा गया!",
      failedAddCustomer: "ग्राहक जोड़ने में विफल। कृपया पुनः प्रयास करें।",
      nameRequired: "नाम आवश्यक है",
      phoneRequired: "फोन नंबर आवश्यक है",
      validPhone: "एक वैध फोन नंबर दर्ज करें (10-15 अंक)",
      validEmail: "एक वैध ईमेल पता दर्ज करें",
      addServiceTitle: "सेवा जोड़ें",
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
      selectCustomerTitle: "ग्राहक चुनें",
      searchCustomer: "नाम, फोन या ईमेल से खोजें",
      selectServiceTypeTitle: "सेवा प्रकार चुनें",
      close: "बंद करें",
      noVehicles: "इस ग्राहक के लिए कोई वाहन नहीं मिला",
      alignment: "अलाइनमेंट",
      balancing: "बैलेंसिंग",
      rotation: "रोटेशन",
      change: "बदलना",
      repair: "मरम्मत",
      inspection: "निरीक्षण",
      other: "अन्य"
    }
  };

  // Translation function
  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  // Load language preference and next_kilometer from localStorage
  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  // Load next_kilometer from localStorage
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
      console.error('Error loading next_kilometer:', error);
      setShowNextKilometerInput(true);
    }
  };

  // Save next_kilometer to localStorage
  const saveNextKilometer = async (value) => {
    try {
      await AsyncStorage.setItem('next_kilometer', value);
      setNextKilometer(value);
      setShowNextKilometerInput(false);
    } catch (error) {
      console.error('Error saving next_kilometer:', error);
    }
  };

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Service form state
  const [serviceForm, setServiceForm] = useState({
    customer: '', // Add customer ID field
    vehicle: '',
    service_type: '',
    description: '',
    price: '',
    kilometers: '', // Added kilometers field
    next_service_due_date: '', // Add next service due date field
    next_kilometer_input: '' // For manual input when not in localStorage
  });

  const [errors, setErrors] = useState({});
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState(null);

  // Fetch customers on component mount
  useEffect(() => {
    const fetchData = async () => {
      await loadLanguagePreference();
      await loadNextKilometer();
      
      try {
        setLoading(true);
        const response = await getCustomer();
        setFilteredCustomers(response);
      } catch (error) {
        alert(t('failedAddCustomer'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter customers based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = filteredCustomers.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery]);

  // Fetch customer vehicles when customer is selected in service form
  const fetchCustomerVehicles = async (customerId) => {
    try {
      setLoading(true);
      const vehiclesResponse = await getCustomerVehicles(customerId);
      setCustomerVehicles(vehiclesResponse);
    } catch (error) {
      alert(t('failedAddVehicle'));
      setCustomerVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic heights based on content and customer selection
  const getServiceFormHeight = () => {
    let baseHeight = 500; // Increased base height for service form to accommodate next_kilometer field
    if (selectedCustomer && customerVehicles.length > 0) {
      baseHeight += Math.min(customerVehicles.length * 50, 150); // Add height for vehicle list
    }
    if (showDatePicker && Platform.OS === 'ios') {
      baseHeight += 200; // Add height for iOS date picker
    }
    if (showNextKilometerInput) {
      baseHeight += 80; // Add height for next_kilometer input
    }
    return baseHeight;
  };

  // Expand/collapse animations with dynamic heights
  useEffect(() => {
    Animated.timing(customerFormHeight, {
      toValue: activeForm === 'addCustomer' ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();

    Animated.timing(serviceFormHeight, {
      toValue: activeForm === 'addService' ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [activeForm, selectedCustomer, customerVehicles.length, showDatePicker, showNextKilometerInput]);

  const customerFormHeightInterpolate = customerFormHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 420]
  });

  const serviceFormHeightInterpolate = serviceFormHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, getServiceFormHeight()]
  });

  const handleCustomerChange = (name, value) => {
    setCustomerForm({
      ...customerForm,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleServiceChange = (name, value) => {
    setServiceForm({
      ...serviceForm,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle next_kilometer input change and save to localStorage
  const handleNextKilometerChange = (value) => {
    setServiceForm({
      ...serviceForm,
      next_kilometer_input: value
    });
    
    if (errors.next_kilometer) {
      setErrors({
        ...errors,
        next_kilometer: ''
      });
    }
  };

  const validateCustomerForm = () => {
    let valid = true;
    const newErrors = {};

    if (!customerForm.name.trim()) {
      newErrors.name = t('nameRequired');
      valid = false;
    }

    if (!customerForm.phone.trim()) {
      newErrors.phone = t('phoneRequired');
      valid = false;
    } else if (!/^\d{10,15}$/.test(customerForm.phone)) {
      newErrors.phone = t('validPhone');
      valid = false;
    }

    if (customerForm.email && !/^\S+@\S+\.\S+$/.test(customerForm.email)) {
      newErrors.email = t('validEmail');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
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

    // Validate next_kilometer (mandatory)
    const nextKilometerValue = showNextKilometerInput ? serviceForm.next_kilometer_input : nextKilometer;
    if (!nextKilometerValue || nextKilometerValue.trim() === '') {
      newErrors.next_kilometer = t('nextKilometerRequired');
      valid = false;
    } else if (isNaN(nextKilometerValue) || parseFloat(nextKilometerValue) < 0) {
      newErrors.next_kilometer = t('validNextKilometer');
      valid = false;
    }

    // Price is no longer mandatory, but if provided, it should be valid
    if (serviceForm.price && (isNaN(serviceForm.price) || parseFloat(serviceForm.price) <= 0)) {
      newErrors.price = t('validPrice');
      valid = false;
    }

    // Validate kilometers if provided
    if (serviceForm.kilometers && (isNaN(serviceForm.kilometers) || parseFloat(serviceForm.kilometers) < 0)) {
      newErrors.kilometers = t('validKilometers');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCustomerSubmit = async () => {
    if (validateCustomerForm()) {
      try {
        setLoading(true);
        const response = await addCustomer(customerForm); 
        console.log(response,"---response");       
        if (response && response.id) {
          setNewCustomerId(response.id);
          alert(t('customerAdded'));
          
          // Reset form
          setCustomerForm({
            name: '',
            phone: '',
            email: ''
          });
          
          // Refresh customer list
          const updatedCustomers = await getCustomer();
          setFilteredCustomers(updatedCustomers);
        }
      } catch (error) {
        alert(t('Mobile number Exists'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleServiceSubmit = async () => {
    if (validateServiceForm()) {
      try {
        setLoading(true);
        
        // Get next_kilometer value
        const nextKilometerValue = showNextKilometerInput ? serviceForm.next_kilometer_input : nextKilometer;
        
        // If next_kilometer was input manually, save it to localStorage
        if (showNextKilometerInput && serviceForm.next_kilometer_input) {
          await saveNextKilometer(serviceForm.next_kilometer_input);
        }
        
        const serviceData = {
          customer: serviceForm.customer, // Include customer ID
          vehicle: serviceForm.vehicle,
          service_type: serviceForm.service_type,
          description: serviceForm.description,
          price: serviceForm.price || null, // Price is optional now
          kilometers: serviceForm.kilometers || null, // Include kilometers
          next_service_due_date: serviceForm.next_service_due_date || null,
          next_kilometer: parseFloat(nextKilometerValue) // Include mandatory next_kilometer
        }; 
        
        const response = await addService(serviceData);        
        alert(t('serviceAdded'));
        
        // Reset form
        setServiceForm({
          customer: '',
          vehicle: '',
          service_type: '',
          description: '',
          price: '',
          kilometers: '',
          next_service_due_date: '',
          next_kilometer_input: ''
        });
        setSelectedCustomer(null);
        setSelectedVehicle(null);
        setCustomerVehicles([]);
      } catch (error) {
        alert(t('failedAddService'));
      } finally {
        setLoading(false);
      }
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    
    if (activeForm === 'addService') {
      setServiceForm({
        ...serviceForm,
        customer: customer.id, // Set customer ID in service form
        vehicle: ''
      });
      setSelectedVehicle(null);
      // Fetch customer vehicles for service form
      fetchCustomerVehicles(customer.id);
    }
    
    setShowCustomerSearch(false);
    setSearchQuery('');
  };

  const selectServiceType = (serviceType) => {
    setServiceForm({
      ...serviceForm,
      service_type: serviceType.value
    });
    setShowServiceTypeSelection(false);
  };

  const selectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setServiceForm({
      ...serviceForm,
      vehicle: vehicle.id
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      setServiceForm({
        ...serviceForm,
        next_service_due_date: formattedDate
      });
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // Helper function to get translated label for service type
  const getTranslatedServiceType = (value) => {
    const serviceType = SERVICE_TYPE_CHOICES.find(st => st.value === value);
    if (serviceType) {
      return t(serviceType.value);
    }
    return value;
  };

  return (
    <ScrollView 
      contentContainerStyle={[FormStyles.container, { paddingBottom: 100 }]} // Increased bottom padding
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Form Selection */}
      <View style={FormStyles.formSelection} >
        <TouchableOpacity 
          style={[FormStyles.formOption, activeForm === 'addCustomer' && FormStyles.activeFormOption]}
          onPress={() => setActiveForm('addCustomer')}
        >
          <Ionicons 
            name="person-add" 
            size={20} 
            color={activeForm === 'addCustomer' ? '#fff' : '#3498db'} 
          />
          <Text style={[FormStyles.formOptionText, activeForm === 'addCustomer' && FormStyles.activeFormOptionText]}>
            {t('addCustomer')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[FormStyles.formOption, activeForm === 'addService' && FormStyles.activeFormOption]}
          onPress={() => setActiveForm('addService')}
        >
          <Ionicons 
            name="construct" 
            size={20} 
            color={activeForm === 'addService' ? '#fff' : '#3498db'} 
          />
          <Text style={[FormStyles.formOptionText, activeForm === 'addService' && FormStyles.activeFormOptionText]}>
            {t('addService')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Customer Form */}
      {activeForm === 'addCustomer' && (
        <View style={[FormStyles.formContainer, { marginTop: 0 }]}>
          <Text style={FormStyles.formTitle}>{t('addNewCustomer')}</Text>
          
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>{t('fullName')}</Text>
            <TextInput
              style={[FormStyles.input, errors.name && FormStyles.inputError]}
              placeholder={t('enterCustomerName')}
              placeholderTextColor="#999"
              value={customerForm.name}
              onChangeText={(text) => handleCustomerChange('name', text)}
              maxLength={100}
            />
            {errors.name ? <Text style={FormStyles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>{t('phoneNumber')}</Text>
            <TextInput
              style={[FormStyles.input, errors.phone && FormStyles.inputError]}
              placeholder={t('enterPhoneNumber')}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={customerForm.phone}
              onChangeText={(text) => handleCustomerChange('phone', text)}
              maxLength={15}
            />
            {errors.phone ? <Text style={FormStyles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>{t('email')}</Text>
            <TextInput
              style={[FormStyles.input, errors.email && FormStyles.inputError]}
              placeholder={t('enterEmailAddress')}
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={customerForm.email}
              onChangeText={(text) => handleCustomerChange('email', text)}
              maxLength={254}
            />
            {errors.email ? <Text style={FormStyles.errorText}>{errors.email}</Text> : null}
          </View>

          <TouchableOpacity 
            style={[FormStyles.submitButton, loading && FormStyles.submitButtonDisabled]} 
            onPress={handleCustomerSubmit}
            disabled={loading}
          >
            <Text style={FormStyles.submitButtonText}>
              {loading ? t('adding') : t('addCustomerButton')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Service Form */}
      {activeForm === 'addService' && (
        <View style={[FormStyles.formContainer, { marginTop: 0, minHeight: 'auto' }]}>
          <Text style={FormStyles.formTitle}>{t('addServiceTitle')}</Text>
          
          {/* Customer Selection */}
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>{t('customer')}</Text>
            <TouchableOpacity 
              style={[FormStyles.selector]}
              onPress={() => setShowCustomerSearch(true)}
            >
              {selectedCustomer ? (
                <Text style={FormStyles.selectedText}>{selectedCustomer.name}</Text>
              ) : (
                <Text style={FormStyles.placeholderText}>{t('selectCustomer')}</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Vehicle Selection - Only show if customer is selected */}
          {selectedCustomer && (
            <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
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
          )}

          {/* Service Type */}
          <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
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
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            {errors.service_type ? <Text style={FormStyles.errorText}>{errors.service_type}</Text> : null}
          </View>

          {/* Description */}
          <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
            <Text style={FormStyles.label}>{t('description')}</Text>
            <TextInput
              style={[FormStyles.input, FormStyles.textArea]}
              placeholder={t('enterServiceDescription')}
              placeholderTextColor="#999"
              value={serviceForm.description}
              onChangeText={(text) => handleServiceChange('description', text)}
              multiline={true}
              numberOfLines={4}
            />
          </View>

          {/* Kilometers */}
          <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
            <Text style={FormStyles.label}>{t('kilometers')}</Text>
            <TextInput
              style={[FormStyles.input, errors.kilometers && FormStyles.inputError]}
              placeholder={t('enterKilometers')}
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={serviceForm.kilometers}
              onChangeText={(text) => handleServiceChange('kilometers', text)}
            />
            {errors.kilometers ? <Text style={FormStyles.errorText}>{errors.kilometers}</Text> : null}
          </View>

          {/* Next Kilometer - Show input if not in localStorage, otherwise show stored value */}
          {showNextKilometerInput ? (
            <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
              <Text style={FormStyles.label}>{t('nextKilometer')}</Text>
              <TextInput
                style={[FormStyles.input, errors.next_kilometer && FormStyles.inputError]}
                placeholder={t('enterNextKilometer')}
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={serviceForm.next_kilometer_input}
                onChangeText={handleNextKilometerChange}
              />
              {errors.next_kilometer ? <Text style={FormStyles.errorText}>{errors.next_kilometer}</Text> : null}
            </View>
          ) : (
            <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
              <Text style={FormStyles.label}>{t('nextKilometer')}</Text>
              <View style={[FormStyles.input, { justifyContent: 'center' }]}>
                <Text style={{ color: '#333', fontSize: 16 }}>
                  {nextKilometer} (from settings)
                </Text>
              </View>
              <TouchableOpacity 
                style={[FormStyles.linkButton, { marginTop: 5 }]}
                onPress={() => setShowNextKilometerInput(true)}
              >
                <Text style={FormStyles.linkButtonText}>Change Next Kilometer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Price */}
          <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
            <Text style={FormStyles.label}>{t('price')}</Text>
            <TextInput
              style={[FormStyles.input, errors.price && FormStyles.inputError]}
              placeholder={t('enterServicePrice')}
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={serviceForm.price}
              onChangeText={(text) => handleServiceChange('price', text)}
            />
            {errors.price ? <Text style={FormStyles.errorText}>{errors.price}</Text> : null}
          </View>
          <TouchableOpacity 
            style={[FormStyles.submitButton, loading && FormStyles.submitButtonDisabled, { marginTop: 30 }]} 
            onPress={handleServiceSubmit}
            disabled={loading}
          >
            <Text style={FormStyles.submitButtonText}>
              {loading ? t('adding') : t('addServiceButton')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Customer Search Modal */}
      <Modal
        visible={showCustomerSearch}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomerSearch(false)}
      >
        <View style={FormStyles.modalContainer}>
          <View style={FormStyles.modalContent}>
            <Text style={FormStyles.modalTitle}>{t('selectCustomerTitle')}</Text>      
            <View style={FormStyles.modalSearchContainer}>
              <Ionicons name="search" size={20} color="#999" style={FormStyles.modalSearchIcon} />
              <TextInput
                style={FormStyles.modalSearchInput}
                placeholder={t('searchCustomer')}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView style={FormStyles.modalList}>
              {filteredCustomers.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  style={FormStyles.modalItem}
                  onPress={() => selectCustomer(customer)}
                >
                  <View>
                    <Text style={FormStyles.modalItemName}>{customer.name}</Text>
                    <Text style={FormStyles.modalItemDetail}>{customer.phone}</Text>
                    {customer.email && (
                      <Text style={FormStyles.modalItemDetail}>{customer.email}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={FormStyles.closeButton}
              onPress={() => setShowCustomerSearch(false)}
            >
              <Text style={FormStyles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Service Type Selection Modal */}
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
  );
}