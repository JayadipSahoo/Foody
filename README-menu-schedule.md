# Foody Menu Scheduling System

## Overview

The Foody menu scheduling system allows vendors to create, manage and schedule their menu items for different days of the week. This system is especially designed for meal service businesses that change their menu daily or weekly.

## Features

- Create and manage basic menu items
- Create weekly menu schedules
- Plan special menus for specific dates
- Toggle schedule availability
- Multiple schedule support with one active schedule at a time

## Menu Schedule Structure

### Menu Items
Basic menu items include:
- Name
- Description
- Price
- Vegetarian status
- Availability toggle

### Menu Schedules
Each menu schedule contains:
- Title and description
- Active status
- Day schedules (for recurring weekly menus)
- Special schedules (for specific dates)

## API Endpoints

### Menu Items
- `GET /api/menu` - Get all menu items for logged-in vendor
- `GET /api/menu/:id` - Get a specific menu item
- `POST /api/menu` - Create a new menu item
- `PUT /api/menu/:id` - Update a menu item
- `DELETE /api/menu/:id` - Delete a menu item
- `PATCH /api/menu/:id/availability` - Toggle item availability

### Menu Schedules
- `GET /api/menu-schedule` - Get all schedules for logged-in vendor
- `GET /api/menu-schedule/:id` - Get a specific schedule
- `POST /api/menu-schedule` - Create a new schedule
- `PUT /api/menu-schedule/:id` - Update a schedule
- `DELETE /api/menu-schedule/:id` - Delete a schedule
- `PATCH /api/menu-schedule/:id/toggle` - Toggle schedule active status
- `GET /api/menu-schedule/today/:vendorId` - Get today's menu for a vendor (public)
- `GET /api/menu-schedule/week/:vendorId` - Get week menu for a vendor (public)

## Models

### MenuItem

```javascript
{
  name: String,
  description: String,
  price: Number,
  vendorId: ObjectId,
  image: String,
  isVeg: Boolean,
  isAvailable: Boolean,
  isFeatured: Boolean
}
```

### MenuSchedule

```javascript
{
  vendor: ObjectId,
  title: String,
  description: String,
  isActive: Boolean,
  daySchedule: [
    {
      day: Number,         // 0=Sunday, 1=Monday, etc.
      isAvailable: Boolean,
      items: [
        {
          name: String,
          description: String,
          price: Number,
          isVeg: Boolean
        }
      ]
    }
  ],
  specialSchedules: [
    {
      date: Date,
      isAvailable: Boolean,
      items: [
        {
          name: String,
          description: String,
          price: Number,
          isVeg: Boolean
        }
      ]
    }
  ]
}
```

## Usage

1. First create basic menu items that you offer regularly
2. Create a menu schedule with a title and description
3. Add items to specific days of the week in the day schedule
4. Optionally add special menus for specific dates
5. Toggle the active status of schedules as needed

## Implementation Notes

- Only one menu schedule can be active at a time
- Special schedules override day schedules for specific dates
- The system handles auto-deactivation of other schedules when one is activated
- Menu items in schedules are copied rather than referenced to preserve historical data 