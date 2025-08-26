import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../api/Auth/authContext'; // Adjust path as needed

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const { logout } = useAuth(); // Get the logout function from your AuthContext

  const settingsOptions = [
    {
      title: "Support",
      icon: <MaterialIcons name="help-outline" size={24} color="#4a7cff" />,
      items: [
        { 
          name: "Help Center", 
          icon: <Ionicons name="help-circle-outline" size={22} color="#666" />,
          screen: "../Screen/General/HelpCenter" // Add screen path
        },
        { 
          name: "Contact Us", 
          icon: <Ionicons name="mail-outline" size={22} color="#666" />,
          screen: "../Screen/General/Contact" // Add screen path
        },
        { 
          name: "Terms & Privacy", 
          icon: <Ionicons name="document-text-outline" size={22} color="#666" />,
          screen: "../Screen/General/Terms" // Add screen path
        },
      ]
    },
    {
      title: "About",
      icon: <MaterialIcons name="info-outline" size={24} color="#4a7cff" />,
      items: [
        { 
          name: "App Version", 
          icon: <Ionicons name="phone-portrait-outline" size={22} color="#666" />, 
          rightText: "1.0.0" 
        },
      ]
    }
  ];

  const handleItemPress = (screen) => {
    if (screen) {
      router.push(screen);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          onPress: async () => {
            try {
              // Clear tokens from AsyncStorage
              await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
              
              // Call the context logout function if available
              if (logout) {
                await logout();
              }
              
              // Navigate to login screen and clear navigation history
              router.replace('/Screen/Owner/Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.headerTitle}>Settings</Text> */}
      </View>

      {settingsOptions.map((section, index) => (
        <View key={index} style={styles.section}>
          <View style={styles.sectionHeader}>
            {section.icon}
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          
          <View style={styles.sectionItems}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={itemIndex} 
                style={[
                  styles.item, 
                  itemIndex !== section.items.length - 1 && styles.itemWithBorder
                ]}
                onPress={() => handleItemPress(item.screen)}
              >
                <View style={styles.itemLeft}>
                  {item.icon}
                  <Text style={styles.itemText}>{item.name}</Text>
                </View>
                
                {item.rightComponent ? (
                  item.rightComponent
                ) : item.rightText ? (
                  <Text style={styles.rightText}>{item.rightText}</Text>
                ) : (
                  <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Wheel Service Pro</Text>
        <Text style={styles.footerText}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  sectionItems: {
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  itemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  rightText: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderColor: '#ff3b30',
    borderWidth: 1,
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
});