import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';

import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // If token exists, redirect to tabs
  if (hasToken) {
    return <Redirect href="/(tabs)/Home" />;
  }

  // If no token, redirect to auth screen
  return <Redirect href="/Home" />;
}