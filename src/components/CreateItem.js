import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parse } from "date-fns";
import { auth } from "../config/firebase";

const CreateItem = () => {
  const [selectedType, setSelectedType] = useState("Task");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [durationValid, setDurationValid] = useState(true);
  const [emails, setEmails] = useState([""]);
  const [emailsValid, setEmailsValid] = useState([""]);
  const [chosenDate, setChosenDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [createButtonEnabled, setCreateButtonEnabled] = useState(true);
  const navigation = useNavigation();

  const createItem = () => {
    if (!createButtonEnabled) {
      Alert.alert(
        "Error",
        "Please select 'Check availability' first to find a common time slot"
      );
    } else if (!title) {
      Alert.alert("Error", "Title cannot be blank");
    } else if (
      startDate &&
      (startDate > endDate || (startDate === endDate && startTime >= endTime))
    ) {
      Alert.alert("Error", "'To' date/time must be after 'From' date/time");
    } else {
      const itemsDb = collection(db, "items");
      addDoc(itemsDb, {
        title: title,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : startDate,
        startTime: startTime ? format(startTime, "HH:mm") : startTime,
        endDate: format(endDate, "yyyy-MM-dd"),
        endTime: format(endTime, "HH:mm"),
        participants: emails,
        email: auth.currentUser?.email,
      });
      Alert.alert("Success", "Item created!");
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

  const onChangeChosenDate = (event, selectedDate) => {
    setChosenDate(selectedDate);
  };

  const changeToTask = () => {
    setSelectedType("Task");
    setStartDate("");
    setStartTime("");
    setEmails([]);
    setCreateButtonEnabled(true);
  };

  const changeToEvent = () => {
    setSelectedType("Event");
    setStartDate(new Date());
    setStartTime(new Date());
    setEndDate(new Date());
    setEmails([]);
    setCreateButtonEnabled(true);
  };

  const changeToGroupEvent = () => {
    setSelectedType("Group Event");
    setStartDate(new Date());
    setStartTime(new Date());
    setEndDate(new Date());
    setEmails([""]);
    setCreateButtonEnabled(false);
  };

  const handleEmailChange = (text, index) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = text;
    setEmails(updatedEmails);
  };

  const validateDurationAndEmails = () => {
    setDurationValid(true);
    setEmails(emails.map((email) => email.toLowerCase()));
    setEmailsValid(emails.map(() => ""));
    if (hours === "") {
      setHours("0");
    }
    if (minutes === "") {
      setMinutes("0");
    }
    const hoursNum = Number(hours);
    const minutesNum = Number(minutes);
    if (hoursNum === 0 && minutesNum === 0) {
      Alert.alert("Error", "Duration cannot be zero");
      setDurationValid(false);
    } else if (!Number.isInteger(hoursNum) || !Number.isInteger(minutesNum)) {
      Alert.alert("Error", "Duration must be in integers");
      setDurationValid(false);
    } else if (minutesNum % 15 !== 0) {
      Alert.alert(
        "Error",
        "Minutes must be in multiples of 15 (e.g. 0, 15, 30, 45)"
      );
      setDurationValid(false);
    } else if (emails.length === 0) {
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

  useEffect(() => {
    if (durationValid && emailsValid.every((status) => status === "valid")) {
      const start = new Date();
      start.setDate(chosenDate.getDate());
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(chosenDate.getDate() + 1);
      end.setHours(0, 0, 0, 0);
      const durationMilliseconds = hours * 60 * 60 * 1000 + minutes * 60 * 1000;
      let slots = [];
      for (
        let current = start;
        current <= end.getTime() - durationMilliseconds;
        current = new Date(current.getTime() + 900000)
      ) {
        slots.push({
          start: current,
          end: new Date(current.getTime() + durationMilliseconds),
        });
      }
      const itemsDb = collection(db, "items");
      onSnapshot(itemsDb, (snapshot) => {
        let itemsList = [];
        snapshot.docs.map((doc) =>
          itemsList.push({ ...doc.data(), id: doc.id })
        );
        for (const item of itemsList) {
          if (
            (item.email === auth.currentUser?.email ||
              emails.includes(item.email)) &&
            item.startDate
          ) {
            const itemStart = parse(
              `${item.startDate} ${item.startTime}`,
              "yyyy-MM-dd HH:mm",
              new Date()
            );
            const itemEnd = parse(
              `${item.endDate} ${item.endTime}`,
              "yyyy-MM-dd HH:mm",
              new Date()
            );
            slots = slots.filter(
              (slot) => slot.end <= itemStart || slot.start >= itemEnd
            );
          }
        }
        setAvailableSlots(slots);
        setSelectedSlot(0);
        setStartDate(new Date(slots[0].start));
        setStartTime(new Date(slots[0].start));
        setEndDate(new Date(slots[0].end));
        setEndTime(new Date(slots[0].end));
      });
      setCreateButtonEnabled(true);
    }
  }, [durationValid, emailsValid, chosenDate]);

  const CustomRadioButton = ({ index, start }) => (
    <TouchableOpacity
      style={[
        styles.radioButton,
        selectedSlot === index && styles.selectedRadioButton,
      ]}
      onPress={() => handleRadioButtonPress(index)}
    >
      <Text
        style={[
          styles.radioButtonText,
          selectedSlot === index && styles.selectedRadioButtonText,
        ]}
      >
        {format(start, "h:mm a")}
      </Text>
    </TouchableOpacity>
  );

  const handleRadioButtonPress = (index) => {
    setSelectedSlot(index);
    setStartDate(new Date(availableSlots[index].start));
    setStartTime(new Date(availableSlots[index].start));
    setEndDate(new Date(availableSlots[index].end));
    setEndTime(new Date(availableSlots[index].end));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
              <View style={styles.availabilitySection}>
                <Text style={styles.label}>Duration</Text>
                <View style={styles.durationRow}>
                  <TextInput
                    style={[
                      styles.durationBox,
                      !durationValid && styles.invalidBox,
                    ]}
                    value={hours}
                    onChangeText={setHours}
                    keyboardType="numeric"
                  />
                  <Text style={styles.hoursText}>hours</Text>
                  <TextInput
                    style={[
                      styles.durationBox,
                      !durationValid && styles.invalidBox,
                    ]}
                    value={minutes}
                    onChangeText={setMinutes}
                    keyboardType="numeric"
                  />
                  <Text>minutes</Text>
                </View>
                <Text style={styles.multiplesMessage}>
                  Minutes should be in multiples of 15.
                </Text>
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
                            styles.invalidBox,
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
                  <Text style={styles.addEmailText}>Add email</Text>
                </TouchableOpacity>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={validateDurationAndEmails}>
                    <Text style={styles.checkAvailabilityText}>
                      Check availability
                    </Text>
                  </TouchableOpacity>
                </View>
                {durationValid &&
                  emailsValid.every((status) => status === "valid") && (
                    <View style={styles.slotsContainer}>
                      <Text style={styles.label}>Select a date:</Text>
                      <View style={styles.chosenDateContainer}>
                        <DateTimePicker
                          value={chosenDate}
                          mode="date"
                          onChange={onChangeChosenDate}
                        />
                      </View>
                      <Text style={styles.label}>Select a time:</Text>
                      <View style={styles.slotsColumns}>
                        {availableSlots.map((slot, index) => (
                          <CustomRadioButton
                            key={index}
                            index={index}
                            start={slot.start}
                          />
                        ))}
                      </View>
                    </View>
                  )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={createItem}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
  availabilitySection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "gray",
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  durationBox: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    borderRadius: 4,
    width: "20%",
    marginRight: 5,
  },
  invalidBox: {
    borderColor: "#dc3545",
  },
  hoursText: {
    marginRight: 10,
  },
  multiplesMessage: {
    marginBottom: 20,
    color: "gray",
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
  addEmailText: {
    color: "#0275d8",
  },
  checkAvailabilityText: {
    color: "#0275d8",
  },
  slotsContainer: {
    marginTop: 20,
  },
  chosenDateContainer: {
    alignItems: "left",
    marginBottom: 20,
  },
  slotsColumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 40,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: "#0275d8",
    padding: 8,
    borderRadius: 8,
    width: "40%",
    height: 40,
    marginBottom: 10,
    marginRight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadioButton: {
    backgroundColor: "#0275d8",
  },
  radioButtonText: {
    textAlign: "center",
  },
  selectedRadioButtonText: {
    color: "white",
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
