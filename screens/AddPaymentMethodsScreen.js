import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { useTheme } from '../services/ThemeContext';
import { savePaymentMethodForUser, fetchAllPaymentMethodsForUser } from "../services/AuthAPI";
import { getAuth } from 'firebase/auth';
import getStyles from "../styles/AddPaymentMethodsStyle";
import { numberOfLines } from 'deprecated-react-native-prop-types/DeprecatedTextPropTypes';

const AddPaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState('');
  const [creditCard, setCreditCard] = useState('');
  const [CVC, setCVC] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [name, setName] = useState('');
  const [ZIP, setZIP] = useState('');
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleCreditCardChange = (text) => {
    const numericInput = text.replace(/[^0-9]/g, '');
    if (numericInput.length <= 16) {
      setCreditCard(numericInput);
    }
  };

  const handleCVCChange = (text) => {
    const numericInput = text.replace(/[^0-9]/g, '');
    if (numericInput.length <= 3) {
      setCVC(numericInput);
    }
  };

  const handleMonthChange = (text) => {
    const numericInput = text.replace(/[^0-9]/g, '');
    if (numericInput.length <= 2) {
      setExpMonth(numericInput);
    }
  };

  const handleYearChange = (text) => {
    const numericInput = text.replace(/[^0-9]/g, '');
    if (numericInput.length <= 4) {
      setExpYear(numericInput);
    }
  };

  const handleZipChange = (text) => {
    const numericInput = text.replace(/[^0-9]/g, '');
    if (numericInput.length <= 5) {
      setZIP(numericInput);
    }
  };

  const handleSavePaymentMethod = async () => {
    const monthNum = parseInt(expMonth, 10);
    const yearNum = parseInt(expYear, 10);

    if(!nickname || nickname.trim() === '') {
      Alert.alert("Nickname is empty.");
      return;
    }
    if (creditCard.length !== 16) {
      Alert.alert("Invalid credit card.");
      return;
    }
    if (CVC.length !== 3) {
      Alert.alert("Invalid CVC number.");
      return;
    }
    if (expMonth.length !== 2 || monthNum < 1 || monthNum > 12) {
      Alert.alert("Invalid EXP month.", "Month must be between 01 and 12.");
      return;
    }
    if (expYear.length !== 4 || yearNum < 2000 || yearNum > 2099) {
      Alert.alert("Invalid EXP year.", "Year must be between 2000 and 2099.");
      return;
    }
    if(!name || name.trim() === '') {
      Alert.alert("Name on card is empty.");
      return;
    }
    if (ZIP.length !== 5) {
      Alert.alert("Invalid ZIP code.");
      return;
    }

    try {
      await savePaymentMethodForUser(userId, { nickname, creditCard, CVC, expMonth, expYear, name, ZIP });
      console.log("Payment method saved successfully");
      Alert.alert(
        "Success", // Alert Title
        "Your payment method was saved successfully!", // Alert Message
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('PaymentMethods'),
          },
        ]
      );
      
      // Fetch all payment methods for the user after adding a new one
      const updatedPaymentMethods = await fetchAllPaymentMethodsForUser(userId);
      
      // Navigate back to the PaymentMethodsScreen with the updated list
      navigation.navigate('PaymentMethods', { paymentMethods: updatedPaymentMethods });
    } catch (error) {
      console.error("Failed to save payment method", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Add Payment Method</Text>
        <View style={{width: 24}}/>
      </View>

      <ScrollView style={styles.screen}>
        <View style={styles.container}>
          <View style={styles.contentContainer}>
            <View>
              <Text style={styles.label}>Nickname:</Text>
              <TextInput style={styles.input} 
              onChangeText={setNickname} 
              value={nickname} 
              placeholder="My Card"
              placeholderTextColor={'grey'}
              keyboardType="default"
              secureTextEntry={false}/>
            </View> 
            
            <View>
              <Text style={styles.label}>Credit Card:</Text>
              <TextInput style={[styles.input, {width: '43%'}]} 
              onChangeText={handleCreditCardChange} 
              value={creditCard} 
              placeholder="1234567890123456"
              placeholderTextColor={'grey'}
              keyboardType="number-pad"
              secureTextEntry={false}/>
            </View> 

            <View>
              <Text style={styles.label}>CVC:</Text>
              <TextInput style={[styles.input, {width: '13%'}]} 
              onChangeText={handleCVCChange} 
              value={CVC} 
              placeholder="123"
              placeholderTextColor={'grey'}
              keyboardType="number-pad"
              secureTextEntry={false}/>
            </View> 

            <View style={{ flexDirection: 'row' }}>
              <View>
                <Text style={styles.label}>EXP Month:</Text>
                <TextInput 
                  style={[styles.input, {width: '50%'}]}
                  onChangeText={handleMonthChange}
                  value={expMonth}
                  placeholder="MM"
                  placeholderTextColor={'grey'}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View>
                <Text style={styles.label}>EXP Year:</Text>
                <TextInput 
                  style={[styles.input, {width: '75%'}]}
                  onChangeText={handleYearChange}
                  value={expYear}
                  placeholder="YYYY"
                  placeholderTextColor={'grey'}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Name on card:</Text>
              <TextInput style={styles.input} 
              onChangeText={setName} 
              value={name} 
              placeholder="John Appleseed"
              placeholderTextColor={'grey'}
              keyboardType="default"
              secureTextEntry={false}/>
            </View>

            <View>
              <Text style={styles.label}>ZIP:</Text>
              <TextInput style={[styles.input, {width: '17%'}]} 
              onChangeText={handleZipChange} 
              value={ZIP} 
              placeholder="12345"
              placeholderTextColor={'grey'}
              keyboardType="number-pad"
              secureTextEntry={false}/>
            </View> 

          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}> 
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity 
            onPress={handleSavePaymentMethod}
            style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Payment Method</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

export default AddPaymentMethodsScreen;