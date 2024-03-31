import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import getStyles from '../styles/HomeScreenStyles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from "../services/ThemeContext";

const AccountButton = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const onAccountPress = () => {
    navigation.navigate("Settings");
  };

  return (
    <View style={styles.accountContainer}>
      <TouchableOpacity onPress={onAccountPress}>
        <MaterialIcons name="settings" size={24} color={theme === 'dark' ? 'white' : 'black'} />
      </TouchableOpacity>
    </View>
  );
};

export default AccountButton;
