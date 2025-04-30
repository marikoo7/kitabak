import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";

const RADIUS = 120;
const CIRCUMFERENCE = Math.PI * RADIUS;

export default function ReadingGoalTracker() {
  const router = useRouter();
  const [readingTime, setReadingTime] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(5);
  const [lastBook, setLastBook] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const isFocused = useIsFocused();

  const fetchStats = async () => {
    const today = new Date().toDateString();
    const lastReset = await AsyncStorage.getItem("lastReadingDate");
    const storedTime = await AsyncStorage.getItem("todayReadingTime");
    const goal = await AsyncStorage.getItem("readingGoalMinutes");
    const last = await AsyncStorage.getItem("lastOpenedBookTitle");

    if (lastReset !== today) {
      await AsyncStorage.setItem("lastReadingDate", today);
      await AsyncStorage.setItem("todayReadingTime", "0");
      setReadingTime(0);
    } else {
      setReadingTime(storedTime ? parseInt(storedTime) : 0);
    }

    setGoalMinutes(goal ? parseInt(goal) : 5);
    if (last) setLastBook(last);
  };

  useEffect(() => {
    if (isFocused) {
      fetchStats();
    }
  }, [isFocused]);

  const minutes = Math.floor(readingTime / 60);
  const percent = Math.min(readingTime / (goalMinutes * 60), 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - percent);

  const adjustGoal = async () => {
    const num = parseInt(newGoal);
    if (!isNaN(num) && num > 0) {
      await AsyncStorage.setItem("readingGoalMinutes", num.toString());
      setGoalMinutes(num);
      setShowAdjustModal(false);
      setNewGoal("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reading Goals</Text>
      <Text style={styles.subtitle}>Read every day, see your stats soar and finish more books</Text>

      <View style={styles.progressContainer}>
        <Svg width="260" height="160">
          <Path d={`M10,130 A120,120 0 0,1 250,130`} stroke="#b0ad9a" strokeWidth="12" fill="none" strokeLinecap="round" />
          <Path
            d={`M10,130 A120,120 0 0,1 250,130`}
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
                <Text style={styles.goalReached}>{goalMinutes} minutes goal tap to adjust</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.timerText}>
                {minutes}:{(readingTime % 60).toString().padStart(2, "0")}
              </Text>
              <TouchableOpacity onPress={() => setShowAdjustModal(true)}>
                <Text style={styles.goalText}>of your {goalMinutes}-minute goal ›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.button}
        onPress={() => {
          if (readingTime === 0) {
            router.push("/store");
          } else {
    
          }
        }}
      >
        <Text style={styles.buttonText}>
          {readingTime === 0 ? "Explore the Book Store" : `Keep Reading ${lastBook || ""}`}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={showAdjustModal} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Adjust Your Daily Goal</Text>
                <TextInput
                    keyboardType="numeric"
                    value={newGoal}
                    onChangeText={setNewGoal}
                    style={styles.input}
                    placeholder="Enter minutes"
                    placeholderTextColor="#b0ad9a"
                />
                <View style={styles.modalButtons}>
                    <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowAdjustModal(false)}
                    >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={adjustGoal}
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
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  readingTextContainer: {
    position: "absolute",
    top: 45,
    alignItems: "center",
    justifyContent: "center",
    width: 200,
  },
  readingText: {
    color: "#7d7362",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "MalibuSunday",
  },
  timerText: {
    color: "#7d7362",
    fontSize: 60,
    fontWeight: "bold",
    fontFamily: "MalibuSunday",
  },
  goalText: {
    color: "#b0ad9a",
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: -12,
  },
  checkmark: {
    fontSize: 40,
    color: "#f6f6f4",
    backgroundColor: "#b0ad9a",
    width: 48,
    height: 48,
    borderRadius: 24,
    textAlign: "center",
    lineHeight: 48,
    marginTop: 10,
  },
  goalReached: {
    fontSize: 12,
    color: "#b0ad9a",
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 100,
  },
  button: {
    backgroundColor: "#7d7362",
    paddingVertical: 15,
    paddingHorizontal: 53,
    borderRadius: 30,
  },
  buttonText: {
    color: "#f6f6f4",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: "#f6f6f4",
    borderRadius: 15,
    padding: 25,
    width: '40%',
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
    marginBottom: 20,
    outlineStyle: "none",
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
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
});
