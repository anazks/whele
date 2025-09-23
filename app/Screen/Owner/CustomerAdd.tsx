import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addCustomer } from '../../api/Services/management';
import AddVehicle from './AddVehicle';

const FormStyles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    width: '90%',
    maxWidth: 500,
    height: '80%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#f8fafc',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    backgroundColor: '#cbd5e1',
  },

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepCircleActive: { backgroundColor: '#3b82f6' },
  stepCircleCompleted: { backgroundColor: '#10b981' },
  stepNumber: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  stepNumberActive: { color: '#ffffff' },
  stepText: { fontSize: 13, color: '#64748b', flex: 1 },
  stepTextActive: { color: '#3b82f6', fontWeight: '600' },
  stepTextCompleted: { color: '#10b981', fontWeight: '600' },
  progressLine: { height: 1.5, backgroundColor: '#e5e7eb', flex: 1, marginHorizontal: 4 },
  progressLineCompleted: { backgroundColor: '#10b981' },

  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerSection: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
    textAlign: 'left',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'left',
    lineHeight: 20,
  },

  inputSection: {
    paddingHorizontal: 4,
    paddingBottom: 20,
    flex: 1,
  },
  formGroup: { marginBottom: 24 },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#374151', 
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: { position: 'relative' },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: { 
    borderColor: '#3b82f6', 
    backgroundColor: '#f8faff',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: { 
    borderColor: '#ef4444', 
    backgroundColor: '#fef2f2',
    shadowColor: '#ef4444',
    shadowOpacity: 0.1,
  },
  inputIcon: { 
    position: 'absolute', 
    right: 16, 
    top: 18,
    zIndex: 1,
  },
  errorText: { 
    color: '#ef4444', 
    fontSize: 13, 
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },

  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: { 
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8,
    letterSpacing: 0.5,
  },

  successContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 20,
    margin: 4,
    marginBottom: 16,
  },
  successIcon: {
    alignSelf: 'center',
    marginBottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#065f46', 
    textAlign: 'center', 
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  summaryCard: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 8,
    padding: 16, 
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryRow: { 
    flexDirection: 'row', 
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#6b7280', 
    width: 80,
    letterSpacing: 0.2,
  },
  summaryValue: { 
    fontSize: 14, 
    color: '#1f2937', 
    flex: 1,
    fontWeight: '500',
  },

  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 18,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addVehicleButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 15, 
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  vehicleModalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  vehicleModalContent: { 
    backgroundColor: '#fff', 
    width: '95%', 
    maxHeight: '85%',
    borderRadius: 16,
  },
  vehicleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  vehicleModalTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1e293b', 
    flex: 1 
  },
  vehicleCloseButton: { 
    width: 28, 
    height: 28, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
  },
});

