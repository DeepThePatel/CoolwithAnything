// Import the required Firebase and AsyncStorage modules
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  addDoc,
  deleteDoc,
  collection,
} from "firebase/firestore";
import eventEmitter from "../components/EventEmitter";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe-_ENL-QmW__8BrE4beO4BLuKV7XPYUM",
  authDomain: "schedulerx-3bf1a.firebaseapp.com",
  projectId: "schedulerx-3bf1a",
  storageBucket: "schedulerx-3bf1a.appspot.com",
  messagingSenderId: "1088673802858",
  appId: "1:1088673802858:android:2cc8a514d360b74b103813",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Get auth instance with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Get Firestore instance
const db = getFirestore(app);

// Helper functions for AsyncStorage operations
const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("Error storing data", e);
    throw e;
  }
};

const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Error retrieving data", e);
    throw e;
  }
};

export const getUserData = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    console.log("No such document!");
    return null;
  }
};

export const getUserID = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userId; // Return the user ID if the document exists
  } else {
    console.log("No such document!");
    return null;
  }
};


export const countTasksByAttributeForUser = async (userId, attribute) => {
  try {
    const userTasksRef = collection(db, "users", userId, "tasks");
    const querySnapshot = await getDocs(userTasksRef);
    const countsByAttribute = {};

    querySnapshot.forEach((doc) => {
      const task = doc.data();
      const attributeValue = task[attribute]; // Dynamically access the attribute
      if (attributeValue) {
        if (!countsByAttribute[attributeValue]) {
          countsByAttribute[attributeValue] = 1;
        } else {
          countsByAttribute[attributeValue] += 1;
        }
      }
    });

    console.log(`Counts by ${attribute}:`, countsByAttribute);
    return countsByAttribute;
  } catch (error) {
    console.error(`Error fetching tasks by ${attribute}: `, error);
    throw error;
  }
};


// Authentication and Firestore functions
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    await storeData("userToken", userCredential.user.refreshToken);
    return userCredential.user;
  } catch (error) {
    if (error.code === "auth/invalid-credential") {
      throw new Error("Either the email or password is incorrect. Please try again.");
    }
    if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email format. Please try again.");
    }
  }
};

export const registerUser = async (
  email,
  password,
  firstName,
  lastName,
  phone_number,
  date_of_birth
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      phone_number,
      date_of_birth,
    });
    await storeData("userToken", userCredential.user.refreshToken);
    return user;
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      throw new Error("The email address is already in use by another account.");
    }
  }
};

export const updateBiometrics = async (
  userId,
  feet,
  inches,
  weight,
  fitnessLevel,
  fitnessGoal
) => {
  try {
    // Convert feet and inches to total inches
    const numericHeight = parseInt(feet) * 12 + parseInt(inches);  // Ensure height is converted to number
    const numericWeight = parseFloat(weight);  // Ensure weight is converted to number

    console.log(`Height: ${numericHeight}, Type: ${typeof numericHeight}`);
    console.log(`Weight: ${numericWeight}, Type: ${typeof numericWeight}`);

    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      height: numericHeight,
      weight: numericWeight,
      fitnessLevel,
      fitnessGoal,
    });
    await storeData("userBiometrics", {
      height: numericHeight,
      weight: numericWeight,
      fitnessLevel,
      fitnessGoal,
    });
    return { status: "success" };
  } catch (error) {
    console.error("Something wrong", error);
    throw error;
  }
};


export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    // You can return a success message or handle it differently
    return { status: "success", message: "Reset password email sent." };
  } catch (error) {
    console.error("Error sending reset password email", error);
    throw error;
  }
};

export const deleteTask = async (userId, taskId) => {
  try {
    const taskDocRef = doc(db, "users", userId, "tasks", taskId);
    await deleteDoc(taskDocRef);
    console.log("Task deleted successfully");
  } catch (error) {
    console.error("Error deleting task: ", error);
    throw new Error("Failed to delete task");
  }
};

export const updateTaskForUser = async (userId, taskId, updatedData) => {
  if (!userId || !taskId) {
    const error = "userId or taskId is not provided";
    console.error(error);
    throw new Error(error);
  }
  try {
    console.log("Updating task with data:", updatedData);

    if (!userId || !taskId) {
      console.error("userId or taskId is not provided");
      return; // Exit the function if no userId or taskId
    }

    if (!updatedData || typeof updatedData !== "object") {
      console.error("Invalid updatedData:", updatedData);
      return; // Exit the function if updatedData is invalid
    }

    const taskDocRef = doc(db, "users", userId, "tasks", taskId);
    await updateDoc(taskDocRef, updatedData);
    console.log("Task updated successfully");
  } catch (error) {
    console.error("Error updating task:", error);
    // Log the error and throw it to be handled
    throw new Error(
      error.message || "Unknown error occurred while updating task"
    );
  }
};

