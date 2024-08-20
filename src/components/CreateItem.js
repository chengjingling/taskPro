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
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { auth } from "../config/firebase";

const CreateItem = () => {
  const [selectedType, setSelectedType] = useState("Task");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [createButtonVisible, setCreateButtonVisible] = useState(true);
  const [emails, setEmails] = useState([""]);
  const [emailsValid, setEmailsValid] = useState([""]);
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
        userId: auth.currentUser?.uid,
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
    setCreateButtonVisible(true);
  };

  const changeToEvent = () => {
    setSelectedType("Event");
    setStartDate(new Date());
    setStartTime(new Date());
    setEndDate(new Date());
    setCreateButtonVisible(true);
  };

  const changeToGroupEvent = () => {
    setSelectedType("Group Event");
    setStartDate(new Date());
    setStartTime(new Date());
    setEndDate(new Date());
    setCreateButtonVisible(false);
  };

  const handleEmailChange = (text, index) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = text;
    setEmails(updatedEmails);
  };

  const checkAvailability = () => {
    if (emails.length === 0) {
      Alert.alert("Error", "Please enter at least one email address");
    } else {
      const usersDb = collection(db, "users");
      onSnapshot(usersDb, (snapshot) => {
        let usersList = [];
        snapshot.docs.map((doc) =>
          usersList.push({ ...doc.data(), id: doc.id })
        );
        const emailsList = usersList.map((user) => user.email);
        let checkEmails = [];
        let checked = [];
        for (const email of emails) {
          const emailLower = email.toLowerCase();
          if (emailsList.includes(emailLower)) {
            if (emailLower === auth.currentUser?.email) {
              checkEmails.push("own email");
            } else if (checked.includes(emailLower)) {
              checkEmails.push("duplicate");
            } else {
              checkEmails.push("valid");
            }
          } else {
            checkEmails.push("not found");
          }
          checked.push(emailLower);
        }
        setEmailsValid(checkEmails);
      });
    }
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
          {(selectedType === "Task" || selectedType === "Event") && (
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
          )}

          {selectedType === "Group Event" && (
            <View>
              <Text style={styles.label}>Participant emails</Text>
              {emails.map((email, index) => (
                <View key={index}>
                  <View style={styles.emailRow}>
                    <TextInput
                      style={[
                        styles.emailBox,
                        (emailsValid[index] === "not found" ||
                          emailsValid[index] === "duplicate" ||
                          emailsValid[index] === "own email") &&
                          styles.invalidEmailBox,
                      ]}
                      value={email}
                      onChangeText={(text) => handleEmailChange(text, index)}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setEmails(emails.filter((_, i) => i !== index))
                      }
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  {emailsValid[index] === "not found" && (
                    <Text style={styles.invalidEmailText}>
                      This email does not exist.
                    </Text>
                  )}
                  {emailsValid[index] === "duplicate" && (
                    <Text style={styles.invalidEmailText}>
                      This email has already been entered.
                    </Text>
                  )}
                  {emailsValid[index] === "own email" && (
                    <Text style={styles.invalidEmailText}>
                      You do not need to enter your own email.
                    </Text>
                  )}
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setEmails([...emails, ""])}
                style={styles.addEmailButton}
              >
                <Text style={styles.blue}>Add email</Text>
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={checkAvailability}>
                  <Text style={styles.blue}>Check availability</Text>
                </TouchableOpacity>
              </View>
              {emailsValid.every((status) => status === "valid") && (
                <Text>All emails valid</Text>
              )}
            </View>
          )}

          {createButtonVisible && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={createItem}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          )}
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
  titleBox: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    borderRadius: 4,
  },
  dateTimeContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailBox: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    borderRadius: 4,
    width: "60%",
    marginBottom: 5,
    marginRight: 10,
  },
  invalidEmailBox: {
    borderColor: "#dc3545",
  },
  removeText: {
    color: "#dc3545",
  },
  invalidEmailText: {
    color: "#dc3545",
    marginBottom: 5,
  },
  addEmailButton: {
    marginTop: 5,
    marginBottom: 20,
  },
  blue: {
    color: "#0275d8",
  },
  buttonContainer: {
    alignItems: "center",
  },
  createText: {
    color: "#0275d8",
    fontSize: 16,
  },
});

export default CreateItem;
