const MenuSchedule = require('../models/menuScheduleModel');
const MenuItem = require('../models/MenuItem');
const Vendor = require('../models/Vendor');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Get today's menu for a vendor
 * @route   GET /api/menu-schedules/today/:vendorId
 * @access  Public
 */
const getTodayMenu = asyncHandler(async (req, res) => {
    const vendorId = req.params.vendorId;
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Find active menu schedule for vendor
    const menuSchedule = await MenuSchedule.findOne({
        vendor: vendorId,
        isActive: true
    });

    if (!menuSchedule) {
        return res.status(404).json({ message: 'No active menu schedule found for this vendor' });
    }

    // Check if there's a special schedule for today
    const todayStr = today.toISOString().split('T')[0];
    const specialSchedule = menuSchedule.specialSchedules.find(schedule => 
        new Date(schedule.date).toISOString().split('T')[0] === todayStr && schedule.isAvailable
    );

    if (specialSchedule) {
        return res.json({
            menuScheduleId: menuSchedule._id,
            title: menuSchedule.title,
            description: menuSchedule.description,
            items: specialSchedule.items
        });
    }

    // Check regular day schedule
    const daySchedule = menuSchedule.daySchedule.find(schedule => 
        schedule.day === dayOfWeek && schedule.isAvailable
    );

    if (!daySchedule) {
        return res.status(404).json({ message: 'No menu available for today' });
    }

    res.json({
        menuScheduleId: menuSchedule._id,
        title: menuSchedule.title,
        description: menuSchedule.description,
        items: daySchedule.items
    });
});

/**
 * @desc    Get week menu for a vendor
 * @route   GET /api/menu-schedules/week/:vendorId
 * @access  Public
 */
const getWeekMenu = asyncHandler(async (req, res) => {
    const vendorId = req.params.vendorId;

    // Find active menu schedule for vendor
    const menuSchedule = await MenuSchedule.findOne({
        vendor: vendorId,
        isActive: true
    });

    if (!menuSchedule) {
        return res.status(404).json({ message: 'No active menu schedule found for this vendor' });
    }

    // Create a 7-day representation of the menu
    const weekMenu = {
        menuScheduleId: menuSchedule._id,
        title: menuSchedule.title,
        description: menuSchedule.description,
        days: []
    };

    // Add day schedules
    for (let i = 0; i < 7; i++) {
        const daySchedule = menuSchedule.daySchedule.find(schedule => schedule.day === i);
        
        if (daySchedule && daySchedule.isAvailable) {
            weekMenu.days.push({
                day: i,
                isAvailable: true,
                items: daySchedule.items
            });
        } else {
            weekMenu.days.push({
                day: i,
                isAvailable: false,
                items: []
            });
        }
    }

    // Get special schedules for the next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Add special schedules that override day schedules
    menuSchedule.specialSchedules.forEach(schedule => {
        const scheduleDate = new Date(schedule.date);
        if (scheduleDate >= today && scheduleDate < nextWeek) {
            const dayIndex = scheduleDate.getDay();
            weekMenu.days[dayIndex] = {
                day: dayIndex,
                isAvailable: schedule.isAvailable,
                items: schedule.isAvailable ? schedule.items : [],
                isSpecial: true,
                date: scheduleDate.toISOString().split('T')[0]
            };
        }
    });

    res.json(weekMenu);
});

/**
 * @desc    Get all menu schedules for logged in vendor
 * @route   GET /api/menu-schedules
 * @access  Private (Vendor)
 */
const getMenuSchedules = asyncHandler(async (req, res) => {
    const menuSchedules = await MenuSchedule.find({ vendor: req.user._id });
    res.json(menuSchedules);
});

/**
 * @desc    Get menu schedule by ID
 * @route   GET /api/menu-schedules/:id
 * @access  Private (Vendor)
 */
const getMenuScheduleById = asyncHandler(async (req, res) => {
    const menuSchedule = await MenuSchedule.findById(req.params.id);

    if (!menuSchedule) {
        res.status(404);
        throw new Error('Menu schedule not found');
    }

    // Make sure the logged in vendor owns the menu schedule
    if (menuSchedule.vendor.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to access this menu schedule');
    }

    res.json(menuSchedule);
});

/**
 * @desc    Create a new menu schedule
 * @route   POST /api/menu-schedules
 * @access  Private (Vendor)
 */
const createMenuSchedule = asyncHandler(async (req, res) => {
    const { title, description, isActive, daySchedule, specialSchedules } = req.body;

    if (!title) {
        res.status(400);
        throw new Error('Please add a title');
    }

    // Create menu schedule
    const menuSchedule = await MenuSchedule.create({
        vendor: req.user._id,
        title,
        description,
        isActive: isActive !== undefined ? isActive : true,
        daySchedule: daySchedule || [],
        specialSchedules: specialSchedules || []
    });

    res.status(201).json(menuSchedule);
});

/**
 * @desc    Update menu schedule
 * @route   PUT /api/menu-schedules/:id
 * @access  Private (Vendor)
 */
const updateMenuSchedule = asyncHandler(async (req, res) => {
    const menuSchedule = await MenuSchedule.findById(req.params.id);

    if (!menuSchedule) {
        res.status(404);
        throw new Error('Menu schedule not found');
    }

    // Make sure the logged in vendor owns the menu schedule
    if (menuSchedule.vendor.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this menu schedule');
    }

    const updatedMenuSchedule = await MenuSchedule.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json(updatedMenuSchedule);
});

/**
 * @desc    Delete menu schedule
 * @route   DELETE /api/menu-schedules/:id
 * @access  Private (Vendor)
 */
const deleteMenuSchedule = asyncHandler(async (req, res) => {
    const menuSchedule = await MenuSchedule.findById(req.params.id);

    if (!menuSchedule) {
        res.status(404);
        throw new Error('Menu schedule not found');
    }

    // Make sure the logged in vendor owns the menu schedule
    if (menuSchedule.vendor.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this menu schedule');
    }

    await MenuSchedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu schedule removed' });
});

/**
 * @desc    Toggle menu schedule active status
 * @route   PATCH /api/menu-schedules/:id/toggle
 * @access  Private (Vendor)
 */
const toggleMenuScheduleStatus = asyncHandler(async (req, res) => {
    const menuSchedule = await MenuSchedule.findById(req.params.id);

    if (!menuSchedule) {
        res.status(404);
        throw new Error('Menu schedule not found');
    }

    // Make sure the logged in vendor owns the menu schedule
    if (menuSchedule.vendor.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this menu schedule');
    }

    menuSchedule.isActive = !menuSchedule.isActive;
    await menuSchedule.save();

    res.json(menuSchedule);
});

module.exports = {
    getTodayMenu,
    getWeekMenu,
    getMenuSchedules,
    getMenuScheduleById,
    createMenuSchedule,
    updateMenuSchedule,
    deleteMenuSchedule,
    toggleMenuScheduleStatus
}; 