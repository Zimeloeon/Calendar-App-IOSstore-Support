
import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  View,
  FlatList,
  Text,
  Dimensions,
  Alert,
} from 'react-native';

// MIT
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileSystem } from 'react-native-file-access';
import Share from 'react-native-share';
import DocumentPicker from 'react-native-document-picker';
import moment from "moment";
import ProgressCircle from 'react-native-progress-circle'
import Dialog from "react-native-dialog";
import { FloatingAction } from "react-native-floating-action";
import { Kaede } from 'react-native-textinput-effects';
import AppleHeader from "react-native-apple-header";
import { showMessage } from "react-native-flash-message";

import {
  getDBConnection, 
  createTable, 
  getTodoItems,
  saveTodoItems,
  deleteTable,
  deleteTodoItem,
  getTodoItemsFilter
} from "../components/db-services";

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

const numColumns = 2;
const margin = 25;

const Home = ({ navigation }) => {

  const getCurrentDate = (separatorDate='.', separatorHour=":") => {

    let newDate = new Date()

    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    
    return `${date}${separatorDate}${month<10?`0${month}`:`${month}`}${separatorDate}${year}`
  }

  const formatData = (data, numColumns) => {
    const numberOfFullRows = Math.floor(data.length / numColumns);
  
    let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns);
    while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
      data.push({ key: `blank-${numberOfElementsLastRow}`, empty: true });
      numberOfElementsLastRow++;
    }
  
    return data;
  };

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem('@filter', value)
    } catch (e) {
      console.log(e);
    }
  }

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@filter')
      if(value !== null) {
        return value;
      }
      else {
        return "_";
      }
    } catch(e) {
      console.log(e);
    }
  }

  const [sortAlpha, setsortAlpha] = useState(0);
  const [sortNumber, setsortNumber] = useState(1);

  //const colorsButton = ["#444444", "#42CE52", "#F59400"]
  const colorsButton = ["#444444", "#42CE52", "#E74400"]

  const actions = [
    {
      text: "import File",
      icon: require("../assets/2672782_down_document_ui_app_object_icon.png"),
      name: "impFile",
      position: 0,
      color: "#AE42EB"
    },
    {
      text: "Save as File",
      icon: require("../assets/2124216_arrow_document_essential_app_up_icon.png"),
      name: "expFile",
      position: 1,
      color: "#FF7ACF"
    },
    {
      text: "Birthday",
      icon: require("../assets/430713_cake_dessert_valenticons_valentine_heart_icon.png"),
      name: "addB",
      position: 2,
      color: "#E79500"
    },
    {
      text: "Anniversary",
      icon: require("../assets/3357506_carnival_circus_fair_firework_star_icon.png"),
      name: "addJ",
      position: 3,
      color: "#E79500"
    },
    {
      text: "Food",
      icon: require("../assets/185119_fork_knife_eat_food_icon.png"),
      name: "addE",
      position: 4,
      color: "#E79500"
    },
    {
      text: "Sort Number",
      icon: require("../assets/8357737.png"),
      name: "sn",
      position: 5,
      textColor: colorsButton[sortNumber],
      color: colorsButton[sortNumber]
    },
    {
      text: "Sort Alphabet",
      icon: require("../assets/858265.png"),
      name: "sa",
      position: 6,
      textColor: colorsButton[sortAlpha],
      color: colorsButton[sortAlpha]
    },
  ];

  const [refreshTime, setRefreshTime] = useState(getCurrentDate());
  const [searchText, setSearchText] = useState("");
  const [data, setdata] = useState([]);
  const [currentEntry, setCurrentEntry] = useState([])
  const [singleFile, setSingleFile] = useState('');
  const [fType, setfType] = useState(":")

  const [visible, setVisible] = useState(false);

  const showDialog = (item) => {
    setCurrentEntry(item);
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleEdit = () => {
    storeData(fType);
    navigation.navigate("Add", {type: "edit", idE: currentEntry.id, nameE: currentEntry.value, dateE: currentEntry.date, typeE: currentEntry.type});
    setVisible(false);
  };

  const handleDelete = async () => {
    const db = await getDBConnection();
    await deleteTodoItem(db, currentEntry.id);
    loadDataCallback(searchText, sortAlpha, sortNumber, fType);
    setVisible(false);
  };

  const filterList = (value) => {
    setSearchText(value);
  }

  const kaedeInput = (
    <Kaede
      label={'Search'}
      inputPadding={16}
      clearButtonMode={"always"}
      onChangeText={(value) => filterList(value)}
      style={{marginTop: 15}}
    />
  );

  const sortList = (toSort, sa, sn) => {
    //console.log("sa\n", sa);
    //console.log("sn\n", sn);
    if (sa  == 1) {
      toSort.sort(function(a, b) {
        if (a.value != undefined) {
          return a.value.localeCompare(b.value);
        } 
      });
    }
    else if (sa == 2) {
      toSort.sort(function(a, b) {
        if (a.value != undefined) {
          return a.value.localeCompare(b.value);
        } 
      });
      toSort.reverse();
    }
    else if (sn == 1) {
      toSort.sort(function(a, b) {
        if (a.value != undefined) {

          var remainingA = calcDays(a.date);
          var remainingB = calcDays(b.date);

          return remainingA > remainingB ? 1 : -1;
        } 
      });
    } else {
      toSort.sort(function(a, b) {
        if (a.value != undefined) {

          var remainingA = calcDays(a.date);
          var remainingB = calcDays(b.date);

          return remainingA > remainingB ? 1 : -1;
        } 
      });
      toSort.reverse();
    }
    return toSort;
  }

  const setTodos = (values, sa, sn) => {
    var list = sortList(values, sa, sn);
    setdata(list);
  }

  const calcDays = (date) => {
    var date1 = new Date();
    var date2 = new Date(date);

    date1.setFullYear(date2.getFullYear());
    date1.setSeconds(0);
    date1.setHours(0);
    date1.setMinutes(0);

    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(0);


    var Difference_In_Time = date2.getTime() - date1.getTime();

    var Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));

    if (Difference_In_Days < 0) {
      Difference_In_Days = (Difference_In_Days * -1 - 365) * -1;
    } 
    return Difference_In_Days
  }

  const calcFood = (date) => {
    var date1 = new Date();
    var date2 = new Date(date);

    date1.setSeconds(0);
    date1.setHours(0);
    date1.setMinutes(0);

    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(0);


    var Difference_In_Time = date2.getTime() - date1.getTime();

    var Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));

    return Difference_In_Days
  }

  const loadDataCallback = useCallback(async (value, sa, sn, st) => {

    if (st == ":") {
      st = await getData();
      setfType(st)
    }
    else {
      st = await getData();
      setfType(st)
    }

    try {
      /*const initTodos = [
          { id: 0, value: 'go to shop', date: "0:0:0" },
          { id: 1, value: 'eat at least a one healthy foods', date: "0:0:0" }, 
          { id: 2, value: 'Do some exercises', date: "0:0:0"},
          { id: 3, value: 'Do 1 exercises', date: "0:0:0"},
          { id: 4, value: 'Do 2 exercises', date: "0:0:0"}];
        */
      const db = await getDBConnection();

      await createTable(db);
      let storedTodoItems = []
      if (value == "" || value == undefined) {
        storedTodoItems = await getTodoItems(db, st);
      } else {
        storedTodoItems = await getTodoItemsFilter(db, value, st);
      }

      setTodos(storedTodoItems, sa, sn);

    } catch (error) {
      console.error(error);
    }
  }, []);

  const renderItem = ({ item, index }) => {
    if (item.empty === true) {
      return <View style={[styles.item, styles.itemInvisible]} />;
    }

    var remaining = calcDays(item.date);
    var dateFormat = new Date(item.date);
    var percentRem = 100 - (calcDays(item.date) / 365) * 100;

    var dayThisYear = new Date(item.date);
    dayThisYear.setFullYear(new Date().getFullYear());

    var cM = "#F0CFFF";

    if (item.type == "G") {
      cM = "#D5F7FD";
    }
    else if (item.type == "E") {
      cM = "#CFFFE4";
    }

    var neuesAlter = (moment(dateFormat).format("YYYY") - moment().format("YYYY")) * -1

    var toDisplay;

    if (item.type == "G") {
      toDisplay = (<View>
                        <Text style={styles.itemText}>{item.value}{"\n"}</Text>
                        <Text style={styles.itemDateDiff}>will be {neuesAlter} on {moment(dayThisYear).format("ddd. DD.MM")}</Text>
                      </View> );
    } else if (item.type == "J") {
      toDisplay = (<View>
                    <Text style={styles.itemText}>{item.value}{"\n"}</Text>
                    <Text style={styles.itemDateDiff}>on {moment(dayThisYear).format("ddd. DD.MM")}</Text>
                  </View> );
    } else {
      toDisplay = (<View>
                    <Text style={styles.itemText}>{item.value}{"\n"}</Text>
                    <Text style={styles.itemDateDiff}>expires {moment(dateFormat).format("ddd. DD.MM.YYYY")}</Text>
                  </View> );
      remaining = calcFood(item.date);

      if (remaining < 0) {
        percentRem = 100;
      }
      
    }

    return (
      <TouchableOpacity style={[{backgroundColor: cM} ,styles.item]} onPress={() => showDialog(item)}>
        <View>
          {toDisplay}
          <View style={{alignContent: "center", alignSelf: "center", marginTop: 20}}>
            <ProgressCircle
                  percent={percentRem}
                  radius={30}
                  borderWidth={5}
                  color="#589DFC"
                  shadowColor="#999"
                  bgColor={cM}
              >
                <Text style={{ fontSize: 12 }}>{remaining}</Text>
              </ProgressCircle>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    storeData("_");
    setRefreshTime(getCurrentDate());
    getData();

    loadDataCallback(searchText, sortAlpha, sortNumber, fType);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDataCallback(searchText, sortAlpha, sortNumber, fType);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadDataCallback(searchText ,sortAlpha, sortNumber, fType);
  }, [sortNumber, sortAlpha, searchText, fType])

  const AsyncAlert = async () => new Promise((resolve) => {
    Alert.alert(
      'Alert',
      'Do you want to overwrite the current Events (not reversable)',
      [
        {
          text: 'yes',
          onPress: () => {
            resolve('YES');
          },
        },
        {
          text: 'no',
          onPress: () => {
            resolve('NO');
          },
        },
      ],
      { cancelable: false },
    );
  });

  const filePicker = async () => {
    //var RNFS = require('react-native-fs');

    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        //There can me more options as well
        // DocumentPicker.types.allFiles
        // DocumentPicker.types.images
        // DocumentPicker.types.plainText
        // DocumentPicker.types.audio
        // DocumentPicker.types.pdf
      });
      //Printing the log realted to the file
      //console.log('res : ' + JSON.stringify(res));
      //console.log('URI : ' + res[0].uri);
      //console.log('Type : ' + res.type);
      //console.log('File Name : ' + res.name);
      //console.log('File Size : ' + res.size);
      //Setting the state to show single file attributes
      setSingleFile(res);

      let correctFile = 0;

      if (res[0].type === "text/csv") {
        const status = await AsyncAlert();
        
        console.log("status", status);
        if (status === "YES") {
          correctFile = 1
        } 
        else{
          throw new Error("user cancle")
        }
      }
      else {
        throw new Error("wrong filetype")
      }

      if (correctFile === 1) {
        const text = await FileSystem.readFile(res[0].uri);

        var lines = text.split(';\n');
        var toSave = []

        for (let index = 0; index < lines.length; index++) {
          let elements = lines[index].split(",");
          let objPart = {id: elements[0], value: elements[2], date: elements[1], type: elements[3]}
          if (objPart.value != undefined) {
            toSave.push(objPart)
          }
        }

        try {
          const db = await getDBConnection();

          try {
            deleteTable(db)
          } catch (error) {
            console.log("no table to delete");
          }

          await createTable(db);
          
          await saveTodoItems(db, toSave).then(() => {
            setTodos(toSave, 0, 1)
          });
    
        } catch (error) {
          console.error(error);
        }
      }

    } catch (err) {
      //Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        //If user canceled the document selection
        showMessage({
          message: "cancled" ,
          type: "danger",
        });
      } else {
        showMessage({
          message: "cancled " + "(" + err + ")" ,
          type: "danger",
        });
        throw err;
      }
    }
  }

  /**
     * This function shares PDF and PNG files to
     * the Files app that you send as the urls param
     */
   const shareToFiles = async (path) => {
    const shareOptions = {
      title: 'Share file',
      failOnCancel: false,
      saveToFiles: true,
      urls: [path], // base64 with mimeType or path to local file
    };

    // If you want, you can use a try catch, to parse
    // the share response. If the user cancels, etc.
    try {
      const ShareResponse = await Share.open(shareOptions);
      //setResult(JSON.stringify(ShareResponse, null, 2));
        showMessage({
          message: "File saved",
          type: "success",
          textStyle: styles.messageTextStyle,
          titleStyle: styles.messageTextStyle
        });
    } catch (error) {
      console.log(error);
      showMessage({
        message: "Not saved",
        type: "danger",
        textStyle: styles.messageTextStyle,
        titleStyle: styles.messageTextStyle
      });
      //console.log('Error =>', error);
      setResult('error: '.concat(getErrorString(error)));
    }
  };

  const savwFile = async (data) => {
    var RNFS = require('react-native-fs');

    // create a path you want to write to
    // :warning: on iOS, you cannot write into `RNFS.MainBundlePath`,
    // but `RNFS.DocumentDirectoryPath` exists on both platforms and is writable
    var path = RNFS.DocumentDirectoryPath + '/birthdayData.csv';

    for (let index = 0; index < data.length; index++) {
      console.log(data[index]);
      if (data[index].value === undefined) {
        console.log(data[index].value);
        data.splice(index, 1);
      } 
    }

    const rowString = data.map(d => `${d.id},${d.date},${d.value},${d.type};\n`).join('');

    // write the file
    RNFS.writeFile(path, rowString, 'utf8')
      .then((success) => {
        //console.log('FILE WRITTEN!');
      })
      .catch((err) => {
        //console.log(err.message);
      });

      shareToFiles(path);
  }

  const openScree = (name) => {
      if (name === "addB") {
        navigation.navigate("Add", {type: "bday"});
      }
      else if (name === "addJ") {
        navigation.navigate("Add", {type: "jday"});
      }
      else if (name == "ref") {
        //loadDataCallback(searchText, sortAlpha, sortNumber);
      }
      else if (name == "sn") {
        setsortAlpha(0);
        if (sortNumber == 2 || sortNumber == 0) {
          setsortNumber(1);
        }
        else {
          setsortNumber(2);
        }
      }
      else if (name == "sa") {
        setsortNumber(0);
        if (sortAlpha == 2 || sortAlpha == 0) {
          setsortAlpha(1);
        }
        else {
          setsortAlpha(2);
        }
      }
      else if (name == "expFile") {
        savwFile(data);
      }
      else if (name == "impFile") {
        filePicker();
      }
      else if (name == "st") {
        filePicker();
      }
      else if (name == "addE") {
        navigation.navigate("AddE", {type: "add"});
      }
  }

  const spinnerList = [
    { label: 'All', value: '_' },
    { label: 'Birthday', value: 'G' },
    { label: 'Anniversary', value: 'J' },
    { label: 'Food', value: 'E' },
  ];

  const getvalSpinner = () => {
    var x = spinnerList.filter(obj => {
      return obj.value === fType;
    })
    if (fType == ":") {
      x = spinnerList[0];
    }
    return x;
  }

  return (
    <View style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{flex: 1}}>
            <View>
            <SafeAreaView>
              <AppleHeader
                  dateTitle={refreshTime}
                  largeTitle={"Events"}
                  borderColor={"lightgray"}
                  largeTitleFontSize={31}
              />
            </SafeAreaView>
            {kaedeInput}
            <View style={styles.inputIOS}>
            <RNPickerSelect
                onValueChange={(value) => {setfType(value); storeData(value);}}
                placeholder={{}}
                items={spinnerList}
                value={getvalSpinner().label}
            />
            </View>
        </View>
            <View style={{flex: 1}}>
                <FlatList
                    data={formatData(data, numColumns)}
                    keyExtractor={(item, index) => item.id}
                    renderItem={renderItem}
                    numColumns={2}
                />
            </View>
            <View>
                <FloatingAction
                    actions={actions}
                    onPressItem={name => {
                        openScree(name);
                    }}
                />
            </View>
            <Dialog.Container visible={visible}>
              <Dialog.Title>Event delete</Dialog.Title>
              <Dialog.Description>
                Do you want to delete this Event? You cannot undo this action.
              </Dialog.Description>
              <Dialog.Button label="Delete" onPress={handleDelete} />
              <Dialog.Button label="Edit" onPress={handleEdit} />
              <Dialog.Button label="Cancel" onPress={handleCancel} />
            </Dialog.Container>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    margin: margin,
    borderRadius: 20,
    height: Dimensions.get('window').width / numColumns - (margin * 2), // approximate a square
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  itemText: {
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
    textAlign: "left",
    fontSize: 12
  },
  itemDateDiff: {
    paddingLeft: 15,
    marginTop: -10,
    textAlign: "left",
    fontSize: 10
  },
  inputIOS: {
    margin: 15,
    marginBottom: 0,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: 'lightgray',
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  messageTitleStyle:{
    textAlign:"right",
    color: 'white',
    fontSize:16,
  },
});

export default Home;
