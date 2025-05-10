import { useState, useEffect } from "react";
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
  Platform
} from "react-native";
import { shuffle } from "lodash";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../kitabak-server/firebaseConfig";
import BookComponent from "./book";

const ExploreSection = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).filter((book) => book.bestseller === true);
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
              <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">
                {item.title}
              </Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

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
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeModal}
          >
            <Pressable 
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <BookComponent 
                book={selectedBook} 
                visible={modalVisible} 
                onClose={closeModal} 
              />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 1 
  },
  header: { 
    fontSize: 40, 
    marginBottom: 10, 
    fontFamily: 'MalibuSunday', 
    color: "#585047" 
  },
  bookContainer: {
    width: 220,
    marginRight: 12,
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
  },
  bestcontainer: { 
    paddingRight: 20 
  },
  desc: { 
    justifyContent: "center" 
  },
  bookImage: { 
    width: 220, 
    height: 330, 
    borderRadius: 8 
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
    color: "#b0ad9a" 
  },
  keyboardView: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'transparent',
    borderRadius: 10,
    elevation: 20,
  }
});

export default ExploreSection;