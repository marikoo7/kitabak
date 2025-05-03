import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Platform } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { db, auth } from "../kitabak-server/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
const isWeb = Platform.OS === "web";

const RADIUS = 120;
const CIRCUMFERENCE = Math.PI * RADIUS;

export default function ReadingGoalTracker() {
  const router = useRouter();
  const [lastBookUrl, setLastBookUrl] = useState(null);
  const [readingTime, setReadingTime] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(5);
  const [lastBook, setLastBook] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const isFocused = useIsFocused();
  const [userId, setUserId] = useState(null);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        // reset local state if user logs out
        setReadingTime(0);
        setGoalMinutes(5);
        setLastBook(null);
        setLastBookUrl(null);
      }
    });
    return () => unsubscribe(); 
  }, []);

  const fetchStats = useCallback(async () => {

    const statsDocRef = doc(db, "users", userId, "readingStats", "daily");
    const todayString = new Date().toDateString();

    try {
      const docSnap = await getDoc(statsDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const lastResetDate = data.lastReadingDate;

        if (lastResetDate !== todayString) {
          // reset time for the new day
          await updateDoc(statsDocRef, {
            lastReadingDate: todayString,
            todayReadingTime: 0,
          });
          setReadingTime(0);
          console.log("Daily reading time reset for new day.");
        } else {
          setReadingTime(data.todayReadingTime || 0);
        }

        setGoalMinutes(data.readingGoalMinutes || 5);
        setLastBook(data.lastOpenedBookTitle || null);
        setLastBookUrl(data.lastOpenedBookUrl || null);

      } else {
        console.log("No reading stats document found, creating one.");
        await setDoc(statsDocRef, {
          lastReadingDate: todayString,
          todayReadingTime: 0,
          readingGoalMinutes: 5,
          lastOpenedBookTitle: null,
          lastOpenedBookUrl: null,
        });
        //local state to defaults
        setReadingTime(0);
        setGoalMinutes(5);
        setLastBook(null);
        setLastBookUrl(null);
      }
    } catch (error) {
      console.error("Error fetching/updating reading stats:", error);
      //default state on error
       setReadingTime(0);
       setGoalMinutes(5);
       setLastBook(null);
       setLastBookUrl(null);
    }
  }, [userId]);


  useEffect(() => {
    if (isFocused && userId) {
      fetchStats();
    }
  }, [isFocused, fetchStats, userId]);

  const minutes = Math.floor(readingTime / 60);
  const seconds = readingTime % 60;
  const percent = goalMinutes > 0 ? Math.min(readingTime / (goalMinutes * 60), 1) : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - percent);

  const adjustGoal = async () => {
    if (!userId) {
        Alert.alert("Not Logged In", "You must be logged in to set a goal.");
        return;
    }

    const num = parseInt(newGoal);
    if (!isNaN(num) && num > 0) {
      const statsDocRef = doc(db, "users", userId, "readingStats", "daily");
      try {
        await updateDoc(statsDocRef, {
          readingGoalMinutes: num,
        });
        setGoalMinutes(num);
        setShowAdjustModal(false);
        setNewGoal("");
         console.log("Reading goal updated in Firestore.");
      } catch (error) {
        console.error("Error updating reading goal:", error);
        Alert.alert("Error", "Could not update reading goal. Please try again.");
      }
    } else {
       Alert.alert("Invalid Input", "Please enter a positive number of minutes for your goal.");
    }
  };

  const handlePressAction = () => {
      if (readingTime === 0 && !lastBookUrl) {
        router.push("/store");
      } else if(lastBookUrl){ 
        router.push({ pathname: "/bookreading", params: { url: lastBookUrl, title: lastBook || undefined } });
      } else {
          Alert.alert("Resume Reading", "No specific book found to resume. Go to your library or the store?");
      }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reading Goals</Text>
      <Text style={styles.subtitle}>Read every day, see your stats soar and finish more books</Text>

      <View style={styles.progressContainer}>
        <Svg width="260" height="160">
          <Path d={`M10,130 A${RADIUS},${RADIUS} 0 0,1 ${RADIUS*2+10},130`} stroke="#b0ad9a" strokeWidth="12" fill="none" strokeLinecap="round" />
          <Path
            d={`M10,130 A${RADIUS},${RADIUS} 0 0,1 ${RADIUS*2+10},130`}
            stroke="#585047"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>

        <View style={styles.readingTextContainer}>
          <Text style={styles.readingText}>Today's Reading</Text>
          {percent >= 1 ? (
            <>
              <Text style={styles.checkmark}>✔</Text>
              <TouchableOpacity onPress={() => setShowAdjustModal(true)}>
                <Text style={styles.goalReached}>{goalMinutes} minutes goal reached! Tap to adjust.</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.timerText}>
                {minutes}:{seconds.toString().padStart(2, "0")}
              </Text>
              <TouchableOpacity onPress={() => setShowAdjustModal(true)}>
                <Text style={styles.goalText}>of your {goalMinutes}-minute goal ›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePressAction}>
         {readingTime === 0 && !lastBookUrl ? (
            <Text style={styles.buttonText}>Explore the Book Store</Text>
        ) : (
            <View style={{ alignItems: "center" }}>
            <Text style={styles.buttonText}>Keep Reading</Text>
            {lastBook && <Text style={styles.bookTitleText}>{lastBook}</Text>}
            </View>
        )}
      </TouchableOpacity>

      <Modal transparent visible={showAdjustModal} animationType="fade" onRequestClose={() => setShowAdjustModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Adjust Your Daily Goal</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={newGoal}
                        onChangeText={setNewGoal}
                        style={styles.input}
                        placeholder={`Current goal: ${goalMinutes} minutes`}
                        placeholderTextColor="#b0ad9a"
                        autoFocus={true}
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => {setShowAdjustModal(false); setNewGoal("");}} // reset input on cancel
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton, (!newGoal || isNaN(parseInt(newGoal)) || parseInt(newGoal) <= 0) && styles.disabledButton]} // Add disabled style
                            onPress={adjustGoal}
                            disabled={!newGoal || isNaN(parseInt(newGoal)) || parseInt(newGoal) <= 0} // the goal must be a number
                        >
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 40,
    color: "#585047",
    marginBottom: 8,
    fontFamily: "MalibuSunday",
  },
  subtitle: {
    color: "#b0ad9a",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  progressContainer: {
    width: 260,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 20,
  },
  readingTextContainer: {
    position: "absolute",
    top: '35%',
    alignItems: "center",
    justifyContent: "center",
    width: 200,
  },
  readingText: {
    color: "#7d7362",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "MalibuSunday",
    marginBottom: 5,
  },
  timerText: {
    color: "#7d7362",
    fontSize: 50,
    fontWeight: "bold",
    fontFamily: "MalibuSunday",
  },
  goalText: {
    color: "#b0ad9a",
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: 0,
  },
  checkmark: {
    fontSize: 35,
    color: "#f6f6f4",
    backgroundColor: "#2d502f",
    width: 48,
    height: 48,
    borderRadius: 24,
    textAlign: "center",
    lineHeight: 48,
    marginTop: 10,
    overflow: 'hidden',
  },
  goalReached: {
    fontSize: 12,
    color: "#b0ad9a",
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#7d7362",
    paddingVertical: 10, 
    paddingHorizontal: 55,
    borderRadius: 30,
    marginTop: 10, 
    minWidth: 220, 
    alignItems: 'center',
  },
  buttonText: {
    color: "#f6f6f4",
    fontWeight: "bold",
    fontSize: 16,
  },
  bookTitleText: {
    fontSize: 12,
    color: "#f6f6f4",
    marginTop: 2,
    fontWeight: "normal",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: "#f6f6f4",
    borderRadius: 15,
    padding: 25,
    width: isWeb? '40%' : '80%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#585047",
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: "#fff",
    borderColor: "#b0ad9a",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#585047",
    marginBottom: 25,
    textAlign: 'center',
    outlineStyle: 'none',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#585047",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
   disabledButton: {
    backgroundColor: "#cccccc",
  },
});