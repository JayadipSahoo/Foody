# Meshi Application: Detailed Workflow Specification

This document outlines the **end-to-end application workflow** for the Meshi App, which addresses the needs of both **Users** (students/customers) and **Vendors** (food providers) in a campus/delivery setting. The frontend is developed with **React Native (Expo)**, and the backend is built with **Node.js** and **MongoDB**. This document focuses on **high-level architecture** and **detailed user flows** without providing explicit code, so it can be used as a guide for your code-generation process.

---

## Table of Contents

1. **Overview**
2. **User (Customer) Flow**
   1. Onboarding (Sign Up / Sign In)
   2. Home Page
   3. Notifications
   4. Vendor Menu & Ordering
   5. Checkout & Payment
   6. My Orders
   7. Profile Management
8. **Vendor Flow**
   1. Vendor Onboarding (Sign Up / Sign In)
   2. Vendor Dashboard (Home Screen)
   3. Menu Management
   4. Order Management
   5. Payment Management
   6. Delivery Agent Interface
   7. Team Management (Role-Based Access)
9. **Admin Flow (If Applicable)**
10. **Backend Considerations**
    1. Database Schema (High-Level)
    2. API Endpoints (High-Level)
    3. Notification Workflow (High-Level)
    4. Payment Flow (High-Level)
11. **Application Permissions & Settings**
12. **Error Handling & Validation**
13. **Future Enhancements**

---

## 1. Overview

- **Goal**: Provide a one-stop solution for campus-based or community-based food ordering. Users can discover vendors, place orders, track orders, modify/cancel, and manage payments easily. Vendors can manage menus, track incoming orders, handle refunds and cancellations, manage delivery, and view analytics.
- **Platforms**:
  - **Frontend**: React Native (Expo) mobile application
  - **Backend**: Node.js + Express server with MongoDB for data storage
- **Key Features**:
  1. **Unified Platform**: Eliminates multiple WhatsApp groups for ordering.
  2. **Order & Payment Flow**: Streamlined in-app ordering, modifications, cancellations, and payments.
  3. **Delivery Management**: Prepaid order system, real-time notifications, location-based services.
  4. **Vendor Tools**: Automated order collection, payment tracking, marketing insights, role-based team access.

---

## 2. User (Customer) Flow

### 2.1 Onboarding (Sign Up / Sign In)

1. **Splash Screen**: 
   - Displays the app logo and checks if a user token exists (silent login if a valid token is found).
2. **Sign Up**:
   - **Options**: Email & Password or Google Sign-In (OAuth).
   - **User Info**: Full Name, Email, Mobile Number (optional or mandatory based on requirements).
   - **Location Setup**: Prompt user to add a default delivery location (e.g., Hostel name, address).
   - **Terms & Conditions**: User must agree to the terms before account creation.
   - **Backend Interaction**:
     - **POST** to `/api/auth/register` with user details.
3. **Sign In**:
   - **Options**: Email & Password or Google Sign-In (OAuth).
   - **Remember Me** toggle to keep user logged in or to store token locally.
   - **Backend Interaction**:
     - **POST** to `/api/auth/login` with user credentials.
   - **Token Handling**: Store JWT (or any auth token) in secure storage (e.g., SecureStore in React Native). 

### 2.2 Home Page

Once the user is authenticated:

1. **Header**:
   - **Location Dropdown**:
     - Allows user to select/change delivery location.
     - The vendor list automatically filters based on the selected location.
   - **Profile Menu Icon**:
     - Tapping it shows:
       1. **My Profile**
       2. **My Orders**
       3. **Logout**
   - **Notifications (Bell Icon)**:
     - Red badge if there are unread notifications.
     - Tapping opens a notification modal or page.
