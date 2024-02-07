import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android",
  },
  container: {
    padding: 10,
    justifyContent: "center",
    flex: 1,
  },
});
export default styles;
