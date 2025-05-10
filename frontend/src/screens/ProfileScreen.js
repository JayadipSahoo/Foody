import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
  StatusBar,
  FlatList,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/authStore';
import { useVendorStore } from '../store/vendorStore';
import useUserStore from '../store/userStore';
import axios from 'axios';
import { API_URL } from '../config/constants';

// Define theme color
const THEME_COLOR = '#fda535'; // Coral/Orange accent color

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isLoading: authLoading, userType } = useAuthStore();
  const { vendorData, fetchVendorProfile, isLoading: vendorLoading } = useVendorStore();
  const { 
    lastOrderedLocation, 
    phoneNumber, 
    setPhoneNumber, 
    notificationSettings,
    updateNotificationSettings
  } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(
    notificationSettings?.newMenuItems || notificationSettings?.orderStatus
  );

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (userType === 'vendor') {
          // Fetch vendor profile from the store
          const vendorProfile = await fetchVendorProfile({ force: true });
          if (vendorProfile) {
            setUserData(vendorProfile);
            initFormValues(vendorProfile);
          }
        } else {
          // Get user data from AsyncStorage as fallback for customers
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const parsedData = JSON.parse(userDataString);
          setUserData(parsedData);
            initFormValues(parsedData);
        } else if (user) {
          // If we have user in state, use that
          setUserData(user);
            initFormValues(user);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user, userType, fetchVendorProfile]);

  useEffect(() => {
    if (phoneNumber) {
      setPhone(phoneNumber);
    }
  }, [phoneNumber]);

  const initFormValues = (data) => {
    setName(data?.name || '');
    setEmail(data?.email || '');
    setBusinessName(data?.businessName || '');
    setContactNumber(data?.contactNumber || '');
    setAddress(data?.address || '');
    setLocations(data?.locationsServed || []);
    setPhone(phoneNumber || data?.phoneNumber || '');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Logout',
          onPress: async () => {
            try {
              await logout();
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Add a state refresh function to make sure we're showing the latest data
  const refreshProfileData = async () => {
    try {
      if (userType === 'vendor') {
        console.log("Refreshing vendor profile data");
        const vendorProfile = await fetchVendorProfile({ force: true });
        if (vendorProfile) {
          console.log("Refreshed profile data:", {
            ...vendorProfile,
            locationsServed: vendorProfile.locationsServed || []
          });
          setUserData(vendorProfile);
          initFormValues(vendorProfile);
        }
      }
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    }
  };

  // When exiting edit mode, refresh the data to show latest changes
  useEffect(() => {
    if (!isEditing) {
      refreshProfileData();
    }
  }, [isEditing]);

  const handleUpdateProfile = async () => {
    // Validate form data
    if (!name || !email) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    if (email && !email.match(/.+\@.+\..+/)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data object based on user type
      const updatedData = {
        name,
        email,
        ...(userType === 'vendor' && {
          businessName,
          contactNumber,
          address,
          locationsServed: locations,
        }),
        ...(userType === 'customer' && {
          phoneNumber: phone,
        }),
      };

      console.log('Updating profile with data:', updatedData);
      console.log('User type:', userType);
      console.log('Locations to save:', locations);

      // For vendors, use the vendor store update function instead of direct API call
      if (userType === 'vendor') {
        const { updateVendorProfile } = useVendorStore.getState();
        const result = await updateVendorProfile(updatedData);
        
        if (result) {
          console.log('Profile updated, new locations:', result.locationsServed);
          
          // Update local userData immediately with result
          setUserData(result);
          
          // Refresh vendor store data
          await fetchVendorProfile({ force: true });
          
          Alert.alert('Success', 'Profile updated successfully');
          setIsEditing(false);
        } else {
          throw new Error('Failed to update profile');
        }
      } else {
        // For regular users, use direct API call
        const endpoint = '/auth/profile';
        const token = await AsyncStorage.getItem('userToken');

        const response = await axios.patch(
          `${API_URL}${endpoint}`,
          updatedData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          // Update local state with new data
          setUserData(response.data);
          
          // Update AsyncStorage
          await AsyncStorage.setItem('userData', JSON.stringify(response.data));
          
          Alert.alert('Success', 'Profile updated successfully');
          setIsEditing(false);
        }
      }

      if (userType === 'customer' && phone) {
        // Update phone number in UserStore
        setPhoneNumber(phone);
      }

      // Update notification settings for menu item alerts
      if (userType === 'customer') {
        updateNotificationSettings({
          newMenuItems: isNotificationsEnabled,
          orderStatus: isNotificationsEnabled
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    
    // Check for duplicates
    if (locations.includes(newLocation.trim())) {
      Alert.alert('Error', 'This location is already in your list');
      return;
    }
    
    const updatedLocations = [...locations, newLocation.trim()];
    console.log("Added location:", newLocation.trim(), "Updated locations:", updatedLocations);
    setLocations(updatedLocations);
    setNewLocation('');
  };

  const handleRemoveLocation = (location) => {
    const updatedLocations = locations.filter(item => item !== location);
    console.log("Removed location:", location, "Updated locations:", updatedLocations);
    setLocations(updatedLocations);
  };

  const renderLocationItem = ({ item }) => (
    <View style={styles.locationItem}>
      <Text style={styles.locationText}>{item}</Text>
      {isEditing && (
        <TouchableOpacity onPress={() => handleRemoveLocation(item)}>
          <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (authLoading || vendorLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor={THEME_COLOR} barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
              <Text style={styles.welcomeText}>
                {isEditing ? 'Edit Your Profile' : `Welcome, ${name || 'User'}!`}
              </Text>
              <Text style={styles.accountTypeText}>
                {userType === 'vendor' ? 'Vendor Account' : 'Customer Account'}
              </Text>
            </View>

            {isEditing ? (
              <View style={styles.formContainer}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Name*</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email*</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your.email@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
        </View>

                {userType === 'vendor' ? (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Business Name</Text>
                      <TextInput
                        style={styles.input}
                        value={businessName}
                        onChangeText={setBusinessName}
                        placeholder="Your business name"
                      />
                    </View>
                    
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Contact Number</Text>
                      <TextInput
                        style={styles.input}
                        value={contactNumber}
                        onChangeText={setContactNumber}
                        placeholder="Your contact number"
                        keyboardType="phone-pad"
                      />
                    </View>
                    
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Address</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Your address"
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                    
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Locations Served</Text>
                      <View style={styles.locationsContainer}>
                        <FlatList
                          data={locations}
                          renderItem={renderLocationItem}
                          keyExtractor={(item, index) => index.toString()}
                          scrollEnabled={false}
                          ListEmptyComponent={
                            <Text style={styles.emptyText}>No locations added yet</Text>
                          }
                        />
                      </View>
                      
                      <View style={styles.addLocationContainer}>
                        <TextInput
                          style={[styles.input, styles.locationInput]}
                          value={newLocation}
                          onChangeText={setNewLocation}
                          placeholder="Add a location"
                        />
                        <TouchableOpacity 
                          style={styles.addLocationButton}
                          onPress={handleAddLocation}
                        >
                          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </TouchableOpacity>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Phone Number</Text>
                      <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Your phone number"
                        keyboardType="phone-pad"
                      />
        </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Notifications</Text>
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>
                          Enable notifications for new menu items
                        </Text>
                        <Switch
                          value={isNotificationsEnabled}
                          onValueChange={setIsNotificationsEnabled}
                          trackColor={{ false: '#d1d1d1', true: `${THEME_COLOR}80` }}
                          thumbColor={isNotificationsEnabled ? THEME_COLOR : '#f4f3f4'}
                        />
                      </View>
                    </View>
                  </>
                )}
                
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsEditing(false);
                      initFormValues(userData);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateProfile}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Text style={styles.infoTitle}>Your Account Details</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
                    <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{userData?.name || "Not set"}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{userData?.email || "Not set"}</Text>
                </View>
                
                {userType === 'vendor' ? (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Business:</Text>
                      <Text style={styles.infoValue}>{userData?.businessName || "Not set"}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Contact:</Text>
                      <Text style={styles.infoValue}>{userData?.contactNumber || "Not set"}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Address:</Text>
                      <Text style={styles.infoValue}>{userData?.address || "Not set"}</Text>
                    </View>
                    
                    <View style={[styles.infoRow, styles.locationsRow]}>
                      <Text style={styles.infoLabel}>Locations:</Text>
                      <View style={styles.locationsContainer}>
                        {userData?.locationsServed && userData.locationsServed.length > 0 ? (
                          <FlatList
                            data={userData.locationsServed}
                            renderItem={renderLocationItem}
                            keyExtractor={(item, index) => index.toString()}
                            scrollEnabled={false}
                          />
                        ) : (
                          <Text style={styles.infoValue}>No locations added</Text>
                        )}
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Phone:</Text>
                      <Text style={styles.infoValue}>{phoneNumber || userData?.phoneNumber || "Not set"}</Text>
        </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Last Ordered:</Text>
                      <Text style={styles.infoValue}>{lastOrderedLocation || "No orders yet"}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Notifications:</Text>
                      <Text style={styles.infoValue}>
                        {notificationSettings?.newMenuItems ? "Enabled" : "Disabled"}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}
      </ScrollView>
        </View>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME_COLOR,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: THEME_COLOR,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  accountTypeText: {
    fontSize: 14,
    color: "#666",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  locationsRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: "#333",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  locationsContainer: {
    marginTop: 8,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    padding: 8,
  },
  addLocationContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
  },
  addLocationButton: {
    backgroundColor: THEME_COLOR,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    backgroundColor: THEME_COLOR,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    marginRight: 16,
  },
});

export default ProfileScreen; 