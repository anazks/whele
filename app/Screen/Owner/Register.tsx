import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

// Professional color palette
const colors = {
  primary: '#1a365d',
  secondary: '#2d3748',
  accent: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: {
    primary: '#1a202c',
    secondary: '#4a5568',
    light: '#718096'
  }
};

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
        {/* Professional Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="business" size={32} color="white" />
              </View>
              <Text style={styles.header}>Service Center Registration</Text>
              <Text style={styles.subHeader}>Create your professional account</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Business Information</Text>
            <Text style={styles.formSubtitle}>Please provide accurate details for verification</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              <MaterialIcons name="business" size={16} color={colors.text.secondary} />
              {' '}Service Center Name*
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('name')}
                placeholder="Enter service center name"
                placeholderTextColor="#94a3b8"
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
            <Text style={styles.label}>
              <MaterialIcons name="location-on" size={16} color={colors.text.secondary} />
              {' '}Business Address*
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('address')}
                placeholder="Enter complete business address"
                placeholderTextColor="#94a3b8"
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
            <Text style={styles.label}>
              <MaterialIcons name="email" size={16} color={colors.text.secondary} />
              {' '}Official Email*
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('email')}
                placeholder="Enter business email address"
                placeholderTextColor="#94a3b8"
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
            <Text style={styles.label}>
              <MaterialIcons name="phone" size={16} color={colors.text.secondary} />
              {' '}Contact Number
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('phone')}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#94a3b8"
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

          <View style={styles.securitySection}>
            <Text style={styles.sectionTitle}>Security Credentials</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                <MaterialIcons name="lock" size={16} color={colors.text.secondary} />
                {' '}Password*
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={getInputStyle('password')}
                  placeholder="Create a strong password (min. 8 characters)"
                  placeholderTextColor="#94a3b8"
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
              <Text style={styles.label}>
                <MaterialIcons name="lock-outline" size={16} color={colors.text.secondary} />
                {' '}Confirm Password*
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={getInputStyle('confirm_password')}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#94a3b8"
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
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.registerButton, buttonPressed && styles.registerButtonPressed]} 
            onPress={handleSubmit}
            onPressIn={() => setButtonPressed(true)}
            onPressOut={() => setButtonPressed(false)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialIcons name="business-center" size={22} color="white" />
              <Text style={styles.registerButtonText}>Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already registered? </Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/Screen/Owner/Login');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Sign In →</Text>
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
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  headerContainer: {
    marginBottom: 30,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 25,
  },
  formHeader: {
    marginBottom: 30,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.text.light,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  securitySection: {
    marginTop: 10,
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    backgroundColor: '#fafbfc',
    color: colors.text.primary,
    minHeight: 56,
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  inputFilled: {
    borderColor: colors.success,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: '#fef7f7',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
    marginLeft: 4,
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  registerButton: {
    borderRadius: 18,
    marginBottom: 25,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 18,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loginText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});