export default function CustomerAdd({ 
  visible = false, 
  onClose, 
  prefilledPhone = '' 
}) {
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [customerForm, setCustomerForm] = useState({ phone: '', name: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [savedCustomer, setSavedCustomer] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [closeButtonPressed, setCloseButtonPressed] = useState(false);

  const translations = {
    english: {
      step1: 'Customer Info',
      step2: 'Add Vehicle',
      step3: 'Add Service',
      addNewCustomer: 'Add New Customer',
      customerSubtitle: 'Enter basic customer information to get started',
      fullName: 'Full Name *',
      enterCustomerName: 'Enter customer full name',
      phoneNumber: 'Phone Number *',
      enterPhoneNumber: 'Enter 10-digit phone number',
      nextButton: 'Add Customer',
      adding: 'Saving...',
      customerAdded: 'Customer Added Successfully!',
      failedAddCustomer: 'Failed to add customer. Please try again.',
      nameRequired: 'Full name is required',
      phoneRequired: 'Phone number is required',
      validPhone: 'Enter a valid 10-15 digit phone number',
      addVehicle: 'Add Vehicle',
      customerSaved: 'Customer information saved successfully',
      nextAddVehicle: "Next: Add customer's vehicle",
    },
  };

  const t = (key) => translations[currentLanguage][key] || key;

  const steps = [
    { number: 1, title: t('step1') },
    { number: 2, title: t('step2') },
    { number: 3, title: t('step3') }
  ];

  useEffect(() => {
    if (visible) {
      setCustomerForm({ phone: prefilledPhone || '', name: '' });
      setErrors({});
      setSavedCustomer(null);
      setCurrentStep(1);
      setFocusedField(null);
    }
  }, [visible, prefilledPhone]);

  useEffect(() => {
    (async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      } catch {}
    })();
  }, []);

  const handleCustomerChange = (field, value) => {
    setCustomerForm({ ...customerForm, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validateCustomerForm = () => {
    const newErrors = {};
    let valid = true;
    if (!customerForm.phone.trim()) {
      newErrors.phone = t('phoneRequired');
      valid = false;
    } else if (!/^\d{10,15}$/.test(customerForm.phone.replace(/\D/g, ''))) {
      newErrors.phone = t('validPhone');
      valid = false;
    }
    if (!customerForm.name.trim()) {
      newErrors.name = t('nameRequired');
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleCustomerSubmit = async () => {
    if (!validateCustomerForm()) return;
    setLoading(true);
    try {
      const response = await addCustomer(customerForm);
      if (response && response.id) {
        const customer = { id: response.id, name: customerForm.name, phone: customerForm.phone };
        setSavedCustomer(customer);
        setCurrentStep(2);
        Alert.alert(t('customerAdded'), t('nextAddVehicle'), [
          { text: 'OK', onPress: () => setShowAddVehicleModal(true) }
        ]);
      }
    } catch {
      Alert.alert('Error', t('failedAddCustomer'));
    }
    setLoading(false);
  };

  const handleVehicleAdded = () => {
    setShowAddVehicleModal(false);
    setCurrentStep(3);
    onClose?.();
    router.push({
      pathname: '/Screen/Owner/AddService',
      params: {
        customerId: savedCustomer.id.toString(),
        customerName: savedCustomer.name,
        customerPhone: savedCustomer.phone
      }
    });
  };

  const handleClose = () => {
    setSavedCustomer(null);
    setCustomerForm({ phone: '', name: '' });
    setErrors({});
    setCurrentStep(1);
    onClose?.();
  };

  const renderCustomerForm = () => (
    <KeyboardAvoidingView 
      style={FormStyles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={FormStyles.formContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={FormStyles.headerSection}>
          <Text style={FormStyles.formSubtitle}>{t('customerSubtitle')}</Text>
        </View>
        <View style={FormStyles.inputSection}>
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>{t('phoneNumber')}</Text>
            <View style={FormStyles.inputContainer}>
              <TextInput
                style={[
                  FormStyles.input,
                  focusedField === 'phone' && FormStyles.inputFocused,
                  errors.phone && FormStyles.inputError
                ]}
                placeholder={t('enterPhoneNumber')}
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={customerForm.phone}
                onChangeText={(text) => handleCustomerChange('phone', text.replace(/\D/g, ''))}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                maxLength={15}
                returnKeyType="next"
              />
              <View style={FormStyles.inputIcon}>
                <MaterialIcons name="phone" size={22} color={focusedField === 'phone' ? '#3b82f6' : '#9ca3af'} />
              </View>
            </View>
            {errors.phone ? <Text style={FormStyles.errorText}>{errors.phone}</Text> : null}
          </View>
          <View style={FormStyles.formGroup}>
            <Text style={FormStyles.label}>{t('fullName')}</Text>
            <View style={FormStyles.inputContainer}>
              <TextInput
                style={[
                  FormStyles.input,
                  focusedField === 'name' && FormStyles.inputFocused,
                  errors.name && FormStyles.inputError
                ]}
                placeholder={t('enterCustomerName')}
                placeholderTextColor="#9ca3af"
                value={customerForm.name}
                onChangeText={(text) => handleCustomerChange('name', text)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                maxLength={100}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleCustomerSubmit}
              />
              <View style={FormStyles.inputIcon}>
                <MaterialIcons name="person" size={22} color={focusedField === 'name' ? '#3b82f6' : '#9ca3af'} />
              </View>
            </View>
            {errors.name ? <Text style={FormStyles.errorText}>{errors.name}</Text> : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderSuccessState = () => (
    <ScrollView style={FormStyles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={FormStyles.successContainer}>
        <View style={FormStyles.successIcon}>
          <MaterialIcons name="check" size={32} color="#ffffff" />
        </View>
        <Text style={FormStyles.successTitle}>{t('customerSaved')}</Text>
        <View style={FormStyles.summaryCard}>
          <View style={FormStyles.summaryRow}>
            <Text style={FormStyles.summaryLabel}>Name:</Text>
            <Text style={FormStyles.summaryValue}>{savedCustomer.name}</Text>
          </View>
          <View style={FormStyles.summaryRow}>
            <Text style={FormStyles.summaryLabel}>Phone:</Text>
            <Text style={FormStyles.summaryValue}>{savedCustomer.phone}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={FormStyles.addVehicleButton}
          onPress={() => setShowAddVehicleModal(true)}
        >
          <MaterialIcons name="directions-car" size={20} color="#ffffff" />
          <Text style={FormStyles.addVehicleButtonText}>{t('addVehicle')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={FormStyles.modalOverlay}>
        <View style={FormStyles.modalContainer}>
          <View style={FormStyles.modalHeader}>
            <Text style={FormStyles.modalTitle}>{t('addNewCustomer')}</Text>
            <TouchableOpacity
              style={[
                FormStyles.closeButton,
                closeButtonPressed && FormStyles.closeButtonPressed
              ]}
              onPress={handleClose}
              onPressIn={() => setCloseButtonPressed(true)}
              onPressOut={() => setCloseButtonPressed(false)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={FormStyles.container}>
            {!savedCustomer ? renderCustomerForm() : renderSuccessState()}
            {!savedCustomer && (
              <View style={FormStyles.buttonContainer}>
                <TouchableOpacity
                  style={[FormStyles.nextButton, loading && FormStyles.nextButtonDisabled]}
                  onPress={handleCustomerSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name={loading ? "hourglass-empty" : "person-add"} size={22} color="#ffffff" />
                  <Text style={FormStyles.nextButtonText}>
                    {loading ? t('adding') : t('nextButton')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      <Modal
        visible={showAddVehicleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddVehicleModal(false)}
      >
        <View style={FormStyles.vehicleModalOverlay}>
          <View style={FormStyles.vehicleModalContent}>
            <View style={FormStyles.vehicleModalHeader}>
              <Text style={FormStyles.vehicleModalTitle}>
                {t('addVehicle')} - {savedCustomer?.name}
              </Text>
              <TouchableOpacity
                style={FormStyles.vehicleCloseButton}
                onPress={() => setShowAddVehicleModal(false)}
              >
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <AddVehicle
              onVehicleAdded={handleVehicleAdded}
              onCancel={() => setShowAddVehicleModal(false)}
              preselectedCustomer={savedCustomer}
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
}