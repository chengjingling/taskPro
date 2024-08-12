import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";

const CreateItem = () => {
  const [selectedType, setSelectedType] = useState("Task");
  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const navigation = useNavigation();

  const createTask = () => {
    const itemsDb = collection(db, "items");
    addDoc(itemsDb, {
      title: title,
      endDate: endDate,
      endTime: endTime,
    });
    navigation.navigate("Calendar");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.label}>Create a:</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity onPress={() => setSelectedType("Task")}>
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
          <TouchableOpacity onPress={() => setSelectedType("Event")}>
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
          <TouchableOpacity onPress={() => setSelectedType("Group Event")}>
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

        {selectedType === "Task" && (
          <View>
            <View style={styles.titleContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.titleBox}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            <Text style={styles.label}>Deadline</Text>
            <View style={styles.deadlineContainer}>
              <TextInput
                style={styles.deadlineBox}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
              />
              <TextInput
                style={styles.deadlineBox}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM"
              />
            </View>
            <View style={styles.createButton}>
              <TouchableOpacity onPress={createTask}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  deadlineContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  titleBox: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    borderRadius: 4,
  },
  deadlineBox: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    borderRadius: 4,
    width: 120,
    marginRight: 10,
  },
  createButton: {
    alignItems: "center",
  },
  createText: {
    color: "#0275d8",
  },
});

export default CreateItem;
