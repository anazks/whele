import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Animated, Modal } from 'react-native';

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

// Color palette
const colors = {
  primary: '#1a365d',
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
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Animation values for success modal
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // --- Validation functions (unchanged) ---
  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return false;
    }
    const phonePatterns = [
      /^\+?1?[0-9]{10}$/,
      /^\+?[0-9]{10,15}$/,
      /^(\+\d{1,3}[- ]?)?\d{10}$/
    ];
    return phonePatterns.some(pattern => pattern.test(phone));
  };

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return {
      isValid: checks.length && (
        (checks.uppercase && checks.lowercase) ||
        (checks.number) ||
        (checks.special)
      ),
      checks
    };
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
      newErrors.name = 'Service center name is required';
      valid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
      valid = false;
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Business address is required';
      valid = false;
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please enter a complete address';
      valid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
      valid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }
    if (formData.phone.trim() && !validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, or numbers';
        valid = false;
      }
    }
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
      valid = false;
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const showSuccessPopup = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideSuccessPopup = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessModal(false);
      router.push('/Screen/Owner/Login');
    });
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        let response = await register(formData);
        if (response.success === true) {
          showSuccessPopup(response.message || 'Registration successful! Welcome to our platform.');
        } else {
          Alert.alert(
            'Registration Failed',
            response.message || 'Please check your information and try again.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      } catch (error) {
        Alert.alert(
          'Email Already Registered',
          'Unable To Register with this email. Please use a different email address or login if you already have an account.',
          [{ text: 'OK', style: 'default' }]
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getInputStyle = (fieldName) => [
    styles.input,
    focusedField === fieldName && styles.inputFocused,
    errors[fieldName] && styles.inputError
  ];

  const SuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent={true}
      animationType="none"
      onRequestClose={hideSuccessPopup}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <MaterialIcons name="check-circle" size={48} color={colors.success} />
          <Text style={styles.successTitle}>Registration Successful!</Text>
          <Text style={styles.successMessage}>{successMessage}</Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={hideSuccessPopup}
            activeOpacity={0.85}
            accessibilityLabel="Continue to login"
            accessibilityHint="Navigates to the login screen"
          >
            <Text style={styles.successButtonText}>Continue to Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

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
        accessible={true}
        accessibilityLabel="Registration form"
      >
        {/* Simple Header Area */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Service Center Registration</Text>
          <Text style={styles.subHeader}>Create your professional account</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Business Information</Text>
          <Text style={styles.formSubtitle}>Please provide accurate details for verification</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Center Name*</Text>
            <TextInput
              style={getInputStyle('name')}
              placeholder="Enter service center name"
              placeholderTextColor="#94a3b8"
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField('')}
              maxLength={255}
              accessibilityLabel="Service center name"
              accessibilityHint="Enter your business or service center name"
              accessibilityRequired={true}
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Address*</Text>
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
              accessibilityLabel="Business address"
              accessibilityHint="Enter your complete business address including city and state"
              accessibilityRequired={true}
            />
            {errors.address ? (
              <Text style={styles.errorText}>{errors.address}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Official Email*</Text>
            <TextInput
              style={getInputStyle('email')}
              placeholder="Enter business email address"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              accessibilityLabel="Email address"
              accessibilityHint="Enter your business email address"
              accessibilityRequired={true}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={getInputStyle('phone')}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              autoComplete="tel"
              value={formData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField('')}
              maxLength={17}
              accessibilityLabel="Phone number"
              accessibilityHint="Enter your contact phone number"
            />
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Security Credentials</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password*</Text>
            <TextInput
              style={getInputStyle('password')}
              placeholder="Create a strong password (min. 8 characters)"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoComplete="new-password"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              accessibilityLabel="Password"
              accessibilityHint="Create a password with at least 8 characters, including uppercase, lowercase, or numbers"
              accessibilityRequired={true}
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Password*</Text>
            <TextInput
              style={getInputStyle('confirm_password')}
              placeholder="Re-enter your password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoComplete="new-password"
              value={formData.confirm_password}
              onChangeText={(text) => handleChange('confirm_password', text)}
              onFocus={() => setFocusedField('confirm_password')}
              onBlur={() => setFocusedField('')}
              accessibilityLabel="Confirm password"
              accessibilityHint="Re-enter the same password to confirm"
              accessibilityRequired={true}
            />
            {errors.confirm_password ? (
              <Text style={styles.errorText}>{errors.confirm_password}</Text>
            ) : null}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.registerButton,
              buttonPressed && styles.registerButtonPressed,
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            onPressIn={() => setButtonPressed(true)}
            onPressOut={() => setButtonPressed(false)}
            activeOpacity={0.9}
            disabled={isLoading}
            accessibilityLabel="Create account"
            accessibilityHint="Submit the registration form to create your account"
            accessibilityState={{ disabled: isLoading }}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.registerButtonText}>Creating Account...</Text>
              </>
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already registered?</Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/Screen/Owner/Login');
              }}
              activeOpacity={0.7}
              accessibilityLabel="Sign in"
              accessibilityHint="Navigate to the login screen if you already have an account"
            >
              <Text style={styles.loginLink}>Sign In →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <SuccessModal />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingBottom: 60,
  },

  // Simple Header
  headerContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 36,
    alignItems: 'center',
    marginBottom: 18,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  subHeader: {
    fontSize: 14,
    color: '#e5e7eb',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 10,
    marginBottom: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 7,
    padding: 13,
    fontSize: 14,
    backgroundColor: 'white',
    color: colors.text.primary,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 2,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 7,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonPressed: {
    opacity: 0.9,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
  },
  loginText: {
    color: colors.text.secondary,
    fontSize: 13,
    marginRight: 2,
  },
  loginLink: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
  // Success Modal Simplified
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 22,
    alignItems: 'center',
    width: '88%',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 19,
  },
  successButton: {
    backgroundColor: colors.success,
    borderRadius: 7,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  successButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});
