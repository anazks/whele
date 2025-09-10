import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'accessToken';

// Base64 URL decode function for React Native
const base64UrlDecode = (str) => {
  // Replace URL-safe characters
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  while (str.length % 4) {
    str += '=';
  }
  
  try {
    // Use atob for base64 decoding (available in React Native)
    return atob(str);
  } catch (error) {
    console.log('Error decoding base64:', error);
    throw new Error('Invalid base64 encoding');
  }
};

export const ExtractToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log(token, "token");
    
    if (token) {
      // JWT format: header.payload.signature
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        console.warn('Invalid JWT token format');
        return null;
      }
      
      const base64Payload = parts[1];
      
      // Decode the payload using our custom function
      const decodedString = base64UrlDecode(base64Payload);
      const decodedPayload = JSON.parse(decodedString);
      
      console.log('Decoded JWT payload:', decodedPayload);
      return decodedPayload;
    } else {
      console.warn('No token found in AsyncStorage');
      return null;
    }
  } catch (error) {
    console.log('Error extracting token:', error);
    return null;
  }
};

// Alternative version using a library (if you want to install one)
// You can install: npm install react-native-base64
/*
import { decode as base64Decode } from 'react-native-base64';

export const ExtractTokenWithLibrary = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    if (token) {
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        console.warn('Invalid JWT token format');
        return null;
      }
      
      const base64Payload = parts[1];
      const decodedString = base64Decode(base64Payload);
      const decodedPayload = JSON.parse(decodedString);
      
      console.log('Decoded JWT payload:', decodedPayload);
      return decodedPayload;
    } else {
      console.warn('No token found in AsyncStorage');
      return null;
    }
  } catch (error) {
    console.log('Error extracting token:', error);
    return null;
  }
};
*/