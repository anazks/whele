import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { register } from '../../api/Services/AuthService';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });

  const [focusedField, setFocusedField] = useState('');
  const [buttonPressed, setButtonPressed] = useState(false);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      address: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    if (formData.phone && !/^\+?[0-9\s-]{10,17}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      console.log('Form submitted:', formData);
      try {
        let response = await register(formData);
        console.log(response);
        
        if (response.success === true) {
          // Show success alert with the message
          Alert.alert(
            'Success',
            response.message || 'Registration successful!',
            [
              { 
                text: 'OK', 
                onPress: () => router.push('/Screen/Owner/Login') 
              }
            ]
          );
        } else {
          // Show error alert if registration failed
          Alert.alert(
            'Registration Failed',
            response.message || 'Please try again later.'
          );
        }
      } catch (error) {
        console.error('Registration error:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred. Please try again.'
        );
      }
    }
  };

  const getInputStyle = (fieldName) => [
    styles.input,
    focusedField === fieldName && styles.inputFocused,
    errors[fieldName] && styles.inputError,
    formData[fieldName] && styles.inputFilled
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerBackground}>
            <Text style={styles.header}>Register Service Center</Text>
            <Text style={styles.subHeader}>Create your admin account</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Center Name*</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('name')}
                placeholder="Enter service center name"
                placeholderTextColor="#9ca3af"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                maxLength={255}
              />
            </View>
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address*</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('address')}
                placeholder="Enter complete address"
                placeholderTextColor="#9ca3af"
                value={formData.address}
                onChangeText={(text) => handleChange('address', text)}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField('')}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email*</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('email')}
                placeholder="Enter official email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('phone')}
                placeholder="Enter phone number (international format)"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField('')}
                maxLength={17}
              />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password*</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('password')}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
              />
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Password*</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('confirm_password')}
                placeholder="Re-enter your password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={formData.confirm_password}
                onChangeText={(text) => handleChange('confirm_password', text)}
                onFocus={() => setFocusedField('confirm_password')}
                onBlur={() => setFocusedField('')}
              />
            </View>
            {errors.confirm_password ? (
              <Text style={styles.errorText}>{errors.confirm_password}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.registerButton, buttonPressed && styles.registerButtonPressed]} 
            onPress={handleSubmit}
            onPressIn={() => setButtonPressed(true)}
            onPressOut={() => setButtonPressed(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/Screen/Owner/Login');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  headerContainer: {
    marginBottom: 35,
    marginTop: 20,
  },
  headerBackground: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 5,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 10,
  },
  formGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    minHeight: 52,
    transition: 'all 0.2s ease',
  },
  inputFocused: {
    borderColor: '#3b82f6',
    backgroundColor: '#ffffff',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    transform: [{ scale: 1.01 }],
  },
  inputFilled: {
    borderColor: '#10b981',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 5,
  },
  registerButton: {
    backgroundColor: '#1a365d',
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 6,
    shadowColor: '#1a365d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 10,
  },
  registerButtonPressed: {
    backgroundColor: '#2d3748',
    transform: [{ scale: 0.98 }],
    elevation: 3,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    marginTop: 15,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loginText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
  },
  loginLink: {
    color: '#1a365d',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});