import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableWithoutFeedback, Keyboard } from 'react-native';

import {
  getDBConnection, 
  saveTodoItems,
  getTodoItems
} from "../components/db-services";

import { Madoka } from 'react-native-textinput-effects';
import DateTimePicker from '@react-native-community/datetimepicker';
import AwesomeButton from "react-native-really-awesome-button";

export default function Add({ route, navigation }) {

  const { type, idE, nameE, dateE, typeE } = route.params;

  const [date, setDate] = useState(new Date(1598051730000));
  const [nameText, setNameText] = useState("");
  const [show, setShow] = useState(false);
  const [editData, setEditData] = useState("");
  const [textName, settextName] = useState("");
  const [mode, setmode] = useState("");
  const [textNamel, settextNamel] = useState(type == "bday" ? "Enter name" : "Jahrestag eingeben")
  const [title, settitle] = useState(type == "bday" ? "Bithday" : "Anniversary")

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };


  useEffect(() => {
    if (type === "bday") {
      settextNamel("Enter name");
      var bDate = new Date();
      bDate.setFullYear(2000)
      setDate(bDate);
      setmode("G")
    } else if(type === "jday") {
      settextNamel("Enter name");
      var jDate = new Date();
      setDate(jDate);
      setmode("J");
    }
    else if (type == "edit"){
      settextNamel("")
      var date2 = new Date(dateE);
      setDate(date2);
      setNameText(nameE);
      setmode(typeE);
      settitle("Anpassen")
    }

    settextName(textNamel)
  }, [])

  navigation.setOptions({title: title});

  const madokaInput = (
    <Madoka
      label={textName}
      // this is used as active and passive border color
      borderColor={'#C3C0C0'}
      inputPadding={16}
      labelHeight={24}
      labelStyle={{ color: '#878787'}}
      inputStyle={{ color: '#000000'}}
      clearButtonMode={"always"}
      onChangeText={(value) => {setNameText(value); 
        settextName(textNamel)}}
      value={nameText}
    />
  );

  const saveEvent = async (type, id) => {

    if (type != "edit" && nameText != "") {
      const db = await getDBConnection();

      const data = await getTodoItems(db, "_");

      var newID = 0;

      if (data[data.length - 1] != undefined) {
        newID = data[data.length - 1].id + 1
      }

      var dateToUse = date

      const dataToSave = [{id: newID, value: nameText, date: dateToUse, type: mode}]

      await saveTodoItems(db, dataToSave);

    } else if (nameText != ""){
      const db = await getDBConnection();

      const data = await getTodoItems(db, "_");

      const dataToSave = [{id: id, value: nameText, date: date, type: mode}]

      await saveTodoItems(db, dataToSave);

      navigation.goBack(null);
    }
    else{
      settextName("cannot be empty!");
    }

  }

  function Button() {
    return (
      <AwesomeButton
        progress
        width={"100%"}
        height={40}
        onPress={next => {
          saveEvent(type, idE);
          next();
        }}
      >
        Add
      </AwesomeButton>
    );
  }

  const monthList = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ]

  return (
    <View style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View>
          <View style={{margin: 20, top: 20}}>
            {madokaInput}
          </View>
          <View style={{margin: 30}}>
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                display="inline"
                mode={"date"}
                is24Hour={true}
                onChange={onChange}
                themeVariant="light"
              />
          </View>
          <View style={{margin: 30, bottom: 10}}>
           {Button()}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputIOS: {
    marginTop: 15,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});