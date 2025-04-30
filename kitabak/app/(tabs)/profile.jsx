import { View, StyleSheet, Dimensions, Text, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, sendEmailVerification } from "firebase/auth";
import { auth } from "../../kitabak-server/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../kitabak-server/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Login from "../../components/login";
import SignUp from "../../components/signUp";
import GetStarted from "../../components/getStarted";
import UserInfoDisplay from "../../components/UserInfoDisplay";
import ReadingGoalTracker from "../../components/ReadingGoalTracker";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === 'web';

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

  useEffect(() => {
    const resetDailyReadingTime = async () => {
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      const lastDate = await AsyncStorage.getItem("lastReadingDate");
  
      if (lastDate !== today) {
        await AsyncStorage.setItem("todayReadingTime", "0");
        await AsyncStorage.setItem("lastReadingDate", today);
      }
    };
  
    resetDailyReadingTime();
  }, []);  

  const handleLogout = async () => {
    await signOut(auth);
    setShowWelcome(true);
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
        <Text style={styles.verifyInfo}>We've sent a verification link to:</Text>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <UserInfoDisplay 
          user={user}
          selectedProfilePic={selectedProfilePic}
          setProfilePic={setProfilePic}
          userData={userData}
          setUserData={setUserData}
        />
        
        <View style={styles.spacer} />
        <ReadingGoalTracker />
        <View style={styles.spacer} />
        
        <TouchableOpacity style={[styles.logoutButton, isWeb && styles.webLogoutButton]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f4",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: isWeb ? 40 : 5,
    width: isWeb ? (width > 1200 ? '80%' : '90%') : '100%',
    alignSelf: 'center',
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    marginBottom: 30,
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  webLogoutButton: {
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 30,
  },
  logoutText: {
    color: "#f6f6f4",
    fontWeight: "bold",
    fontSize: isWeb ? 18 : 16,
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
    fontSize: isWeb ? 50 : 40,
    fontWeight: "bold",
    color: "#585047",
    marginBottom: 10,
    textAlign: "center",
  },
  verifyInfo: {
    fontSize: isWeb ? 20 : 16,
    color: "#7d7362",
    marginBottom: 5,
    textAlign: "center",
  },
  userEmail: {
    fontSize: isWeb ? 20 : 16,
    color: "#585047",
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  verifyTip: {
    fontSize: isWeb ? 20 : 16,
    color: "#b0ad9a",
    textAlign: "center",
    marginBottom: 25,
  },
  resendButton: {
    backgroundColor: "#585047",
    paddingVertical: isWeb ? 15 : 12,
    paddingHorizontal: isWeb ? 40 : 30,
    borderRadius: 20,
    marginBottom: 15,
  },
  resendButtonText: {
    color: "#f6f6f4",
    fontWeight: "bold",
    fontSize: isWeb ? 18 : 16,
  },
  backLoginButton: {
    marginTop: 10,
  },
  backgetstartedText: {
    fontSize: isWeb ? 18 : 16,
    color: "#b0ad9a",
    textDecorationLine: "underline",
  },
});