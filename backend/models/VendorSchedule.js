const mongoose = require('mongoose');

const specialHoursSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    openingTime: {
      type: String,
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format (HH:MM)`
      }
    },
    closingTime: {
      type: String,
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format (HH:MM)`
      }
    },
    reason: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const vendorScheduleSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    openingTime: {
      type: String,
      required: true,
      default: '09:00',
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format (HH:MM)`
      }
    },
    closingTime: {
      type: String,
      required: true,
      default: '22:00',
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format (HH:MM)`
      }
    },
    offDays: {
      type: [Number],
      default: [],
      validate: {
        validator: function(v) {
          return v.every(day => day >= 0 && day <= 6);
        },
        message: props => `Off days must be between 0 (Sunday) and 6 (Saturday)`
      }
    },
    specialHours: {
      type: [specialHoursSchema],
      default: []
    },
    breakTime: {
      enabled: {
        type: Boolean,
        default: false
      },
      startTime: {
        type: String,
        validate: {
          validator: function(v) {
            if (!v) return true; // Allow empty
            return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
          },
          message: props => `${props.value} is not a valid time format (HH:MM)`
        }
      },
      endTime: {
        type: String,
        validate: {
          validator: function(v) {
            if (!v) return true; // Allow empty
            return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
          },
          message: props => `${props.value} is not a valid time format (HH:MM)`
        }
      }
    }
  },
  {
    timestamps: true
  }
);

// Pre-save validation to ensure breakTime times are set if enabled
vendorScheduleSchema.pre('save', function(next) {
  if (this.breakTime.enabled && (!this.breakTime.startTime || !this.breakTime.endTime)) {
    return next(new Error('Break start and end times are required when break is enabled'));
  }
  next();
});

// Ensure opening time is before closing time
vendorScheduleSchema.pre('save', function(next) {
  if (this.openingTime >= this.closingTime) {
    return next(new Error('Opening time must be before closing time'));
  }
  next();
});

// Helper method to check if vendor is open at a specific time
vendorScheduleSchema.methods.isOpenAt = function(date = new Date()) {
  const day = date.getDay();
  
  // Check if it's an off day
  if (this.offDays.includes(day)) {
    return false;
  }
  
  // Format date to YYYY-MM-DD for checking special hours
  const formattedDate = date.toISOString().split('T')[0];
  
  // Check for special hours
  const specialDay = this.specialHours.find(sh => 
    sh.date.toISOString().split('T')[0] === formattedDate
  );
  
  if (specialDay) {
    if (!specialDay.isOpen) return false;
    
    // Use special day hours if defined
    return isTimeInRange(date, specialDay.openingTime, specialDay.closingTime);
  }
  
  // Use regular hours
  return isTimeInRange(date, this.openingTime, this.closingTime);
};

// Helper function to check if a time is within range
function isTimeInRange(date, openingTime, closingTime) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;
  
  return currentTime >= openingTime && currentTime <= closingTime;
}

const VendorSchedule = mongoose.model('VendorSchedule', vendorScheduleSchema);

module.exports = VendorSchedule; 