2. **Body**:
   - **Greeting**: "Hi [User]! Welcome to Meshi"
   - **Trending Meals Section**:
     - Displays top-trending available meals for the currently selected location.
     - If no trending meals are active, hide this section.
   - **All Vendors List**:
     - Shows vendors delivering to the selected location.
     - Vendors currently accepting orders are visually distinct (e.g., highlight).
     - Inactive vendors have a "Notify Me" (bell) icon:
       - User taps to get an alert when the vendor starts accepting orders.

### 2.3 Notifications

- **Purpose**: Keep users updated on:
  - Order status changes (Order Placed, Order Confirmed, Delivered, etc.).
  - Payment reminders.
  - Vendor opening/closing notifications for vendors the user follows.
- **Modal / Page**:
  - **Recent Notifications**: Show a short list in a modal.
  - **View All**: Navigate to a comprehensive Notification page with older messages.
- **Backend Interaction**:
  - **GET** to `/api/notifications` 
  - **Mark as read** with a **PATCH** or **POST** to `/api/notifications/mark-read`.

### 2.4 Vendor Menu & Ordering

1. **Vendor List → Vendor Menu Screen**:
   - If the vendor is **active**, user can view the menu:
     - List of items with item name, price, and an "Add" button.
   - If the vendor is **inactive**, show a pop-up: "Vendor not accepting orders. Set a notification for next time."
2. **Selecting Menu Items**:
   - Tapping "Add" changes it to a counter (e.g., + / - ) where the user can increase or decrease quantity.
   - **Cart Summary Bar** at the bottom:
     - Displays total items, total price, and a "Checkout" button that navigates to the **Checkout** screen.

### 2.5 Checkout & Payment

1. **Checkout Screen**:
   - **Order Review**:
     - List of selected items with quantity, unit price, subtotal.
     - User can modify quantities or remove items.
   - **Delivery Location**:
     - If multiple location options are available (and supported by the vendor), user can switch to a different location. Otherwise, the default location is displayed.
   - **Delivery Time**:
     - Display the expected delivery date/time (read-only).
   - **Payment**:
     - **UPI** integration or other payment gateways.
     - Show payment method options. On success, redirect user to an **Order Confirmation** or **Home** page.
   - **Backend Interaction**:
     - **POST** to `/api/orders/create` with cart details, user ID, location, and payment info.
     - **Order Payment** can be either:
       - **In-App** (UPI) → Payment gateway service → On success, order finalizes.
       - **External** (UPI apps) → Once paid, the status is updated with the payment reference.

### 2.6 My Orders

Accessed from the profile menu:

1. **Order Listing Tabs**:
   - **Active Orders**: Ongoing or upcoming deliveries.
   - **Past Orders**: Already delivered or canceled.
   - **All Orders**: Combined view.
2. **Order Actions**:
   - **Modify / Cancel**:
     - If still allowed by vendor policy (e.g., 2 hours before delivery).
     - If not allowed, the button is either disabled or hidden.
   - **Refund Pending** indicator if the order is canceled but not yet refunded.
3. **Filtering**:
   - By date range, vendor, or location.
4. **Backend Interaction**:
   - **GET** to `/api/orders` (with query parameters for filtering).
   - **PATCH** to `/api/orders/:orderId` for modifying or canceling (if permitted).

### 2.7 Profile Management

1. **My Profile**:
   - **Personal Details**: Full Name, Verified Email, Verified Mobile, Profile Pic.
   - **Default Delivery Location**: Manage multiple saved addresses or hostels.
   - **Settings**: Theme (dark/light), notification preferences, etc.
2. **Change Password**:
   - Old Password, New Password, Confirm New Password.
   - **Backend Interaction**:
     - **PATCH** to `/api/users/profile` (for personal details).
     - **PATCH** to `/api/users/password` (for password changes).

---

## 3. Vendor Flow

### 3.1 Vendor Onboarding (Sign Up / Sign In)

1. **Registration**:
   - **Basic Info**: Vendor Name, Email, Password, Contact Number.
   - **Business Info**: Type of cuisine or service, default locations they serve.
   - **Verification**: Possibly an admin approval or verification step.
   - **Backend**: 
     - **POST** to `/api/vendors/register`.
