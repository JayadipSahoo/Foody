import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Image,
    Modal,
    TextInput,
    Switch,
    ActivityIndicator,
    Alert,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import menuService from "../../services/menuService";

const VendorMenuScreen = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // New item form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        isVeg: false,
        isAvailable: true,
        isFeatured: false,
        image: "",
    });

    // New category form state
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
        displayOrder: "0",
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [menuItemsData, categoriesData] = await Promise.all([
                menuService.getMenuItems(),
                menuService.getCategories(),
            ]);
            setMenuItems(menuItemsData);
            setCategories(categoriesData);
        } catch (err) {
            setError(err.message || "Failed to load data");
            Alert.alert("Error", err.message || "Failed to load data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const filteredItems = selectedCategory
        ? menuItems.filter((item) => item.categoryId._id === selectedCategory)
        : menuItems;

    const handleCreateCategory = async () => {
        if (!categoryForm.name.trim()) {
            Alert.alert("Error", "Category name is required");
            return;
        }

        try {
            setLoading(true);
            const newCategory = await menuService.createCategory({
                name: categoryForm.name,
                description: categoryForm.description,
                displayOrder: parseInt(categoryForm.displayOrder) || 0,
            });
            setCategories([...categories, newCategory]);
            setCategoryForm({ name: "", description: "", displayOrder: "0" });
            setModalVisible(false);
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to create category");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMenuItem = async () => {
        if (!formData.name.trim() || !formData.price || !formData.categoryId) {
            Alert.alert("Error", "Name, price and category are required");
            return;
        }

        try {
            setLoading(true);
            const priceValue = parseFloat(formData.price);
            if (isNaN(priceValue) || priceValue < 0) {
                throw new Error("Price must be a positive number");
            }

            const itemData = {
                ...formData,
                price: priceValue,
            };

            const newItem = await menuService.createMenuItem(itemData);
            setMenuItems([newItem, ...menuItems]);
            setFormData({
                name: "",
                description: "",
                price: "",
                categoryId: "",
                isVeg: false,
                isAvailable: true,
                isFeatured: false,
                image: "",
            });
            setItemModalVisible(false);
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to create menu item");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAvailability = async (itemId, currentStatus) => {
        try {
            await menuService.toggleItemAvailability(itemId, !currentStatus);
            setMenuItems(
                menuItems.map((item) =>
                    item._id === itemId
                        ? { ...item, isAvailable: !currentStatus }
                        : item
                )
            );
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to update item");
        }
    };

    const handleEditItem = (item) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            description: item.description || "",
            price: item.price.toString(),
            categoryId: item.categoryId._id,
            isVeg: item.isVeg,
            isAvailable: item.isAvailable,
            isFeatured: item.isFeatured,
            image: item.image || "",
        });
        setItemModalVisible(true);
    };

    const handleUpdateMenuItem = async () => {
        if (!formData.name.trim() || !formData.price || !formData.categoryId) {
            Alert.alert("Error", "Name, price and category are required");
            return;
        }

        try {
            setLoading(true);
            const priceValue = parseFloat(formData.price);
            if (isNaN(priceValue) || priceValue < 0) {
                throw new Error("Price must be a positive number");
            }

            const itemData = {
                ...formData,
                price: priceValue,
            };

            const updatedItem = await menuService.updateMenuItem(
                selectedItem._id,
                itemData
            );
            setMenuItems(
                menuItems.map((item) =>
                    item._id === selectedItem._id ? updatedItem : item
                )
            );
            setSelectedItem(null);
            setFormData({
                name: "",
                description: "",
                price: "",
                categoryId: "",
                isVeg: false,
                isAvailable: true,
                isFeatured: false,
                image: "",
            });
            setItemModalVisible(false);
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to update menu item");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this item?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await menuService.deleteMenuItem(itemId);
                            setMenuItems(
                                menuItems.filter((item) => item._id !== itemId)
                            );
                        } catch (err) {
                            Alert.alert(
                                "Error",
                                err.message || "Failed to delete item"
                            );
                        }
                    },
                },
            ]
        );
    };

    const renderMenuItem = ({ item }) => (
        <View style={styles.menuItem}>
            <View style={styles.menuItemHeader}>
                <View style={styles.menuItemDetails}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <View style={styles.menuItemBadges}>
                        {item.isVeg && (
                            <View style={styles.vegBadge}>
                                <Text style={styles.badgeText}>Veg</Text>
                            </View>
                        )}
                        {item.isFeatured && (
                            <View style={styles.featuredBadge}>
                                <Text style={styles.badgeText}>Featured</Text>
                            </View>
                        )}
                    </View>
                </View>
                <Text style={styles.menuItemPrice}>
                    ₹{item.price.toFixed(2)}
                </Text>
            </View>

            {item.description && (
                <Text style={styles.menuItemDescription}>
                    {item.description}
                </Text>
            )}

            <View style={styles.menuItemCategory}>
                <Text style={styles.categoryName}>
                    {item.categoryId?.name || "Uncategorized"}
                </Text>
            </View>

            <View style={styles.menuItemActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditItem(item)}
                >
                    <Ionicons name="pencil" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        item.isAvailable
                            ? styles.disableButton
                            : styles.enableButton,
                    ]}
                    onPress={() =>
                        handleToggleAvailability(item._id, item.isAvailable)
                    }
                >
                    <MaterialCommunityIcons
                        name={
                            item.isAvailable ? "close-circle" : "check-circle"
                        }
                        size={16}
                        color="#fff"
                    />
                    <Text style={styles.actionButtonText}>
                        {item.isAvailable ? "Disable" : "Enable"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteItem(item._id)}
                >
                    <MaterialCommunityIcons
                        name="delete"
                        size={16}
                        color="#fff"
                    />
                    <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Menu Management</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <MaterialCommunityIcons
                        name="playlist-plus"
                        size={20}
                        color="#fff"
                    />
                    <Text style={styles.addButtonText}>Add Category</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        if (categories.length === 0) {
                            Alert.alert(
                                "Error",
                                "Please create a category first"
                            );
                            return;
                        }
                        setSelectedItem(null);
                        setFormData({
                            name: "",
                            description: "",
                            price: "",
                            categoryId: categories[0]._id,
                            isVeg: false,
                            isAvailable: true,
                            isFeatured: false,
                            image: "",
                        });
                        setItemModalVisible(true);
                    }}
                >
                    <MaterialCommunityIcons
                        name="food-variant-plus"
                        size={20}
                        color="#fff"
                    />
                    <Text style={styles.addButtonText}>Add Menu Item</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.categoryFilter}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            selectedCategory === null &&
                                styles.selectedCategoryChip,
                        ]}
                        onPress={() => setSelectedCategory(null)}
                    >
                        <Text style={styles.categoryChipText}>All</Text>
                    </TouchableOpacity>

                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category._id}
                            style={[
                                styles.categoryChip,
                                selectedCategory === category._id &&
                                    styles.selectedCategoryChip,
                            ]}
                            onPress={() => setSelectedCategory(category._id)}
                        >
                            <Text style={styles.categoryChipText}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4361ee" />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={loadData}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : filteredItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                        name="food-off"
                        size={64}
                        color="#d1d9e6"
                    />
                    <Text style={styles.emptyText}>No menu items found</Text>
                    <Text style={styles.emptySubtext}>
                        {selectedCategory
                            ? "Try selecting a different category or add items to this category"
                            : "Start adding items to your menu"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    renderItem={renderMenuItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.menuList}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            )}

            {/* Add Category Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Add New Category
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Name*</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Category name"
                                value={categoryForm.name}
                                onChangeText={(text) =>
                                    setCategoryForm({
                                        ...categoryForm,
                                        name: text,
                                    })
                                }
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Description</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Category description"
                                value={categoryForm.description}
                                onChangeText={(text) =>
                                    setCategoryForm({
                                        ...categoryForm,
                                        description: text,
                                    })
                                }
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Display Order</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Display order"
                                value={categoryForm.displayOrder}
                                onChangeText={(text) =>
                                    setCategoryForm({
                                        ...categoryForm,
                                        displayOrder: text,
                                    })
                                }
                                keyboardType="numeric"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleCreateCategory}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    Create Category
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add/Edit Menu Item Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={itemModalVisible}
                onRequestClose={() => setItemModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedItem
                                    ? "Edit Menu Item"
                                    : "Add New Menu Item"}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setItemModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Name*</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="Item name"
                                    value={formData.name}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, name: text })
                                    }
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>
                                    Description
                                </Text>
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    placeholder="Item description"
                                    value={formData.description}
                                    onChangeText={(text) =>
                                        setFormData({
                                            ...formData,
                                            description: text,
                                        })
                                    }
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Price*</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="Price"
                                    value={formData.price}
                                    onChangeText={(text) =>
                                        setFormData({
                                            ...formData,
                                            price: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Category*</Text>
                                <View style={styles.pickerContainer}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                    >
                                        {categories.map((category) => (
                                            <TouchableOpacity
                                                key={category._id}
                                                style={[
                                                    styles.categoryOption,
                                                    formData.categoryId ===
                                                        category._id &&
                                                        styles.selectedCategoryOption,
                                                ]}
                                                onPress={() =>
                                                    setFormData({
                                                        ...formData,
                                                        categoryId:
                                                            category._id,
                                                    })
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.categoryOptionText,
                                                        formData.categoryId ===
                                                            category._id &&
                                                            styles.selectedCategoryOptionText,
                                                    ]}
                                                >
                                                    {category.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Image URL</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="Image URL"
                                    value={formData.image}
                                    onChangeText={(text) =>
                                        setFormData({
                                            ...formData,
                                            image: text,
                                        })
                                    }
                                />
                            </View>

                            <View style={styles.switchGroup}>
                                <Text style={styles.formLabel}>Vegetarian</Text>
                                <Switch
                                    value={formData.isVeg}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            isVeg: value,
                                        })
                                    }
                                    trackColor={{
                                        false: "#ccc",
                                        true: "#4CAF50",
                                    }}
                                    thumbColor={
                                        formData.isVeg ? "#fff" : "#f4f3f4"
                                    }
                                />
                            </View>

                            <View style={styles.switchGroup}>
                                <Text style={styles.formLabel}>Available</Text>
                                <Switch
                                    value={formData.isAvailable}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            isAvailable: value,
                                        })
                                    }
                                    trackColor={{
                                        false: "#ccc",
                                        true: "#4361ee",
                                    }}
                                    thumbColor={
                                        formData.isAvailable
                                            ? "#fff"
                                            : "#f4f3f4"
                                    }
                                />
                            </View>

                            <View style={styles.switchGroup}>
                                <Text style={styles.formLabel}>Featured</Text>
                                <Switch
                                    value={formData.isFeatured}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            isFeatured: value,
                                        })
                                    }
                                    trackColor={{
                                        false: "#ccc",
                                        true: "#FF9800",
                                    }}
                                    thumbColor={
                                        formData.isFeatured ? "#fff" : "#f4f3f4"
                                    }
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={
                                    selectedItem
                                        ? handleUpdateMenuItem
                                        : handleCreateMenuItem
                                }
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                    />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {selectedItem
                                            ? "Update Item"
                                            : "Create Item"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        padding: 20,
        backgroundColor: "#4361ee",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4361ee",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "600",
        marginLeft: 5,
    },
    categoryFilter: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "#f8f9fa",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    categoryChip: {
        paddingVertical: 6,
        paddingHorizontal: 15,
        backgroundColor: "#e9ecef",
        borderRadius: 20,
        marginRight: 10,
    },
    selectedCategoryChip: {
        backgroundColor: "#4361ee",
    },
    categoryChipText: {
        color: "#333",
        fontWeight: "500",
    },
    selectedCategoryChipText: {
        color: "#fff",
    },
    menuList: {
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: "#dc3545",
        marginBottom: 15,
        textAlign: "center",
    },
    retryButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#4361ee",
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 10,
    },
    menuItem: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuItemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    menuItemDetails: {
        flex: 1,
    },
    menuItemName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    menuItemBadges: {
        flexDirection: "row",
        marginTop: 5,
    },
    vegBadge: {
        backgroundColor: "#4CAF50",
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginRight: 5,
    },
    featuredBadge: {
        backgroundColor: "#FF9800",
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "500",
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4361ee",
    },
    menuItemDescription: {
        fontSize: 14,
        color: "#666",
        marginBottom: 10,
    },
    menuItemCategory: {
        marginBottom: 10,
    },
    categoryName: {
        fontSize: 13,
        color: "#333",
        backgroundColor: "#e9ecef",
        alignSelf: "flex-start",
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    menuItemActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingTop: 10,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
        flex: 1,
        justifyContent: "center",
        marginHorizontal: 3,
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500",
        marginLeft: 4,
    },
    editButton: {
        backgroundColor: "#4361ee",
    },
    disableButton: {
        backgroundColor: "#6c757d",
    },
    enableButton: {
        backgroundColor: "#28a745",
    },
    deleteButton: {
        backgroundColor: "#dc3545",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        width: "90%",
        maxHeight: "80%",
        borderRadius: 10,
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    formGroup: {
        marginBottom: 15,
    },
    formLabel: {
        fontSize: 16,
        color: "#333",
        marginBottom: 5,
    },
    formInput: {
        borderWidth: 1,
        borderColor: "#ced4da",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ced4da",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    categoryOption: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 10,
        borderRadius: 4,
        backgroundColor: "#f1f3f5",
    },
    selectedCategoryOption: {
        backgroundColor: "#4361ee",
    },
    categoryOptionText: {
        fontSize: 14,
        color: "#333",
    },
    selectedCategoryOptionText: {
        color: "#fff",
    },
    switchGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    submitButton: {
        backgroundColor: "#4361ee",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default VendorMenuScreen;
