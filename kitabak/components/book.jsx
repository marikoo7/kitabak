import { View, StyleSheet, TouchableOpacity, Modal, Text, Image, ScrollView, Alert, TextInput, Keyboard, useWindowDimensions, KeyboardAvoidingView, Platform } from "react-native";
import { useEffect, useState, useRef } from "react";
import { doc, setDoc, deleteDoc, getDoc, getDocs, collection, addDoc, query, orderBy, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../kitabak-server/firebaseConfig";
import { useRouter } from "expo-router";
import { AirbnbRating, Button } from "@rneui/themed";
import Icon from "react-native-vector-icons/FontAwesome";

export default function BookComponent({ book, visible, onClose }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 500;
  const router = useRouter();
  const reviewInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("description");
  const [showExtraOption, setShowExtraOption] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewsList, setReviewsList] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [userName, setUserName] = useState(""); 
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        if (user.displayName) {
          setUserName(user.displayName);
        } else {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUserName(data.username || user.email?.split('@')[0] || "User");
            } else {
              setUserName(user.email?.split('@')[0] || "User");
            }
          } catch {
            setUserName(user.email?.split('@')[0] || "User");
          }
        }
      }
    };
    fetchUserProfile();
  }, []);

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
      } catch {
        Alert.alert("error", "Error adding to Finished");
      }
    } else {
      Alert.alert("alert", "you should log in first");
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
      userName: userName || user.email?.split('@')[0] || "User",
      reviewText: reviewText.trim(),
      timestamp: new Date(),
    });
    const bookRef = doc(db, "books", book.id);
    await updateDoc(bookRef, { reviews: increment(1) });
    setReviewText("");
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (activeTab === "reviews" && reviewInputRef.current) {
      setTimeout(() => {
        if (reviewInputRef.current) {
          reviewInputRef.current.focus();
        }
      }, 300);
    }
  }, [activeTab]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalBackground}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.closeButtonContainer}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="times" size={18} color="#7d7362" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.mainScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ 
                flexDirection: isSmallScreen ? "column" : "row", 
                alignItems: isSmallScreen ? "center" : "flex-start", 
                marginBottom: 10 
              }}>
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
                    <TouchableOpacity onPress={handleAddToFinished} style={[styles.addToLibraryBtn, { marginTop: 10 }]}>
                      <Text style={styles.addToLibraryText}>Add to Finished</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ flex: 1, marginLeft: isSmallScreen ? 0 : 15, marginTop: isSmallScreen ? 10 : 0 }}>
                  <AirbnbRating isDisabled showRating={false} defaultRating={averageRating} size={20} />
                  <Text style={styles.bookTitleInDialog}>{book?.title}</Text>
                  <Text style={styles.bookAuthorInDialog}>by {book?.author}</Text>
                  <Text style={{ color: "#7d7362" }}>Genres:</Text>
                  <Text style={styles.bookCategory}>
                    {Array.isArray(book?.genres) ? book.genres.join(', ') : book?.genres}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: "#7d7362" }}>Rate This Book</Text>
                <AirbnbRating defaultRating={userRating} showRating={false} size={25} onFinishRating={submitRating} />
              </View>

              <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 15 }}>
                {["description", "reviews"].map((tab) => (
                  <TouchableOpacity 
                    key={tab} 
                    onPress={() => setActiveTab(tab)} 
                    style={[
                      styles.tabButton,
                      activeTab === tab ? styles.tabButtonActive : null
                    ]}
                  >
                    <Text style={[
                      styles.tabButtonText,
                      activeTab === tab ? styles.tabButtonTextActive : null
                    ]}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ marginTop: 10, flex: 1 }}>
                {activeTab === "reviews" ? (
                  <View style={styles.reviewsContainer}>
                    {reviewsList.length === 0 ? (
                      <Text style={styles.bookdescription}>No reviews yet.</Text>
                    ) : (
                      reviewsList.map((r) => (
                        <View key={r.id} style={styles.reviewItem}>
                          <Text style={styles.reviewUserName}>{r.userName}</Text>
                          <Text style={styles.reviewText}>{r.reviewText}</Text>
                          <Text style={styles.reviewTime}>
                            {r.timestamp && r.timestamp.seconds 
                              ? new Date(r.timestamp.seconds * 1000).toLocaleString() 
                              : 'Just now'}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                ) : (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.bookdescription}>{book?.description}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            {activeTab === "reviews" && (
              <View style={[
                styles.reviewInputContainer,
                keyboardVisible && Platform.OS === "ios" ? { paddingBottom: 20 } : {}
              ]}>
                <Text style={{ color: "#7d7362", marginBottom: 5 }}>Add your review:</Text>
                <TextInput
                  ref={reviewInputRef}
                  placeholder="Write a review..."
                  value={reviewText}
                  onChangeText={setReviewText}
                  style={styles.reviewInput}
                  multiline
                  autoCapitalize="sentences"
                  keyboardType="default"
                  keyboardAppearance="default"
                  maxLength={500}
                  // Add direct focus handling attributes
                  accessible={true}
                  onResponderGrant={() => {
                    if (reviewInputRef.current) {
                      reviewInputRef.current.focus();
                    }
                  }}
                />
                {reviewText.length > 0 && (
                  <Button 
                    title="Submit" 
                    onPress={submitReview} 
                    buttonStyle={styles.submitButton}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
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
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "90%",
    borderRadius: 10,
    overflow: "hidden",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    height: "100%",
    flexDirection: "column",
  },
  mainScrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  closeButtonContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
    backgroundColor: "#e7e6df",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  bookImageInDialog: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  bookTitleInDialog: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 5,
    color: "#7d7362",
  },
  bookAuthorInDialog: {
    color: "gray",
    marginBottom: 10,
  },
  bookCategory: {
    marginTop: 5,
    marginBottom: 10,
    color: "#b0ad9a",
  },
  bookdescription: {
    color: "#b0ad9a",
    paddingBottom: 10,
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
    fontSize: 12,
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
  tabButton: {
    padding: 10,
    marginHorizontal: 5,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#7d7362",
  },
  tabButtonText: {
    color: "#7d7362",
  },
  tabButtonTextActive: {
    fontWeight: "bold",
  },
  reviewsContainer: {
    paddingBottom: 10,
  },
  descriptionContainer: {
    paddingBottom: 10,
  },
  reviewItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#f9f7f4",
    borderRadius: 8,
  },
  reviewUserName: {
    fontWeight: "bold",
    color: "#7d7362",
  },
  reviewText: {
    color: "#b0ad9a",
  },
  reviewTime: {
    fontSize: 10,
    color: "gray",
    marginTop: 3,
  },
  reviewInputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e7e6df",
    paddingTop: 10,
    marginTop: 5,
    backgroundColor: "#fff",
    zIndex: 99,
  },
  reviewInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: "#333",
    minHeight: 60,
    maxHeight: 100,
    borderColor: "#e7e6df",
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: "#7d7362",
    borderRadius: 20,
  },
});