2. **Sign In**:
   - Same flow as users but with vendor-specific endpoints and roles.
   - **POST** to `/api/vendors/login`.

### 3.2 Vendor Dashboard (Home Screen)

1. **Active Orders Summary**:
   - Number of live orders, total quantity, etc.
2. **Menu Status**:
   - Toggle between “Accepting Orders” or “Closed”.
   - If “Accepting Orders”, the system notifies subscribed users.
3. **Delivery Locations**:
   - List of locations the vendor serves today or in general.

### 3.3 Menu Management

1. **Menu Creation & Update**:
   - **Add Item**: Name, price, description, availability times, image (if applicable).
   - **Edit Item**: Modify existing items (price, availability, etc.).
   - **Remove / Hide Item**: If item not available temporarily, mark as sold out or hide it.
   - **Set Ordering Window**: e.g., only accept orders from 8am to 11am.
   - **Capacity Management**: For each item, set a max capacity (like 20 burgers, 30 sandwiches). 
   - **Backend**:
     - **POST/PUT** to `/api/menu` for creating/editing items.
     - **PATCH** to `/api/menu/status` for toggling item availability or vendor acceptance window.

### 3.4 Order Management

1. **Active Orders View**:
   - List of current orders: includes order ID, customer name (if anonymity not enforced), item details, status, payment info.
   - Search, filter by location, time, status.
2. **Order Modifications**:
   - Accept or reject modifications/cancellations from users if within policy.
   - **Backend**:
     - **GET** `/api/vendors/orders`
     - **PATCH** `/api/vendors/orders/:orderId` to update order status, accept or deny cancellation.
3. **Analytics**:
   - Real-time count of total items ordered, total revenue from the day, etc.

### 3.5 Payment Management

1. **Collecting Payments**:
   - If using in-app payment, the status should automatically update upon success.
   - If external UPI screenshots are still in use, the vendor can manually mark an order as paid.
2. **Refunds**:
   - When an order is canceled, check whether a refund is due, and process it (manually or automatically).
   - **Backend**:
     - **GET** `/api/vendors/payments` for an overview.
     - **PATCH** `/api/vendors/orders/:orderId/refund` if a refund is initiated.
3. **Payment Reminders**:
   - If a user hasn’t completed payment, a reminder can be triggered.

### 3.6 Delivery Agent Interface

1. **Access Control**:
   - Delivery agents have a restricted role, seeing only relevant delivery details.
2. **Delivery List**:
   - List of orders assigned or ready for delivery.
   - Check-off feature when an order is handed over to the customer.
3. **Backend**:
   - **GET** `/api/delivery/orders` for the agent-specific orders.
   - **PATCH** `/api/delivery/orders/:orderId` to mark as delivered.

### 3.7 Team Management (Role-Based Access)

1. **User Roles**:
   - **Admin / Owner**: Full access to menu, orders, payments, analytics.
   - **Staff**: Partial access (e.g., menu updates, order status updates).
   - **Delivery Agent**: Access to delivery dashboard only.
2. **Backend**:
   - Role-based authentication and authorization on each route.

---

## 4. Admin Flow (If Applicable)

1. **Admin Dashboard**:
   - Oversight over all vendors, users, system analytics.
   - User management (block/unblock).
   - Vendor management (approve or verify new vendors).
2. **Analytics**:
   - Platform-wide analytics, revenue, order counts, user retention.

---

## 5. Backend Considerations

### 5.1 Database Schema (High-Level)

1. **User** Collection:
   - `name`, `email`, `passwordHash`, `mobile`, `defaultLocation`, `notifications[]`
2. **Vendor** Collection:
   - `vendorName`, `email`, `businessInfo`, `locationsServed[]`, `menu[]`, `orders[]`, `roleBasedStaff[]`
3. **Menu** (Sub-document or separate collection):
   - `itemId`, `vendorId`, `name`, `price`, `availability`, `capacity`
