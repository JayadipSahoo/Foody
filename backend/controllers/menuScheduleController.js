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

/**
 * @desc    Get available menu items for users based on IST time window
 * @route   GET /api/public/user/menu/:vendorId
 * @access  Public
 */
const getUserMenu = asyncHandler(async (req, res) => {
    const vendorId = req.params.vendorId;
    
    // Create a new Date object with the current time
    const now = new Date();
    
    // Convert to IST (UTC+5:30)
    const istOffset = 330; // 5 hours and 30 minutes in minutes
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const istMinutes = (utcMinutes + istOffset) % (24 * 60);
    const istHours = Math.floor(istMinutes / 60);
    const istMinutesOfHour = istMinutes % 60;
    
    // Format IST time for logging
    const istTimeString = `${istHours}:${istMinutesOfHour.toString().padStart(2, '0')}`;
    console.log(`Current IST time: ${istTimeString}`);
    
    // Check if vendor exists and is accepting orders
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // Initialize arrays for all types of items
    let scheduledLunchItems = [];
    let scheduledDinnerItems = [];
    let regularItems = [];
    
    // Get regular menu items directly posted by vendor
    try {
        regularItems = await MenuItem.find({ 
            vendorId: vendorId,
            isAvailable: true
        });
        
        console.log(`Found ${regularItems.length} regular menu items for vendor ${vendorId}`);
        
        // Convert to plain objects for easier manipulation
        regularItems = regularItems.map(item => {
            const plainItem = item.toObject();
            // Validate fields for regular items too
            return {
                ...plainItem,
                name: plainItem.name || 'Menu Item',
                price: plainItem.price || 0,
                description: plainItem.description || 'No description available',
                isVeg: typeof plainItem.isVeg === 'boolean' ? plainItem.isVeg : false,
                isAvailable: plainItem.isAvailable !== false,
                _id: plainItem._id || `regular-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
            };
        });
    } catch (error) {
        console.error("Error fetching regular menu items:", error);
    }
    
    // Find active menu schedule for vendor
    const menuSchedule = await MenuSchedule.findOne({
        vendor: vendorId,
        isActive: true
    });
    
    console.log(`Found menu schedule for vendor ${vendorId}: ${menuSchedule ? 'Yes' : 'No'}`);
    
    // Only process scheduled items if vendor is accepting orders and has an active menu schedule
    if (vendor.isAcceptingOrders && menuSchedule) {
        // Get the current day of week in IST
        const istDate = new Date(now.getTime() + (istOffset * 60000));
        const istDay = istDate.getDay();
        
        // Get the previous day
        const prevDay = (istDay - 1 + 7) % 7;
        
        // Get the next day
        const nextDay = (istDay + 1) % 7;
        
        console.log(`Current IST day: ${istDay}, Previous day: ${prevDay}, Next day: ${nextDay}`);
        
        // Format dates for special schedules
        const istDateStr = istDate.toISOString().split('T')[0];
        
        // Get yesterday's date in IST
        const yesterdayIst = new Date(istDate);
        yesterdayIst.setDate(istDate.getDate() - 1);
        const yesterdayIstStr = yesterdayIst.toISOString().split('T')[0];
        
        // Get tomorrow's date in IST
        const tomorrowIst = new Date(istDate);
        tomorrowIst.setDate(istDate.getDate() + 1);
        const tomorrowIstStr = tomorrowIst.toISOString().split('T')[0];
        
        // Check for special schedules
        const todaySpecialSchedule = menuSchedule.specialSchedules.find(schedule => 
            new Date(schedule.date).toISOString().split('T')[0] === istDateStr && schedule.isAvailable
        );
        
        const yesterdaySpecialSchedule = menuSchedule.specialSchedules.find(schedule => 
            new Date(schedule.date).toISOString().split('T')[0] === yesterdayIstStr && schedule.isAvailable
        );
        
        const tomorrowSpecialSchedule = menuSchedule.specialSchedules.find(schedule => 
            new Date(schedule.date).toISOString().split('T')[0] === tomorrowIstStr && schedule.isAvailable
        );
        
        // Check regular day schedules
        const todayRegularSchedule = menuSchedule.daySchedule.find(schedule => 
            schedule.day === istDay && schedule.isAvailable
        );
        
        const yesterdayRegularSchedule = menuSchedule.daySchedule.find(schedule => 
            schedule.day === prevDay && schedule.isAvailable
        );
        
        const tomorrowRegularSchedule = menuSchedule.daySchedule.find(schedule => 
            schedule.day === nextDay && schedule.isAvailable
        );
        
        console.log(`Schedules - Today special: ${todaySpecialSchedule ? 'Yes' : 'No'}, Yesterday special: ${yesterdaySpecialSchedule ? 'Yes' : 'No'}, Tomorrow special: ${tomorrowSpecialSchedule ? 'Yes' : 'No'}`);
        console.log(`Schedules - Today regular: ${todayRegularSchedule ? 'Yes' : 'No'}, Yesterday regular: ${yesterdayRegularSchedule ? 'Yes' : 'No'}, Tomorrow regular: ${tomorrowRegularSchedule ? 'Yes' : 'No'}`);
        
        // Time window checks for specific meal types
        // Lunch Time Windows:
        // 1. Current day lunch - visible from previous day 5:00 PM until current day 9:00 AM
        const isCurrentDayLunchWindow = 
            (istHours >= 17 && prevDay === yesterdayRegularSchedule?.day) || // After 5 PM yesterday
            (istHours < 9 && istDay === todayRegularSchedule?.day); // Before 9 AM today
        
        // 2. Tomorrow's lunch - early access from 6:00 PM
        const isNextDayLunchWindow = 
            (istHours >= 18 && istDay === todayRegularSchedule?.day); // After 6 PM today
        
        // Dinner Time Windows:
        // 1. Current day dinner - visible from previous day 5:00 PM until current day 6:00 PM
        const isCurrentDayDinnerWindow = 
            (istHours >= 17 && prevDay === yesterdayRegularSchedule?.day) || // After 5 PM yesterday
            (istHours < 18 && istDay === todayRegularSchedule?.day); // Before 6 PM today
        
        console.log(`Time windows - Current day lunch: ${isCurrentDayLunchWindow}, Next day lunch (early): ${isNextDayLunchWindow}, Current day dinner: ${isCurrentDayDinnerWindow}`);
        
        // Process current day items if within time window
        if (todayRegularSchedule) {
            const todayItems = todaySpecialSchedule ? todaySpecialSchedule.items : todayRegularSchedule.items;
            
            // Debug log all available items from today's schedule
            console.log("Today's raw schedule items:", JSON.stringify(todayItems.map(item => ({
                name: item.name,
                mealType: item.mealType,
                price: item.price,
                isAvailable: item.isAvailable
            }))));
            
            // Filter lunch and dinner items - handle missing mealType and validate required fields
            const lunchItems = todayItems.filter(item => {
                const mealType = (item.mealType || '').toLowerCase();
                const isValid = item.name && item.price !== undefined && item.price !== null;
                
                if (!isValid) {
                    console.log(`WARNING: Skipping invalid lunch item:`, JSON.stringify(item));
                }
                
                return (mealType === 'lunch' || mealType === '') && isValid; // Include items with no meal type that have valid fields
            });
            
            const dinnerItems = todayItems.filter(item => {
                const mealType = (item.mealType || '').toLowerCase();
                const isValid = item.name && item.price !== undefined && item.price !== null;
                
                if (!isValid && mealType === 'dinner') {
                    console.log(`WARNING: Skipping invalid dinner item:`, JSON.stringify(item));
                }
                
                return mealType === 'dinner' && isValid;
            });
            
            console.log(`Today's menu has ${lunchItems.length} valid lunch items and ${dinnerItems.length} valid dinner items`);
            
            // Add lunch items if within lunch window
            if (isCurrentDayLunchWindow && lunchItems.length > 0) {
                // Force items to be available and ensure required fields
                const availableLunchItems = lunchItems.map(item => ({
                    ...item,
                    isAvailable: true,
                    mealType: item.mealType || 'lunch', // Default to lunch if missing
                    name: item.name || 'Lunch Item',
                    price: typeof item.price === 'number' ? item.price : 0,
                    // Preserve the exact isVeg value, treat null/undefined as false but keep true values as true
                    isVeg: item.isVeg === true
                }));
                
                scheduledLunchItems = [...availableLunchItems];
                console.log(`Adding ${availableLunchItems.length} current day lunch items (within window)`);
            }
            
            // Add dinner items if within dinner window
            if (isCurrentDayDinnerWindow && dinnerItems.length > 0) {
                // Force items to be available and ensure required fields
                const availableDinnerItems = dinnerItems.map(item => ({
                    ...item,
                    isAvailable: true,
                    mealType: 'dinner',
                    name: item.name || 'Dinner Item',
                    price: typeof item.price === 'number' ? item.price : 0,
                    // Preserve the exact isVeg value, treat null/undefined as false but keep true values as true
                    isVeg: item.isVeg === true
                }));
                
                scheduledDinnerItems = [...availableDinnerItems];
                console.log(`Adding ${availableDinnerItems.length} current day dinner items (within window)`);
            }
        }
        
        // Process tomorrow's items for early access
        if (isNextDayLunchWindow && tomorrowRegularSchedule) {
            const tomorrowItems = tomorrowSpecialSchedule ? tomorrowSpecialSchedule.items : tomorrowRegularSchedule.items;
            
            // Debug log all available items from tomorrow's schedule
            console.log("Tomorrow's raw schedule items:", JSON.stringify(tomorrowItems.map(item => ({
                name: item.name,
                mealType: item.mealType,
                price: item.price,
                isAvailable: item.isAvailable
            }))));
            
            // Only filter lunch items for next day early access - handle missing mealType and validate required fields
            const nextDayLunchItems = tomorrowItems.filter(item => {
                const mealType = (item.mealType || '').toLowerCase();
                const isValid = item.name && item.price !== undefined && item.price !== null;
                
                if (!isValid) {
                    console.log(`WARNING: Skipping invalid tomorrow lunch item:`, JSON.stringify(item));
                }
                
                return (mealType === 'lunch' || mealType === '') && isValid; // Include items with no meal type that have valid fields
            });
            
            if (nextDayLunchItems.length > 0) {
                // Add a note that these are next day items and force them to be available
                const markedItems = nextDayLunchItems.map(item => {
                    // Make sure item has valid name and price before processing
                    const validName = item.name || 'Tomorrow\'s Lunch Item';
                    const validPrice = typeof item.price === 'number' ? item.price : 0;
                    
                    return {
                        ...item,
                        name: `${validName} (Tomorrow)`,
                        description: `${item.description || ''} - Available for tomorrow's lunch.`,
                        isAvailable: true,
                        mealType: item.mealType || 'lunch', // Default to lunch if missing
                        price: validPrice,
                        _id: item._id || `tomorrow-${validName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
                    };
                });
                
                scheduledLunchItems = [...scheduledLunchItems, ...markedItems];
                console.log(`Adding ${nextDayLunchItems.length} next day lunch items (early access)`);
            }
        }
        
        // Combine lunch and dinner items
        let scheduledItems = [...scheduledLunchItems, ...scheduledDinnerItems];
        console.log(`Total scheduled items: ${scheduledItems.length} (${scheduledLunchItems.length} lunch + ${scheduledDinnerItems.length} dinner)`);
        
        // Mark all scheduled items with a flag for UI differentiation
        scheduledItems = scheduledItems.map(item => {
            console.log(`Processing scheduled item: ${item.name}, Current isAvailable:`, item.isAvailable, "isVeg:", item.isVeg);
            return {
                ...item,
                isScheduled: true,
                // Add defaults for missing fields
                name: item.name || 'Scheduled Item',
                price: item.price || 0,
                description: item.description || 'This is a scheduled menu item',
                // Preserve the exact isVeg value, treat null/undefined as false but keep true values as true
                isVeg: item.isVeg === true,
                // Explicitly set to true for scheduled items that are in the time window
                isAvailable: true,
                mealType: item.mealType || 'lunch',
                // Generate a unique ID if needed
                _id: item._id || item.menuItemId || `scheduled-${(item.name || 'item').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`
            };
        });
    }
    
    // Combine both types of items
    const allItems = [...regularItems, ...scheduledLunchItems, ...scheduledDinnerItems];
    
    console.log(`Combined total items: ${allItems.length} (${regularItems.length} regular + ${scheduledLunchItems.length} lunch + ${scheduledDinnerItems.length} dinner)`);
    
    // Check for items missing key fields
    const itemsWithIssues = allItems.filter(item => !item.name || !item.price);
    if (itemsWithIssues.length > 0) {
        console.log(`WARNING: Found ${itemsWithIssues.length} items with missing key fields:`);
        itemsWithIssues.forEach((item, index) => {
            console.log(`Problem item #${index+1}:`, 
                        `ID: ${item._id || 'missing'}`, 
                        `Name: ${item.name || 'missing'}`, 
                        `Price: ${item.price || 'missing'}`,
                        `Type: ${item.isScheduled ? 'scheduled' : 'regular'}`);
        });
    }
    
    // Remove any potential duplicates (prefer scheduled items if duplicate names)
    const uniqueItemsMap = new Map();
    
    // First add scheduled lunch items to the map (higher priority)
    scheduledLunchItems.forEach(item => {
        uniqueItemsMap.set(item.name, item);
    });
    
    // Then add scheduled dinner items
    scheduledDinnerItems.forEach(item => {
        if (!uniqueItemsMap.has(item.name)) {
            uniqueItemsMap.set(item.name, item);
        }
    });
    
    // Then add regular items only if they don't conflict with scheduled items
    regularItems.forEach(item => {
        if (!uniqueItemsMap.has(item.name)) {
            uniqueItemsMap.set(item.name, item);
        }
    });
    
    const uniqueItems = Array.from(uniqueItemsMap.values());
    
    // Prepare the response with time window information
    const response = {
        items: uniqueItems
    };
    
    // Add appropriate time window messages
    if (scheduledLunchItems.length > 0 || scheduledDinnerItems.length > 0) {
        response.timeWindow = {
            lunchWindow: {
                opensAt: "5:00 PM IST (of previous day)",
                closesAt: "9:00 AM IST", 
                earlyAccessFor: "Next day's lunch from 6:00 PM IST"
            },
            dinnerWindow: {
                opensAt: "5:00 PM IST (of previous day)",
                closesAt: "6:00 PM IST"
            },
            message: "Scheduled items are available based on meal type time windows"
        };
    }
    
    if (menuSchedule) {
        response.menuScheduleId = menuSchedule._id;
        response.title = menuSchedule.title;
        response.description = menuSchedule.description;
    }
    
    res.json(response);
});

module.exports = {
    getTodayMenu,
    getWeekMenu,
    getMenuSchedules,
    getMenuScheduleById,
    createMenuSchedule,
    updateMenuSchedule,
    deleteMenuSchedule,
    toggleMenuScheduleStatus,
    getUserMenu
}; 