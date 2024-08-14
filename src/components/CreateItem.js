import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

const CreateItem = () => {
  const [selectedType, setSelectedType] = useState("Task");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const navigation = useNavigation();

  const createItem = () => {
    if (!title) {
      Alert.alert("Unable to create item", "Title cannot be blank");
    } else if (
      startDate &&
      (startDate > endDate || (startDate === endDate && startTime >= endTime))
    ) {
      Alert.alert(
        "Unable to create item",
        "'To' date/time must be after 'From' date/time"
      );
    } else {
      const itemsDb = collection(db, "items");
      addDoc(itemsDb, {
        title: title,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : startDate,
        startTime: startTime ? format(startTime, "HH:mm") : startTime,
        endDate: format(endDate, "yyyy-MM-dd"),
        endTime: format(endTime, "HH:mm"),
      });
      navigation.navigate("Calendar");
    }
  };

  const onChangeStartDate = (event, selectedDate) => {
    setStartDate(selectedDate);
  };

  const onChangeStartTime = (event, selectedTime) => {
    setStartTime(selectedTime);
  };

  const onChangeEndDate = (event, selectedDate) => {
    setEndDate(selectedDate);
  };

  const onChangeEndTime = (event, selectedTime) => {
    setEndTime(selectedTime);
  };

  const changeToTask = () => {
    setSelectedType("Task");
    setStartDate("");
    setStartTime("");
  };

  const changeToEvent = () => {
    setSelectedType("Event");
    setStartDate(new Date());
    setStartTime(new Date());
  };

  const changeToGroupEvent = () => {
    setSelectedType("Group Event");
    setStartDate(new Date());
    setStartTime(new Date());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.label}>Create a:</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity onPress={changeToTask}>
            <Text
              style={
                selectedType === "Task"
                  ? styles.selectedType
                  : styles.unselectedType
              }
            >
              Task
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={changeToEvent}>
            <Text
              style={
                selectedType === "Event"
                  ? styles.selectedType
                  : styles.unselectedType
              }
            >
              Event
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={changeToGroupEvent}>
            <Text
              style={
                selectedType === "Group Event"
                  ? styles.selectedType
                  : styles.unselectedType
              }
            >
              Group Event
            </Text>
          </TouchableOpacity>
        </View>

        <View>
          <View style={styles.titleContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.titleBox}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {selectedType === "Event" && (
            <View>
              <Text style={styles.label}>From</Text>
              <View style={styles.dateTimeContainer}>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  onChange={onChangeStartDate}
                />
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  onChange={onChangeStartTime}
                />
              </View>
            </View>
          )}

          {selectedType === "Task" && (
            <Text style={styles.label}>Deadline</Text>
          )}
          {selectedType === "Event" && <Text style={styles.label}>To</Text>}
          <View style={styles.dateTimeContainer}>
            <DateTimePicker
              value={endDate}
              mode="date"
              onChange={onChangeEndDate}
            />
            <DateTimePicker
              value={endTime}
              mode="time"
              onChange={onChangeEndTime}
            />
          </View>

          <View style={styles.createButton}>
            <TouchableOpacity onPress={createItem}>
              <Text style={styles.createText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginBottom: 5,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  selectedType: {
    color: "#0275d8",
  },
  unselectedType: {
    color: "gray",
  },
  titleContainer: {
    marginBottom: 20,
  },
  dateTimeContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  titleBox: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    borderRadius: 4,
  },
  createButton: {
    alignItems: "center",
  },
  createText: {
    color: "#0275d8",
    fontSize: 16,
  },
});

export default CreateItem;
