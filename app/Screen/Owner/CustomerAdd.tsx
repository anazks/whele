import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addCustomer } from '../../api/Services/management';

// Updated Form Styles without shadows
const FormStyles = {
  container: {
    flexGrow: 1,
    marginTop: 40,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 6,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
};

export default function CustomerAdd() {
  const [currentLanguage, setCurrentLanguage] = useState('english');

  // Translations for the customer add screen
  const translations = {
    english: {
      addCustomer: "Add Customer",
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
    },
    hindi: {
      addCustomer: "ग्राहक जोड़ें",
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
    }
  };

  // Translation function
  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  // Load language preference from localStorage
  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.log('Error loading language preference:', error);
    }
  };

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load language preference on component mount
  useEffect(() => {
    loadLanguagePreference();
  }, []);

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

  const handleCustomerSubmit = async () => {
    if (validateCustomerForm()) {
      try {
        setLoading(true);
        const response = await addCustomer(customerForm); 
        console.log(response,"---response");       
        if (response && response.id) {
          alert(t('customerAdded'));
          
          // Reset form
          setCustomerForm({
            name: '',
            phone: '',
            email: ''
          });
          
          // Navigate to home tab after successful customer addition
          router.push('/(tabs)/Home');
        }
      } catch (error) {
        alert(t('Mobile number Exists'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={FormStyles.container}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
    >
      {/* Customer Form */}
      <View style={FormStyles.formContainer}>
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
    </ScrollView>
  );
}