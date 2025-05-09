import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { db, auth } from "../kitabak-server/firebaseConfig";
import { collection, query, where, orderBy, onSnapshot, doc, setDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");

const BooksReadSection = ({ userId }) => {
  const [readingGoal, setReadingGoal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actualBooksRead, setActualBooksRead] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const cardWidth = width * 0.20;
  const cardHeight = cardWidth * 1.5;

  useEffect(() => {
    if (!userId) {
      setActualBooksRead([]);
      setReadingGoal(3);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let userGoalLoaded = false;
    let booksLoaded = false;

    const trySetLoadingFalse = () => {
        if (userGoalLoaded && booksLoaded) {
            setIsLoading(false);
        }
    };

    const userDocRef = doc(db, "users", userId);
    const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().readingGoal !== undefined) {
        setReadingGoal(Number(docSnap.data().readingGoal));
      } else {
        setReadingGoal(3);
        setDoc(userDocRef, { readingGoal: 3 }, { merge: true }).catch(e => console.error("Error saving default goal for user:", userId, e));
      }
      userGoalLoaded = true;
      trySetLoadingFalse();
    }, (error) => {
      console.error("Error fetching user reading goal for user:", userId, error);
      setReadingGoal(3);
      userGoalLoaded = true;
      trySetLoadingFalse();
    });

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1).toISOString();
    const endDate = new Date(currentYear + 1, 0, 1).toISOString();

    const q = query(
      collection(db, "users", userId, "booksRead"),
      where("finishedTimestamp", ">=", startDate),
      where("finishedTimestamp", "<", endDate),
      orderBy("finishedTimestamp", "desc")
    );

    const unsubscribeBooksRead = onSnapshot(q, (querySnapshot) => {
      const booksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActualBooksRead(booksData);
      booksLoaded = true;
      trySetLoadingFalse();
    }, (error) => {
      console.error("Error fetching read books for user:", userId, error);
      Alert.alert("خطأ حاد!", "مشكلة في استقبال تحديثات الكتب المقروءة.");
      booksLoaded = true;
      trySetLoadingFalse();
    });

    return () => {
      unsubscribeUserDoc();
      unsubscribeBooksRead();
    };
  }, [userId]);

  const currentReadingGoal = Number(readingGoal) || 0;
  const itemsForFlatList = Array.from({ length: currentReadingGoal }, (_, i) => {
    if (userId && i < actualBooksRead.length) {
      return {
        ...actualBooksRead[i],
        isActualBook: true,
        displaySlotNumber: i + 1,
      };
    } else {
      return {
        id: `placeholder_slot_${i}_${Date.now()}`,
        isActualBook: false,
        displaySlotNumber: i + 1,
      };
    }
  });

  const renderItem = ({ item }) => {
    const imageUrl = item.cover || item.image;
    return (
      <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
        {item.isActualBook && imageUrl ? (
          <Image
            key={item.id + "_" + imageUrl}
            source={{ uri: imageUrl }}
            style={styles.bookImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.bookNumber}>{item.displaySlotNumber}</Text>
        )}
      </View>
    );
  };

  const booksReadCount = userId ? actualBooksRead.length : 0;
  const booksNeededForGoal = Math.max(0, currentReadingGoal - booksReadCount);
  const goalReached = userId && booksReadCount >= currentReadingGoal && currentReadingGoal > 0;

  if (isLoading && userId) {
    return (
      <View style={styles.containerLoading}>
        <Text style={styles.title}>Books Read This Year</Text>
        <ActivityIndicator size="large" color="#585047" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Books Read This Year</Text>

      <View style={{ width: "100%", height: cardHeight + 20, marginBottom: 10 }}>
        {(itemsForFlatList.length > 0 || currentReadingGoal > 0) ? (
            <FlatList
              horizontal
              data={itemsForFlatList}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 10,
                justifyContent: itemsForFlatList.length * (cardWidth + 16) < width ? "center" : "flex-start",
                flexGrow: 1,
              }}
            />
        ) : (
             !userId && <Text style={styles.noBooksText}>Create an account to set your goal!</Text>
        )}
      </View>

      {!userId ? (
        <View>
        <TouchableOpacity onPress={() => router.push('(tabs)/profile')} style={styles.createAccountButton}>
          <Text style={styles.createAccountButtonText}>
            Create an account to track your progress!
          </Text>
        </TouchableOpacity>
        <View style={styles.login}>
              <Text style={styles.loginText} onPress={() => router.push('(tabs)/profile')}>
                Already have an account? <Text style={styles.loginLink}>Log in</Text>
              </Text>
              </View>
            </View>
      ) : (
        <>
          <View style={styles.goalRow}>
            <Text style={styles.goalText}>
              {goalReached
                ? "You've reached your goal!"
                : booksNeededForGoal > 0
                ? `${booksNeededForGoal} more book${booksNeededForGoal === 1 ? "" : "s"} to reach your goal`
                : booksReadCount > 0 && currentReadingGoal === 0 
                ? "Set a goal to track your progress!"
                : "Let's start reading!"
              }
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.arrow}>➔</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subText}>
            You've read {booksReadCount} book{booksReadCount === 1 ? "" : "s"} this year.{" "}
            {goalReached ? (
              <Text style={styles.congratsText}>
                Congratulations!
              </Text>
            ) : (
              <TouchableOpacity onPress={() => router.push('/(tabs)/library')} style={styles.touchableLink}>
                <Text style={styles.linkText}>
                  Keep reading!
                </Text>
              </TouchableOpacity>
            )}
          </Text>
        </>
      )}

      {userId && modalVisible && (
        <Modal transparent animationType="slide" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setModalVisible(false)}>
              <View style={styles.pickerContainer} onStartShouldSetResponder={() => true}>
              <Picker
                selectedValue={currentReadingGoal}
                onValueChange={(itemValue) => {
                  setReadingGoal(Number(itemValue));
                }}
                style={{width: '100%'}}
              >
                {Array.from({ length: 31 }, (_, i) => i).map((num) => (
                  <Picker.Item key={num} label={`${num} book${num === 1 ? "" : "s"}`} value={num} />
                ))}
              </Picker>
              <TouchableOpacity
                onPress={async () => {
                  if (!userId) {
                      Alert.alert("خطأ", "المستخدم غير مسجل للدخول.");
                      setModalVisible(false);
                      return;
                  }
                  if (readingGoal !== null) {
                    try {
                      const userDocRef = doc(db, "users", userId);
                      await setDoc(userDocRef, { readingGoal: Number(readingGoal) }, { merge: true });
                      Alert.alert("تم", "تم تحديث هدف القراءة بنجاح!");
                    } catch (error) {
                      console.error("Error updating reading goal: ", error);
                      Alert.alert("خطأ", "لم نتمكن من تحديث هدف القراءة.");
                    }
                  }
                  setModalVisible(false);
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Set Goal</Text>
              </TouchableOpacity>
              </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    width: "100%",
    borderRadius:15,
  },
  containerLoading: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    width: "100%",
    minHeight: 200,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    color: "#585047",
    marginBottom: 20,
    fontFamily: "MalibuSunday",
    textAlign: "center",
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginHorizontal: 8,
    backgroundColor: "#b0ad9a",
    justifyContent: "center",
    alignItems: "center",
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  bookNumber: {
    fontSize: 40,
    color: "#FFFFFF",
    fontFamily: "MalibuSunday",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 5,
  },
  goalText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5a4e3a",
    textAlign: 'center',
  },
  arrow: {
    fontSize: 20,
    color: "#5a4e3a",
    marginLeft: 8,
  },
  subText: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
    textAlign: 'center',
  },
  linkText:{
    color:'#b0ad9a',
    fontSize: 13,
  },
  congratsText: {
    fontWeight: 'bold',
    color: '#4CAF50',
    fontSize: 13,
  },
  touchableLink: {
  },
  noBooksText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
    marginTop: 20,
  },
  createAccountButton: {
    color:'#b0ad9a',
    marginTop: 7,
  },
  createAccountButtonText: {
    color: '#7d7362',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 19,
  },
  login:{textAlign:'center', alignItems:"center"},
  loginText: { marginTop: 15, color: "#7d7362", fontSize: 16 },
  loginLink: { fontWeight: "bold", color: "#585047" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    paddingBottom: 20,
    paddingTop: 10,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#7d7362',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 15,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BooksReadSection;