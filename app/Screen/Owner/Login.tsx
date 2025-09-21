import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Dologin } from '../../api/Services/AuthService';

type Credentials = {
  email: string;
  password: string;
};

export default function Login() {
 
    const [hasToken, setHasToken] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      email: !credentials.email ? 'Email is required' : '',
      password: !credentials.password ? 'Password is required' : '',
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleChange = (name: keyof Credentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in SecureStore (more secure than AsyncStorage)
        const token = await AsyncStorage.getItem('accessToken');
        
        if (token) {
          setHasToken(true);
        } else {
          setHasToken(false);
        }
      } catch (error) {
        setHasToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await Dologin(credentials);
        console.log(response,"response from login....")
      if (response.status === 200) {
        await Promise.all([
          AsyncStorage.setItem('accessToken', response.data.access),
          AsyncStorage.setItem('refreshToken', response.data.refresh)
        ]);
        router.replace('/(tabs)/Home');
      } else {
        Alert.alert(
          'Login Failed',
           'Invalid email or password'
        );
      }
    } catch (error) {
      Alert.alert(
        'Login Failed',
        'Invalid email or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // router.push('/Auth/ForgotPassword'); // Update with your forgot password route
  };

  const handleSignUp = () => {
    router.push('/Screen/Owner/Register'); // Update with your register route
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.content}>
        {/* Logo/Header Section */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/logo.jpg')} // Update with your logo path
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="App Logo"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to manage your service center</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email or Mobile"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={credentials.email}
              onChangeText={(text) => handleChange('email', text)}
              accessibilityLabel="Email input"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordInputContainer, errors.password && styles.inputError]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={credentials.password}
                onChangeText={(text) => handleChange('password', text)}
                accessibilityLabel="Password input"
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
            accessibilityLabel="Forgot password button"
          >
            {/* <Text style={styles.forgotPasswordText}>Forgot Password?</Text> */}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityLabel="Sign in button"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer/Sign Up Option */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpText}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 12,
    marginTop: 4,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  showPasswordButton: {
    padding: 14,
  },
  showPasswordText: {
    color: '#4299e1',
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4299e1',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#1a365d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#718096',
  },
  signUpText: {
    color: '#1a365d',
    fontWeight: '600',
  },
});