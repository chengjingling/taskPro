import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { format, parse } from "date-fns";
import { deleteDoc, doc, collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../config/firebase";

const ItemDetails = ({ route }) => {
  const { item } = route.params;
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();

  const confirmDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              deleteDoc(doc(db, "items", item.id));
              navigation.navigate("Calendar");
            } catch (error) {
              Alert.alert("Error", "Something went wrong, please try again.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    const usersDb = collection(db, "users");
    onSnapshot(usersDb, (snapshot) => {
      let usersList = [];
      snapshot.docs.map((doc) => usersList.push({ ...doc.data(), id: doc.id }));
      usersList = usersList.filter(
        (user) =>
          user.email === item.email || item.participants.includes(user.email)
      );
      setUsers(usersList);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.itemTitle}>{item.title}</Text>

        {item.startDate ? (
          <Text style={styles.itemDateTime}>
            from{" "}
            {format(
              parse(item.startDate, "yyyy-MM-dd", new Date()),
              "eeee, d MMM yyyy"
            )}{" "}
            {format(parse(item.startTime, "HH:mm", new Date()), "h:mm a")}
            {"\n"}to{" "}
            {format(
              parse(item.endDate, "yyyy-MM-dd", new Date()),
              "eeee, d MMM yyyy"
            )}{" "}
            {format(parse(item.endTime, "HH:mm", new Date()), "h:mm a")}
          </Text>
        ) : (
          <Text style={styles.itemDateTime}>
            by{" "}
            {format(
              parse(item.endDate, "yyyy-MM-dd", new Date()),
              "eeee, d MMM yyyy"
            )}{" "}
            {format(parse(item.endTime, "HH:mm", new Date()), "h:mm a")}
          </Text>
        )}

        {item.participants.length !== 0 && (
          <View style={styles.participantsContainer}>
            <Text style={styles.participantsHeader}>Participants</Text>
            <Text>• You ({auth.currentUser?.email})</Text>
            {users.map(
              (user, index) =>
                user.email !== auth.currentUser?.email && (
                  <Text key={index}>
                    • {user.firstName} {user.lastName} ({user.email})
                  </Text>
                )
            )}
          </View>
        )}

        <View style={styles.deleteButton}>
          <TouchableOpacity onPress={confirmDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemDateTime: {
    marginBottom: 20,
  },
  participantsContainer: {
    marginBottom: 20,
  },
  participantsHeader: {
    fontWeight: "bold",
  },
  deleteButton: {
    alignItems: "center",
  },
  deleteText: {
    color: "#dc3545",
    fontSize: 16,
  },
});

export default ItemDetails;
