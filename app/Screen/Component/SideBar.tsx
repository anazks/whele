import { useAuth } from '@/app/api/Auth/authContext'; // Ensure correct import path
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Translation object for English and Hindi
const translations = {
  english: {
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    error: 'Error',
    logoutError: 'Failed to logout. Please try again.',
    setNextKilometer: 'Set Next Service Kilometer',
    currentValue: 'Current Value',
    enterKilometer: 'Enter Next Service Kilometer',
    save: 'Save',
    languageSettings: 'Language Settings',
    selectLanguage: 'Select Language',
    apply: 'Apply',
    settings: 'Settings',
    helpSupport: 'Help & Support',
    vehicleManager: 'Vehicle Manager',
    professionalDashboard: 'Professional Dashboard',
    version: 'Version 1.0.0',
    language: 'Language',
    name: 'Name',
    phone: 'Phone',
    department: 'Department',
    employeeId: 'Employee ID',
    nextService: 'Next Service',
    success: 'Success',
    kilometerSaved: 'Next service kilometer saved successfully',
    languageChanged: 'Language changed to',
    failedSaveKilometer: 'Failed to save service interval',
    invalidKilometer: 'Please enter a valid kilometer value',
  },
  hindi: {
    logout: 'लॉगआउट',
    logoutConfirm: 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
    cancel: 'रद्द करें',
    error: 'त्रुटि',
    logoutError: 'लॉगआउट करने में विफल। कृपया फिर से कोशिश करें।',
    setNextKilometer: 'अगला सर्विस किलोमीटर सेट करें',
    currentValue: 'वर्तमान मूल्य',
    enterKilometer: 'अगला सर्विस किलोमीटर दर्ज करें',
    save: 'सहेजें',
    languageSettings: 'भाषा सेटिंग्स',
    selectLanguage: 'भाषा चुनें',
    apply: 'लागू करें',
    settings: 'सेटिंग्स',
    helpSupport: 'सहायता और समर्थन',
    vehicleManager: 'वाहन प्रबंधक',
    professionalDashboard: 'पेशेवर डैशबोर्ड',
    version: 'संस्करण 1.0.0',
    language: 'भाषा',
    name: 'नाम',
    phone: 'फोन',
    department: 'विभाग',
    employeeId: 'कर्मचारी आईडी',
    nextService: 'अगली सर्विस',
    success: 'सफलता',
    kilometerSaved: 'अगला सर्विस किलोमीटर सफलतापूर्वक सहेजा गया',
    languageChanged: 'भाषा बदलकर',
    failedSaveKilometer: 'सर्विस अंतराल सहेजने में विफल',
    invalidKilometer: 'कृपया एक मान्य किलोमीटर मूल्य दर्ज करें',
  },
};

