// CreateTaskScreen.js
import React from "react";
import { useState } from "react";
import { ScrollView, Alert, Pressable, Text, View, TextInput } from "react-native";
import Header from "./Header";
import DateTimePicker from "./DateTimePicker";
import TypeSelector from "./TypeSelector";
import CreateButton from "./CreateButton";
import { saveTaskForUser } from "../services/AuthAPI";
import eventEmitter from "./EventEmitter";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../services/ThemeContext";
import getStyles from "../styles/AddStyles";

const CreateTaskScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userID } = route.params;
  const [taskName, setTaskName] = useState("");
  const [location, setLocation] = useState("");
  const [taskType, setTaskType] = useState("");
  const [comment, setComment] = useState("");
  const [date, setDate] = useState(new Date());
  const [priority, setPriority] = useState("medium");
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleclose = () => {
    setTaskName("");
    setLocation("");
    setComment("");
    setPriority("medium");
    navigation.navigate("Today");
  };
  const handleCreateTask = async () => {
    const user = userID;

    const taskData = {
      name: taskName,
      date: date.toISOString(),
      location: location,
      type: taskType,
      comment: comment,
      completed: false,
      priority: priority, // default priority
    };

    try {
      await saveTaskForUser(user, taskData);
      Alert.alert("Task Created", "Your task has been successfully created!");
      // Reset task creation form or navigate the user away
    } catch (error) {
      Alert.alert(
        "Error",
        "There was an error creating your task. Please try again."
      );
      console.error(error);
    }
    eventEmitter.emit("taskCreated");
    setTaskName("");
    setLocation("");
    setComment("");
    setPriority("medium");
    navigation.navigate("Today");
  };
  return (
    <View style={styles.screen}>
      <View style={styles.createTextContainer}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>
        <Text style={styles.createText}>Create Task</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.container}>
        <Header onClose={() => handleclose()} />
        <TextInput
          style={styles.input}
          value={taskName}
          placeholder="Name"
          placeholderTextColor="grey"
          onChangeText={setTaskName}
        />
        <DateTimePicker onConfirm={setDate} />
        <TextInput
          style={styles.input}
          value={location}
          placeholder="Location"
          placeholderTextColor="grey"
          onChangeText={setLocation}
        />
        <TypeSelector
          selectedType={taskType}
          onSelect={(type) => setTaskType(type)}
        />
          <TextInput
          style={[styles.input, styles.tallInput]}
          value={comment}
          placeholder="Add notes..."
          placeholderTextColor="grey"
          multiline
          onChangeText={setComment}
        />
        <Text style={styles.priorityText}>Priority</Text>
        <View style={styles.priorityPicker}>
          <Picker
            selectedValue={priority}
            onValueChange={(itemValue, itemIndex) => setPriority(itemValue)}
            style={{ height: 50, width: 150 }}
          >
            <Picker.Item label="Low" value="low" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="High" value="high" />
          </Picker>
        </View>
        <CreateButton onPress={handleCreateTask} label={"Create Task"} />
      </ScrollView>
    </View>
  );
};

export default CreateTaskScreen;