import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addVehicle, getBrand, getCustomer } from '../../api/Services/management';
import { translations } from '../../Languge/Languages';


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
  return years.reverse();
};

const YEAR_OPTIONS = generateYearOptions();


// Clean Professional Styles
const styles = {
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#d1d1d1',
    paddingVertical: 10,
    minHeight: 48,
  },
  selectorError: {
    borderColor: '#e53e3e',
  },
  selectedText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
    flex: 1,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#d1d1d1',
    paddingVertical: 10,
    fontSize: 16,
    color: '#1a1a1a',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#a1a1aa',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#d1d1d1',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1a1a1a',
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  modalItemDetail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: '#a1a1aa',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  brandImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
};


// Reusable Modal Component
const SelectionModal = ({ visible, onClose, title, data, onSelect, renderItem, search, onSearch }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {search && (
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder={search.placeholder}
                placeholderTextColor="#999"
                value={search.value}
                onChangeText={onSearch}
              />
            </View>
          )}
          <ScrollView style={styles.modalList}>
            {data.map((item) => (
              <TouchableOpacity
                key={item.id || item.value || item.toString()}
                style={styles.modalItem}
                onPress={() => onSelect(item)}
              >
                {renderItem(item)}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{translations.english.close}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


// Main Component
export default function AddVehicle({ onVehicleAdded, preselectedCustomer = null }) {
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState({
    customer: false,
    brand: false,
    variant: false,
    transport: false,
    year: false,
  });
  const [selectedCustomer, setSelectedCustomer] = useState(preselectedCustomer);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [vehicleForm, setVehicleForm] = useState({
    customer: preselectedCustomer ? preselectedCustomer.id.toString() : '',
    vehicle_type: '',
    vehicle_model: '',
    vehicle_number: '',
    transport_type: '',
  });

  const t = (key) => translations[currentLanguage][key] || key;

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) setCurrentLanguage(savedLanguage);
    } catch (error) {
      console.log('Error loading language preference:', error);
    }
  };

  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomer(preselectedCustomer);
      setVehicleForm((prev) => ({ ...prev, customer: preselectedCustomer.id.toString() }));
    }
  }, [preselectedCustomer]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customersResponse, brandsResponse] = await Promise.all([getCustomer(), getBrand()]);
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

  useEffect(() => {
    if (searchQuery) {
      const filtered = filteredCustomers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery) ||
          (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery]);

  const handleVehicleChange = (name, value) => {
    setVehicleForm({ ...vehicleForm, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateVehicleForm = () => {
    const newErrors = {};
    let valid = true;

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
    if (!validateVehicleForm()) return;
    setLoading(true);
    try {
      const vehicleData = {
        customer: vehicleForm.customer,
        vehicle_type: vehicleForm.vehicle_type,
        vehicle_model: parseInt(vehicleForm.vehicle_model),
        vehicle_number: vehicleForm.vehicle_number,
        transport_type: vehicleForm.transport_type,
      };
      const response = await addVehicle(vehicleData);
      Alert.alert(t('Vehicle Added Successfully!'));
      setVehicleForm({
        customer: '',
        vehicle_type: '',
        vehicle_model: '',
        vehicle_number: '',
        transport_type: '',
      });
      setSelectedBrand(null);
      setSelectedVariant(null);
      setSelectedCustomer(null);
      if (onVehicleAdded) onVehicleAdded(response);
    } catch (error) {
      Alert.alert(t('failedAddVehicle'));
    } finally {
      setLoading(false);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setVehicleForm({ ...vehicleForm, customer: customer.id.toString() });
    setModalState({ ...modalState, customer: false });
    setSearchQuery('');
  };

  const selectBrand = (brand) => {
    const brandVariants = brands.filter((item) => item.brand.id === brand.id);
    setSelectedBrand(brand);
    setVariants(brandVariants);
    setModalState({ ...modalState, brand: false, variant: true });
  };

  const selectVariant = (variant) => {
    setSelectedVariant(variant);
    setVehicleForm({ ...vehicleForm, vehicle_type: variant.id });
    setModalState({ ...modalState, variant: false });
  };

  const selectTransportType = (transportType) => {
    setVehicleForm({ ...vehicleForm, transport_type: transportType.value });
    setModalState({ ...modalState, transport: false });
  };

  const selectYear = (year) => {
    setVehicleForm({ ...vehicleForm, vehicle_model: year.toString() });
    setModalState({ ...modalState, year: false });
  };

  const getTranslatedTransportType = (value) => {
    const transportType = TRANSPORT_TYPE_CHOICES.find((tt) => tt.value === value);
    return transportType ? t(transportType.value) : value;
  };

  const uniqueBrands = brands.reduce((acc, item) => {
    if (!acc.find((brand) => brand.id === item.brand.id)) {
      acc.push(item.brand);
    }
    return acc;
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled"
      bounces
    >
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>{t('Add Vehicle')}</Text>

        {/* Customer */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('customer')}</Text>
          <TouchableOpacity
            style={[styles.selector, errors.customer && styles.selectorError]}
            onPress={() => setModalState({ ...modalState, customer: true })}
          >
            <Text style={[styles.selectedText, !selectedCustomer && styles.placeholderText]}>
              {selectedCustomer ? selectedCustomer.name : t('selectCustomer')}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {errors.customer && <Text style={styles.errorText}>{errors.customer}</Text>}
        </View>

        {/* Variant */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('variant')}</Text>
          <TouchableOpacity
            style={[styles.selector, errors.vehicle_type && styles.selectorError]}
            onPress={() => setModalState({ ...modalState, brand: true })}
          >
            {selectedVariant ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {selectedVariant.brand.image_url && (
                  <Image source={{ uri: selectedVariant.brand.image_url }} style={styles.brandImage} />
                )}
                <Text style={styles.selectedText}>{selectedVariant.full_name}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>{t('selectVariant')}</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {errors.vehicle_type && <Text style={styles.errorText}>{errors.vehicle_type}</Text>}
        </View>

        {/* Model Year */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('Year')}</Text>
          <TouchableOpacity
            style={[styles.selector, errors.vehicle_model && styles.selectorError]}
            onPress={() => setModalState({ ...modalState, year: true })}
          >
            <Text style={[styles.selectedText, !vehicleForm.vehicle_model && styles.placeholderText]}>
              {vehicleForm.vehicle_model || t('Year')}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {errors.vehicle_model && <Text style={styles.errorText}>{errors.vehicle_model}</Text>}
        </View>

        {/* Vehicle Number */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('Vehicle Number')}</Text>
          <TextInput
            style={[styles.input, errors.vehicle_number && styles.inputError]}
            placeholder={t('enterVehicleNumber')}
            placeholderTextColor="#999"
            value={vehicleForm.vehicle_number}
            onChangeText={(text) => handleVehicleChange('vehicle_number', text.toUpperCase())}
            maxLength={20}
            autoCapitalize="characters"
          />
          {errors.vehicle_number && <Text style={styles.errorText}>{errors.vehicle_number}</Text>}
        </View>

        {/* Transport Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('Type')}</Text>
          <TouchableOpacity
            style={[styles.selector, errors.transport_type && styles.selectorError]}
            onPress={() => setModalState({ ...modalState, transport: true })}
          >
            <Text style={[styles.selectedText, !vehicleForm.transport_type && styles.placeholderText]}>
              {vehicleForm.transport_type ? getTranslatedTransportType(vehicleForm.transport_type) : t('selectTransportType')}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {errors.transport_type && <Text style={styles.errorText}>{errors.transport_type}</Text>}
        </View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleVehicleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>{loading ? t('adding') : t('Add')}</Text>
        </TouchableOpacity>
      </View>

      {/* Customer Modal */}
      <SelectionModal
        visible={modalState.customer}
        onClose={() => setModalState({ ...modalState, customer: false })}
        title={t('selectCustomerTitle')}
        data={filteredCustomers}
        onSelect={selectCustomer}
        search={{ placeholder: t('searchCustomer'), value: searchQuery }}
        onSearch={setSearchQuery}
        renderItem={(customer) => (
          <View>
            <Text style={styles.modalItemName}>{customer.name}</Text>
            <Text style={styles.modalItemDetail}>{customer.phone}</Text>
            {customer.email && <Text style={styles.modalItemDetail}>{customer.email}</Text>}
          </View>
        )}
      />

      {/* Brand Modal */}
      <SelectionModal
        visible={modalState.brand}
        onClose={() => setModalState({ ...modalState, brand: false })}
        title={t('selectBrandTitle')}
        data={uniqueBrands}
        onSelect={selectBrand}
        renderItem={(brand) => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {brand.image_url && <Image source={{ uri: brand.image_url }} style={styles.brandImage} />}
            <Text style={styles.modalItemName}>{brand.name}</Text>
          </View>
        )}
      />

      {/* Variant Modal */}
      <SelectionModal
        visible={modalState.variant}
        onClose={() => setModalState({ ...modalState, variant: false })}
        title={t('selectVariantTitle')}
        data={variants}
        onSelect={selectVariant}
        renderItem={(variant) => (
          <View>
            <Text style={styles.modalItemName}>{variant.full_name}</Text>
            <Text style={styles.modalItemDetail}>{variant.body_type_display}</Text>
          </View>
        )}
      />

      {/* Year Modal */}
      <SelectionModal
        visible={modalState.year}
        onClose={() => setModalState({ ...modalState, year: false })}
        title={t('selectModelYearTitle')}
        data={YEAR_OPTIONS}
        onSelect={selectYear}
        renderItem={(year) => <Text style={styles.modalItemName}>{year}</Text>}
      />

      {/* Transport Type Modal */}
      <SelectionModal
        visible={modalState.transport}
        onClose={() => setModalState({ ...modalState, transport: false })}
        title={t('selectTransportTypeTitle')}
        data={TRANSPORT_TYPE_CHOICES}
        onSelect={selectTransportType}
        renderItem={(transportType) => (
          <Text style={styles.modalItemName}>{t(transportType.value)}</Text>
        )}
      />
    </ScrollView>
  );
}
