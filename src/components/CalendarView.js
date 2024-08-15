import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { Calendar } from "react-native-calendars";
import { format, parse } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../config/firebase";

const CalendarView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filteredItems, setFilteredItems] = useState([]);
  const selectedDate = format(currentDate, "yyyy-MM-dd");
  const todaysDate = format(new Date(), "yyyy-MM-dd");
  const navigation = useNavigation();

  useEffect(() => {
    setLoading(true);
    const itemsDb = collection(db, "items");
    onSnapshot(itemsDb, (snapshot) => {
      let itemsList = [];
      snapshot.docs.map((doc) => itemsList.push({ ...doc.data(), id: doc.id }));
      setItems(itemsList);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filtered = items.filter((item) => {
      if (item.userId === auth.currentUser?.uid) {
        if (item.startDate) {
          return selectedDate >= item.startDate && selectedDate <= item.endDate;
        } else {
          return selectedDate === item.endDate;
        }
      }
    });
    const sorted = filtered.sort((a, b) => a.endTime.localeCompare(b.endTime));
    setFilteredItems(sorted);
  }, [items, selectedDate]);

  const markedDates = items.reduce((acc, item) => {
    if (item.userId === auth.currentUser?.uid) {
      if (item.startDate) {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        for (
          let date = startDate;
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const formattedDate = format(date, "yyyy-MM-dd");
          if (!acc[formattedDate]) {
            acc[formattedDate] = {
              marked: true,
              dotColor: "#ccc",
              selected: formattedDate === selectedDate,
              selectedColor: formattedDate === todaysDate ? "#00BAF2" : "black",
            };
          }
        }
      } else {
        if (!acc[item.endDate]) {
          acc[item.endDate] = {
            marked: true,
            dotColor: "#ccc",
            selected: item.endDate === selectedDate,
            selectedColor: item.endDate === todaysDate ? "#00BAF2" : "black",
          };
        }
      }
    }

    return acc;
  }, {});

  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: selectedDate === todaysDate ? "#00BAF2" : "black",
    };
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Item Details", { item })}
      style={styles.itemContainer}
    >
      <View style={styles.itemRow}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.startDate ? (
          <View style={styles.itemTimeContainer}>
            <Text style={styles.itemTime}>
              {item.startDate !== selectedDate &&
                format(
                  parse(item.startDate, "yyyy-MM-dd", new Date()),
                  "EEE, d MMM"
                )}{" "}
              {format(parse(item.startTime, "HH:mm", new Date()), "h:mm a")}
            </Text>
            <Text style={styles.itemTime}>
              {item.endDate !== selectedDate &&
                format(
                  parse(item.endDate, "yyyy-MM-dd", new Date()),
                  "EEE, d MMM"
                )}{" "}
              {format(parse(item.endTime, "HH:mm", new Date()), "h:mm a")}
            </Text>
          </View>
        ) : (
          <View style={styles.itemTimeContainer}>
            <Text style={styles.itemTime}>
              {format(parse(item.endTime, "HH:mm", new Date()), "h:mm a")}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Calendar
          current={selectedDate}
          markedDates={markedDates}
          onDayPress={(day) => {
            const newDate = new Date(day.timestamp);
            setCurrentDate(newDate);
          }}
          hideExtraDays={true}
          style={styles.calendar}
        />
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.noItemsText}>No items for the day</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  itemTimeContainer: {
    alignItems: "flex-end",
  },
  itemTime: {
    fontSize: 14,
  },
  noItemsText: {
    padding: 10,
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
});

export default CalendarView;
