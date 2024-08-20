import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const Login = () => {
  const [selectedType, setSelectedType] = useState("Login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("Logged in with:", user.email);
      })
      .catch((error) => Alert.alert("Error", error.message));
  };

  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("Registered with:", user.email);
        const usersDb = collection(db, "users");
        addDoc(usersDb, {
          firstName: firstName,
          lastName: lastName,
          email: email.toLowerCase(),
        });
        console.log("User added to db");
        handleLogin();
      })
      .catch((error) => Alert.alert("Error", error.message));
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.replace("Calendar");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.taskPro}>TaskPro</Text>

        <View style={styles.typeContainer}>
          <TouchableOpacity onPress={() => setSelectedType("Login")}>
            <Text
              style={
                selectedType === "Login"
                  ? styles.selectedType
                  : styles.unselectedType
              }
            >
              Login
            </Text>
          </TouchableOpacity>

          <Text>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </Text>

          <TouchableOpacity onPress={() => setSelectedType("Register")}>
            <Text
              style={
                selectedType === "Register"
                  ? styles.selectedType
                  : styles.unselectedType
              }
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {selectedType === "Login" ? (
          <View>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.textInput}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.textInput}
              secureTextEntry
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <TextInput
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.textInput}
            />
            <TextInput
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
              style={styles.textInput}
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.textInput}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.textInput}
              secureTextEntry
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
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
    flex: 1,
    alignItems: "center",
  },
  taskPro: {
    fontSize: 24,
    marginTop: 40,
    marginBottom: 40,
  },
  typeContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },
  selectedType: {
    color: "#0275d8",
    fontSize: 16,
  },
  unselectedType: {
    color: "gray",
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    borderRadius: 4,
    width: 300,
    marginBottom: 10,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#0275d8",
    fontSize: 16,
  },
});

export default Login;
