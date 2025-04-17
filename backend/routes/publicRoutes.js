const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const menuScheduleController = require('../controllers/menuScheduleController');
const vendorController = require('../controllers/vendorController');

// Public menu routes
router.get('/menu/vendor/:vendorId', menuController.getVendorMenu);

// Public menu schedule routes
router.get('/menu-schedule/today/:vendorId', menuScheduleController.getTodayMenu);
router.get('/menu-schedule/week/:vendorId', menuScheduleController.getWeekMenu);

// Public vendor routes
router.get('/vendors/by-location', vendorController.getVendorsByLocation);
router.get('/vendor/:vendorId', vendorController.getVendorPublicProfile);

module.exports = router; 