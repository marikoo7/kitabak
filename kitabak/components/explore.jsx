import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert
} from "react-native";
import { shuffle } from "lodash";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db, auth } from "../kitabak-server/firebaseConfig";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";

const ExploreSection = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(shuffle(booksData));
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  const handleAddToLibrary = async (book) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You need to be logged in.");
      return;
    }

    try {
      const bookRef = doc(db, "users", user.uid, "library", book.id);
      await setDoc(bookRef, {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        image: book.cover || book.image || "https://via.placeholder.com/200x300",
        page_count: book.page_count || 0,
        reviews: book.reviews || 0,
      });

      Alert.alert("Added!", `"${book.title}" has been added to your library.`);
      setSelectedBook(null);
      router.push("/library"); // ✅ تحويل تلقائي للـ Library
    } catch (error) {
      console.error("Error adding to library:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const toggleFavorite = (book) => {
    if (favorites.some((b) => b.id === book.id)) {
      setFavorites(favorites.filter((b) => b.id !== book.id));
    } else {
      setFavorites([...favorites, book]);
    }
  };

  const handleRating = (book, rating) => {
    setSelectedBook({ ...selectedBook, rating });
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
          <TouchableOpacity onPress={() => setSelectedBook(item)} style={styles.bookContainer}>
            <View style={styles.excontainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
            </View>
            <View style={styles.desc}>
            <Text style={styles.bookTitle} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
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

      {/* Modal */}
      {selectedBook && (
        <Modal transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={() => setSelectedBook(null)} style={styles.closeIcon}>
                <Text style={{ fontSize: 20 }}>✖</Text>
              </TouchableOpacity>

              <Image source={{ uri: selectedBook.cover }} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{selectedBook.title}</Text>
              <Text style={styles.modalAuthor}>{selectedBook.author}</Text>

              <ScrollView>
                <Text style={styles.modalDesc}>{selectedBook.description || "No description available."}</Text>
              </ScrollView>

              <Text style={styles.rateText}>Rate this book</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => handleRating(selectedBook, star)}>
                    <Icon
                      name="star"
                      size={20}
                      color={star <= (selectedBook.rating || 0) ? "#FFD700" : "#ccc"}
                    />
                  </TouchableOpacity>
                ))}
                <Text style={styles.ratingNumber}>{selectedBook.rating ? selectedBook.rating.toFixed(1) : "0.0"}</Text>
              </View>

              <TouchableOpacity
                style={styles.favoriteBtn}
                onPress={() => toggleFavorite(selectedBook)}
              >
                <Icon
                  name={favorites.some((b) => b.id === selectedBook.id) ? "heart" : "heart-o"}
                  size={20}
                  color={favorites.some((b) => b.id === selectedBook.id) ? "red" : "#ccc"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToLibrary(selectedBook)}
              >
                <Text style={styles.addButtonText}>Add to Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 1 },
  header: { fontSize: 40, marginBottom: 10, fontFamily: 'MalibuSunday',color:"#585047" },
  bookContainer: {
    width: 300,
    marginRight: 10,
    padding: 10,
    backgroundColor: "#b0ad9a",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  excontainer: { paddingRight: 20 },
  desc: { justifyContent: "center" },
  bookImage: { width: 100, height: 150, borderRadius: 8 },
  bookTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 5,
    color: "#7d7362",
    maxWidth: 170,
    lineHeight: 20, 
  },
  bookAuthor: { fontSize: 12, color: "#e7e6df", marginTop:5 },
  bookPages: { fontSize: 17, marginTop: 2, color: "#585047", fontWeight: "bold" },
  pg: { color: "#e7e6df" },
  bkP: { paddingRight: 10, paddingTop: 10 },
  review: { flexDirection: "row" },

  modalBackground: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 1,
  },
  modalImage: {
    width: 120,
    height: 180,
    alignSelf: "center",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  modalAuthor: {
    textAlign: "center",
    color: "#555",
    marginBottom: 10,
  },
  modalDesc: {
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },
  rateText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  ratingNumber: {
    fontSize: 18,
    marginLeft: 10,
    color: "#FFD700",
  },
  favoriteBtn: {
    position: "absolute",
    top: 220,
    right: 20,
  },
  addButton: {
    marginTop: 15,
    backgroundColor: "#7d7362",
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ExploreSection;
