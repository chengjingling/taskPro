import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { Calendar } from "react-native-calendars";
import { format, parse } from "date-fns";
import { useNavigation } from "@react-navigation/native";

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
    const filtered = items.filter((item) => item.endDate === selectedDate);
    const sorted = filtered.sort((a, b) => a.endTime.localeCompare(b.endTime));
    setFilteredItems(sorted);
  }, [items, selectedDate]);

  const markedDates = items.reduce((acc, item) => {
    const date = item.endDate;
    if (!acc[date]) {
      acc[date] = {
        marked: true,
        dotColor: "#ccc",
        selected: date === selectedDate,
        selectedColor: date === todaysDate ? "#00BAF2" : "black",
      };
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
        <Text style={styles.itemTime}>
          {format(parse(item.endTime, "HH:mm", new Date()), "h:mm a")}
        </Text>
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
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
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
