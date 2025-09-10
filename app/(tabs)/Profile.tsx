import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getProfile } from '../api/Services/AuthService';
import { addStaff, deleteStaff, SMSperiod } from '../api/Services/management';
import { ExtractToken } from '../api/Services/TokenExtract';

export default function Profile() {
  const [staffMembers, setStaffMembers] = useState([]);
  const [isStaffModalVisible, setStaffModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isReminderModalVisible, setReminderModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isKmReminderModalVisible, setKmReminderModalVisible] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);
  const [role, setRole] = useState(null);
  const [currentStaff, setCurrentStaff] = useState({ 
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '' 
  });
  const [passwordError, setPasswordError] = useState('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    rating: 0,
    servicesCompleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [reminderSettings, setReminderSettings] = useState({
    private: '3',
    taxi: '1',
  });
  
  // New state for KM reminder
  const [nextKilometer, setNextKilometer] = useState('');
  const [tempKmInput, setTempKmInput] = useState('');

  // Translations for the profile screen
  const translations = {
    english: {
      profile: "Profile",
      services: "services",
      staffManagement: "Staff Management",
      addStaffMember: "Add Staff Member",
      addNewStaff: "Add New Staff",
      email: "Email",
      enterStaffEmail: "Enter staff email",
      phoneNumber: "Phone Number",
      enterPhoneNumber: "Enter 10-digit phone number",
      password: "Password",
      enterPassword: "Enter password (min 6 characters)",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm password",
      addStaff: "Add Staff",
      staffAddedSuccess: "Staff Added Successfully!",
      staffAddedMessage: "The new staff member has been added to your team.",
      ok: "OK",
      error: "Error",
      fillAllDetails: "Please fill all staff details",
      validEmail: "Please enter a valid email address",
      validPhone: "Please enter a valid 10-digit phone number",
      passwordLength: "Password must be at least 6 characters long",
      passwordsDontMatch: "Passwords do not match",
      failedAddStaff: "Failed to add staff member",
      notProvided: "Not provided",
      loadingProfile: "Loading profile data...",
      authenticationError: "Authentication required. Please login again.",
      reminderPeriod: "Reminder Period",
      reminderSettings: "Reminder Settings",
      privateVehicles: "Private Vehicles",
      taxiVehicles: "Taxi Vehicles",
      months: "months",
      saveSettings: "Save Settings",
      settingsSaved: "Settings Saved",
      settingsSavedMessage: "Reminder settings have been updated successfully",
      deleteStaff: "Delete Staff",
      confirmDelete: "Confirm Delete",
      deleteStaffConfirm: "Are you sure you want to delete this staff member?",
      deleteStaffWarning: "This action cannot be undone.",
      cancel: "Cancel",
      delete: "Delete",
      staffDeletedSuccess: "Staff Deleted Successfully!",
      staffDeletedMessage: "The staff member has been removed from your team.",
      failedDeleteStaff: "Failed to delete staff member",
      cannotDeleteAdmin: "Cannot delete service center admin",
      // New KM reminder translations
      kmReminder: "KM Reminder",
      setKmReminder: "Set Next KM",
      nextKmAlignment: "Next KM Alignment",
      enterNextKm: "Enter next kilometer (e.g., 300, 500, 1000)",
      saveKmReminder: "Save KM Reminder",
      kmReminderSaved: "KM Reminder Saved!",
      kmReminderSavedMessage: "Next kilometer reminder has been set successfully.",
      currentKmReminder: "Current: ",
      enterValidKm: "Please enter a valid kilometer value",
    },
    hindi: {
      profile: "प्रोफाइल",
      services: "सेवाएं",
      staffManagement: "स्टाफ प्रबंधन",
      addStaffMember: "स्टाफ सदस्य जोड़ें",
      addNewStaff: "नया स्टाफ जोड़ें",
      email: "ईमेल",
      enterStaffEmail: "स्टाफ ईमेल दर्ज करें",
      phoneNumber: "फोन नंबर",
      enterPhoneNumber: "10-अंकीय फोन नंबर दर्ज करें",
      password: "पासवर्ड",
      enterPassword: "पासवर्ड दर्ज करें (न्यूनतम 6 अक्षर)",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      confirmPasswordPlaceholder: "पासवर्ड की पुष्टि करें",
      addStaff: "स्टाफ जोड़ें",
      staffAddedSuccess: "स्टाफ सफलतापूर्वक जोड़ा गया!",
      staffAddedMessage: "नया स्टाफ सदस्य आपकी टीम में जोड़ दिया गया है।",
      ok: "ठीक है",
      error: "त्रुटि",
      fillAllDetails: "कृपया सभी स्टाफ विवरण भरें",
      validEmail: "कृपया एक वैध ईमेल पता दर्ज करें",
      validPhone: "कृपया एक वैध 10-अंकीय फोन नंबर दर्ज करें",
      passwordLength: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
      passwordsDontMatch: "पासवर्ड मेल नहीं खाते",
      failedAddStaff: "स्टाफ सदस्य जोड़ने में विफल",
      notProvided: "प्रदान नहीं किया गया",
      loadingProfile: "प्रोफाइल डेटा लोड हो रहा है...",
      authenticationError: "प्रमाणीकरण आवश्यक है। कृपया फिर से लॉगिन करें।",
      reminderPeriod: "अनुस्मारक अवधि",
      reminderSettings: "अनुस्मारक सेटिंग्स",
      privateVehicles: "निजी वाहन",
      taxiVehicles: "टैक्सी वाहन",
      months: "महीने",
      saveSettings: "सेटिंग्स सहेजें",
      settingsSaved: "सेटिंग्स सहेजे गए",
      settingsSavedMessage: "अनुस्मारक सेटिंग्स सफलतापूर्वक अपडेट की गई हैं",
      deleteStaff: "स्टाफ हटाएं",
      confirmDelete: "हटाने की पुष्टि करें",
      deleteStaffConfirm: "क्या आप वाकई इस स्टाफ सदस्य को हटाना चाहते हैं?",
      deleteStaffWarning: "यह क्रिया पूर्ववत नहीं की जा सकती।",
      cancel: "रद्द करें",
      delete: "हटाएं",
      staffDeletedSuccess: "स्टाफ सफलतापूर्वक हटा दिया गया!",
      staffDeletedMessage: "स्टाफ सदस्य को आपकी टीम से हटा दिया गया है।",
      failedDeleteStaff: "स्टाफ सदस्य हटाने में विफल",
      cannotDeleteAdmin: "सेवा केंद्र व्यवस्थापक को हटाया नहीं जा सकता",
      // New KM reminder translations
      kmReminder: "किलोमीटर अनुस्मारक",
      setKmReminder: "अगला किमी सेट करें",
      nextKmAlignment: "अगला किमी संरेखण",
      enterNextKm: "अगला किलोमीटर दर्ज करें (जैसे 300, 500, 1000)",
      saveKmReminder: "किमी अनुस्मारक सहेजें",
      kmReminderSaved: "किमी अनुस्मारक सहेजा गया!",
      kmReminderSavedMessage: "अगला किलोमीटर अनुस्मारक सफलतापूर्वक सेट किया गया।",
      currentKmReminder: "वर्तमान: ",
      enterValidKm: "कृपया एक वैध किलोमीटर मान दर्ज करें",
    }
  };

  // Translation function
  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  // Load KM reminder from AsyncStorage
  const loadKmReminder = async () => {
    try {
      const savedKm = await AsyncStorage.getItem('next_kilometer');
      if (savedKm) {
        setNextKilometer(savedKm);
      }
    } catch (error) {
      console.error('Error loading KM reminder:', error);
    }
  };

  // Save KM reminder to AsyncStorage
  const saveKmReminder = async (kmValue) => {
    try {
      await AsyncStorage.setItem('next_kilometer', kmValue);
      setNextKilometer(kmValue);
    } catch (error) {
      console.error('Error saving KM reminder:', error);
      Alert.alert(t('error'), 'Failed to save KM reminder');
    }
  };

  // Handle KM reminder save
  const handleSaveKmReminder = async () => {
    const trimmedKm = tempKmInput.trim();
    
    if (!trimmedKm || isNaN(trimmedKm) || parseInt(trimmedKm) <= 0) {
      Alert.alert(t('error'), t('enterValidKm'));
      return;
    }

    await saveKmReminder(trimmedKm);
    setKmReminderModalVisible(false);
    setTempKmInput('');
    
    Alert.alert(
      t('kmReminderSaved'),
      t('kmReminderSavedMessage'),
      [{ text: t('ok') }]
    );
  };

  // Load language preference
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

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      await loadLanguagePreference();
      await loadKmReminder(); // Load KM reminder
      
      const tokenData = await ExtractToken();
      setRole(tokenData?.role || null);
      if (tokenData?.id) {
        const profileData = await getProfile(tokenData.id);
        
        setUserData({
          name: profileData?.name || "My Wheel Service",
          email: profileData?.email || "",
          phone: profileData?.phone || "",
          location: profileData?.address || "",
          rating: profileData?.rating || 4.5,
          servicesCompleted: profileData?.servicesCompleted || 0,
        });

        if (profileData?.all_users && Array.isArray(profileData.all_users)) {
          const staffOnly = profileData.all_users.filter(user => user.role === 'staff');
          setStaffMembers(staffOnly);
        }

        // Load existing reminder settings if available
        if (profileData?.sms_frequency_for_private_vehicles || profileData?.sms_frequency_for_transport_vehicles) {
          setReminderSettings({
            private: profileData.sms_frequency_for_private_vehicles?.toString() || '3',
            taxi: profileData.sms_frequency_for_transport_vehicles?.toString() || '1'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert(t('error'), 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const validateStaffInput = () => {
    const trimmedStaff = {
      email: currentStaff.email.trim(),
      phone_number: currentStaff.phone_number.trim(),
      password: currentStaff.password,
      confirm_password: currentStaff.confirm_password
    };

    if (!trimmedStaff.email || !trimmedStaff.phone_number || 
        !trimmedStaff.password || !trimmedStaff.confirm_password) {
      Alert.alert(t('error'), t('fillAllDetails'));
      return null;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedStaff.email)) {
      Alert.alert(t('error'), t('validEmail'));
      return null;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(trimmedStaff.phone_number)) {
      Alert.alert(t('error'), t('validPhone'));
      return null;
    }

    if (trimmedStaff.password.length < 6) {
      Alert.alert(t('error'), t('passwordLength'));
      return null;
    }

    if (trimmedStaff.password !== trimmedStaff.confirm_password) {
      setPasswordError(t('passwordsDontMatch'));
      return null;
    }

    return trimmedStaff;
  };

  const handleAddStaff = async () => {
    const validatedStaff = validateStaffInput();
    if (!validatedStaff) {
      return;
    }

    setPasswordError('');
    setIsAddingStaff(true);

    try {
      const tokenData = await ExtractToken();
      if (!tokenData) {
        throw new Error(t('authenticationError'));
      }

      const staffData = {
        email: validatedStaff.email,
        phone_number: validatedStaff.phone_number,
        password: validatedStaff.password,
        service_center_id: tokenData.service_center_id,
        confirm_password: validatedStaff.confirm_password,
      };
      
      const response = await addStaff(staffData);
      console.log("Add staff response:-------", response);
      if (response && (response.success === true || response.status === 'success' || response.data)) {
        setStaffModalVisible(false);
        setCurrentStaff({ 
          email: '', 
          phone_number: '', 
          password: '', 
          confirm_password: '' 
        });
        setPasswordError('');

        await fetchUserProfile();

        setConfirmModalVisible(true);
      } else {
        throw new Error(response?.message || t('failedAddStaff'));
      }
    } catch (error) {
      let errorMessage = t('failedAddStaff');
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }  
      Alert.alert(t('error'), errorMessage);
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleSaveReminderSettings = async () => {
    try {
      const tokenData = await ExtractToken();
      if (!tokenData) {
        throw new Error(t('authenticationError'));
      }

      // Prepare the data in the required format
      const reminderData = {
        sms_frequency_for_private_vehicles: parseInt(reminderSettings.private),
        sms_frequency_for_transport_vehicles: parseInt(reminderSettings.taxi)
      };

      // Call the API
      const response = await SMSperiod(reminderData);

      if (response && (response.status === 200)) {
        setReminderModalVisible(false);
        Alert.alert(t('settingsSaved'), t('settingsSavedMessage'));
      } else {
        throw new Error(response?.message || 'Failed to save reminder settings');
      }
    } catch (error) {
      console.error('Save reminder settings error:', error);
      
      let errorMessage = 'Failed to save reminder settings';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert(t('error'), errorMessage);
    }
  };

  const confirmDeleteStaff = (staff) => {
    if (staff.role === 'centeradmin') {
      Alert.alert(t('error'), t('cannotDeleteAdmin'));
      return;
    }

    setStaffToDelete(staff);
    setDeleteModalVisible(true);
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    setIsDeletingStaff(true);

    try {
      const tokenData = await ExtractToken();
      if (!tokenData) {
        throw new Error(t('authenticationError'));
      }

      const response = await deleteStaff(staffToDelete.id);

      if (response && (response.status === 200)) {
        setStaffMembers(prevStaff => prevStaff.filter(staff => staff.id !== staffToDelete.id));
        
        setDeleteModalVisible(false);
        setStaffToDelete(null);

        Alert.alert(t('staffDeletedSuccess'), t('staffDeletedMessage'));
      } else {
        throw new Error(response?.message || t('failedDeleteStaff'));
      }
    } catch (error) {
      console.error('Delete staff error:', error);
      
      let errorMessage = t('failedDeleteStaff');
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert(t('error'), errorMessage);
    } finally {
      setIsDeletingStaff(false);
    }
  };

  const resetStaffForm = () => {
    setCurrentStaff({ 
      email: '', 
      phone_number: '', 
      password: '', 
      confirm_password: '' 
    });
    setPasswordError('');
  };

  const openKmReminderModal = () => {
    setTempKmInput(nextKilometer); // Pre-fill with current value
    setKmReminderModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a7cff" />
        <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header - Simplified without avatar */}
      <View style={styles.profileHeader}>
        <Text style={styles.shopName}>{userData.name}</Text>
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{userData.rating} ({userData.servicesCompleted} {t('services')})</Text>
        </View>
      </View>

      {/* Profile Details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailItem}>
          <MaterialIcons name="email" size={20} color="#666" />
          <Text style={styles.detailText}>{userData.email || t('notProvided')}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialIcons name="phone" size={20} color="#666" />
          <Text style={styles.detailText}>{userData.phone || t('notProvided')}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <Text style={styles.detailText}>{userData.location || t('notProvided')}</Text>
        </View>
      </View>
      
      {/* Action Buttons Row - Updated to include KM Reminder */}
      <View style={styles.actionButtonsRow}>
        {/* Reminder Period Button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.reminderButton]}
          onPress={() => setReminderModalVisible(true)}
        >
          <MaterialIcons name="notifications" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>{t('reminderPeriod')}</Text>
        </TouchableOpacity>
        
        {/* KM Reminder Button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.kmReminderButton]}
          onPress={openKmReminderModal}
        >
          <MaterialIcons name="speed" size={20} color="#fff" />
          <View style={styles.kmReminderContent}>
            <Text style={styles.actionButtonText}>{t('setKmReminder')}</Text>
            {nextKilometer && (
              <Text style={styles.kmCurrentText}>
                {t('currentKmReminder')}{nextKilometer} KM
              </Text>
            )}
          </View>
        </TouchableOpacity>
        
        {/* Add Staff Button - Only show for owners */}
        {role === 'centeradmin' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.addStaffButton]}
            onPress={() => setStaffModalVisible(true)}
          >
            <MaterialIcons name="person-add" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>{t('addStaffMember')}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Staff Management - Only show for owners */}
      {role === 'centeradmin' && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('staffManagement')}</Text>
          </View>

          <View style={styles.listContainer}>
            {staffMembers.map((staff) => (
              <View key={staff.id} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{staff.email}</Text>
                  <Text style={styles.listItemSubtitle}>Phone: {staff.phone_number}</Text>
                  <Text style={styles.listItemSubtitle}>Username: {staff.username}</Text>
                  <Text style={styles.listItemSubtitle}>Role: {staff.role_display}</Text>
                </View>
                <View style={styles.listItemActions}>
                  <TouchableOpacity 
                    style={[styles.listItemAction, styles.deleteAction]}
                    onPress={() => confirmDeleteStaff(staff)}
                  >
                    <MaterialIcons name="delete" size={20} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Add Staff Modal */}
          <Modal
            visible={isStaffModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
              setStaffModalVisible(false);
              resetStaffForm();
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('addNewStaff')}</Text>
                  <TouchableOpacity onPress={() => {
                    setStaffModalVisible(false);
                    resetStaffForm();
                  }}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('email')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('enterStaffEmail')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={currentStaff.email}
                    onChangeText={(text) => setCurrentStaff({...currentStaff, email: text})}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('phoneNumber')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('enterPhoneNumber')}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={currentStaff.phone_number}
                    onChangeText={(text) => setCurrentStaff({...currentStaff, phone_number: text})}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('password')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('enterPassword')}
                    secureTextEntry
                    value={currentStaff.password}
                    onChangeText={(text) => {
                      setCurrentStaff({...currentStaff, password: text});
                      setPasswordError('');
                    }}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('confirmPassword')}</Text>
                  <TextInput
                    style={[styles.input, passwordError ? styles.inputError : null]}
                    placeholder={t('confirmPasswordPlaceholder')}
                    secureTextEntry
                    value={currentStaff.confirm_password}
                    onChangeText={(text) => {
                      setCurrentStaff({...currentStaff, confirm_password: text});
                      setPasswordError('');
                    }}
                  />
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>
                
                <TouchableOpacity 
                  style={[styles.modalButton, isAddingStaff ? styles.disabledButton : null]}
                  onPress={handleAddStaff}
                  disabled={isAddingStaff}
                >
                  {isAddingStaff ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.modalButtonText}>{t('addStaff')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            visible={isDeleteModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => {
              setDeleteModalVisible(false);
              setStaffToDelete(null);
            }}
          >
            <View style={styles.confirmModalContainer}>
              <View style={styles.confirmModalContent}>
                <View style={styles.warningIconContainer}>
                  <MaterialIcons name="warning" size={60} color="#ff9500" />
                </View>
                
                <Text style={styles.confirmTitle}>{t('confirmDelete')}</Text>
                <Text style={styles.confirmMessage}>
                  {t('deleteStaffConfirm')}
                </Text>
                <Text style={styles.warningMessage}>
                  {staffToDelete?.email}
                </Text>
                <Text style={styles.confirmMessage}>
                  {t('deleteStaffWarning')}
                </Text>
                
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setDeleteModalVisible(false);
                      setStaffToDelete(null);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.deleteButton, isDeletingStaff ? styles.disabledButton : null]}
                    onPress={handleDeleteStaff}
                    disabled={isDeletingStaff}
                  >
                    {isDeletingStaff ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.deleteButtonText}>{t('delete')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Reminder Settings Modal */}
          <Modal
            visible={isReminderModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setReminderModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('reminderSettings')}</Text>
                  <TouchableOpacity onPress={() => setReminderModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                {/* Private Vehicles Settings */}
                <View style={styles.reminderSection}>
                  <Text style={styles.reminderLabel}>{t('privateVehicles')}</Text>
                  <View style={styles.reminderOptions}>
                    {['3', '6', '9', '12'].map((month) => (
                      <TouchableOpacity
                        key={`private-${month}`}
                        style={[
                          styles.reminderOption,
                          reminderSettings.private === month && styles.reminderOptionSelected
                        ]}
                        onPress={() => setReminderSettings({...reminderSettings, private: month})}
                      >
                        <Text style={[
                          styles.reminderOptionText,
                          reminderSettings.private === month && styles.reminderOptionTextSelected
                        ]}>
                          {month} {t('months')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Taxi Vehicles Settings */}
                <View style={styles.reminderSection}>
                  <Text style={styles.reminderLabel}>{t('taxiVehicles')}</Text>
                  <View style={styles.reminderOptions}>
                    {['1', '3', '6', '9', '12'].map((month) => (
                      <TouchableOpacity
                        key={`taxi-${month}`}
                        style={[
                          styles.reminderOption,
                          reminderSettings.taxi === month && styles.reminderOptionSelected
                        ]}
                        onPress={() => setReminderSettings({...reminderSettings, taxi: month})}
                      >
                        <Text style={[
                          styles.reminderOptionText,
                          reminderSettings.taxi === month && styles.reminderOptionTextSelected
                        ]}>
                          {month} {t('months')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={handleSaveReminderSettings}
                >
                  <Text style={styles.modalButtonText}>{t('saveSettings')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Success Confirmation Modal */}
          <Modal
            visible={isConfirmModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setConfirmModalVisible(false)}
          >
            <View style={styles.confirmModalContainer}>
              <View style={styles.confirmModalContent}>
                <View style={styles.successIconContainer}>
                  <MaterialIcons name="check-circle" size={60} color="#4CAF50" />
                </View>
                
                <Text style={styles.confirmTitle}>{t('staffAddedSuccess')}</Text>
                <Text style={styles.confirmMessage}>
                  {t('staffAddedMessage')}
                </Text>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={() => setConfirmModalVisible(false)}
                >
                  <Text style={styles.confirmButtonText}>{t('ok')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}

      {/* KM Reminder Modal */}
      <Modal
        visible={isKmReminderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setKmReminderModalVisible(false);
          setTempKmInput('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('nextKmAlignment')}</Text>
              <TouchableOpacity onPress={() => {
                setKmReminderModalVisible(false);
                setTempKmInput('');
              }}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('nextKmAlignment')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterNextKm')}
                keyboardType="numeric"
                value={tempKmInput}
                onChangeText={setTempKmInput}
              />
            </View>
            
            {nextKilometer && (
              <View style={styles.currentKmContainer}>
                <Text style={styles.currentKmLabel}>
                  {t('currentKmReminder')}{nextKilometer} KM
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleSaveKmReminder}
            >
              <Text style={styles.modalButtonText}>{t('saveKmReminder')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 30,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  // Updated styles for action buttons row
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
  },
  reminderButton: {
    backgroundColor: '#6c5ce7',
  },
  kmReminderButton: {
    backgroundColor: '#00b894',
  },
  addStaffButton: {
    backgroundColor: '#4a7cff',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  // New styles for KM reminder
  kmReminderContent: {
    alignItems: 'center',
    marginLeft: 8,
  },
  kmCurrentText: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.9,
    marginTop: 2,
  },
  currentKmContainer: {
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  currentKmLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    marginBottom: 24,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemAction: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  deleteAction: {
    backgroundColor: '#ffebee',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  modalButton: {
    backgroundColor: '#4a7cff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
  reminderSection: {
    marginBottom: 20,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    minWidth: 80,
    alignItems: 'center',
  },
  reminderOptionSelected: {
    backgroundColor: '#4a7cff',
  },
  reminderOptionText: {
    color: '#333',
    fontSize: 14,
  },
  reminderOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  confirmModalContent: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  warningIconContainer: {
    marginBottom: 16,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  warningMessage: {
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});