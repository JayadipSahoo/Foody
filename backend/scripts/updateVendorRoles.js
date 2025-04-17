/**
 * Migration script to update existing vendors to have a role field
 * Run with: node scripts/updateVendorRoles.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Vendor = require('../models/Vendor');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check if MONGO_URI is defined
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/foody';

if (!process.env.MONGO_URI) {
  console.warn('MONGO_URI not found in environment variables. Using default localhost connection.');
}

console.log('Attempting to connect to MongoDB...');

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    updateVendors();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

async function updateVendors() {
  try {
    // Find all vendors without a role
    const vendors = await Vendor.find({ role: { $exists: false } });
    
    console.log(`Found ${vendors.length} vendors without a role field`);
    
    if (vendors.length === 0) {
      console.log('No vendors need to be updated.');
      mongoose.disconnect();
      return;
    }
    
    // Update all vendors to have the 'vendor' role
    const result = await Vendor.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'vendor' } }
    );
    
    console.log(`Updated ${result.modifiedCount} vendors to have the 'vendor' role`);
    
    // Verify the update
    const updatedVendors = await Vendor.find({ role: 'vendor' });
    console.log(`Total vendors with 'vendor' role: ${updatedVendors.length}`);
    
    mongoose.disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error updating vendors:', error);
    mongoose.disconnect();
    process.exit(1);
  }
} 