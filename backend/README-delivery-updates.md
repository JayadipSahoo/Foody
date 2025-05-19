# Delivery Staff Authentication Update

This document outlines the necessary changes to the backend to support vendor code-based authentication for delivery staff.

## Model Changes

### Delivery Staff Model

Update the Delivery Staff model to replace the password field with a vendorCode field:

```javascript
// models/deliveryStaffModel.js

const deliveryStaffSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    // Replace password with vendorCode
    vendorCode: {
      type: String,
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Remove any existing password hashing middleware if it exists
```

## Controller Changes

### Registration Controller

Update the delivery staff registration controller to use vendorCode instead of password:

```javascript
// controllers/deliveryStaffController.js

const registerDeliveryStaff = asyncHandler(async (req, res) => {
  const { name, email, mobile, vendorCode, vendorId } = req.body;

  // Check if delivery staff with this email already exists
  const deliveryStaffExists = await DeliveryStaff.findOne({ email });

  if (deliveryStaffExists) {
    res.status(400);
    throw new Error("Delivery staff with this email already exists");
  }

  // Create new delivery staff
  const deliveryStaff = await DeliveryStaff.create({
    name,
    email,
    mobile,
    vendorCode, // Use vendorCode instead of password
    vendor: vendorId,
  });

  if (deliveryStaff) {
    res.status(201).json({
      _id: deliveryStaff._id,
      name: deliveryStaff.name,
      email: deliveryStaff.email,
      mobile: deliveryStaff.mobile,
      vendor: deliveryStaff.vendor,
      status: deliveryStaff.status,
    });
  } else {
    res.status(400);
    throw new Error("Invalid delivery staff data");
  }
});
```

### Authentication Controller

Update the delivery staff login controller to use vendorCode instead of password:

```javascript
// controllers/authController.js or controllers/deliveryStaffController.js

const authDeliveryStaff = asyncHandler(async (req, res) => {
  const { email, vendorCode } = req.body;

  // Find delivery staff by email
  const deliveryStaff = await DeliveryStaff.findOne({ email }).populate('vendor', 'name');

  // Check if delivery staff exists and vendorCode matches
  if (deliveryStaff && deliveryStaff.vendorCode === vendorCode) {
    // Check if the delivery staff is active
    if (deliveryStaff.status !== 'active') {
      res.status(401);
      throw new Error('Your account is not active. Please contact your vendor.');
    }

    res.json({
      _id: deliveryStaff._id,
      name: deliveryStaff.name,
      email: deliveryStaff.email,
      mobile: deliveryStaff.mobile,
      vendor: deliveryStaff.vendor,
      status: deliveryStaff.status,
      token: generateToken(deliveryStaff._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or vendor code");
  }
});
```

## API Routes

Ensure the API routes are updated to reflect these changes:

```javascript
// routes/deliveryStaffRoutes.js

router.post('/login', authDeliveryStaff);
router.post('/register-by-vendor', protect, vendorProtect, registerDeliveryStaff);
```

## Additional Considerations

1. **Update any validation middleware**:
   - Ensure any validation middleware for delivery staff registration/login is updated to validate vendorCode instead of password

2. **Update login screen for delivery staff**:
   - Make sure the delivery staff login screen is updated to ask for email and vendorCode instead of password

3. **Database migration**:
   - If you have existing delivery staff in the database, you'll need to migrate their data:
   ```javascript
   // Migration script example
   const deliveryStaff = await DeliveryStaff.find({});

   for (const staff of deliveryStaff) {
     // Generate a random vendor code or use a default one
     staff.vendorCode = 'DEFAULT_CODE'; // Or use a proper random code generator
     await staff.save();
   }
   ```

4. **Security considerations**:
   - Consider implementing rate limiting for login attempts
   - Consider adding vendorCode requirements (e.g., minimum length, complexity)
