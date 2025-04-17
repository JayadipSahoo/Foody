import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
    TouchableOpacity,
  ScrollView,
    StatusBar,
    ActivityIndicator,
  Switch,
  Alert,
    TextInput,
    Platform,
    Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVendorStore } from '../../store/vendorStore';
import CustomNumberPicker from '../../components/CustomNumberPicker';

// Theme color to match the other screens
const THEME_COLOR = '#FF9F6A'; // Orange/Coral accent

const weekDays = [
  { id: 0, name: 'Sunday' },
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' }
];

const VendorScheduleScreen = ({ navigation }) => {
    const { scheduleData, fetchSchedule, updateSchedule, isLoading, error } = useVendorStore();
    
    // Local state
    const [isOpen, setIsOpen] = useState(true);
    const [openingTime, setOpeningTime] = useState('09:00');
    const [closingTime, setClosingTime] = useState('22:00');
    const [offDays, setOffDays] = useState([]);
    const [hasBreakTime, setHasBreakTime] = useState(false);
    const [breakStartTime, setBreakStartTime] = useState('14:00');
    const [breakEndTime, setBreakEndTime] = useState('15:00');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [currentTimePickerFor, setCurrentTimePickerFor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

    // Fetch schedule data
  useEffect(() => {
        fetchSchedule({ force: true });
  }, []);

    // Update local state when data is fetched
  useEffect(() => {
    if (scheduleData) {
            setIsOpen(scheduleData.isOpen);
            setOpeningTime(scheduleData.openingTime);
            setClosingTime(scheduleData.closingTime);
            setOffDays(scheduleData.offDays || []);
            
            if (scheduleData.breakTime) {
                setHasBreakTime(scheduleData.breakTime.enabled);
                if (scheduleData.breakTime.startTime) {
                    setBreakStartTime(scheduleData.breakTime.startTime);
                }
                if (scheduleData.breakTime.endTime) {
                    setBreakEndTime(scheduleData.breakTime.endTime);
                }
            }
    }
  }, [scheduleData]);

    // Handle time picker
    const showPicker = (forTime) => {
        setCurrentTimePickerFor(forTime);
        setShowTimePicker(true);
    };
    
    const onTimeChange = (hours, minutes) => {
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return; // Invalid time values
        }
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        switch (currentTimePickerFor) {
            case 'opening':
                setOpeningTime(timeString);
                break;
            case 'closing':
                setClosingTime(timeString);
                break;
            case 'breakStart':
                setBreakStartTime(timeString);
                break;
            case 'breakEnd':
                setBreakEndTime(timeString);
                break;
        }
    };
    
    // Toggle off days
    const toggleOffDay = (dayId) => {
        if (offDays.includes(dayId)) {
            setOffDays(offDays.filter(day => day !== dayId));
        } else {
            setOffDays([...offDays, dayId]);
        }
    };
    
    // Save schedule changes
    const saveSchedule = async () => {
        // Validate times
        if (openingTime >= closingTime) {
            Alert.alert('Invalid Time', 'Opening time must be before closing time');
            return;
        }
        
        if (hasBreakTime && breakStartTime >= breakEndTime) {
            Alert.alert('Invalid Break Time', 'Break start time must be before break end time');
            return;
        }
        
        if (hasBreakTime && (breakStartTime <= openingTime || breakEndTime >= closingTime)) {
            Alert.alert('Invalid Break Time', 'Break time must be within business hours');
            return;
        }
        
    setIsSaving(true);
    
    try {
            await updateSchedule({
                isOpen,
                openingTime,
                closingTime,
                offDays,
                breakTime: {
                    enabled: hasBreakTime,
                    startTime: breakStartTime,
                    endTime: breakEndTime
                }
            });
            
      Alert.alert('Success', 'Schedule updated successfully');
    } catch (error) {
            console.error('Error saving schedule:', error);
            Alert.alert('Error', 'Failed to update schedule. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !scheduleData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME_COLOR} />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </SafeAreaView>
    );
  }

  return (
        <>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Schedule</Text>
                        <View style={styles.rightPlaceholder} />
                    </View>
                    
                    <ScrollView style={styles.content}>
      {error && (
                            <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Store Status</Text>
                            <View style={styles.switchRow}>
                                <View style={styles.switchLabelContainer}>
                                    <Text style={styles.switchLabel}>Store is currently {isOpen ? 'Open' : 'Closed'}</Text>
                                    <Text style={styles.switchSubLabel}>
                                        {isOpen 
                                            ? 'You are accepting orders when items are available' 
                                            : 'You are not accepting any orders'}
                                    </Text>
                                </View>
                                <Switch
                                    trackColor={{ false: '#d1d1d1', true: THEME_COLOR + '80' }}
                                    thumbColor={isOpen ? THEME_COLOR : '#f4f3f4'}
                                    ios_backgroundColor="#d1d1d1"
                                    onValueChange={(value) => {
                                        setIsOpen(value);
                                        // Show alert explaining the change
                                        if (value) {
                                            Alert.alert(
                                                'Opening Store',
                                                'When your store is open and menu items are available, you will receive orders from customers.',
                                                [{ text: 'OK' }]
                                            );
                                        } else {
                                            Alert.alert(
                                                'Closing Store',
                                                'Your store is now closed. You will not receive any new orders.',
                                                [{ text: 'OK' }]
                                            );
                                        }
                                    }}
                                    value={isOpen}
                                />
                            </View>
                        </View>
                        
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Business Hours</Text>
                            
                            <View style={styles.timeRow}>
                                <Text style={styles.timeLabel}>Opening Time:</Text>
                                <TouchableOpacity 
                                    style={styles.timePickerButton}
                                    onPress={() => showPicker('opening')}
                                >
                                    <Text style={styles.timePickerText}>{openingTime}</Text>
                                    <MaterialCommunityIcons name="clock-outline" size={20} color={THEME_COLOR} />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.timeRow}>
                                <Text style={styles.timeLabel}>Closing Time:</Text>
                                <TouchableOpacity 
                                    style={styles.timePickerButton}
                                    onPress={() => showPicker('closing')}
                                >
                                    <Text style={styles.timePickerText}>{closingTime}</Text>
                                    <MaterialCommunityIcons name="clock-outline" size={20} color={THEME_COLOR} />
                                </TouchableOpacity>
                            </View>
      </View>
      
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Break Time</Text>
                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>Enable Break Time</Text>
            <Switch
                                    trackColor={{ false: '#d1d1d1', true: THEME_COLOR + '80' }}
                                    thumbColor={hasBreakTime ? THEME_COLOR : '#f4f3f4'}
                                    ios_backgroundColor="#d1d1d1"
                                    onValueChange={setHasBreakTime}
                                    value={hasBreakTime}
            />
          </View>
          
                            {hasBreakTime && (
                                <>
                                    <View style={styles.timeRow}>
                                        <Text style={styles.timeLabel}>Start Time:</Text>
                                        <TouchableOpacity 
                                            style={styles.timePickerButton}
                                            onPress={() => showPicker('breakStart')}
                                        >
                                            <Text style={styles.timePickerText}>{breakStartTime}</Text>
                                            <MaterialCommunityIcons name="clock-outline" size={20} color={THEME_COLOR} />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <View style={styles.timeRow}>
                                        <Text style={styles.timeLabel}>End Time:</Text>
                                        <TouchableOpacity 
                                            style={styles.timePickerButton}
                                            onPress={() => showPicker('breakEnd')}
                                        >
                                            <Text style={styles.timePickerText}>{breakEndTime}</Text>
                                            <MaterialCommunityIcons name="clock-outline" size={20} color={THEME_COLOR} />
                                        </TouchableOpacity>
            </View>
                                </>
          )}
        </View>
        
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Off Days</Text>
                            <Text style={styles.offDaysInfo}>Select days when your store is closed</Text>
                            
                            {weekDays.map(day => (
                                <TouchableOpacity 
                key={day.id}
                                    style={[
                                        styles.dayRow,
                                        offDays.includes(day.id) && styles.selectedDayRow
                                    ]}
                                    onPress={() => toggleOffDay(day.id)}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        offDays.includes(day.id) && styles.selectedDayText
                                    ]}>
                                        {day.name}
                                    </Text>
                                    {offDays.includes(day.id) && (
                                        <MaterialCommunityIcons name="check" size={20} color="#fff" />
                                    )}
                                </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.saveButton}
                            onPress={saveSchedule}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
                                <Text style={styles.saveButtonText}>Save Schedule</Text>
            )}
          </TouchableOpacity>
                    </ScrollView>
                    
                    {showTimePicker && (
                        <Modal
                            visible={showTimePicker}
                            animationType="slide"
                            transparent={true}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Select Time</Text>
                                    
                                    <View style={styles.timeInputContainer}>
                                        <View style={styles.timeInputWrapper}>
                                            <Text style={styles.timeInputLabel}>Hour</Text>
                                            <CustomNumberPicker 
                                                initialValue={(() => {
                                                    const timeString = (() => {
                                                        switch (currentTimePickerFor) {
                                                            case 'opening': return openingTime;
                                                            case 'closing': return closingTime;
                                                            case 'breakStart': return breakStartTime;
                                                            case 'breakEnd': return breakEndTime;
                                                            default: return '00:00';
                                                        }
                                                    })();
                                                    return parseInt(timeString.split(':')[0], 10);
                                                })()}
                                                minValue={0}
                                                maxValue={23}
                                                onChange={(value) => {
                                                    const timeString = (() => {
                                                        switch (currentTimePickerFor) {
                                                            case 'opening': return openingTime;
                                                            case 'closing': return closingTime;
                                                            case 'breakStart': return breakStartTime;
                                                            case 'breakEnd': return breakEndTime;
                                                            default: return '00:00';
                                                        }
                                                    })();
                                                    const minutes = parseInt(timeString.split(':')[1], 10);
                                                    onTimeChange(value, minutes);
                                                }}
                                            />
                                        </View>
                                        
                                        <Text style={styles.timeSeparator}>:</Text>
                                        
                                        <View style={styles.timeInputWrapper}>
                                            <Text style={styles.timeInputLabel}>Minute</Text>
                                            <CustomNumberPicker 
                                                initialValue={(() => {
                                                    const timeString = (() => {
                                                        switch (currentTimePickerFor) {
                                                            case 'opening': return openingTime;
                                                            case 'closing': return closingTime;
                                                            case 'breakStart': return breakStartTime;
                                                            case 'breakEnd': return breakEndTime;
                                                            default: return '00:00';
                                                        }
                                                    })();
                                                    return parseInt(timeString.split(':')[1], 10);
                                                })()}
                                                minValue={0}
                                                maxValue={59}
                                                onChange={(value) => {
                                                    const timeString = (() => {
                                                        switch (currentTimePickerFor) {
                                                            case 'opening': return openingTime;
                                                            case 'closing': return closingTime;
                                                            case 'breakStart': return breakStartTime;
                                                            case 'breakEnd': return breakEndTime;
                                                            default: return '00:00';
                                                        }
                                                    })();
                                                    const hours = parseInt(timeString.split(':')[0], 10);
                                                    onTimeChange(hours, value);
                                                }}
                                            />
                                        </View>
                                    </View>
                                    
                                    <View style={styles.modalButtonsContainer}>
                                        <TouchableOpacity 
                                            style={styles.cancelModalButton}
                                            onPress={() => setShowTimePicker(false)}
                                        >
                                            <Text style={styles.cancelModalButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={styles.saveModalButton}
                                            onPress={() => setShowTimePicker(false)}
                                        >
                                            <Text style={styles.saveModalButtonText}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
        </View>
                        </Modal>
      )}
                </View>
    </SafeAreaView>
        </>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
  container: {
    flex: 1,
        backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
        backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    color: '#333',
  },
    rightPlaceholder: {
        width: 40,
    },
    content: {
    flex: 1,
        padding: 16,
  },
    card: {
        backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
        elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
        alignItems: 'center',
    marginBottom: 8,
  },
    switchLabelContainer: {
        flex: 1,
    },
    switchLabel: {
    fontSize: 16,
        color: '#333',
    },
    switchSubLabel: {
        fontSize: 12,
        color: '#888',
    marginTop: 4,
  },
    timeRow: {
    flexDirection: 'row',
        justifyContent: 'space-between',
    alignItems: 'center',
        marginBottom: 16,
  },
    timeLabel: {
    fontSize: 16,
    color: '#333',
  },
    timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    timePickerText: {
        fontSize: 16,
        color: '#333',
    marginRight: 8,
  },
    offDaysInfo: {
    fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    dayRow: {
    flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedDayRow: {
        backgroundColor: THEME_COLOR,
        borderRadius: 8,
        marginVertical: 4,
        borderBottomWidth: 0,
    },
    dayText: {
        fontSize: 16,
        color: '#333',
    },
    selectedDayText: {
        color: '#fff',
        fontWeight: '500',
  },
  saveButton: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 24,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
        fontWeight: 'bold',
    },
    errorContainer: {
        backgroundColor: '#FFE8E6',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#F44336',
    },
    errorText: {
        color: '#D32F2F',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    timeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    timeInputWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    timeInputLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    timeSeparator: {
        fontSize: 16,
        color: '#333',
        marginHorizontal: 10,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    cancelModalButton: {
        backgroundColor: '#d1d1d1',
        padding: 12,
        borderRadius: 8,
    },
    cancelModalButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    saveModalButton: {
        backgroundColor: THEME_COLOR,
        padding: 12,
    borderRadius: 8,
  },
    saveModalButtonText: {
    fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
  },
});

export default VendorScheduleScreen; 