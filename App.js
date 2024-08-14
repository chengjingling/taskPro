import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./src/components/Login";
import CalendarView from "./src/components/CalendarView";
import CreateItem from "./src/components/CreateItem";
import ItemDetails from "./src/components/ItemDetails";
import { auth, signOut } from "./src/config/firebase";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login/Register" component={Login} />
        <Stack.Screen
          name="Calendar"
          component={CalendarView}
          options={({ navigation }) => ({
            headerLeft: () => (
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                  signOut(auth)
                    .then(() => {
                      console.log("Logged out");
                      navigation.replace("Login/Register");
                    })
                    .catch((error) => Alert.alert("Error", error.message));
                }}
              >
                <Text style={styles.logoutText}>Log out</Text>
              </TouchableOpacity>
            ),
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
  logoutButton: {
    marginLeft: 10,
  },
  logoutText: {
    color: "#0275d8",
  },
  plusButton: {
    marginRight: 23,
    marginBottom: 5,
  },
  plusText: {
    fontSize: 25,
  },
});

export default App;
