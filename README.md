# Meshi Application

A unified mobile application for students to order meals from campus vendors. It provides streamlined ordering, payment, delivery management, analytics, and more.

## Project Structure

- `backend/` - Node.js + Express + MongoDB backend
- `Foody/` - React Native + Expo frontend

## Features

### User Features

- User authentication (sign up, sign in)
- Browse vendors and menus
- Place and track orders
- Modify or cancel orders (if allowed by vendor)
- Manage payment
- Receive notifications
- Manage profile and delivery locations

### Vendor Features

- Vendor authentication
- Manage menu items
- Process incoming orders
- Track payments and refunds
- Manage delivery
- Role-based access for staff
- Analytics

## Setup

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/meshi
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd Foody
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the Expo development server:
   ```
   npm start
   ```

## Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend

- React Native
- Expo
- React Navigation
- React Native Paper
- React Native Elements

## API Documentation

See the [backend README](backend/README.md) for detailed API documentation.

## License

This project is licensed under the ISC License.

## Contributors

- [Your Name](https://github.com/yourusername) 