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
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../kitabak-server/firebaseConfig";
import { useRouter } from "expo-router";
import { AirbnbRating } from "@rneui/themed";
import Icon from "react-native-vector-icons/FontAwesome";

export default function BookComponent({ book, visible, onClose }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 500;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("description");
  const [showExtraOption, setShowExtraOption] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleModal = useCallback(() => {
    onClose();
  }, [onClose]);

  // ✅ check favorite status when modal opens
  useEffect(() => {
    const checkFavorite = async () => {
      const user = auth.currentUser;
      if (user && book?.id && visible) {
        const favRef = doc(db, "users", user.uid, "favorites", String(book.id));
        const docSnap = await getDoc(favRef);
        setIsFavorite(docSnap.exists());
      }
    };
    checkFavorite();
  }, [visible, book]);

  const handleToggleFavorite = async () => {
    const user = auth.currentUser;
    if (!user || !book?.id) return;

    const favRef = doc(db, "users", user.uid, "favorites", String(book.id));

    if (isFavorite) {
      await deleteDoc(favRef);
      setIsFavorite(false);
      Alert.alert("تم الحذف", `"${book.title}" تمت إزالته من المفضلة.`);
    } else {
      const bookData = {
        id: String(book.id),
        title: book.title || "No Title",
        author: book.author || "Unknown Author",
        cover: book.cover || null,
        bookpdf: book.bookpdf || "",
        description: book.description || "",
      };
      await setDoc(favRef, bookData);
      setIsFavorite(true);
      Alert.alert("تم الإضافة", `"${book.title}" تمت إضافته إلى المفضلة.`);
    }
  };

  const handleAddToLibrary = async () => {
    const user = auth.currentUser;
    if (user && book?.id) {
      try {
        const bookRef = doc(db, "users", user.uid, "library", String(book.id));
        const bookDataForLibrary = {
          id: String(book.id),
          title: book.title || "No Title",
          author: book.author || "Unknown Author",
          cover: book.cover || null,
          bookpdf: book.bookpdf || "",
          description: book.description || "No description available.",
          page_count: book.page_count || 0,
          genres: book.genres || [],
        };
        await setDoc(bookRef, bookDataForLibrary);
        Alert.alert("تم بنجاح", `"${bookDataForLibrary.title}" تم إضافته إلى مكتبتك.`);
        router.push("/(tabs)/library");
        if (onClose) onClose();
      } catch (error) {
        console.error("Error adding to library:", error);
        Alert.alert("خطأ", "حدث خطأ أثناء إضافة الكتاب للمكتبة.");
      }
    } else {
      Alert.alert("تنبيه", "يجب تسجيل الدخول وتحديد كتاب لإضافته للمكتبة.");
    }
  };

  const handleAddToFinished = async () => {
    const user = auth.currentUser;
    if (user && book?.id) {
      const finishedBookRef = doc(db, "users", user.uid, "booksRead", String(book.id));
      try {
        const bookDataForFinished = {
          id: String(book.id),
          title: book.title || "No Title",
          author: book.author || "Unknown Author",
          cover: book.cover || null,
          description: book.description || "No description available.",
          page_count: book.page_count || 0,
          genres: book.genres || [],
          rating: book.rating || 0,
          finishedTimestamp: new Date().toISOString(),
        };
        await setDoc(finishedBookRef, bookDataForFinished);
        Alert.alert(`"${bookDataForFinished.title}" تمت إضافته إلى قائمة الكتب المقروءة.`);
        if (onClose) onClose();
      } catch (error) {
        console.error("Error adding to finished books: ", error);
        Alert.alert("خطأ", "حدث خطأ أثناء إضافة الكتاب إلى قائمة المقروءة.");
      }
    } else {
      Alert.alert("تنبيه", "يجب تسجيل الدخول وتحديد كتاب لإضافته للمقروءة.");
    }
  };

  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={toggleModal}
      presentationStyle="overFullScreen"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableWithoutFeedback onPress={handleModalClose}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <View
                style={{
                  flexDirection: isSmallScreen ? "column" : "row",
                  alignItems: isSmallScreen ? "center" : "flex-start",
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Image source={{ uri: book?.cover }} style={styles.bookImageInDialog} />
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 10,
                      marginRight: 10,
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setShowExtraOption(!showExtraOption)}
                      style={styles.arrowBtn}
                    >
                      <Icon name={showExtraOption ? "chevron-up" : "chevron-down"} size={14} color="#7d7362" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleAddToLibrary} style={styles.addToLibraryBtn}>
                      <Text style={styles.addToLibraryText}>Add to library</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteBtn}>
                      <Icon
                        name={isFavorite ? "heart" : "heart-o"}
                        size={20}
                        color={isFavorite ? "red" : "#ccc"}
                      />
                    </TouchableOpacity>
                  </View>

                  {showExtraOption && (
                    <TouchableOpacity
                      onPress={handleAddToFinished}
                      style={[styles.addToLibraryBtn, {
                        marginTop: 10,
                        marginLeft: 40,
                        alignSelf: "flex-start"
                      }]}
                    >
                      <Text style={styles.addToLibraryText}>Add to Finished</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ flex: 1, marginLeft: 15, justifyContent: "space-around" }}>
                  <AirbnbRating isDisabled={true} showRating={false} size={25} />
                  <Text style={styles.bookTitleInDialog}>{book?.title}</Text>
                  <Text style={styles.bookAuthorInDialog}>by {book?.author}</Text>
                  <Text style={{ color: "#7d7362" }}>Genres:</Text>
                  <Text style={styles.bookCategory}>{book?.genres}</Text>
                </View>
              </View>

              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: "#7d7362" }}>Rate This Book</Text>
                <AirbnbRating defaultRating={book?.rating || 0} showRating={false} size={25} />
              </View>

              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
                <TouchableOpacity
                  onPress={() => setActiveTab("description")}
                  style={{
                    padding: 10,
                    borderBottomWidth: activeTab === "description" ? 2 : 0,
                    borderBottomColor: "#7d7362",
                    marginRight: 20,
                  }}
                >
                  <Text style={{
                    color: "#7d7362",
                    fontWeight: activeTab === "description" ? "bold" : "normal",
                  }}>
                    Description
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveTab("reviews")}
                  style={{
                    padding: 10,
                    borderBottomWidth: activeTab === "reviews" ? 2 : 0,
                    borderBottomColor: "#7d7362",
                  }}
                >
                  <Text style={{
                    color: "#7d7362",
                    fontWeight: activeTab === "reviews" ? "bold" : "normal",
                  }}>
                    Reviews
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 10 }}>
                {activeTab === "description" ? (
                  <ScrollView>
                    <Text style={styles.bookdescription}>{book?.description}</Text>
                  </ScrollView>
                ) : (
                  <ScrollView>
                    <Text style={styles.bookdescription}>No reviews yet.</Text>
                  </ScrollView>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
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
