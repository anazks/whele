import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { addVehicle, getBrand, getCustomer } from '../../api/Services/management';
import { FormStyles } from './Add'; // Adjust the path as needed

// Import translations from external file
import { translations } from '../../Languge/Languages'; // Update this path

// Transport type choices
const TRANSPORT_TYPE_CHOICES = [
  { value: 'private', label: 'Private' },
  { value: 'goods_transport', label: 'Goods Transport' },
  { value: 'passenger_transport', label: 'Passenger Transport' },
  { value: 'commercial', label: 'Commercial' },
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

export default function AddVehicle({ onVehicleAdded, preselectedCustomer = null }) {
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showBrandSelection, setShowBrandSelection] = useState(false);
  const [showVariantSelection, setShowVariantSelection] = useState(false);
  const [showTransportSelection, setShowTransportSelection] = useState(false);
  const [showYearSelection, setShowYearSelection] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(preselectedCustomer);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    customer: preselectedCustomer ? preselectedCustomer.id.toString() : '',
    vehicle_type: '', // variant id
    vehicle_model: '', // year (1980-2026)
    vehicle_number: '',
    transport_type: ''
  });

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
      console.error('Error loading language preference:', error);
    }
  };

  // Update form when preselectedCustomer changes
  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomer(preselectedCustomer);
      setVehicleForm(prev => ({
        ...prev,
        customer: preselectedCustomer.id.toString()
      }));
    }
  }, [preselectedCustomer]);

  // Fetch customers and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      await loadLanguagePreference();
      
      try {
        setLoading(true);
        const [customersResponse, brandsResponse] = await Promise.all([
          getCustomer(),
          getBrand()
        ]);
        
        setFilteredCustomers(customersResponse);
        setBrands(brandsResponse);
      } catch (error) {
        Alert.alert(t('failedAddVehicle'));
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

  const validateVehicleForm = () => {
    let valid = true;
    const newErrors = {};

    if (!vehicleForm.customer) {
      newErrors.customer = t('customerRequired');
      valid = false;
    }

    if (!vehicleForm.vehicle_type) {
      newErrors.vehicle_type = t('variantRequired');
      valid = false;
    }

    if (!vehicleForm.vehicle_model) {
      newErrors.vehicle_model = t('modelYearRequired');
      valid = false;
    } else if (parseInt(vehicleForm.vehicle_model) < 1980 || parseInt(vehicleForm.vehicle_model) > 2026) {
      newErrors.vehicle_model = t('validModelYear');
      valid = false;
    }

    if (!vehicleForm.vehicle_number) {
      newErrors.vehicle_number = t('vehicleNumberRequired');
      valid = false;
    }

    if (!vehicleForm.transport_type) {
      newErrors.transport_type = t('transportTypeRequired');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleVehicleSubmit = async () => {
    if (validateVehicleForm()) {
      try {
        setLoading(true);
        const vehicleData = {
          customer: vehicleForm.customer,
          vehicle_type: vehicleForm.vehicle_type,
          vehicle_model: parseInt(vehicleForm.vehicle_model), // Convert to integer
          vehicle_number: vehicleForm.vehicle_number,
          transport_type: vehicleForm.transport_type
        };
        
        const response = await addVehicle(vehicleData);
        Alert.alert(t('vehicleAdded'));
        
        // Reset form
        setVehicleForm({
          customer: '',
          vehicle_type: '',
          vehicle_model: '',
          vehicle_number: '',
          transport_type: ''
        });
        
        setSelectedBrand(null);
        setSelectedVariant(null);
        setSelectedCustomer(null);
        
        // Notify parent component
        if (onVehicleAdded) {
          onVehicleAdded(response);
        }
      } catch (error) {
        Alert.alert(t('failedAddVehicle'));
      } finally {
        setLoading(false);
      }
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setVehicleForm({
      ...vehicleForm,
      customer: customer.id.toString()
    });
    setShowCustomerSearch(false);
    setSearchQuery('');
  };

  const selectBrand = (brand) => {
    // Filter variants for the selected brand
    const brandVariants = brands.filter(item => item.brand.id === brand.id);
    setSelectedBrand(brand);
    setVariants(brandVariants);
    setShowBrandSelection(false);
    setShowVariantSelection(true);
  };

  const selectVariant = (variant) => {
    setSelectedVariant(variant);
    setVehicleForm({
      ...vehicleForm,
      vehicle_type: variant.id
    });
    setShowVariantSelection(false);
  };

  const selectTransportType = (transportType) => {
    setVehicleForm({
      ...vehicleForm,
      transport_type: transportType.value
    });
    setShowTransportSelection(false);
  };

  const selectYear = (year) => {
    setVehicleForm({
      ...vehicleForm,
      vehicle_model: year.toString()
    });
    setShowYearSelection(false);
  };

  // Helper function to get translated label for transport type
  const getTranslatedTransportType = (value) => {
    const transportType = TRANSPORT_TYPE_CHOICES.find(tt => tt.value === value);
    if (transportType) {
      return t(transportType.value);
    }
    return value;
  };

  // Group brands by brand id to avoid duplicates
  const uniqueBrands = brands.reduce((acc, item) => {
    if (!acc.find(brand => brand.id === item.brand.id)) {
      acc.push(item.brand);
    }
    return acc;
  }, []);

  return (
    <ScrollView 
      contentContainerStyle={[FormStyles.container, { paddingBottom: 50 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[FormStyles.formContainer, { marginTop: 0 }]}>
        <Text style={FormStyles.formTitle}>{t('addVehicleTitle')}</Text>
        
        {/* Customer Selection */}
        <View style={FormStyles.formGroup}>
          <Text style={FormStyles.label}>{t('customer')}</Text>
          <TouchableOpacity 
            style={[FormStyles.selector, errors.customer && FormStyles.inputError]}
            onPress={() => setShowCustomerSearch(true)}
          >
            {selectedCustomer ? (
              <Text style={FormStyles.selectedText}>{selectedCustomer.name}</Text>
            ) : (
              <Text style={FormStyles.placeholderText}>{t('selectCustomer')}</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {errors.customer ? <Text style={FormStyles.errorText}>{errors.customer}</Text> : null}
        </View>

        {/* Brand and Variant Selection */}
        <View style={FormStyles.formGroup}>
          <Text style={FormStyles.label}>{t('variant')}</Text>
          <TouchableOpacity 
            style={[FormStyles.selector, errors.vehicle_type && FormStyles.inputError]}
            onPress={() => setShowBrandSelection(true)}
          >
            {selectedVariant ? (
              <View style={FormStyles.selectedBrandContainer}>
                {selectedVariant.brand.image_url && (
                  <Image source={{ uri: selectedVariant.brand.image_url }} style={FormStyles.brandImage} />
                )}
                <Text style={FormStyles.selectedText}>{selectedVariant.full_name}</Text>
              </View>
            ) : (
              <Text style={FormStyles.placeholderText}>{t('selectVariant')}</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {errors.vehicle_type ? <Text style={FormStyles.errorText}>{errors.vehicle_type}</Text> : null}
        </View>

        {/* Vehicle Model Year Selection */}
        <View style={FormStyles.formGroup}>
          <Text style={FormStyles.label}>{t('vehicleModelYear')}</Text>
          <TouchableOpacity 
            style={[FormStyles.selector, errors.vehicle_model && FormStyles.inputError]}
            onPress={() => setShowYearSelection(true)}
          >
            {vehicleForm.vehicle_model ? (
              <Text style={FormStyles.selectedText}>{vehicleForm.vehicle_model}</Text>
            ) : (
              <Text style={FormStyles.placeholderText}>{t('selectModelYear')}</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {errors.vehicle_model ? <Text style={FormStyles.errorText}>{errors.vehicle_model}</Text> : null}
        </View>

        {/* Vehicle Number */}
        <View style={FormStyles.formGroup}>
          <Text style={FormStyles.label}>{t('vehicleNumber')}</Text>
          <TextInput
            style={[FormStyles.input, errors.vehicle_number && FormStyles.inputError]}
            placeholder={t('enterVehicleNumber')}
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
          <Text style={FormStyles.label}>{t('transportType')}</Text>
          <TouchableOpacity 
            style={[FormStyles.selector, errors.transport_type && FormStyles.inputError]}
            onPress={() => setShowTransportSelection(true)}
          >
            {vehicleForm.transport_type ? (
              <Text style={FormStyles.selectedText}>
                {getTranslatedTransportType(vehicleForm.transport_type)}
              </Text>
            ) : (
              <Text style={FormStyles.placeholderText}>{t('selectTransportType')}</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {errors.transport_type ? <Text style={FormStyles.errorText}>{errors.transport_type}</Text> : null}
        </View>

        {/* Full Width Add Vehicle Button */}
        <TouchableOpacity 
          style={[FormStyles.submitButton, { width: '100%', marginTop: 20 }, loading && FormStyles.submitButtonDisabled]} 
          onPress={handleVehicleSubmit}
          disabled={loading}
        >
          <Text style={FormStyles.submitButtonText}>
            {loading ? t('adding') : t('addVehicleButton')}
          </Text>
        </TouchableOpacity>
      </View>

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
      
      {/* Brand Selection Modal */}
      <Modal
        visible={showBrandSelection}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBrandSelection(false)}
      >
        <View style={FormStyles.modalContainer}>
          <View style={FormStyles.modalContent}>
            <Text style={FormStyles.modalTitle}>{t('selectBrandTitle')}</Text>
            
            <ScrollView style={FormStyles.brandGrid} contentContainerStyle={FormStyles.brandGridContent}>
              {uniqueBrands.map((brand) => (
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
              <Text style={FormStyles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Variant Selection Modal */}
      <Modal
        visible={showVariantSelection}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVariantSelection(false)}
      >
        <View style={FormStyles.modalContainer}>
          <View style={FormStyles.modalContent}>
            <Text style={FormStyles.modalTitle}>{t('selectVariantTitle')}</Text>
            
            <ScrollView style={FormStyles.modalList}>
              {variants.map((variant) => (
                <TouchableOpacity
                  key={variant.id}
                  style={FormStyles.modalItem}
                  onPress={() => selectVariant(variant)}
                >
                  <View style={FormStyles.variantItem}>
                    <View style={FormStyles.variantInfo}>
                      <Text style={FormStyles.modalItemName}>{variant.full_name}</Text>
                      <Text style={FormStyles.modalItemDetail}>{variant.body_type_display}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={FormStyles.closeButton}
              onPress={() => setShowVariantSelection(false)}
            >
              <Text style={FormStyles.closeButtonText}>{t('close')}</Text>
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
            <Text style={FormStyles.modalTitle}>{t('selectModelYearTitle')}</Text>
            
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
              <Text style={FormStyles.closeButtonText}>{t('close')}</Text>
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
            <Text style={FormStyles.modalTitle}>{t('selectTransportTypeTitle')}</Text>
            
            <ScrollView style={FormStyles.modalList}>
              {TRANSPORT_TYPE_CHOICES.map((transportType) => (
                <TouchableOpacity
                  key={transportType.value}
                  style={FormStyles.modalItem}
                  onPress={() => selectTransportType(transportType)}
                >
                  <Text style={FormStyles.modalItemName}>{t(transportType.value)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={FormStyles.closeButton}
              onPress={() => setShowTransportSelection(false)}
            >
              <Text style={FormStyles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}