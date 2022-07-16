import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableWithoutFeedback, Keyboard } from 'react-native';

import {
  getDBConnection, 
  saveTodoItems,
  getTodoItems
} from "../components/db-services";

import { Madoka } from 'react-native-textinput-effects';
import AwesomeButton from "react-native-really-awesome-button";
import moment from "moment";

export default function AddE({ route, navigation }) {

  const { type, idE, nameE, dateE, typeE } = route.params;
  var textNamel = "";

  const [date, setDate] = useState("");
  const [nameText, setNameText] = useState("");
  const [show, setShow] = useState(false);
  const [editData, setEditData] = useState("");
  const [textName, settextName] = useState("");
  const [textDate, settextDate] = useState("")
  const [mode, setmode] = useState("");
  const [title, settitle] = useState(type == "add" ? "Food" : "Anpassen")
  const [prozzDate, setprozzDate] = useState("")


  useEffect(() => {
    if (type === "add") {
      textNamel = "Enter name"
      setmode("E")
    }
    else if (type == "edit"){
      textNamel = ""
      var date2 = new Date(dateE);
      setDate(date2);
      setNameText(nameE);
      setmode(typeE);
    }

    settextName(textNamel)
    settextDate("Enter date")
  }, [])  

  useEffect(() => {
    pd = moment(getDateFromString()).format('DD.MM.YYYY');
    setprozzDate(pd);
  }, [date])
  
  navigation.setOptions({title: title})

  const madokaInputName = (
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
        settextName("Name eingeben")}}
      value={nameText}
    />
  );

  const getDateFromString = () => {
    var tmpDate = date;

    const searchRegExp = new RegExp("[, /;:)({}=$!+*#<>']", "g");

    tmpDate = tmpDate.replaceAll(searchRegExp, ".");

    var parts = tmpDate.split(".")

    if (parts.length == 2) {
      tmpDate = "01." + tmpDate; 
    }

    for (let index = 0; index < parts.length; index++) {
      if (parseInt(parts[index]) < 10) {
        parts[index] = "0" + parts[index];
      }
    }

    var momentObj = moment(tmpDate, 'DD.MM.YYYY');

    var dateToUse = new Date(momentObj.format('YYYY-MM-DD'));

    console.log("func " + dateToUse);

    return dateToUse;
  }

  const saveEvent = async (type, id) => {

    if (type != "edit" && nameText != "" && date != "") {
      const db = await getDBConnection();

      const data = await getTodoItems(db, "_");

      var newID = 0;

      if (data[data.length - 1] != undefined) {
        newID = data[data.length - 1].id + 1
      }

      var dateToUse = getDateFromString();

      const dataToSave = [{id: newID, value: nameText, date: dateToUse, type: mode}]

      if (!isNaN(dateToUse)) {
        await saveTodoItems(db, dataToSave);
      }
      else{
          set("cannot save Item without date")
      }

    } else if (nameText != "" && date != ""){
      const db = await getDBConnection();

      const data = await getTodoItems(db, "_");

      var dateToUse = getDateFromString();

      const dataToSave = [{id: id, value: nameText, date: dateToUse, type: mode}]

      await saveTodoItems(db, dataToSave);

      navigation.goBack(null);
    }
    if (nameText == "") {
        settextName("cannot be empty!");
    }
    if (date == ""){
        settextDate("cannot be empty!");
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

  const madokaInputDate = (
    <Madoka
      label={textDate}
      // this is used as active and passive border color
      borderColor={'#C3C0C0'}
      inputPadding={16}
      labelHeight={24}
      labelStyle={{ color: '#878787'}}
      inputStyle={{ color: '#000000'}}
      clearButtonMode={"always"}
      onChangeText={(value) => {setDate(value); 
        settextDate("Datum eingeben")
        pd = moment(getDateFromString()).format('DD.MM.YYYY');
        setprozzDate(pd);
      }}
      value={date}
    />
  );

  const madokaOutputDate = (
    <Madoka
      label={"generated date"}
      borderColor={'#C3C0C0'}
      inputPadding={16}
      labelHeight={24}
      labelStyle={{ color: '#878787'}}
      inputStyle={{ color: '#000000'}}
      onChangeText={(value) => {setDate(value); settextDate("Datum eingeben")}}
      value={prozzDate}
      editable={false}
    />
  );

  return (
    <View style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{flex: 1}}>
          <View style={{margin: 20, top: 20}}>
            {madokaInputName}
          </View>
          <View style={{margin: 20, top: 20}}>
            {madokaInputDate}
          </View>
          <View style={{margin: 20, top: 20}}>
            {madokaOutputDate}
          </View>
          <View style={{margin: 30, bottom: 10, marginTop: 55}}>
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