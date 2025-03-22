import { View, StyleSheet, Dimensions, Button } from "react-native";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../kitabak-server/firebaseConfig";
import ProfilePic from "../../components/profilePic";
import Login from "../../components/login";
import SignUp from "../../components/signUp";
import GetStarted from "../../components/getStarted"; // Import WelcomeScreen

const { width, height } = Dimensions.get("window");

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true); // Track if welcome screen is shown

  // Listen for authentication state changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) setShowWelcome(false); // Hide welcome only if logged in
      });
      return () => {
        unsubscribe();
        clearTimeout(timeout);
      };
    }, 500); // Small delay before checking auth (0.5s)
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowWelcome(true); // Show welcome screen again
  };

  if (showWelcome) {
    return (
      <GetStarted 
        onSignUp={() => {
          setIsSignUp(true);
          setShowWelcome(false); // Hide GetStarted and show SignUp
        }} 
        onLogin={() => {
          setIsSignUp(false);
          setShowWelcome(false); // Hide GetStarted and show Login
        }} 
      />
    );
  }

  if (!user) {
    return isSignUp ? <SignUp onSwitchToLogin={() => setIsSignUp(false)} /> : <Login onSwitchToSignUp={() => setIsSignUp(true)} />;
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
