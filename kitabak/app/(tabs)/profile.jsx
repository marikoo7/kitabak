import { View, StyleSheet, Dimensions, Button } from "react-native";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../kitabak-server/firebaseConfig";
import ProfilePic from "../../components/profilePic";
import Login from "../../components/login";
import SignUp from "../../components/signUp";

const { width, height } = Dimensions.get("window");

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return isSignUp ? (
      <SignUp onSwitchToLogin={() => setIsSignUp(false)} />
    ) : (
      <Login onSwitchToSignUp={() => setIsSignUp(true)} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <ProfilePic uri={user.photoURL || "https://example.com/default-profile.jpg"} size={width * 0.3} />
      </View>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f4" },
  profileContainer: { position: "absolute", top: height * 0.04, left: width * 0.03 },
});
