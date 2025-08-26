import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addCustomer, addService, addVehicle, getBrand, getCustomer, getCustomerVehicles } from '../../api/Services/management';
import { FormStyles } from './Add'; // Adjust the path as needed

// Transport type choices
const TRANSPORT_TYPE_CHOICES = [
  { value: 'private', label: 'Private' },
  { value: 'goods_transport', label: 'Goods Transport' },
  { value: 'passenger_transport', label: 'Passenger Transport' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'other', label: 'Other' },
];

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

// Generate years from 1980 to 2026
const generateYearOptions = () => {
  const years = [];
  for (let year = 1980; year <= 2026; year++) {
    years.push(year);
  }
  return years.reverse(); // Show most recent years first
};

const YEAR_OPTIONS = generateYearOptions();

export default function CustomerAdd() {
  const [activeForm, setActiveForm] = useState('addCustomer');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showBrandSelection, setShowBrandSelection] = useState(false);
  const [showTransportSelection, setShowTransportSelection] = useState(false);
  const [showServiceTypeSelection, setShowServiceTypeSelection] = useState(false);
  const [showYearSelection, setShowYearSelection] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [customerFormHeight] = useState(new Animated.Value(0));
  const [vehicleFormHeight] = useState(new Animated.Value(0));
  const [serviceFormHeight] = useState(new Animated.Value(0));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    customer: '',
    vehicle_type: '', // brand id
    vehicle_model: '', // year (1980-2026)
    vehicle_number: '',
    transport_type: '',
    last_service_date: ''
  });

  // Service form state
  const [serviceForm, setServiceForm] = useState({
    customer: '', // Add customer ID field
    vehicle: '',
    service_type: '',
    description: '',
    price: '',
    kilometers: '', // Added kilometers field
    next_service_due_date: '' // Add next service due date field
  });

  const [errors, setErrors] = useState({});
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState(null);

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await getCustomer();
        console.log('Fetched customers:', response);
        setFilteredCustomers(response);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
        alert('Failed to fetch customers. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const brandsResponse = await getBrand();
        console.log('Fetched brands:', brandsResponse);
        setBrands(brandsResponse);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
        alert('Failed to fetch brands. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
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
      console.log('Fetched customer vehicles:', vehiclesResponse);
      setCustomerVehicles(vehiclesResponse);
    } catch (error) {
      console.error('Failed to fetch customer vehicles:', error);
      alert('Failed to fetch customer vehicles. Please try again.');
      setCustomerVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic heights based on content and customer selection
  const getServiceFormHeight = () => {
    let baseHeight = 450; // Increased base height for service form to accommodate kilometers field
    if (selectedCustomer && customerVehicles.length > 0) {
      baseHeight += Math.min(customerVehicles.length * 50, 150); // Add height for vehicle list
    }
    if (showDatePicker && Platform.OS === 'ios') {
      baseHeight += 200; // Add height for iOS date picker
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

    Animated.timing(vehicleFormHeight, {
      toValue: activeForm === 'addVehicle' ? 1 : 0,
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
  }, [activeForm, selectedCustomer, customerVehicles.length, showDatePicker]);

  const customerFormHeightInterpolate = customerFormHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 420]
  });

  const vehicleFormHeightInterpolate = vehicleFormHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 700]
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

  const handleVehicleChange = (name, value) => {
    setVehicleForm({
      ...vehicleForm,
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

  const validateCustomerForm = () => {
    let valid = true;
    const newErrors = {};

    if (!customerForm.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!customerForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!/^\d{10,15}$/.test(customerForm.phone)) {
      newErrors.phone = 'Enter a valid phone number (10-15 digits)';
      valid = false;
    }

    if (customerForm.email && !/^\S+@\S+\.\S+$/.test(customerForm.email)) {
      newErrors.email = 'Enter a valid email address';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const validateVehicleForm = () => {
    let valid = true;
    const newErrors = {};

    if (!vehicleForm.customer) {
      newErrors.customer = 'Customer is required';
      valid = false;
    }

    if (!vehicleForm.vehicle_type) {
      newErrors.vehicle_type = 'Brand is required';
      valid = false;
    }

    if (!vehicleForm.vehicle_model) {
      newErrors.vehicle_model = 'Vehicle model year is required';
      valid = false;
    } else if (parseInt(vehicleForm.vehicle_model) < 1980 || parseInt(vehicleForm.vehicle_model) > 2026) {
      newErrors.vehicle_model = 'Vehicle model year must be between 1980 and 2026';
      valid = false;
    }

    if (!vehicleForm.vehicle_number) {
      newErrors.vehicle_number = 'Vehicle number is required';
      valid = false;
    }

    if (!vehicleForm.transport_type) {
      newErrors.transport_type = 'Transport type is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const validateServiceForm = () => {
    let valid = true;
    const newErrors = {};

    if (!serviceForm.vehicle) {
      newErrors.vehicle = 'Vehicle is required';
      valid = false;
    }

    if (!serviceForm.service_type) {
      newErrors.service_type = 'Service type is required';
      valid = false;
    }

    // Price is no longer mandatory, but if provided, it should be valid
    if (serviceForm.price && (isNaN(serviceForm.price) || parseFloat(serviceForm.price) <= 0)) {
      newErrors.price = 'Enter a valid price';
      valid = false;
    }

    // Validate kilometers if provided
    if (serviceForm.kilometers && (isNaN(serviceForm.kilometers) || parseFloat(serviceForm.kilometers) < 0)) {
      newErrors.kilometers = 'Enter a valid kilometers value';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCustomerSubmit = async () => {
    if (validateCustomerForm()) {
      try {
        setLoading(true);
        console.log('Customer submitted:', customerForm);
        const response = await addCustomer(customerForm);
        console.log("Response from API:", response);
        
        if (response && response.id) {
          setNewCustomerId(response.id);
          alert('Customer added successfully!');
          
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
        console.error('Error adding customer:', error);
        alert('Failed to add customer. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVehicleSubmit = async () => {
    if (validateVehicleForm()) {
      try {
        setLoading(true);
        console.log('Vehicle submitted:', vehicleForm);
        
        const vehicleData = {
          customer: vehicleForm.customer,
          vehicle_type: vehicleForm.vehicle_type,
          vehicle_model: parseInt(vehicleForm.vehicle_model), // Convert to integer
          vehicle_number: vehicleForm.vehicle_number,
          transport_type: vehicleForm.transport_type,
          last_service_date: vehicleForm.last_service_date || null
        };
        
        const response = await addVehicle(vehicleData);
        console.log("Response from API:", response);
        
        alert('Vehicle added successfully!');
        
        // Reset form
        setVehicleForm({
          customer: '',
          vehicle_type: '',
          vehicle_model: '',
          vehicle_number: '',
          transport_type: '',
          last_service_date: ''
        });
        setSelectedBrand(null);
        setSelectedCustomer(null);
      } catch (error) {
        console.error('Error adding vehicle:', error);
        alert('Failed to add vehicle. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleServiceSubmit = async () => {
    if (validateServiceForm()) {
      try {
        setLoading(true);
        console.log('Service submitted:', serviceForm);
        
        const serviceData = {
          customer: serviceForm.customer, // Include customer ID
          vehicle: serviceForm.vehicle,
          service_type: serviceForm.service_type,
          description: serviceForm.description,
          price: serviceForm.price || null, // Price is optional now
          kilometers: serviceForm.kilometers || null, // Include kilometers
          next_service_due_date: serviceForm.next_service_due_date || null
        };
        
        const response = await addService(serviceData);
        console.log("Response from API:", response);
        
        alert('Service added successfully!');
        
        // Reset form
        setServiceForm({
          customer: '',
          vehicle: '',
          service_type: '',
          description: '',
          price: '',
          kilometers: '',
          next_service_due_date: ''
        });
        setSelectedCustomer(null);
        setSelectedVehicle(null);
        setCustomerVehicles([]);
      } catch (error) {
        console.error('Error adding service:', error);
        alert('Failed to add service. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    
    if (activeForm === 'addVehicle') {
      setVehicleForm({
        ...vehicleForm,
        customer: customer.id
      });
    } else if (activeForm === 'addService') {
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

  const selectBrand = (brand) => {
    setSelectedBrand(brand);
    setVehicleForm({
      ...vehicleForm,
      vehicle_type: brand.id
    });
    setShowBrandSelection(false);
  };

  const selectTransportType = (transportType) => {
    setVehicleForm({
      ...vehicleForm,
      transport_type: transportType.value
    });
    setShowTransportSelection(false);
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

  const selectYear = (year) => {
    setVehicleForm({
      ...vehicleForm,
      vehicle_model: year.toString()
    });
    setShowYearSelection(false);
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
            Add Customer
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[FormStyles.formOption, activeForm === 'addVehicle' && FormStyles.activeFormOption]}
          onPress={() => setActiveForm('addVehicle')}
        >
          <Ionicons 
            name="car" 
            size={20} 
            color={activeForm === 'addVehicle' ? '#fff' : '#3498db'} 
          />
          <Text style={[FormStyles.formOptionText, activeForm === 'addVehicle' && FormStyles.activeFormOptionText]}>
            Add Vehicle
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
            Add Service
          </Text>
        </TouchableOpacity>
      </View>

      {/* Customer Form */}
      {activeForm === 'addCustomer' && (
        <View style={[FormStyles.formContainer, { marginTop: 0 }]}>
          <Text style={FormStyles.formTitle}>Add New Customer</Text>
          
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>Full Name *</Text>
            <TextInput
              style={[FormStyles.input, errors.name && FormStyles.inputError]}
              placeholder="Enter customer name"
              placeholderTextColor="#999"
              value={customerForm.name}
              onChangeText={(text) => handleCustomerChange('name', text)}
              maxLength={100}
            />
            {errors.name ? <Text style={FormStyles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>Phone Number *</Text>
            <TextInput
              style={[FormStyles.input, errors.phone && FormStyles.inputError]}
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={customerForm.phone}
              onChangeText={(text) => handleCustomerChange('phone', text)}
              maxLength={15}
            />
            {errors.phone ? <Text style={FormStyles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>Email</Text>
            <TextInput
              style={[FormStyles.input, errors.email && FormStyles.inputError]}
              placeholder="Enter email address"
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
              {loading ? 'Adding...' : 'Add Customer'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Vehicle Form */}
      {activeForm === 'addVehicle' && (
        <View style={[FormStyles.formContainer, { marginTop: 0 }]}>
          <Text style={FormStyles.formTitle}>Add Vehicle</Text>
          
          {/* Customer Selection */}
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>Customer *</Text>
            <TouchableOpacity 
              style={[FormStyles.selector, errors.customer && FormStyles.inputError]}
              onPress={() => setShowCustomerSearch(true)}
            >
              {selectedCustomer ? (
                <Text style={FormStyles.selectedText}>{selectedCustomer.name}</Text>
              ) : (
                <Text style={FormStyles.placeholderText}>Select a customer</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            {errors.customer ? <Text style={FormStyles.errorText}>{errors.customer}</Text> : null}
          </View>

          {/* Brand Selection */}
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>Brand *</Text>
            <TouchableOpacity 
              style={[FormStyles.selector, errors.vehicle_type && FormStyles.inputError]}
              onPress={() => setShowBrandSelection(true)}
            >
              {selectedBrand ? (
                <View style={FormStyles.selectedBrandContainer}>
                  {selectedBrand.image_url && (
                    <Image source={{ uri: selectedBrand.image_url }} style={FormStyles.brandImage} />
                  )}
                  <Text style={FormStyles.selectedText}>{selectedBrand.name}</Text>
                </View>
              ) : (
                <Text style={FormStyles.placeholderText}>Select a brand</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            {errors.vehicle_type ? <Text style={FormStyles.errorText}>{errors.vehicle_type}</Text> : null}
          </View>

          {/* Vehicle Model Year Selection */}
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>Vehicle Model Year *</Text>
            <TouchableOpacity 
              style={[FormStyles.selector, errors.vehicle_model && FormStyles.inputError]}
              onPress={() => setShowYearSelection(true)}
            >
              {vehicleForm.vehicle_model ? (
                <Text style={FormStyles.selectedText}>{vehicleForm.vehicle_model}</Text>
              ) : (
                <Text style={FormStyles.placeholderText}>Select model year</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            {errors.vehicle_model ? <Text style={FormStyles.errorText}>{errors.vehicle_model}</Text> : null}
          </View>

          {/* Vehicle Number */}
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>Vehicle Number *</Text>
            <TextInput
              style={[FormStyles.input, errors.vehicle_number && FormStyles.inputError]}
              placeholder="Enter vehicle number"
              placeholderTextColor="#999"
              value={vehicleForm.vehicle_number}
              onChangeText={(text) => handleVehicleChange('vehicle_number', text.toUpperCase())}
              maxLength={20}
              autoCapitalize="characters"
            />
            {errors.vehicle_number ? <Text style={FormStyles.errorText}>{errors.vehicle_number}</Text> : null}
          </View>

          {/* Transport Type */}
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>Transport Type *</Text>
            <TouchableOpacity 
              style={[FormStyles.selector, errors.transport_type && FormStyles.inputError]}
              onPress={() => setShowTransportSelection(true)}
            >
              {vehicleForm.transport_type ? (
                <Text style={FormStyles.selectedText}>
                  {TRANSPORT_TYPE_CHOICES.find(tt => tt.value === vehicleForm.transport_type)?.label}
                </Text>
              ) : (
                <Text style={FormStyles.placeholderText}>Select transport type</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            {errors.transport_type ? <Text style={FormStyles.errorText}>{errors.transport_type}</Text> : null}
          </View>

          {/* Last Service Date */}
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>Last Service Date</Text>
            <TextInput
              style={FormStyles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              value={vehicleForm.last_service_date}
              onChangeText={(text) => handleVehicleChange('last_service_date', text)}
            />
          </View>

          <TouchableOpacity 
            style={[FormStyles.submitButton, loading && FormStyles.submitButtonDisabled]} 
            onPress={handleVehicleSubmit}
            disabled={loading}
          >
            <Text style={FormStyles.submitButtonText}>
              {loading ? 'Adding...' : 'Add Vehicle'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Service Form */}
      {activeForm === 'addService' && (
        <View style={[FormStyles.formContainer, { marginTop: 0, minHeight: 'auto' }]}>
          <Text style={FormStyles.formTitle}>Add Service</Text>
          
          {/* Customer Selection */}
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>Customer *</Text>
            <TouchableOpacity 
              style={[FormStyles.selector]}
              onPress={() => setShowCustomerSearch(true)}
            >
              {selectedCustomer ? (
                <Text style={FormStyles.selectedText}>{selectedCustomer.name}</Text>
              ) : (
                <Text style={FormStyles.placeholderText}>Select a customer</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Vehicle Selection - Only show if customer is selected */}
          {selectedCustomer && (
            <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
              <Text style={FormStyles.label}>Vehicle *</Text>
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
                <Text style={FormStyles.noVariantsText}>No vehicles found for this customer</Text>
              )}
              {errors.vehicle ? <Text style={FormStyles.errorText}>{errors.vehicle}</Text> : null}
            </View>
          )}

          {/* Service Type */}
          <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
            <Text style={FormStyles.label}>Service Type *</Text>
            <TouchableOpacity 
              style={[FormStyles.selector, errors.service_type && FormStyles.inputError]}
              onPress={() => setShowServiceTypeSelection(true)}
            >
              {serviceForm.service_type ? (
                <Text style={FormStyles.selectedText}>
                  {SERVICE_TYPE_CHOICES.find(st => st.value === serviceForm.service_type)?.label}
                </Text>
              ) : (
                <Text style={FormStyles.placeholderText}>Select service type</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            {errors.service_type ? <Text style={FormStyles.errorText}>{errors.service_type}</Text> : null}
          </View>

          {/* Description */}
          <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
            <Text style={FormStyles.label}>Description</Text>
            <TextInput
              style={[FormStyles.input, FormStyles.textArea]}
              placeholder="Enter service description"
              placeholderTextColor="#999"
              value={serviceForm.description}
              onChangeText={(text) => handleServiceChange('description', text)}
              multiline={true}
              numberOfLines={4}
            />
          </View>

          {/* Kilometers */}
          <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
            <Text style={FormStyles.label}>Kilometers</Text>
            <TextInput
              style={[FormStyles.input, errors.kilometers && FormStyles.inputError]}
              placeholder="Enter kilometers"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={serviceForm.kilometers}
              onChangeText={(text) => handleServiceChange('kilometers', text)}
            />
            {errors.kilometers ? <Text style={FormStyles.errorText}>{errors.kilometers}</Text> : null}
          </View>

          {/* Price */}
          <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
            <Text style={FormStyles.label}>Price</Text>
            <TextInput
              style={[FormStyles.input, errors.price && FormStyles.inputError]}
              placeholder="Enter service price"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={serviceForm.price}
              onChangeText={(text) => handleServiceChange('price', text)}
            />
            {errors.price ? <Text style={FormStyles.errorText}>{errors.price}</Text> : null}
          </View>

          {/* Next Service Due Date */}
          <View style={[FormStyles.formGroup, { marginTop: 15 }]}>
            <Text style={FormStyles.label}>Next Service Due Date</Text>
            <TouchableOpacity 
              style={FormStyles.selector}
              onPress={showDatepicker}
            >
              {serviceForm.next_service_due_date ? (
                <Text style={FormStyles.selectedText}>{serviceForm.next_service_due_date}</Text>
              ) : (
                <Text style={FormStyles.placeholderText}>Select due date</Text>
              )}
              <Ionicons name="calendar" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <View style={{ marginTop: 10, marginBottom: 20 }}>
              <DateTimePicker
                value={serviceForm.next_service_due_date ? new Date(serviceForm.next_service_due_date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            </View>
          )}

          <TouchableOpacity 
            style={[FormStyles.submitButton, loading && FormStyles.submitButtonDisabled, { marginTop: 30 }]} 
            onPress={handleServiceSubmit}
            disabled={loading}
          >
            <Text style={FormStyles.submitButtonText}>
              {loading ? 'Adding...' : 'Add Service'}
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
            <Text style={FormStyles.modalTitle}>Select Customer</Text>
            
            <View style={FormStyles.modalSearchContainer}>
              <Ionicons name="search" size={20} color="#999" style={FormStyles.modalSearchIcon} />
              <TextInput
                style={FormStyles.modalSearchInput}
                placeholder="Search by name, phone or email"
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
              <Text style={FormStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Brand Selection Modal */}
      <Modal
        visible={showBrandSelection}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBrandSelection(false)}
      >
        <View style={FormStyles.modalContainer}>
          <View style={FormStyles.modalContent}>
            <Text style={FormStyles.modalTitle}>Select Brand</Text>
            
            <ScrollView style={FormStyles.brandGrid} contentContainerStyle={FormStyles.brandGridContent}>
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={FormStyles.brandCard}
                  onPress={() => selectBrand(brand)}
                >
                  {brand.image_url && (
                    <Image source={{ uri: brand.image_url }} style={FormStyles.brandCardImage} />
                  )}
                  <Text style={FormStyles.brandCardName}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={FormStyles.closeButton}
              onPress={() => setShowBrandSelection(false)}
            >
              <Text style={FormStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Year Selection Modal */}
      <Modal
        visible={showYearSelection}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowYearSelection(false)}
      >
        <View style={FormStyles.modalContainer}>
          <View style={FormStyles.modalContent}>
            <Text style={FormStyles.modalTitle}>Select Model Year</Text>
            
            <ScrollView style={FormStyles.modalList}>
              {YEAR_OPTIONS.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={FormStyles.modalItem}
                  onPress={() => selectYear(year)}
                >
                  <Text style={FormStyles.modalItemName}>{year}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={FormStyles.closeButton}
              onPress={() => setShowYearSelection(false)}
            >
              <Text style={FormStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transport Type Selection Modal */}
      <Modal
        visible={showTransportSelection}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTransportSelection(false)}
      >
        <View style={FormStyles.modalContainer}>
          <View style={FormStyles.modalContent}>
            <Text style={FormStyles.modalTitle}>Select Transport Type</Text>
            
            <ScrollView style={FormStyles.modalList}>
              {TRANSPORT_TYPE_CHOICES.map((transportType) => (
                <TouchableOpacity
                  key={transportType.value}
                  style={FormStyles.modalItem}
                  onPress={() => selectTransportType(transportType)}
                >
                  <Text style={FormStyles.modalItemName}>{transportType.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={FormStyles.closeButton}
              onPress={() => setShowTransportSelection(false)}
            >
              <Text style={FormStyles.closeButtonText}>Close</Text>
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
            <Text style={FormStyles.modalTitle}>Select Service Type</Text>
            
            <ScrollView style={FormStyles.modalList}>
              {SERVICE_TYPE_CHOICES.map((serviceType) => (
                <TouchableOpacity
                  key={serviceType.value}
                  style={FormStyles.modalItem}
                  onPress={() => selectServiceType(serviceType)}
                >
                  <Text style={FormStyles.modalItemName}>{serviceType.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={FormStyles.closeButton}
              onPress={() => setShowServiceTypeSelection(false)}
            >
              <Text style={FormStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}