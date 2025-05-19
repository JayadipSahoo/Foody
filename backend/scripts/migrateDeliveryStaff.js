/**
 * Migration script to update DeliveryStaff records to use the new assignedOrders array
 * instead of the old currentOrder field.
 */
const mongoose = require("mongoose");
const DeliveryStaff = require("../models/DeliveryStaff");
const Order = require("../models/Order");
require("dotenv").config();

// Connect to database
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected for migration"))
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

const migrateDeliveryStaff = async () => {
    try {
        console.log("Starting DeliveryStaff migration...");

        // Find all delivery staff that have a currentOrder field
        const deliveryStaffList = await DeliveryStaff.find({});
        console.log(`Found ${deliveryStaffList.length} delivery staff records`);

        let updatedCount = 0;

        for (const staff of deliveryStaffList) {
            // Check if the staff document has the old currentOrder field
            if (staff._doc.currentOrder) {
                const currentOrderId = staff._doc.currentOrder;

                // Update to new structure
                await DeliveryStaff.findByIdAndUpdate(staff._id, {
                    $set: { assignedOrders: [currentOrderId] },
                    $unset: { currentOrder: "" },
                });

                updatedCount++;
            } else if (!staff.assignedOrders) {
                // Ensure every staff has the assignedOrders array
                await DeliveryStaff.findByIdAndUpdate(staff._id, {
                    $set: { assignedOrders: [] },
                    $unset: { currentOrder: "" },
                });

                updatedCount++;
            }
        }

        console.log(`Updated ${updatedCount} delivery staff records`);
        console.log("Migration completed successfully");
    } catch (error) {
        console.error("Error during migration:", error);
    } finally {
        // Close database connection
        mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
};

// Run the migration
migrateDeliveryStaff();
