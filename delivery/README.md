# Meshi Delivery App

A React Native mobile application for food delivery personnel to manage deliveries for the Meshi Food Delivery platform.

## Features

- Delivery partner authentication
- Real-time order management
- Order acceptance and tracking
- Delivery status updates
- Location tracking
- Profile management

## Project Structure

```
delivery/
├── assets/              # Static assets like images and fonts
├── src/
│   ├── components/      # Reusable UI components
│   ├── config/          # App configuration
│   ├── context/         # React context providers
│   ├── navigators/      # Navigation setup
│   ├── screens/         # App screens
│   ├── services/        # API and other services
│   ├── store/           # State management
│   └── utils/           # Helper functions
├── App.js               # Main app component
├── app.json             # Expo configuration
├── index.js             # Entry point
└── package.json         # Dependencies
```

## Setup Instructions

1. Install dependencies:
   ```
   cd delivery
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Run on a device or emulator:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app on your device

## Backend Integration

The app connects to the Meshi backend API. Make sure the backend server is running and the IP address in `src/config/config.js` is correctly set to your local development environment.

## Technology Stack

- React Native
- Expo
- React Navigation
- Zustand (state management)
- Axios
