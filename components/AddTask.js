// CreateTaskScreen.js
import React from "react";
import { useState } from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";
import Header from "./Header";
import InputField from "./InputField";
import DateTimePicker from "./DateTimePicker";
import TypeSelector from "./TypeSelector";
import CommentBox from "./CommentBox";
import CreateButton from "./CreateButton";
import { saveTaskForUser } from "../services/AuthAPI";
import eventEmitter from "./EventEmitter";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

const CreateTaskScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userID } = route.params;
  const [taskName, setTaskName] = useState("");
  const [location, setLocation] = useState("");
  const [taskType, setTaskType] = useState("");
  const [comment, setComment] = useState("");
  const [date, setDate] = useState(new Date());
  const [priority, setPriority] = useState("medium");

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
    <ScrollView style={styles.container}>
      <Header onClose={() => handleclose()} />
      <InputField
        value={taskName}
        placeholder="Name"
        onChangeText={setTaskName}
      />
      <DateTimePicker onConfirm={setDate} />
      <InputField
        value={location}
        placeholder="Location"
        onChangeText={setLocation}
      />
      <TypeSelector onSelect={setTaskType} />
      <CommentBox value={comment} onChangeText={setComment} />
      <CreateButton onPress={handleCreateTask} label={"Create Task"} />
      <Picker
        selectedValue={priority}
        onValueChange={(itemValue, itemIndex) => setPriority(itemValue)}
        style={{ height: 50, width: 150 }}
      >
        <Picker.Item label="Low" value="low" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="High" value="high" />
      </Picker>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default CreateTaskScreen;
