import { registerRootComponent } from "expo";
import { AppRegistry } from "react-native";
import App from "./App";

// Explicitly register the app with the name 'main'
AppRegistry.registerComponent("main", () => App);

// registerRootComponent for Expo Go
registerRootComponent(App);