export const saveTaskForUser = async (userId, taskData) => {
  try {
    // Create a reference to the user's tasks subcollection
    const userTasksRef = collection(db, "users", userId, "tasks");

    // Add the task data to the user's tasks subcollection
    const docRef = await addDoc(userTasksRef, taskData);
    console.log("Task document written with ID: ", docRef.id);
    return { status: "success", docId: docRef.id };
  } catch (error) {
    console.error("Error adding task document: ", error);
    throw error;
  }
};
export const addMealData = async (userId, mealData) => {
  try {
    // Create a reference to the user's tasks subcollection
    const userMealRef = collection(db, "users", userId, "meals");

    // Add the task data to the user's tasks subcollection
    const docRef = await addDoc(userMealRef, mealData);
    console.log("Task document written with ID: ", docRef.id);
    return { status: "success", docId: docRef.id };
  } catch (error) {
    console.error("Error adding task document: ", error);
    throw error;
  }
};
export const getMealData = async (userId) => {
  try {
    const userMealRef = collection(db, "users", userId, "meals");
    const querySnapshot = await getDocs(userMealRef);
    let meals = [];
    querySnapshot.forEach((doc) => {
      meals.push({ id: doc.id, ...doc.data() });
    });
    console.log("Meals fetched successfully:", meals);
    return meals;
  } catch (error) {
    console.error("Error fetching Meals: ", error);
    throw error;
  }
};
export const deleteMealData = async (userId, mealId) => {
  try {
    const mealDocRef = doc(db, "users", userId, "meals", mealId);
    await deleteDoc(mealDocRef);
    console.log("meals deleted successfully");
  } catch (error) {
    console.error("Error deleting meal: ", error);
    throw error;
  }
};
export const updateMealData = async (userId, mealId, updatedData) => {
  if (!userId || !mealId) {
    const error = "userId or mealId is not provided";
    console.error(error);
    throw new Error(error);
  }
  try {
    console.log("Updating meal with data:", updatedData);
    if (!userId || !mealId) {
      console.error("userId or mealId is not provided");
      return; // Exit the function if no userId or taskId
    }

    if (!updatedData || typeof updatedData !== "object") {
      console.error("Invalid updatedData:", updatedData);
      return; // Exit the function if updatedData is invalid
    }

    const mealDocRef = doc(db, "users", userId, "meals", mealId);
    await updateDoc(mealDocRef, updatedData);
    console.log("meal updated successfully");
  } catch (error) {
    console.error("Error updating meal:", error);
    // Log the error and throw it to be handled
    throw new Error(
      error.message || "Unknown error occurred while updating meal"
    );
  }
};
export const addWorkoutData = async (userId, workoutData) => {
  try {
    // Create a reference to the user's tasks subcollection
    const userWorkoutRef = collection(db, "users", userId, "workouts");

    // Add the task data to the user's tasks subcollection
    const docRef = await addDoc(userWorkoutRef, workoutData);
    console.log("Task document written with ID: ", docRef.id);
    return { status: "success", docId: docRef.id };
  } catch (error) {
    console.error("Error adding workout document: ", error);
    throw error;
  }
};
export const getWorkoutData = async (userId) => {
  try {
    const userWorkoutRef = collection(db, "users", userId, "workouts");
    const querySnapshot = await getDocs(userWorkoutRef);
    let workouts = [];
    querySnapshot.forEach((doc) => {
      workouts.push({ id: doc.id, ...doc.data() });
    });
    console.log("Workouts fetched successfully:", workouts);
    return workouts;
  } catch (error) {
    console.error("Error fetching workouts: ", error);
    throw error;
  }
};
export const deleteWorkoutData = async (userId, workoutId) => {
  try {
    const workoutDocRef = doc(db, "users", userId, "workouts", workoutId);
    await deleteDoc(workoutDocRef);
    console.log("workouts deleted successfully");
  } catch (error) {
    console.error("Error deleting workout: ", error);
    throw error;
  }
};
export const updateWorkoutData = async (userId, workoutId, updatedData) => {
  if (!userId || !workoutId) {
    const error = "userId or workoutId is not provided";
    console.error(error);
    throw new Error(error);
  }
  try {
    console.log("Updating workout with data:", updatedData);
    if (!userId || !workoutId) {
      console.error("userId or workoutId is not provided");
      return; // Exit the function if no userId or taskId
    }

    if (!updatedData || typeof updatedData !== "object") {
      console.error("Invalid updatedData:", updatedData);
      return; // Exit the function if updatedData is invalid
    }

    const workoutDocRef = doc(db, "users", userId, "workouts", workoutId);
    await updateDoc(workoutDocRef, updatedData);
    console.log("workout updated successfully");
  } catch (error) {
    console.error("Error updating workout:", error);
    // Log the error and throw it to be handled
    throw new Error(
      error.message || "Unknown error occurred while updating workout"
    );
  }
};
export const fetchTasksForUser = async (userId) => {
  try {
    const userTasksRef = collection(db, "users", userId, "tasks");
    const querySnapshot = await getDocs(userTasksRef);
    let tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    console.log("Tasks fetched successfully:", tasks);
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks: ", error);
    throw error;
  }
};

