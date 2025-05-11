import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { shuffle } from "lodash";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../kitabak-server/firebaseConfig";
import BookComponent from "./book";

const truncateText = (text, limit) => {
  if (!text) return '';
  return text.length > limit ? text.substring(0, limit) + ' ......' : text;
};

const ExploreSection = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((book) => book.bestseller === false);
        setBooks(shuffle(booksData));
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  const handleBookPress = (book) => {
    setSelectedBook(book);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBook(null);
  };

  const showMoreDetails = () => {
    setModalVisible(false);
    setShowFullDetails(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookContainer}
            onPress={() => handleBookPress(item)}
          >
            <View style={styles.excontainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
            </View>
            <View style={styles.desc}>
              <Text
                style={styles.bookTitle}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
              <View style={styles.review}>
                <View style={styles.bkP}>
                  <Text style={styles.bookPages}>{item.page_count}</Text>
                  <Text style={styles.pg}>pages</Text>
                </View>
                <View style={styles.bkP}>
                  <Text style={styles.bookPages}>{item.reviews}</Text>
                  <Text style={styles.pg}>reviews</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {modalVisible && selectedBook && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
          statusBarTranslucent
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <Pressable style={styles.modalBackdrop} onPress={closeModal}>
              <Pressable
                style={styles.modalPopup}
                onPress={(e) => e.stopPropagation()}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>

                <Image
                  source={{ uri: selectedBook.cover }}
                  style={styles.popupImage}
                />

                <Text
                  style={styles.popupDescription}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {truncateText(selectedBook.description, 110)}
                </Text>

                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={showMoreDetails}
                >
                  <Text style={styles.detailsButtonText}>
                    Show More Details
                  </Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {showFullDetails && selectedBook && (
        <BookComponent
          book={selectedBook}
          visible={true}
          onClose={() => {
            setShowFullDetails(false);
            setSelectedBook(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 1 },
  header: {
    fontSize: 40,
    marginBottom: 10,
    fontFamily: "MalibuSunday",
    color: "#585047",
  },
  bookContainer: {
    width: 300,
    marginRight: 10,
    padding: 10,
    backgroundColor: "#b0ad9a",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  excontainer: {
    width: 100,
    marginRight: 15,
  },
  desc: {
    flex: 1,
    justifyContent: "center",
  },
  bookImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 5,
    color: "#7d7362",
    maxWidth: "100%",
    lineHeight: 20,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#e7e6df",
    marginTop: 5,
  },
  bookPages: {
    fontSize: 17,
    marginTop: 2,
    color: "#585047",
    fontWeight: "bold",
  },
  pg: {
    color: "#e7e6df",
  },
  bkP: {
    paddingRight: 10,
    paddingTop: 10,
  },
  review: {
    flexDirection: "row",
  },
  keyboardView: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalPopup: {
    width: 300,
    backgroundColor: "#f6f6f4",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 20,
  },
  popupImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  popupDescription: {
    fontSize: 14,
    color: "#7d7362",
    textAlign: "center",
    marginBottom: 10,
  },
  detailsButton: {
    backgroundColor: "#585047",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  detailsButtonText: {
    color: "#f6f6f4",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 15,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 30,
    color: "#585047",
  },
});

export default ExploreSection;
