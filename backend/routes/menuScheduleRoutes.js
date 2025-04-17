const express = require('express');
const router = express.Router();
const {
    getTodayMenu,
    getWeekMenu,
    getMenuSchedules,
    getMenuScheduleById,
    createMenuSchedule,
    updateMenuSchedule,
    deleteMenuSchedule,
    toggleMenuScheduleStatus
} = require('../controllers/menuScheduleController');
const { protect, isVendor } = require('../middleware/authMiddleware');

// Public routes
router.get('/today/:vendorId', getTodayMenu);
router.get('/week/:vendorId', getWeekMenu);

// Private vendor routes
router.route('/')
    .get(protect, isVendor, getMenuSchedules)
    .post(protect, isVendor, createMenuSchedule);

router.route('/:id')
    .get(protect, isVendor, getMenuScheduleById)
    .put(protect, isVendor, updateMenuSchedule)
    .delete(protect, isVendor, deleteMenuSchedule);

router.patch('/:id/toggle', protect, isVendor, toggleMenuScheduleStatus);

module.exports = router; 