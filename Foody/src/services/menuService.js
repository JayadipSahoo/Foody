import api from './apiService';

const menuService = {
    // Get all menu items for the vendor
    getMenuItems: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.isAvailable !== undefined) queryParams.append('isAvailable', filters.isAvailable);
            if (filters.isVeg !== undefined) queryParams.append('isVeg', filters.isVeg);
            if (filters.featured !== undefined) queryParams.append('featured', filters.featured);

            const url = `/menu${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching menu items' }; 
        }
    },

    // Get a single menu item
    getMenuItem: async (id) => {
        try {
            const response = await api.get(`/menu/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching menu item' };
        }
    },

    // Create a new menu item
    createMenuItem: async (menuData) => {
        try {
            const response = await api.post('/menu', menuData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error creating menu item' };
        }
    },

    // Update a menu item
    updateMenuItem: async (id, menuData) => {
        try {
            const response = await api.put(`/menu/${id}`, menuData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error updating menu item' };
        }
    },

    // Delete a menu item
    deleteMenuItem: async (id) => {
        try {
            const response = await api.delete(`/menu/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error deleting menu item' };
        }
    },

    // Toggle menu item availability
    toggleItemAvailability: async (id, isAvailable) => {
        try {
            const response = await api.patch(`/menu/${id}/availability`, { isAvailable });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error toggling item availability' };
        }
    },

    // Get all categories
    getCategories: async () => {
        try {
            const response = await api.get('/menu/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching categories' };
        }
    },

    // Create a new category
    createCategory: async (categoryData) => {
        try {   
            console.log('Category data:', categoryData);
            const directResponse = await axios.post(
                'http://192.168.0.111:5000/api/menu/categories',
                {
                   categoryData
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
                    }
                }
            );
            console.log('Direct API response:', directResponse.data);
        } catch (error) {
            throw error.response?.data || { message: 'Error creating category' };
        }
    },

    // Update a category
    updateCategory: async (id, categoryData) => {
        try {
            const response = await api.put(`/menu/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error updating category' };
        }
    },

    // Delete a category
    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/menu/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error deleting category' };
        }
    },
};

export default menuService;