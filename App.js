import React from "react";
import { UserProvider } from "./services/UserContext";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { WorkoutsProvider } from "./services/WorkoutsContext";
import { MealsProvider } from "./services/MealsContext.js";
import { ThemeProvider } from './services/ThemeContext.js';
import MainNavigator from "./navigators/MainNavigator";

export default function App() {

  return (
    <ThemeProvider>
      <ActionSheetProvider>
        <UserProvider>
          <WorkoutsProvider>
            <MealsProvider>
              <MainNavigator />
            </MealsProvider>
          </WorkoutsProvider>
        </UserProvider>
      </ActionSheetProvider>
    </ThemeProvider>
  );
}