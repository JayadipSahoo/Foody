import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { vendorAPI } from "../services/apiService";
import useAuthStore from "./authStore";
import { devtools } from 'zustand/middleware';

// Debug flag
const DEBUG_VENDOR = true;

// Create a proper Zustand hook
export const useVendorStore = create(
    devtools(
        (set, get) => ({
    // Vendor profile data
    vendorData: null,
    
    // Menu items
    menuItems: [],
    filteredMenuItems: [],
    
    // Vendor orders
    orders: [],
    filteredOrders: [],
    orderStatusCounts: {
        pending: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
        cancelled: 0,
    },
    
    // Schedule data
    scheduleData: {
        isOpen: true,
        openingTime: "09:00",
        closingTime: "22:00",
        offDays: [],
        specialHours: [],
    },
    
    // UI state
    isLoading: false,
    fetchTimestamps: {
        profile: 0,
        menuItems: 0,
        orders: 0,
        schedule: 0
    },
    error: null,
            
            // Menu Schedules
            menuSchedules: [],
            currentMenuSchedule: null,
            isLoadingMenuSchedules: false,
            menuScheduleError: null,
    
    // Update fetch timestamp to prevent too frequent API calls
    updateFetchTimestamp: (key) => {
        set(state => ({
            fetchTimestamps: {
                ...state.fetchTimestamps,
                [key]: Date.now()
            }
        }));
    },
    
    // Check if we should fetch data based on last fetch time
    shouldFetch: (key, minInterval = 30000) => { // Default 30 second interval
        const { fetchTimestamps } = get();
        const lastFetch = fetchTimestamps[key] || 0;
        const now = Date.now();
        return (now - lastFetch) > minInterval;
    },
    
    // Get vendor profile data
    fetchVendorProfile: async (options = {}) => {
        // Skip if already loading or fetched recently (unless forced)
        if (get().isLoading && !options.force) return get().vendorData;
        if (!options.force && !get().shouldFetch('profile')) {
            if (DEBUG_VENDOR) console.log("Skipping vendor profile fetch - fetched recently");
            return get().vendorData;
        }
        
        if (DEBUG_VENDOR) console.log("Fetching vendor profile");
        set({ isLoading: true, error: null });
        
        try {
            const data = await vendorAPI.getProfile();
            
            if (data) {
                set({ 
                    vendorData: data,
                    isLoading: false
                });
                get().updateFetchTimestamp('profile');
                return data;
            }
            
            throw new Error('No data returned from API');
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                    return null;
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to fetch vendor profile'
            });
            return null;
        }
    },
    
    // Update vendor profile data
    updateVendorProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        
        // Add extra logging for locations
        if (DEBUG_VENDOR || true) {
            console.log("Updating vendor profile with data:", {
                ...profileData,
                locationsServed: profileData.locationsServed 
                    ? `Array with ${profileData.locationsServed.length} locations`
                    : 'undefined'
            });
            
            if (profileData.locationsServed) {
                console.log("Locations being sent:", profileData.locationsServed);
            }
        }
        
        try {
            const data = await vendorAPI.updateProfile(profileData);
            
            if (data) {
                // Log updated data
                if (DEBUG_VENDOR || true) {
                    console.log("Vendor profile updated successfully, received data:", {
                        ...data,
                        locationsServed: data.locationsServed 
                            ? `Array with ${data.locationsServed.length} locations`
                            : 'undefined'
                    });
                    
                    if (data.locationsServed) {
                        console.log("Updated locations:", data.locationsServed);
                    }
                }
                
                // Update the local state
                set({ 
                    vendorData: data,
                    isLoading: false
                });
                get().updateFetchTimestamp('profile');
                return data;
            }
            
            throw new Error('No data returned from API');
        } catch (error) {
            console.error('Error updating vendor profile:', error);
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                    return null;
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to update vendor profile'
            });
            return null;
        }
    },
    
    // Get vendor menu items
    fetchMenuItems: async (options = {}) => {
        // Skip if already loading or fetched recently (unless forced)
        if (get().isLoading && !options.force) return get().menuItems;
        if (!options.force && !get().shouldFetch('menuItems')) {
            if (DEBUG_VENDOR) console.log("Skipping menu items fetch - fetched recently");
            return get().menuItems;
        }
        
                if (DEBUG_VENDOR) {
                    console.log("[VendorStore] Fetching menu items");
                    // Log auth status to debug role issues
                    const authStatus = await AsyncStorage.getItem('userType');
                    const token = await AsyncStorage.getItem('userToken');
                    const userData = await AsyncStorage.getItem('userData');
                    console.log("[VendorStore] Auth status:", { 
                        userType: authStatus, 
                        hasToken: !!token,
                        userData: userData ? JSON.parse(userData) : null
                    });
                }
        
        try {
            const data = await vendorAPI.getMenu();
                    
                    if (DEBUG_VENDOR) {
                        console.log("[VendorStore] Menu items fetched:", data?.length || 0);
                    }
            
            if (data) {
                set({ 
                    menuItems: data,
                    filteredMenuItems: data,
                    isLoading: false 
                });
                get().updateFetchTimestamp('menuItems');
                return data;
            }
            
            throw new Error('No menu items returned from API');
        } catch (error) {
            console.error('Error fetching menu items:', error);
                    
                    if (DEBUG_VENDOR) {
                        console.log("[VendorStore] Error details:", { 
                            message: error.message,
                            isAuthError: !!error.isAuthError,
                            response: error.response?.data
                        });
                    }
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                    return [];
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to fetch menu items'
            });
            return [];
        }
    },
    
    // Filter menu items
    filterMenuItems: (filters) => {
        const { menuItems } = get();
        
        if (!menuItems || !menuItems.length) {
            set({ filteredMenuItems: [] });
            return;
        }
        
        let filtered = [...menuItems];
        
        // Apply filters
        if (filters) {
            if (filters.query) {
                const query = filters.query.toLowerCase();
                filtered = filtered.filter(item => 
                    item.name.toLowerCase().includes(query) || 
                    item.description.toLowerCase().includes(query)
                );
            }
            
            if (filters.isVeg === true) {
                filtered = filtered.filter(item => item.isVeg);
            } else if (filters.isVeg === false) {
                filtered = filtered.filter(item => !item.isVeg);
            }
            
            if (filters.isAvailable === true) {
                filtered = filtered.filter(item => item.isAvailable);
            } else if (filters.isAvailable === false) {
                filtered = filtered.filter(item => !item.isAvailable);
            }
        }
        
        set({ filteredMenuItems: filtered });
    },
    
    // Create a new menu item
    createMenuItem: async (menuItemData) => {
        set({ isLoading: true, error: null });
        
        try {
            const data = await vendorAPI.addMenuItem(menuItemData);
            
            if (data) {
                // Update the local state with the new item
                set(state => ({ 
                    menuItems: [...state.menuItems, data],
                    filteredMenuItems: [...state.filteredMenuItems, data],
                    isLoading: false 
                }));
                
                return data;
            }
            
            throw new Error('Failed to create menu item');
        } catch (error) {
            console.error('Error creating menu item:', error);
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                    return null;
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to create menu item'
            });
            return null;
        }
    },
    
    // Update an existing menu item
    updateMenuItem: async (id, menuItemData) => {
        set({ isLoading: true, error: null });
        
        try {
            const data = await vendorAPI.updateMenuItem(id, menuItemData);
            
            if (data) {
                // Update the local state
                set(state => {
                    const updatedMenuItems = state.menuItems.map(item => 
                        item._id === id ? data : item
                    );
                    
                    const updatedFilteredItems = state.filteredMenuItems.map(item => 
                        item._id === id ? data : item
                    );
                    
                    return { 
                        menuItems: updatedMenuItems,
                        filteredMenuItems: updatedFilteredItems,
                        isLoading: false 
                    };
                });
                
                return data;
            }
            
            throw new Error('Failed to update menu item');
        } catch (error) {
            console.error('Error updating menu item:', error);
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                    return null;
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to update menu item'
            });
            return null;
        }
    },
    
    // Delete a menu item
    deleteMenuItem: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
            await vendorAPI.deleteMenuItem(id);
            
            // Update the local state
            set(state => ({
                menuItems: state.menuItems.filter(item => item._id !== id),
                filteredMenuItems: state.filteredMenuItems.filter(item => item._id !== id),
                isLoading: false
            }));
            
            return true;
        } catch (error) {
            console.error('Error deleting menu item:', error);
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                    return false;
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to delete menu item'
            });
            return false;
        }
    },
    
    // Toggle menu item availability
            toggleItemAvailability: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
                    // Call the API service function
                    const data = await vendorAPI.toggleItemAvailability(id);
            
            if (data) {
                // Update the local state
                set(state => {
                    const updatedMenuItems = state.menuItems.map(item => 
                                item._id === id ? data : item
                    );
                    
                    const updatedFilteredItems = state.filteredMenuItems.map(item => 
                                item._id === id ? data : item
                    );
                    
                    return { 
                        menuItems: updatedMenuItems,
                        filteredMenuItems: updatedFilteredItems,
                        isLoading: false 
                    };
                });
                
                        return data;
            }
            
            throw new Error('Failed to update menu item availability');
        } catch (error) {
            console.error('Error updating menu item availability:', error);
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                            return null;
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to update menu item availability'
            });
                    return null;
        }
    },
    
    // Get vendor orders
    fetchOrders: async (options = {}) => {
        // Skip if already loading or fetched recently (unless forced)
        if (get().isLoading && !options.force) return get().orders;
        if (!options.force && !get().shouldFetch('orders')) {
            if (DEBUG_VENDOR) console.log("Skipping orders fetch - fetched recently");
            return get().orders;
        }
        
        if (DEBUG_VENDOR) console.log("Fetching orders");
        set({ isLoading: true, error: null });
        
        try {
            const data = await vendorAPI.getOrders();
            
            if (data) {
                // Calculate status counts
                const statusCounts = {
                    pending: 0,
                    preparing: 0,
                    ready: 0,
                    delivered: 0,
                    cancelled: 0,
                };
                
                data.forEach(order => {
                    if (statusCounts.hasOwnProperty(order.status)) {
                        statusCounts[order.status]++;
                    }
                });
                
                set({ 
                    orders: data,
                    filteredOrders: data,
                    orderStatusCounts: statusCounts,
                    isLoading: false 
                });
                
                get().updateFetchTimestamp('orders');
                return data;
            }
            
            throw new Error('No orders returned from API');
        } catch (error) {
            console.error('Error fetching vendor orders:', error);
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                    return [];
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to fetch orders'
            });
            return [];
        }
    },
    
    // Filter orders
    filterOrders: (filters) => {
        const { orders } = get();
        
        if (!orders || !orders.length) {
            set({ filteredOrders: [] });
            return;
        }
        
        let filtered = [...orders];
        
        // Apply filters
        if (filters) {
            if (filters.status) {
                filtered = filtered.filter(order => order.status === filters.status);
            }
            
            if (filters.query) {
                const query = filters.query.toLowerCase();
                filtered = filtered.filter(order => {
                    // Check for matching order number
                    if (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) {
                        return true;
                    }
                    
                    // Check for matching customer name
                    if (order.user && order.user.name && order.user.name.toLowerCase().includes(query)) {
                        return true;
                    }
                    
                    // Check for matching item names
                    if (order.items && order.items.some(item => 
                        item.name && item.name.toLowerCase().includes(query)
                    )) {
                        return true;
                    }
                    
                    return false;
                });
            }
        }
        
        set({ filteredOrders: filtered });
    },
    
    // Update order status
    updateOrderStatus: async (orderId, status) => {
        set({ isLoading: true, error: null });
        
        try {
            const data = await vendorAPI.updateOrderStatus(orderId, status);
            
            if (data) {
                // Update the local state
                set(state => {
                    const updatedOrders = state.orders.map(order => 
                        order._id === orderId ? { ...order, status } : order
                    );
                    
                    const updatedFilteredOrders = state.filteredOrders.map(order => 
                        order._id === orderId ? { ...order, status } : order
                    );
                    
                    // Recalculate status counts
                    const statusCounts = { ...state.orderStatusCounts };
                    
                    // Decrement previous status count
                    const prevOrder = state.orders.find(o => o._id === orderId);
                    if (prevOrder && statusCounts.hasOwnProperty(prevOrder.status)) {
                        statusCounts[prevOrder.status]--;
                    }
                    
                    // Increment new status count
                    if (statusCounts.hasOwnProperty(status)) {
                        statusCounts[status]++;
                    }
                    
                    return { 
                        orders: updatedOrders,
                        filteredOrders: updatedFilteredOrders,
                        orderStatusCounts: statusCounts,
                        isLoading: false 
                    };
                });
                
                return data;
            }
            
            throw new Error('Failed to update order status');
        } catch (error) {
            console.error('Error updating order status:', error);
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                    return null;
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to update order status'
            });
            return null;
        }
    },
    
    // Fetch store schedule
    fetchSchedule: async (options = {}) => {
        // Skip if already loading or fetched recently (unless forced)
        if (get().isLoading && !options.force) return get().scheduleData;
        if (!options.force && !get().shouldFetch('schedule')) {
            if (DEBUG_VENDOR) console.log("Skipping schedule fetch - fetched recently");
            return get().scheduleData;
        }
        
        if (DEBUG_VENDOR) console.log("Fetching schedule");
        set({ isLoading: true, error: null });
        
        try {
            const data = await vendorAPI.getSchedule();
            
            if (data) {
                set({ 
                    scheduleData: data,
                    isLoading: false 
                });
                
                get().updateFetchTimestamp('schedule');
                return data;
            }
            
            throw new Error('No schedule data returned from API');
        } catch (error) {
            console.error('Error fetching schedule:', error);
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                    return null;
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to fetch schedule'
            });
            return null;
        }
    },
    
    // Update store schedule
    updateSchedule: async (scheduleData) => {
        set({ isLoading: true, error: null });
        
        try {
            const data = await vendorAPI.updateSchedule(scheduleData);
            
            if (data) {
                set({ 
                    scheduleData: data,
                    isLoading: false 
                });
                
                return data;
            }
            
            throw new Error('Failed to update schedule');
        } catch (error) {
            console.error('Error updating schedule:', error);
            
            // Handle auth errors
            if (error.isAuthError) {
                const handled = await useAuthStore.getState().handleAuthError({
                    isAuthError: true,
                    message: 'Your session has expired. Please log in again.'
                });
                
                if (handled) {
                    set({ isLoading: false });
                    return null;
                }
            }
            
            set({ 
                isLoading: false, 
                error: error.message || 'Failed to update schedule'
            });
            return null;
        }
    },
    
    // Reset state
    resetState: () => {
        set({
            vendorData: null,
            menuItems: [],
            filteredMenuItems: [],
            orders: [],
            filteredOrders: [],
            orderStatusCounts: {
                pending: 0,
                preparing: 0,
                ready: 0,
                delivered: 0,
                cancelled: 0,
            },
            scheduleData: {
                isOpen: true,
                openingTime: "09:00",
                closingTime: "22:00",
                offDays: [],
                specialHours: [],
            },
            isLoading: false,
            fetchTimestamps: {
                profile: 0,
                menuItems: 0,
                orders: 0,
                schedule: 0
            },
            error: null,
                    menuSchedules: [],
                    currentMenuSchedule: null,
                    isLoadingMenuSchedules: false,
                    menuScheduleError: null,
        });
    },
    
    // Clear error
    clearError: () => set({ error: null }),
            
            // Fetch menu schedules
            fetchMenuSchedules: async (options = {}) => {
                // Skip if already loading or fetched recently (unless forced)
                if (get().isLoadingMenuSchedules && !options.force) return get().menuSchedules;
                if (!options.force && !get().shouldFetch('menuSchedules')) {
                    if (DEBUG_VENDOR) console.log("Skipping menu schedules fetch - fetched recently");
                    return get().menuSchedules;
                }
                
                if (DEBUG_VENDOR) console.log("[VendorStore] Fetching menu schedules");
                set({ isLoadingMenuSchedules: true, menuScheduleError: null });
                
                try {
                    const data = await vendorAPI.getMenuSchedules();
                    
                    if (DEBUG_VENDOR) {
                        console.log("[VendorStore] Menu schedules fetched:", data?.length || 0);
                    }
                    
                    set({ 
                        menuSchedules: data || [],
                        isLoadingMenuSchedules: false 
                    });
                    get().updateFetchTimestamp('menuSchedules');
                    return data;
                } catch (error) {
                    console.error('Error fetching menu schedules:', error);
                    
                    if (DEBUG_VENDOR) {
                        console.log("[VendorStore] Error details:", { 
                            message: error.message,
                            isAuthError: !!error.isAuthError,
                            response: error.response?.data
                        });
                    }
                    
                    // Handle auth errors
                    if (error.isAuthError) {
                        const handled = await useAuthStore.getState().handleAuthError({
                            isAuthError: true,
                            message: 'Your session has expired. Please log in again.'
                        });
                        
                        if (handled) {
                            set({ isLoadingMenuSchedules: false });
                            return [];
                        }
                    }
                    
                    set({ 
                        isLoadingMenuSchedules: false, 
                        menuScheduleError: error.message || 'Failed to fetch menu schedules'
                    });
                    return [];
                }
            },
            
            // Get a single menu schedule
            getMenuSchedule: async (id) => {
                set({ isLoadingMenuSchedules: true, menuScheduleError: null });
                
                try {
                    const data = await vendorAPI.getMenuSchedule(id);
                    
                    set({ 
                        currentMenuSchedule: data,
                        isLoadingMenuSchedules: false 
                    });
                    
                    return data;
                } catch (error) {
                    console.error(`Error fetching menu schedule ${id}:`, error);
                    
                    // Handle auth errors
                    if (error.isAuthError) {
                        await useAuthStore.getState().handleAuthError({
                            isAuthError: true,
                            message: 'Your session has expired. Please log in again.'
                        });
                    }
                    
                    set({ 
                        isLoadingMenuSchedules: false, 
                        menuScheduleError: error.message || 'Failed to fetch menu schedule'
                    });
                    return null;
                }
            },
            
            // Create a new menu schedule
            createMenuSchedule: async (scheduleData) => {
                set({ isLoadingMenuSchedules: true, menuScheduleError: null });
                
                try {
                    const data = await vendorAPI.createMenuSchedule(scheduleData);
                    
                    // Update the local state with the new schedule
                    set(state => ({ 
                        menuSchedules: [...state.menuSchedules, data],
                        currentMenuSchedule: data,
                        isLoadingMenuSchedules: false 
                    }));
                    
                    return data;
                } catch (error) {
                    console.error('Error creating menu schedule:', error);
                    
                    // Handle auth errors
                    if (error.isAuthError) {
                        await useAuthStore.getState().handleAuthError({
                            isAuthError: true,
                            message: 'Your session has expired. Please log in again.'
                        });
                    }
                    
                    set({ 
                        isLoadingMenuSchedules: false, 
                        menuScheduleError: error.message || 'Failed to create menu schedule'
                    });
                    return null;
                }
            },
            
            // Update a menu schedule
            updateMenuSchedule: async (id, scheduleData) => {
                set({ isLoadingMenuSchedules: true, menuScheduleError: null });
                
                try {
                    const data = await vendorAPI.updateMenuSchedule(id, scheduleData);
                    
                    // Update the local state
                    set(state => {
                        const updatedSchedules = state.menuSchedules.map(schedule => 
                            schedule._id === id ? data : schedule
                        );
                        
                        return { 
                            menuSchedules: updatedSchedules,
                            currentMenuSchedule: data,
                            isLoadingMenuSchedules: false 
                        };
                    });
                    
                    return data;
                } catch (error) {
                    console.error(`Error updating menu schedule ${id}:`, error);
                    
                    // Handle auth errors
                    if (error.isAuthError) {
                        await useAuthStore.getState().handleAuthError({
                            isAuthError: true,
                            message: 'Your session has expired. Please log in again.'
                        });
                    }
                    
                    set({ 
                        isLoadingMenuSchedules: false, 
                        menuScheduleError: error.message || 'Failed to update menu schedule'
                    });
                    return null;
                }
            },
            
            // Delete a menu schedule
            deleteMenuSchedule: async (id) => {
                set({ isLoadingMenuSchedules: true, menuScheduleError: null });
                
                try {
                    await vendorAPI.deleteMenuSchedule(id);
                    
                    // Update the local state
                    set(state => ({
                        menuSchedules: state.menuSchedules.filter(schedule => schedule._id !== id),
                        currentMenuSchedule: state.currentMenuSchedule?._id === id ? null : state.currentMenuSchedule,
                        isLoadingMenuSchedules: false
                    }));
                    
                    return true;
                } catch (error) {
                    console.error(`Error deleting menu schedule ${id}:`, error);
                    
                    // Handle auth errors
                    if (error.isAuthError) {
                        await useAuthStore.getState().handleAuthError({
                            isAuthError: true,
                            message: 'Your session has expired. Please log in again.'
                        });
                    }
                    
                    set({ 
                        isLoadingMenuSchedules: false, 
                        menuScheduleError: error.message || 'Failed to delete menu schedule'
                    });
                    return false;
                }
            },
            
            // Toggle a menu schedule's active status
            toggleMenuScheduleStatus: async (id) => {
                set({ isLoadingMenuSchedules: true, menuScheduleError: null });
                
                try {
                    const data = await vendorAPI.toggleMenuScheduleStatus(id);
                    
                    // Update the local state
                    set(state => {
                        const updatedSchedules = state.menuSchedules.map(schedule => 
                            schedule._id === id ? data : schedule
                        );
                        
                        return { 
                            menuSchedules: updatedSchedules,
                            currentMenuSchedule: state.currentMenuSchedule?._id === id ? data : state.currentMenuSchedule,
                            isLoadingMenuSchedules: false 
                        };
                    });
                    
                    return data;
                } catch (error) {
                    console.error(`Error toggling menu schedule ${id} status:`, error);
                    
                    // Handle auth errors
                    if (error.isAuthError) {
                        await useAuthStore.getState().handleAuthError({
                            isAuthError: true,
                            message: 'Your session has expired. Please log in again.'
                        });
                    }
                    
                    set({ 
                        isLoadingMenuSchedules: false, 
                        menuScheduleError: error.message || 'Failed to toggle menu schedule status'
                    });
                    return null;
                }
            },
        })
    )
);

// No need for the default export anymore
// export default vendorStore; 