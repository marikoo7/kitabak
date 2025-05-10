import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Text,
  Image,
  ScrollView,
  Alert,
  TextInput,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../kitabak-server/firebaseConfig";
import { useRouter } from "expo-router";
import { AirbnbRating, Button } from "@rneui/themed";
import Icon from "react-native-vector-icons/FontAwesome";

export default function BookComponent({ book, visible, onClose }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 500;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("description");
  const [showExtraOption, setShowExtraOption] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewsList, setReviewsList] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const checkFavorite = async () => {
      const user = auth.currentUser;
      if (user && book?.id && visible) {
        const favRef = doc(db, "users", user.uid, "favorites", book.id);
        const docSnap = await getDoc(favRef);
        setIsFavorite(docSnap.exists());
      }
    };
    checkFavorite();
  }, [visible, book]);

  const handleToggleFavorite = async () => {
    const user = auth.currentUser;
    if (!user || !book?.id) return;
    const favRef = doc(db, "users", user.uid, "favorites", book.id);
    if (isFavorite) {
      await deleteDoc(favRef);
      setIsFavorite(false);
    } else {
      await setDoc(favRef, book);
      setIsFavorite(true);
    }
  };

  const handleAddToLibrary = async () => {
    const user = auth.currentUser;
    if (user && book?.id) {
      const bookRef = doc(db, "users", user.uid, "library", book.id);
      await setDoc(bookRef, book);
      router.push("/(tabs)/library");
      onClose();
    }
  };

  const handleAddToFinished = async () => {
    const user = auth.currentUser;
    if (user && book?.id) {
      const ref = doc(db, "users", user.uid, "booksRead", book.id);
      const finishedData = {
        id: String(book.id),
        title: book.title || "No Title",
        author: book.author || "Unknown Author",
        cover: book.cover || null,
        description: book.description || "",
        page_count: book.page_count || 0,
        genres: book.genres || [],
        finishedTimestamp: new Date().toISOString(),
      };
      try {
        await setDoc(ref, finishedData);
        if (onClose) onClose();
      } catch (error) {
        console.error("Error adding to Finished:", error);
        Alert.alert("خطأ", "حدث خطأ أثناء الإضافة إلى المقروءة.");
      }
    } else {
      Alert.alert("تنبيه", "يجب تسجيل الدخول أولاً.");
    }
  };

  useEffect(() => {
    const fetchAverageRating = async () => {
      if (!book?.id) return;
      const snapshot = await getDocs(collection(db, "books", book.id, "ratings"));
      let total = 0, count = 0;
      snapshot.forEach((doc) => {
        const d = doc.data();
        if (d.rating) {
          total += d.rating;
          count += 1;
        }
      });
      setAverageRating(count > 0 ? total / count : 0);
    };
    fetchAverageRating();
  }, [book?.id]);

  useEffect(() => {
    const fetchUserRating = async () => {
      const user = auth.currentUser;
      if (!user || !book?.id) return;
      const snap = await getDoc(doc(db, "books", book.id, "ratings", user.uid));
      setUserRating(snap.exists() ? snap.data().rating : 0);
    };
    fetchUserRating();
  }, [book?.id]);

  const submitRating = async (value) => {
    const user = auth.currentUser;
    if (!user) return;
    await setDoc(doc(db, "books", book.id, "ratings", user.uid), {
      rating: value,
      userId: user.uid,
      createdAt: new Date(),
    });
    setUserRating(value);
  };

  useEffect(() => {
    if (!book?.id) return;
    const q = query(collection(db, "books", book.id, "reviews"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const revs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReviewsList(revs);
    });
    return () => unsub();
  }, [book?.id]);

  const submitReview = async () => {
    const user = auth.currentUser;
    if (!user || !reviewText.trim()) return;
    await addDoc(collection(db, "books", book.id, "reviews"), {
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      reviewText: reviewText.trim(),
      timestamp: new Date(),
    });
    setReviewText("");
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
  <View style={styles.modalBackground}>
    <TouchableOpacity
      activeOpacity={1}
      style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
      onPress={onClose}
    >
      <TouchableWithoutFeedback onPress={() => {}}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.modalContent}>
            {/* Book Info Row */}
            <View style={{ flexDirection: isSmallScreen ? "column" : "row", alignItems: isSmallScreen ? "center" : "flex-start" }}>
              <View style={{ alignItems: "center" }}>
                <Image source={{ uri: book?.cover }} style={styles.bookImageInDialog} />
                <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}>
                  <TouchableOpacity onPress={() => setShowExtraOption(!showExtraOption)} style={styles.arrowBtn}>
                    <Icon name={showExtraOption ? "chevron-up" : "chevron-down"} size={14} color="#7d7362" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddToLibrary} style={styles.addToLibraryBtn}>
                    <Text style={styles.addToLibraryText}>Add to library</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteBtn}>
                    <Icon name={isFavorite ? "heart" : "heart-o"} size={20} color={isFavorite ? "red" : "#ccc"} />
                  </TouchableOpacity>
                </View>

                {showExtraOption && (
                  <TouchableOpacity onPress={handleAddToFinished} style={[styles.addToLibraryBtn, { marginTop: 10, marginLeft: 40 }]}>
                    <Text style={styles.addToLibraryText}>Add to Finished</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 15 }}>
                <AirbnbRating isDisabled showRating={false} defaultRating={averageRating} size={20} />
                <Text style={styles.bookTitleInDialog}>{book?.title}</Text>
                <Text style={styles.bookAuthorInDialog}>by {book?.author}</Text>
                <Text style={{ color: "#7d7362" }}>Genres:</Text>
                <Text style={styles.bookCategory}>{book?.genres}</Text>
              </View>
            </View>

            {/* Rating Section */}
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Text style={{ color: "#7d7362" }}>Rate This Book</Text>
              <AirbnbRating defaultRating={userRating} showRating={false} size={25} onFinishRating={submitRating} />
            </View>

            {/* Tab Switch */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
              {["description", "reviews"].map((tab) => (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={{
                  padding: 10,
                  borderBottomWidth: activeTab === tab ? 2 : 0,
                  borderBottomColor: "#7d7362",
                  marginRight: tab === "description" ? 20 : 0,
                }}>
                  <Text style={{ color: "#7d7362", fontWeight: activeTab === tab ? "bold" : "normal" }}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description or Reviews */}
            <View style={{ marginTop: 10 }}>
              {activeTab === "reviews" ? (
                <ScrollView style={{ paddingHorizontal: 10 }}>
                  {reviewsList.length === 0 ? (
                    <Text style={styles.bookdescription}>No reviews yet.</Text>
                  ) : (
                    reviewsList.map((r) => (
                      <View key={r.id} style={{ marginBottom: 10 }}>
                        <Text style={{ fontWeight: "bold", color: "#7d7362" }}>{r.userName}</Text>
                        <Text style={{ color: "#b0ad9a" }}>{r.reviewText}</Text>
                        <Text style={{ fontSize: 10, color: "gray" }}>
                          {new Date(r.timestamp.seconds * 1000).toLocaleString()}
                        </Text>
                      </View>
                    ))
                  )}
                  <View style={{ marginTop: 20 }}>
                    <Text style={{ color: "#7d7362", marginBottom: 5 }}>Add your review:</Text>
                    <TextInput
                      placeholder="Write a review..."
                      value={reviewText}
                      onChangeText={setReviewText}
                      style={{
                        backgroundColor: "#f0f0f0",
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 10,
                        color: "#333",
                        minHeight: 60,
                      }}
                      multiline
                    />
                    <Button title="Submit" onPress={submitReview} />
                  </View>
                </ScrollView>
              ) : (
                <ScrollView><Text style={styles.bookdescription}>{book?.description}</Text></ScrollView>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </TouchableOpacity>
  </View>
</Modal>

  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
  },
  bookImageInDialog: {
    width: 220,
    height: 330,
    borderRadius: 8,
  },
  bookTitleInDialog: {
    fontWeight: "bold",
    fontSize: 28,
    marginBottom: 5,
    color: "#7d7362",
  },
  bookAuthorInDialog: {
    color: "gray",
    marginBottom: 10,
  },
  bookCategory: {
    marginTop: 10,
    marginBottom: 15,
    color: "#b0ad9a",
  },
  bookdescription: {
    color: "#b0ad9a",
  },
  addToLibraryBtn: {
    backgroundColor: "#7d7362",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  addToLibraryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  favoriteBtn: {
    backgroundColor: "#e7e6df",
    padding: 10,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  arrowBtn: {
    backgroundColor: "#e7e6df",
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});