export default function SideBar({ userData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-280));
  const [showKilometerModal, setShowKilometerModal] = useState(false);
  const [nextKilometer, setNextKilometer] = useState('');
  const [currentServiceInterval, setCurrentServiceInterval] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english'); // Default to 'english'
  const [showStaffModal, setShowStaffModal] = useState(false);
  const { logout } = useAuth();

  // Translation function with fallback to English
  const t = (key) => {
    const lang = selectedLanguage || 'english'; // Fallback to 'english' if undefined
    return translations[lang][key] || translations.english[key];
  };

  // Load stored data on component mount
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const serviceInterval = await AsyncStorage.getItem('service_interval');
      const appLanguage = await AsyncStorage.getItem('appLanguage');
      if (serviceInterval) {
        setCurrentServiceInterval(serviceInterval);
      }
      // Only set valid language values ('english' or 'hindi')
      if (appLanguage === 'english' || appLanguage === 'hindi') {
        setSelectedLanguage(appLanguage);
      } else {
        // Fallback to 'english' if invalid or undefined
        setSelectedLanguage('english');
        await AsyncStorage.setItem('appLanguage', 'english');
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
      // Fallback to 'english' on error
      setSelectedLanguage('english');
      await AsyncStorage.setItem('appLanguage', 'english');
    }
  };

  const toggleSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? -280 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleSetNextKilometer = async () => {
    if (nextKilometer.trim() === '') {
      Alert.alert(t('error'), t('invalidKilometer'));
      return;
    }

    try {
      await AsyncStorage.setItem('service_interval', nextKilometer);
      setCurrentServiceInterval(nextKilometer);
      setShowKilometerModal(false);
      setNextKilometer('');
      Alert.alert(t('success'), t('kilometerSaved'));
    } catch (error) {
      console.error('Error saving service interval:', error);
      Alert.alert(t('error'), t('failedSaveKilometer'));
    }
  };

  const handleLanguageChange = async (language) => {
    // Validate language input
    const validLanguage = language === 'english' || language === 'hindi' ? language : 'english';
    try {
      await AsyncStorage.setItem('appLanguage', validLanguage);
      setSelectedLanguage(validLanguage);
      setShowStaffModal(false);
      Alert.alert(t('success'), `${t('languageChanged')} ${validLanguage === 'hindi' ? 'हिंदी' : 'English'}`);
    } catch (error) {
      console.error('Error saving language:', error);
      Alert.alert(t('error'), t('failedSaveLanguage'));
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logout'),
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
              if (logout) {
                await logout();
              }
              router.replace('/Screen/Owner/Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(t('error'), t('logoutError'));
            }
          },
        },
      ],
    );
  };

  const menuItems = [
    { icon: 'speedometer-outline', label: t('setNextKilometer'), action: () => setShowKilometerModal(true) },
    { icon: 'language-outline', label: t('languageSettings'), action: () => setShowStaffModal(true) },
    { icon: 'settings-outline', label: t('settings'), action: () => router.push('/(tabs)/Settings') },
    { icon: 'help-circle-outline', label: t('helpSupport'), action: () => router.push('/Screen/General/HelpCenter') },
    { icon: 'log-out-outline', label: t('logout'), action: handleLogout },
  ];

  return (
    <>
      {/* Hamburger Icon */}
      <TouchableOpacity style={styles.iconContainer} onPress={toggleSidebar} pointerEvents="box-none">
        <View style={styles.iconWrapper}>
          <Ionicons name={isOpen ? 'close' : 'menu'} size={24} color="#2563eb" />
        </View>
      </TouchableOpacity>

      {/* Sidebar */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: slideAnim }], zIndex: isOpen ? 1500 : -1 }]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <ScrollView style={styles.sidebarContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {userData?.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.defaultProfileIcon}>
                  <Ionicons name="person" size={32} color="#2563eb" />
                </View>
              )}
            </View>
            <Text style={styles.headerTitle}>{userData?.name || t('vehicleManager')}</Text>
            <Text style={styles.headerSubtitle}>{userData?.role || t('professionalDashboard')}</Text>
            {userData?.email && <Text style={styles.headerEmail}>{userData.email}</Text>}
          </View>

          {/* Service Interval Display */}
          {currentServiceInterval && (
            <View style={styles.serviceIntervalCard}>
              <Ionicons name="speedometer" size={20} color="#2563eb" />
              <Text style={styles.serviceIntervalText}>
                {t('nextService')}: {currentServiceInterval} km
              </Text>
            </View>
          )}

          {/* User Info Section */}
          {userData && (
            <View style={styles.userInfoSection}>
              <View style={styles.userInfoRow}>
                <Ionicons name="person-outline" size={16} color="#64748b" />
                <Text style={styles.userInfoLabel}>{t('name')}:</Text>
                <Text style={styles.userInfoValue}>{userData.name || 'N/A'}</Text>
              </View>
              {userData.phone && (
                <View style={styles.userInfoRow}>
                  <Ionicons name="call-outline" size={16} color="#64748b" />
                  <Text style={styles.userInfoLabel}>{t('phone')}:</Text>
                  <Text style={styles.userInfoValue}>{userData.phone}</Text>
                </View>
              )}
              {userData.department && (
                <View style={styles.userInfoRow}>
                  <Ionicons name="business-outline" size={16} color="#64748b" />
                  <Text style={styles.userInfoLabel}>{t('department')}:</Text>
                  <Text style={styles.userInfoValue}>{userData.department}</Text>
                </View>
              )}
              {userData.employeeId && (
                <View style={styles.userInfoRow}>
                  <Ionicons name="id-card-outline" size={16} color="#64748b" />
                  <Text style={styles.userInfoLabel}>{t('employeeId')}:</Text>
                  <Text style={styles.userInfoValue}>{userData.employeeId}</Text>
                </View>
              )}
            </View>
          )}

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action} activeOpacity={0.7}>
                <Ionicons name={item.icon} size={20} color="#2563eb" />
                <Text style={styles.menuItemText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('version')}</Text>
            <Text style={styles.footerLanguage}>
              {t('language')}: {selectedLanguage === 'hindi' ? 'हिंदी' : 'English'}
            </Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Overlay */}
      {isOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleSidebar} pointerEvents={isOpen ? 'auto' : 'none'} />
      )}

      {/* Set Next Kilometer Modal */}
      <Modal
        visible={showKilometerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowKilometerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="speedometer" size={24} color="#2563eb" />
              <Text style={styles.modalTitle}>{t('setNextKilometer')}</Text>
            </View>

            {currentServiceInterval && (
              <View style={styles.currentValueContainer}>
                <Text style={styles.currentValueLabel}>{t('currentValue')}:</Text>
                <Text style={styles.currentValueText}>{currentServiceInterval} km</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('enterKilometer')}:</Text>
              <TextInput
                style={styles.textInput}
                value={nextKilometer}
                onChangeText={setNextKilometer}
                placeholder={t('enterKilometer')}
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowKilometerModal(false);
                  setNextKilometer('');
                }}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSetNextKilometer}>
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={showStaffModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStaffModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="language" size={24} color="#2563eb" />
              <Text style={styles.modalTitle}>{t('languageSettings')}</Text>
            </View>

            <View style={styles.languageContainer}>
              <Text style={styles.inputLabel}>{t('selectLanguage')}:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedLanguage}
                  onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="English" value="english" />
                  <Picker.Item label="हिंदी" value="hindi" />
                </Picker>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowStaffModal(false)}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => handleLanguageChange(selectedLanguage)}>
                <Text style={styles.saveButtonText}>{t('apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Styles remain the same as provided
const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2000,
  },
  iconWrapper: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
  },
  sidebarContent: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#ffffff',
    padding: 4,
    borderRadius: 50,
    marginBottom: 12,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultProfileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  headerEmail: {
    fontSize: 12,
    color: '#93c5fd',
    marginTop: 4,
    fontStyle: 'italic',
  },
  serviceIntervalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  serviceIntervalText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e40af',
    flex: 1,
  },
  userInfoSection: {
    backgroundColor: '#f8fafc',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
    minWidth: 80,
    fontWeight: '500',
  },
  userInfoValue: {
    fontSize: 12,
    color: '#1e293b',
    flex: 1,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  footerLanguage: {
    fontSize: 12,
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12,
  },
  currentValueContainer: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentValueLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  currentValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  inputContainer: {
    marginBottom: 24,
  },
  languageContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});