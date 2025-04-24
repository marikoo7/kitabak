import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../../kitabak-server/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../kitabak-server/firebaseConfig";
import ProfilePic from "../../components/profilePic";
import Login from "../../components/login";
import SignUp from "../../components/signUp";
import GetStarted from "../../components/getStarted";

const { width, height } = Dimensions.get("window");

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedProfilePic, setProfilePic] = useState(undefined);
  const [userData, setUserData] = useState({ username: "", email: "" });

  useEffect(() => {
    const timeout = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          setShowWelcome(false);
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfilePic(data.profilePic); // Set the profilePic from Firestore
            setUserData({ username: data.username, email: currentUser.email }); // Set the username and email
          }
        }
      });
      return () => {
        unsubscribe();
        clearTimeout(timeout);
      };
    }, 500);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowWelcome(true);
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setProfilePic(result.assets[0].uri);

      if (user) {
        // Fetch current user document
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const existingData = userDoc.data();
          await setDoc(userDocRef, {
            ...existingData,
            profilePic: result.assets[0].uri,
          }, { merge: true });
        }
      }
    } else {
      alert("You did not select any image.");
    }
  };

  if (showWelcome) {
    return (
      <GetStarted 
        onSignUp={() => {
          setIsSignUp(true);
          setShowWelcome(false);
        }} 
        onLogin={() => {
          setIsSignUp(false);
          setShowWelcome(false);
        }} 
      />
    );
  }

  if (!user) {
    return isSignUp ? <SignUp onSwitchToLogin={() => setIsSignUp(false)} /> : <Login onSwitchToSignUp={() => setIsSignUp(true)} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImageAsync} style={styles.profileContainer}>
        <ProfilePic uri={selectedProfilePic} size={width * 0.3} />
      </TouchableOpacity>

      <View style={styles.userInfoContainer}>
        <Text style={styles.username}>{userData.username}</Text>
        <Text style={styles.email}>{userData.email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f4" },
  profileContainer: {
    position: "absolute",
    top: height * 0.07,
    left: width * 0.05,
  },
  userInfoContainer: {
    position: "absolute",
    top: height * 0.08,
    left: width * 0.4,
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    flexWrap: "wrap",
    maxWidth: width * 0.6,
  },
  username: {
    fontSize: width * 0.15,  
    fontWeight: "bold",
    color: "#7d7362",
    marginBottom: 5,
    flexWrap: "wrap",
  },
  email: {
    fontSize: width * 0.03,
    color: "#b0ad9a",
  },
  logoutButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
