import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, sendEmailVerification } from "firebase/auth";
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
  const [verificationSent, setVerificationSent] = useState(false);
  const [fromSignUp, setFromSignUp] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);

        if (currentUser) {
          setShowWelcome(false);

          if (!currentUser.emailVerified) {
            setVerificationSent(true);
          } else {
            setVerificationSent(false);
            setFromSignUp(false);
          }

          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfilePic(data.profilePic);
            setUserData({ username: data.username, email: currentUser.email });
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

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);

      if (user) {
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

  const handleResendVerification = async () => {
    if (user) {
      await sendEmailVerification(user);
    }
  };

  if (showWelcome) {
    return (
      <GetStarted
        onSignUp={() => {
          setIsSignUp(true);
          setShowWelcome(false);
          setFromSignUp(true);
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

  if (verificationSent) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verifyTitle}>Please verify your email</Text>
        <Text style={styles.verifyInfo}>We’ve sent a verification link to:</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.verifyTip}>Once verified, refresh the page to continue to your profile page</Text>

        <TouchableOpacity style={styles.resendButton} onPress={handleResendVerification}>
          <Text style={styles.resendButtonText}>Resend Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLoginButton} onPress={handleLogout}>
          <Text style={styles.backgetstartedText}>Back to get started</Text>
        </TouchableOpacity>
      </View>
    );
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
  container: {
    flex: 1,
    backgroundColor: "#f6f6f4",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
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

  // verification screen styles
  verificationContainer: {
    flex: 1,
    backgroundColor: "#f6f6f4",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  verifyTitle: {
    fontFamily: "MalibuSunday",
    fontSize: 40,
    fontWeight: "bold",
    color: "#585047",
    marginBottom: 10,
  },
  verifyInfo: {
    fontSize: 16,
    color: "#7d7362",
    marginBottom: 5,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 16,
    color: "#585047",
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  verifyTip: {
    fontSize: 16,
    color: "#b0ad9a",
    textAlign: "center",
    marginBottom: 25,
  },
  resendButton: {
    backgroundColor: "#585047",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 15,
  },
  resendButtonText: {
    color: "#f6f6f4",
    fontWeight: "bold",
    fontSize: 16,
  },
  backLoginButton: {
    marginTop: 10,
  },
  backgetstartedText: {
    fontSize: 16,
    color: "#b0ad9a",
    textDecorationLine: "underline",
  },
});
