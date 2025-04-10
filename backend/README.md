# Meshi Backend

This is the backend API for the Meshi application, a unified mobile application for students to order meals from campus vendors.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/meshi
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

3. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/vendors/register` - Register a new vendor
- `POST /api/vendors/login` - Login vendor

### User

- `GET /api/users/me` - Get user profile
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/password` - Update user password
- `POST /api/users/locations` - Add a new location
- `DELETE /api/users/locations/:locationId` - Delete a location

### Vendor

- `GET /api/vendors/me` - Get vendor profile
- `PATCH /api/vendors/profile` - Update vendor profile
- `PATCH /api/vendors/password` - Update vendor password
- `PATCH /api/vendors/toggle-active` - Toggle vendor active status
- `POST /api/vendors/locations` - Add a new location
- `PATCH /api/vendors/locations/:locationId` - Update a location
- `DELETE /api/vendors/locations/:locationId` - Delete a location
- `POST /api/vendors/staff` - Add a new staff member
- `PATCH /api/vendors/staff/:staffId` - Update a staff member
- `DELETE /api/vendors/staff/:staffId` - Delete a staff member

### Menu

- `GET /api/menu?vendorId=` - Get all menu items for a vendor
- `GET /api/menu/featured` - Get featured menu items
- `POST /api/menu` - Create a new menu item
- `PATCH /api/menu/:itemId` - Update a menu item
- `DELETE /api/menu/:itemId` - Delete a menu item
- `PATCH /api/menu/:itemId/toggle-availability` - Toggle menu item availability

### Orders

- `POST /api/orders/create` - Create a new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:orderId` - Get order by ID
- `PATCH /api/orders/:orderId` - Update order (modify or cancel)
- `GET /api/vendors/orders` - Get vendor orders
- `PATCH /api/vendors/orders/:orderId` - Update vendor order

### Payments

- `POST /api/payments/checkout` - Process payment for an order
- `POST /api/payments/refund` - Process refund for an order
- `GET /api/vendors/payments` - Get vendor payments

### Notifications

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark notifications as read
- `POST /api/notifications/subscribe` - Subscribe to vendor notifications
- `POST /api/notifications/unsubscribe` - Unsubscribe from vendor notifications
- `GET /api/vendors/notifications` - Get vendor notifications
- `POST /api/vendors/notifications/mark-read` - Mark vendor notifications as read

### Delivery

- `GET /api/delivery/orders` - Get delivery agent orders
- `PATCH /api/delivery/orders/:orderId` - Update delivery order status

## Models

- User
- Vendor
- MenuItem
- Order
- Notification

## Authentication

The API uses JWT for authentication. To access protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

All API responses follow the format:

```json
{
  "success": true/false,
  "data": {...} or "message": "..."
}
```

For errors:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (only in development)"
}
``` 