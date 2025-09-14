import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
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
  container: {
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerSection: {
    marginBottom: 12,
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
    lineHeight: 18,
  },

  inputSection: {
    padding: 16,
    marginBottom: 16,
  },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputContainer: { position: 'relative' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  inputFocused: { borderColor: '#3b82f6', backgroundColor: '#f8faff' },
  inputError: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  inputIcon: { position: 'absolute', right: 12, top: 14 },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },

  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
  },
  nextButtonDisabled: { backgroundColor: '#9ca3af' },
  nextButtonText: { color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 },

  successContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 16,
    marginBottom: 16,
  },
  successIcon: {
    alignSelf: 'center',
    marginBottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 16, fontWeight: '700', color: '#065f46', textAlign: 'center', marginBottom: 8 },
  summaryCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 12, marginTop: 12 },
  summaryRow: { flexDirection: 'row', marginBottom: 6 },
  summaryLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', width: 70 },
  summaryValue: { fontSize: 13, color: '#1f2937', flex: 1 },

  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    marginTop: 14,
  },
  addVehicleButtonText: { color: '#fff', fontWeight: '600', fontSize: 15, marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '95%', maxHeight: '85%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', flex: 1 },
  closeButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb' },
});

export default function CustomerAdd({ prefilledPhone = '' }) {
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [customerForm, setCustomerForm] = useState({ phone: '', name: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [savedCustomer, setSavedCustomer] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

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
      nextButton: 'Next',
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
    setCustomerForm((form) => ({ ...form, phone: prefilledPhone || '' }));
  }, [prefilledPhone]);

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
    router.push({
      pathname: '/Screen/Owner/AddService',
      params: {
        customerId: savedCustomer.id.toString(),
        customerName: savedCustomer.name,
        customerPhone: savedCustomer.phone
      }
    });
  };

  const renderProgressBar = () => (
    <View style={FormStyles.progressContainer}>
      {/* <View style={FormStyles.progressBar}>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <View style={FormStyles.progressStep}>
              <View style={[
                FormStyles.stepCircle,
                currentStep === step.number && FormStyles.stepCircleActive,
                currentStep > step.number && FormStyles.stepCircleCompleted,
              ]}>
                {currentStep > step.number ? (
                  <MaterialIcons name="check" size={18} color="#ffffff" />
                ) : (
                  <Text style={[
                    FormStyles.stepNumber,
                    (currentStep === step.number || currentStep > step.number) && FormStyles.stepNumberActive,
                  ]}>
                    {step.number}
                  </Text>
                )}
              </View>
              <Text style={[
                FormStyles.stepText,
                currentStep === step.number && FormStyles.stepTextActive,
                currentStep > step.number && FormStyles.stepTextCompleted,
              ]}>
                {step.title}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                FormStyles.progressLine,
                currentStep > step.number && FormStyles.progressLineCompleted,
              ]} />
            )}
          </React.Fragment>
        ))}
      </View> */}
    </View>
  );

  const renderCustomerForm = () => (
    <ScrollView style={FormStyles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={FormStyles.headerSection}>
        <Text style={FormStyles.formTitle}>{t('addNewCustomer')}</Text>
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
            />
            <View style={FormStyles.inputIcon}>
              <MaterialIcons name="phone" size={20} color={focusedField === 'phone' ? '#3b82f6' : '#9ca3af'} />
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
            />
            <View style={FormStyles.inputIcon}>
              <MaterialIcons name="person" size={20} color={focusedField === 'name' ? '#3b82f6' : '#9ca3af'} />
            </View>
          </View>
          {errors.name ? <Text style={FormStyles.errorText}>{errors.name}</Text> : null}
        </View>
      </View>
    </ScrollView>
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
    <View style={FormStyles.container}>
      {renderProgressBar()}
      {!savedCustomer ? renderCustomerForm() : renderSuccessState()}
      {!savedCustomer && (
        <View style={FormStyles.buttonContainer}>
          <TouchableOpacity
            style={[FormStyles.nextButton, loading && FormStyles.nextButtonDisabled]}
            onPress={handleCustomerSubmit}
            disabled={loading}
          >
            <MaterialIcons name={loading ? "hourglass-empty" : "arrow-forward"} size={20} color="#ffffff" />
            <Text style={FormStyles.nextButtonText}>
              {loading ? t('adding') : t('nextButton')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={showAddVehicleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddVehicleModal(false)}
      >
        <View style={FormStyles.modalOverlay}>
          <View style={FormStyles.modalContent}>
            <View style={FormStyles.modalHeader}>
              <Text style={FormStyles.modalTitle}>
                {t('addVehicle')} - {savedCustomer?.name}
              </Text>
              <TouchableOpacity
                style={FormStyles.closeButton}
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
    </View>
  );
}
