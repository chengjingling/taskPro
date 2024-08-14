import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { format, parse } from "date-fns";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";

const ItemDetails = ({ route }) => {
  const { item } = route.params;
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.detailsContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>

          {item.startDate ? (
            <Text>
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
            <Text>
              by{" "}
              {format(
                parse(item.endDate, "yyyy-MM-dd", new Date()),
                "eeee, d MMM yyyy"
              )}{" "}
              {format(parse(item.endTime, "HH:mm", new Date()), "h:mm a")}
            </Text>
          )}
        </View>

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
  detailsContainer: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
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
