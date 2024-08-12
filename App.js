import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CalendarView from "./src/components/CalendarView";
import CreateItem from "./src/components/CreateItem";
import ItemDetails from "./src/components/ItemDetails";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Calendar"
          component={CalendarView}
          options={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity
                style={styles.plusButton}
                onPress={() => navigation.navigate("New Item")}
              >
                <Text style={styles.plusText}>+</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen name="New Item" component={CreateItem} />
        <Stack.Screen name="Item Details" component={ItemDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  plusButton: {
    marginRight: 23,
    marginBottom: 5,
  },
  plusText: {
    fontSize: 25,
  },
});

export default App;
