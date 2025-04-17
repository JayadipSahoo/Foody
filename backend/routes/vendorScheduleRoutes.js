const express = require('express');
const router = express.Router();
const { protect, isVendor } = require('../middleware/authMiddleware');
const {
  getVendorSchedule,
  updateVendorSchedule,
  addSpecialHours,
  removeSpecialHours,
  toggleVendorStatus,
  checkVendorStatus
} = require('../controllers/vendorScheduleController');

// Get and update vendor schedule
router.get('/', protect, isVendor, getVendorSchedule);
router.put('/', protect, isVendor, updateVendorSchedule);

// Toggle vendor open/closed status
router.patch('/toggle', protect, isVendor, toggleVendorStatus);

// Special hours management
router.post('/special', protect, isVendor, addSpecialHours);
router.delete('/special/:date', protect, isVendor, removeSpecialHours);

// Public endpoint to check if vendor is open
router.get('/status/:vendorId', checkVendorStatus);

module.exports = router; 