export const countTasksForUser = async (userId) => {
  try {
    const tasksRef = collection(db, "users", userId, "tasks");
    const querySnapshot = await getDocs(tasksRef);
    const tasksCount = querySnapshot.size;

    console.log('Total tasks for user ${userId}: ${tasksCount}');
    return tasksCount;
  } catch (error) {
    console.error("Error fetching task count: ", error);
    throw error;
  }
};

export const updateUserThemePreference = async (userId, themePreference) => {
  const db = getFirestore();
  const userRef = doc(db, "users", userId); 

  try {
    await updateDoc(userRef, {
      themePreference: themePreference,
    });
    console.log("Theme preference updated successfully");
  } catch (error) {
    console.error("Error updating theme preference: ", error);
  }
};

export const updateUserProfile = async (userId, updatedData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, updatedData);
    console.log("User profile updated successfully");
    return { status: "success" };
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw error;
  }
};

export const savePaymentMethodForUser = async (userId, paymentMethodData) => {
  try {
    // Create a reference to the user's paymentMethods subcollection
    const userPaymentMethodsRef = collection(
      db,
      "users",
      userId,
      "paymentMethods"
    );

    // Add the payment method data to the user's paymentMethods subcollection
    const docRef = await addDoc(userPaymentMethodsRef, paymentMethodData);
    console.log("Payment method document written with ID: ", docRef.id);
    return { status: "success", docId: docRef.id };
  } catch (error) {
    console.error("Error adding payment method document: ", error);
    throw error;
  }
};

export const fetchAllPaymentMethodsForUser = async (userId) => {
  try {
    const userPaymentMethodsRef = collection(
      db,
      "users",
      userId,
      "paymentMethods"
    );
    const querySnapshot = await getDocs(userPaymentMethodsRef);
    const paymentMethods = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Fetched payment methods: ", paymentMethods);
    return paymentMethods; // Returns an array of payment method objects
  } catch (error) {
    console.error("Error fetching payment methods: ", error);
    throw error;
  }
};
export const updatePaymentMethodForUser = async (
  userId,
  paymentMethodId,
  paymentMethodData
) => {
  try {
    if (!paymentMethodData) {
      console.error("Payment method data is undefined");
      throw new Error("Payment method data is undefined");
    }
    
    const paymentMethodDocRef = doc(
      db,
      "users",
      userId,
      "paymentMethods",
      paymentMethodId
    );

    await updateDoc(paymentMethodDocRef, paymentMethodData);

    console.log("Payment method document updated with ID:", paymentMethodId);
    return { status: "success", docId: paymentMethodId };
  } catch (error) {
    console.error("Error updating payment method document:", error);
    throw error;
  }
};

export const deletePaymentMethodForUser = async (userId, paymentMethodId) => {
  try {
    // Reference to a specific payment method document for the user
    const paymentMethodDocRef = doc(
      db,
      "users",
      userId,
      "paymentMethods",
      paymentMethodId
    );

    // Delete the payment method document
    await deleteDoc(paymentMethodDocRef);

    console.log("Payment method document deleted with ID: ", paymentMethodId);
    return { status: "success", docId: paymentMethodId };
  } catch (error) {
    console.error("Error deleting payment method document: ", error);
    throw error;
  }
};

// Clean up user data by converting height and weight to numbers
export const cleanUserData = async () => {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  snapshot.forEach(async (doc) => {
    const userData = doc.data();

    let { height, weight } = userData;

    // Convert height and weight only if they are stored as strings
    const isHeightString = typeof height === 'string';
    const isWeightString = typeof weight === 'string';

    if (isHeightString || isWeightString) {
      // Convert string to numbers
      height = isHeightString ? parseFloat(height) : height;
      weight = isWeightString ? parseFloat(weight) : weight;

      // Update the document with corrected types
      await updateDoc(doc.ref, {
        ...userData,
        height: height,
        weight: weight
      });

      console.log(`Updated user ${doc.id} with height: ${height} and weight: ${weight}`);
    }
  });
};

// Export the AsyncStorage getData function if needed elsewhere
export { getData };