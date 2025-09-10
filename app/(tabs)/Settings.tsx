import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../api/Auth/authContext'; // Adjust path as needed

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [currentLanguage, setCurrentLanguage] = React.useState('english');
  const { logout } = useAuth(); // Get the logout function from your AuthContext

  // Translations for the settings screen
  const translations = {
    english: {
      support: "Support",
      helpCenter: "Help Center",
      contactUs: "Contact Us",
      termsPrivacy: "Terms & Privacy",
      about: "About",
      appVersion: "App Version",
      language: "Language",
      english: "English",
      hindi: "Hindi",
      logout: "Log Out",
      logoutConfirm: "Are you sure you want to log out?",
      cancel: "Cancel",
      error: "Error",
      logoutError: "Failed to log out. Please try again."
    },
    hindi: {
      support: "सहायता",
      helpCenter: "सहायता केंद्र",
      contactUs: "हमसे संपर्क करें",
      termsPrivacy: "नियम और गोपनीयता",
      about: "के बारे में",
      appVersion: "ऐप संस्करण",
      language: "भाषा",
      english: "अंग्रेज़ी",
      hindi: "हिंदी",
      logout: "लॉग आउट",
      logoutConfirm: "क्या आप वाकई लॉग आउट करना चाहते हैं?",
      cancel: "रद्द करें",
      error: "त्रुटि",
      logoutError: "लॉग आउट करने में विफल। कृपया पुनः प्रयास करें।"
    }
  };

  // Load language preference on component mount
  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const saveLanguagePreference = async (language) => {
    try {
      await AsyncStorage.setItem('appLanguage', language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  const settingsOptions = [
    {
      title: t("support"),
      icon: <MaterialIcons name="help-outline" size={24} color="#4a7cff" />,
      items: [
        { 
          name: t("helpCenter"), 
          icon: <Ionicons name="help-circle-outline" size={22} color="#666" />,
          screen: "../Screen/General/HelpCenter" // Add screen path
        },
        { 
          name: t("contactUs"), 
          icon: <Ionicons name="mail-outline" size={22} color="#666" />,
          screen: "../Screen/General/Contact" // Add screen path
        },
        { 
          name: t("termsPrivacy"), 
          icon: <Ionicons name="document-text-outline" size={22} color="#666" />,
          screen: "../Screen/General/Terms" // Add screen path
        },
      ]
    },
    {
      title: t("language"),
      icon: <MaterialIcons name="language" size={24} color="#4a7cff" />,
      items: [
        { 
          name: t("english"), 
          icon: <Ionicons name="language-outline" size={22} color="#666" />,
          rightComponent: (
            <TouchableOpacity onPress={() => saveLanguagePreference('english')}>
              <Ionicons 
                name={currentLanguage === 'english' ? "radio-button-on" : "radio-button-off"} 
                size={22} 
                color={currentLanguage === 'english' ? "#4a7cff" : "#666"} 
              />
            </TouchableOpacity>
          )
        },
        { 
          name: t("hindi"), 
          icon: <Ionicons name="language-outline" size={22} color="#666" />,
          rightComponent: (
            <TouchableOpacity onPress={() => saveLanguagePreference('hindi')}>
              <Ionicons 
                name={currentLanguage === 'hindi' ? "radio-button-on" : "radio-button-off"} 
                size={22} 
                color={currentLanguage === 'hindi' ? "#4a7cff" : "#666"} 
              />
            </TouchableOpacity>
          )
        },
      ]
    },
    {
      title: t("about"),
      icon: <MaterialIcons name="info-outline" size={24} color="#4a7cff" />,
      items: [
        { 
          name: t("appVersion"), 
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
      t("logout"),
      t("logoutConfirm"),
      [
        {
          text: t("cancel"),
          style: "cancel"
        },
        { 
          text: t("logout"), 
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
              Alert.alert(t("error"), t("logoutError"));
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
                disabled={!item.screen} // Disable press for non-navigable items
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
        <Text style={styles.logoutText}>{t("logout")}</Text>
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