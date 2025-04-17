const VendorSchedule = require('../models/VendorSchedule');
const Vendor = require('../models/Vendor');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Get vendor schedule
 * @route   GET /api/vendor/schedule
 * @access  Private (Vendor only)
 */
const getVendorSchedule = asyncHandler(async (req, res) => {
  try {
    // Check if we have a valid user and vendor ID
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, no vendor ID found' });
    }

    // Find schedule for this vendor
    let schedule = await VendorSchedule.findOne({ vendor: req.user._id });

    // If no schedule exists yet, create a default one
    if (!schedule) {
      schedule = await VendorSchedule.create({
        vendor: req.user._id,
        isOpen: true,
        openingTime: '09:00',
        closingTime: '22:00',
        offDays: [],
        specialHours: [],
        breakTime: {
          enabled: false,
          startTime: '',
          endTime: ''
        }
      });
    }

    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Error in getVendorSchedule:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Update vendor schedule
 * @route   PUT /api/vendor/schedule
 * @access  Private (Vendor only)
 */
const updateVendorSchedule = asyncHandler(async (req, res) => {
  try {
    // Check if we have a valid user and vendor ID
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, no vendor ID found' });
    }

    const {
      isOpen,
      openingTime,
      closingTime,
      offDays,
      specialHours,
      breakTime
    } = req.body;

    // Validate required fields
    if (openingTime === undefined || closingTime === undefined) {
      return res.status(400).json({ message: 'Opening and closing times are required' });
    }

    // Check time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(openingTime) || !timeRegex.test(closingTime)) {
      return res.status(400).json({ message: 'Times must be in HH:MM format' });
    }

    // Check if opening time is before closing time
    if (openingTime >= closingTime) {
      return res.status(400).json({ message: 'Opening time must be before closing time' });
    }

    // Find and update schedule, create if doesn't exist
    let schedule = await VendorSchedule.findOne({ vendor: req.user._id });

    if (!schedule) {
      // Create new schedule
      schedule = await VendorSchedule.create({
        vendor: req.user._id,
        isOpen: isOpen !== undefined ? isOpen : true,
        openingTime,
        closingTime,
        offDays: offDays || [],
        specialHours: specialHours || [],
        breakTime: breakTime || { enabled: false }
      });
    } else {
      // Update existing schedule
      if (isOpen !== undefined) schedule.isOpen = isOpen;
      schedule.openingTime = openingTime;
      schedule.closingTime = closingTime;
      
      if (offDays) schedule.offDays = offDays;
      if (specialHours) schedule.specialHours = specialHours;
      
      if (breakTime) {
        schedule.breakTime.enabled = breakTime.enabled || false;
        if (breakTime.startTime) schedule.breakTime.startTime = breakTime.startTime;
        if (breakTime.endTime) schedule.breakTime.endTime = breakTime.endTime;
      }

      await schedule.save();
    }

    // Update the vendor's isAcceptingOrders status to match the schedule isOpen status
    if (isOpen !== undefined) {
      const vendor = await Vendor.findById(req.user._id);
      if (vendor) {
        vendor.isAcceptingOrders = isOpen;
        await vendor.save();
      }
    }

    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Error in updateVendorSchedule:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Add special hours for a specific date
 * @route   POST /api/vendor/schedule/special
 * @access  Private (Vendor only)
 */
const addSpecialHours = asyncHandler(async (req, res) => {
  try {
    // Check if we have a valid user and vendor ID
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, no vendor ID found' });
    }

    const { date, isOpen, openingTime, closingTime, reason } = req.body;

    // Validate required fields
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Find schedule for this vendor
    let schedule = await VendorSchedule.findOne({ vendor: req.user._id });

    // If no schedule exists yet, create a default one
    if (!schedule) {
      schedule = await VendorSchedule.create({
        vendor: req.user._id,
        isOpen: true,
        openingTime: '09:00',
        closingTime: '22:00',
        offDays: [],
        specialHours: [],
        breakTime: {
          enabled: false,
          startTime: '',
          endTime: ''
        }
      });
    }

    // Check if this date already exists in special hours
    const existingIndex = schedule.specialHours.findIndex(
      sh => new Date(sh.date).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );

    if (existingIndex !== -1) {
      // Update existing special hours
      schedule.specialHours[existingIndex] = {
        date: dateObj,
        isOpen: isOpen !== undefined ? isOpen : true,
        openingTime: openingTime || schedule.openingTime,
        closingTime: closingTime || schedule.closingTime,
        reason: reason || ''
      };
    } else {
      // Add new special hours
      schedule.specialHours.push({
        date: dateObj,
        isOpen: isOpen !== undefined ? isOpen : true,
        openingTime: openingTime || schedule.openingTime,
        closingTime: closingTime || schedule.closingTime,
        reason: reason || ''
      });
    }

    await schedule.save();
    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Error in addSpecialHours:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Remove special hours for a specific date
 * @route   DELETE /api/vendor/schedule/special/:date
 * @access  Private (Vendor only)
 */
const removeSpecialHours = asyncHandler(async (req, res) => {
  try {
    // Check if we have a valid user and vendor ID
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, no vendor ID found' });
    }

    const { date } = req.params;

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Find schedule for this vendor
    let schedule = await VendorSchedule.findOne({ vendor: req.user._id });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Filter out the special hours for this date
    const formattedDate = dateObj.toISOString().split('T')[0];
    schedule.specialHours = schedule.specialHours.filter(
      sh => new Date(sh.date).toISOString().split('T')[0] !== formattedDate
    );

    await schedule.save();
    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Error in removeSpecialHours:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Toggle vendor open/closed status
 * @route   PATCH /api/vendor/schedule/toggle
 * @access  Private (Vendor only)
 */
const toggleVendorStatus = asyncHandler(async (req, res) => {
  try {
    // Check if we have a valid user and vendor ID
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, no vendor ID found' });
    }

    // Find schedule for this vendor
    let schedule = await VendorSchedule.findOne({ vendor: req.user._id });

    // If no schedule exists yet, create a default one
    if (!schedule) {
      schedule = await VendorSchedule.create({
        vendor: req.user._id,
        isOpen: false, // Start as closed since we're toggling
        openingTime: '09:00',
        closingTime: '22:00',
        offDays: [],
        specialHours: []
      });
    } else {
      // Toggle the isOpen status
      schedule.isOpen = !schedule.isOpen;
      await schedule.save();
    }

    // Update the vendor's isAcceptingOrders status to match the schedule's isOpen status
    const vendor = await Vendor.findById(req.user._id);
    if (vendor) {
      vendor.isAcceptingOrders = schedule.isOpen;
      await vendor.save();
    }

    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Error in toggleVendorStatus:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Check if vendor is currently open
 * @route   GET /api/vendor/schedule/status/:vendorId
 * @access  Public
 */
const checkVendorStatus = asyncHandler(async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Find schedule for this vendor
    const schedule = await VendorSchedule.findOne({ vendor: vendorId });

    if (!schedule) {
      return res.status(404).json({ message: 'Vendor schedule not found' });
    }

    // Check if vendor is open right now
    const isOpen = schedule.isOpen && schedule.isOpenAt(new Date());

    return res.status(200).json({
      isOpen,
      schedule: {
        openingTime: schedule.openingTime,
        closingTime: schedule.closingTime,
        offDays: schedule.offDays,
        hasSpecialHoursToday: schedule.specialHours.some(sh => 
          new Date(sh.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
        )
      }
    });
  } catch (error) {
    console.error('Error in checkVendorStatus:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  getVendorSchedule,
  updateVendorSchedule,
  addSpecialHours,
  removeSpecialHours,
  toggleVendorStatus,
  checkVendorStatus
}; 