import { MaterialIcons } from '@expo/vector-icons';
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
import { addStaff } from '../api/Services/management';
import { ExtractToken } from '../api/Services/TokenExtract';

export default function Profile() {
  const [staffMembers, setStaffMembers] = useState([]);
  const [isStaffModalVisible, setStaffModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [role, setRole] = useState<string | null>(null);
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

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
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
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const validateStaffInput = () => {
    // Trim whitespace from inputs
    const trimmedStaff = {
      email: currentStaff.email.trim(),
      phone_number: currentStaff.phone_number.trim(),
      password: currentStaff.password,
      confirm_password: currentStaff.confirm_password
    };

    // Check if all fields are filled
    if (!trimmedStaff.email || !trimmedStaff.phone_number || 
        !trimmedStaff.password || !trimmedStaff.confirm_password) {
      Alert.alert('Error', 'Please fill all staff details');
      return null;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedStaff.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return null;
    }

    // Validate phone number (basic validation for 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(trimmedStaff.phone_number)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return null;
    }

    // Check password length
    if (trimmedStaff.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return null;
    }

    // Check if passwords match
    if (trimmedStaff.password !== trimmedStaff.confirm_password) {
      setPasswordError('Passwords do not match');
      return null;
    }

    return trimmedStaff;
  };

  const handleAddStaff = async () => {
    // Validate inputs
    const validatedStaff = validateStaffInput();
    if (!validatedStaff) {
      return;
    }

    // Clear any previous password error
    setPasswordError('');
    setIsAddingStaff(true);

    try {
      const tokenData = await ExtractToken();
      if (!tokenData) {
        throw new Error('Authentication required. Please login again.');
      }

      // Prepare data for API call (remove confirm_password as it's not needed for API)
      const staffData = {
        email: validatedStaff.email,
        phone_number: validatedStaff.phone_number,
        password: validatedStaff.password,
        service_center_id: tokenData.service_center_id,
        confirm_password: validatedStaff.confirm_password, // Include if your API requires it
      };
      
      const response = await addStaff(staffData);

      if (response && (response.success === true || response.status === 'success' || response.data)) {
        // Update local staff list
        setStaffMembers([...staffMembers, {
          id: response.data?.id || staffMembers.length + 1,
          email: validatedStaff.email,
          phone: validatedStaff.phone_number
        }]);

        // Close modal and reset form
        setStaffModalVisible(false);
        setCurrentStaff({ 
          email: '', 
          phone_number: '', 
          password: '', 
          confirm_password: '' 
        });
        setPasswordError('');

        // Show confirmation modal
        setConfirmModalVisible(true);
      } else {
        throw new Error(response?.message || 'Failed to add staff member');
      }
    } catch (error) {
      console.error('Add staff error:', error);
      
      let errorMessage = 'Failed to add staff member';
      
      // Handle different types of errors
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsAddingStaff(false);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a7cff" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar} />
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={18} color="#4a7cff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.shopName}>{userData.name}</Text>
        <Text style={styles.rating}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          {userData.rating} ({userData.servicesCompleted} services)
        </Text>
      </View>

      {/* Profile Details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailItem}>
          <MaterialIcons name="email" size={20} color="#666" />
          <Text style={styles.detailText}>{userData.email || 'Not provided'}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialIcons name="phone" size={20} color="#666" />
          <Text style={styles.detailText}>{userData.phone || 'Not provided'}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <Text style={styles.detailText}>{userData.location || 'Not provided'}</Text>
        </View>
      </View>

      {/* Staff Management - Only show for owners */}
      {role === 'centeradmin' && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Staff Management</Text>
          </View>

          <View style={styles.listContainer}>
            {staffMembers.map((staff, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{staff.email}</Text>
                  <Text style={styles.listItemSubtitle}>Phone: {staff.phone}</Text>
                </View>
                <TouchableOpacity style={styles.listItemAction}>
                  <MaterialIcons name="edit" size={18} color="#4a7cff" />
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Add Staff Button */}
            <TouchableOpacity 
              style={styles.addStaffButton}
              onPress={() => setStaffModalVisible(true)}
            >
              <MaterialIcons name="person-add" size={20} color="#fff" />
              <Text style={styles.addStaffButtonText}>Add Staff Member</Text>
            </TouchableOpacity>
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
                  <Text style={styles.modalTitle}>Add New Staff</Text>
                  <TouchableOpacity onPress={() => {
                    setStaffModalVisible(false);
                    resetStaffForm();
                  }}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter staff email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={currentStaff.email}
                    onChangeText={(text) => setCurrentStaff({...currentStaff, email: text})}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 10-digit phone number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={currentStaff.phone_number}
                    onChangeText={(text) => setCurrentStaff({...currentStaff, phone_number: text})}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password (min 6 characters)"
                    secureTextEntry
                    value={currentStaff.password}
                    onChangeText={(text) => {
                      setCurrentStaff({...currentStaff, password: text});
                      setPasswordError('');
                    }}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={[styles.input, passwordError ? styles.inputError : null]}
                    placeholder="Confirm password"
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
                    <Text style={styles.modalButtonText}>Add Staff</Text>
                  )}
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
                
                <Text style={styles.confirmTitle}>Staff Added Successfully!</Text>
                <Text style={styles.confirmMessage}>
                  The new staff member has been added to your team.
                </Text>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={() => setConfirmModalVisible(false)}
                >
                  <Text style={styles.confirmButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#e0e0e0',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  viewAllText: {
    color: '#4a7cff',
    fontWeight: '500',
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
  listItemAction: {
    marginLeft: 16,
  },
  addStaffButton: {
    backgroundColor: '#4a7cff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  addStaffButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    marginBottom: 24,
    lineHeight: 22,
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