4. **Order** Collection:
   - `userId`, `vendorId`, `items[]`, `status`, `paymentStatus`, `deliveryLocation`, `timestamps`
5. **Notifications**:
   - `userId` or `vendorId`, `message`, `readStatus`, `timestamp`

### 5.2 API Endpoints (High-Level)

- **Auth**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- **User**:
  - `GET /api/users/me`
  - `PATCH /api/users/profile`
  - `PATCH /api/users/password`
- **Vendors**:
  - `POST /api/vendors/register`
  - `POST /api/vendors/login`
  - `GET /api/vendors/me`
- **Menu**:
  - `GET /api/menu?vendorId=`
  - `POST /api/menu` (create new item)
  - `PATCH /api/menu/:itemId` (update item)
- **Orders**:
  - `POST /api/orders/create`
  - `GET /api/orders` (list user orders)
  - `PATCH /api/orders/:orderId` (modify/cancel order)
- **Vendor Orders**:
  - `GET /api/vendors/orders`
  - `PATCH /api/vendors/orders/:orderId` (accept/deny modifications, set status)
- **Payments**:
  - `POST /api/payments/checkout`
  - `GET /api/vendors/payments`
- **Notifications**:
  - `GET /api/notifications`
  - `POST /api/notifications/mark-read`
- **Delivery Agent**:
  - `GET /api/delivery/orders`
  - `PATCH /api/delivery/orders/:orderId`

### 5.3 Notification Workflow (High-Level)

1. **Event-Based Triggers**: e.g., When a vendor toggles from closed to open:
   - Find all users subscribed to that vendor, create a notification entry, push to device via push notifications or in-app alerts.
2. **Payment Reminders**:
   - Cron job or scheduled job checks for unpaid orders, triggers notifications.

### 5.4 Payment Flow (High-Level)

- **In-App Payment**:
  - Integrate with a payment service that supports UPI or card payments. 
  - On success, payment details are captured, order status moves to “Paid”.
- **Refunds**:
  - If an order is canceled, vendor or system triggers a refund. Payment gateway API is called if in-app integration is present. Otherwise, manual outside refund process is recorded in the system.

---

## 6. Application Permissions & Settings

1. **Push Notifications**:
   - Prompt user for notification permissions on first install.
2. **Location**:
   - Possibly optional if user picks location from a predefined list (hostels, campus areas, etc.).
3. **Media Access**:
   - Only if the user wants to update profile pictures or the vendor wants to upload item images.

---

## 7. Error Handling & Validation

1. **Validation**:
   - Check required fields (email, password, etc.) on the frontend before sending requests.
   - Display user-friendly error messages for invalid data.
2. **Server Errors**:
   - Return standardized error responses (e.g., `{ success: false, message: ..., errors: [...] }`).
   - Frontend displays relevant messages or fallback UI.
3. **Edge Cases**:
   - **Offline Scenarios**: Cache or show relevant messages.
   - **Payment Failures**: Retry flow, display error if continuous failure.

---

## 8. Future Enhancements

- **Marketing & Insights**:
  - Personalized vendor recommendations, discount codes.
- **Loyalty Program**:
  - Reward frequent users or vendors.
- **Real-Time Tracking**:
  - Delivery agent’s location to provide real-time order tracking.
- **Advanced Analytics**:
  - Provide vendors with deeper insights: daily/weekly trends, user segment analysis, etc.

---

# Summary

This specification provides a **comprehensive workflow** for both **Users** and **Vendors**, detailing how the **frontend** (React Native) should interact with the **backend** (Node.js + MongoDB). The goal is to unify food ordering, payment processing, and delivery management into one streamlined application. 

Use these **detailed workflows** to generate code with cursor.ai or any other code-generation tool by **translating each described step and feature into your respective components, screens, routes, controllers, and data models** without deviating from the user experience and vendor functionalities outlined here.

