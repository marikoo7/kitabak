import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
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
          .filter((book) => book.bestseller === true);
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
      <Text style={styles.header}>All-Time Bestsellers</Text>
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
            <View style={styles.bestcontainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
            </View>
            <View style={styles.desc}>
              <Text
                style={styles.bookTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {modalVisible && selectedBook && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={modalVisible}
          onRequestClose={closeModal}
          statusBarTranslucent
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.popupContainer}>
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

              <Text style={styles.popupDescription}>
                {truncateText(selectedBook.description, 110)}
              </Text>

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={showMoreDetails}
              >
                <Text style={styles.detailsButtonText}>Show More Details</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  container: {
    padding: 1,
  },
  header: {
    fontSize: 40,
    marginBottom: 10,
    fontFamily: "MalibuSunday",
    color: "#585047",
  },
  bookContainer: {
    width: 220,
    marginRight: 12,
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
  },
  bestcontainer: {
    paddingRight: 20,
  },
  desc: {
    justifyContent: "center",
  },
  bookImage: {
    width: 220,
    height: 330,
    borderRadius: 8,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 5,
    color: "#7d7362",
    maxWidth: 170,
    lineHeight: 20,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#b0ad9a",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupContainer: {
    backgroundColor: "#f6f6f4",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
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
  popupImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginBottom: 15,
  },
  popupDescription: {
    fontSize: 14,
    color: "#7d7362",
    textAlign: "center",
    marginBottom: 15,
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
});

export default ExploreSection;
