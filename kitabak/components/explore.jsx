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
  const [selectedSection, setSelectedSection] = useState('description');
  const router = useRouter();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).filter((book) => book.bestseller === false);
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
      alert("You need to be logged in.");
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

      alert(`"${book.title}" has been added to your library.`);
      setSelectedBook(null);
      router.push("/library");
    } catch (error) {
      console.error("Error adding to library:", error);
      alert("Something went wrong.");
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

      {selectedBook && (
        <Modal transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={() => setSelectedBook(null)} style={styles.closeIcon}>
                <Text style={{ fontSize: 20 }}>✖</Text>
              </TouchableOpacity>

              <View style={styles.bookInfoContainer}>
                <Image source={{ uri: selectedBook.cover }} style={styles.modalImage} />
                <View style={styles.modalTextContainer}>
                  <Text style={styles.modalTitle}>{selectedBook.title}</Text>
                  <Text style={styles.modalAuthor}>by {selectedBook.author}</Text>
                </View>
              </View>

              <View style={styles.starsContainer}>
                {[1, 2, 3].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    size={20}
                    color="#FFD700"
                  />
                ))}
                {[4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    size={20}
                    color="#ccc"
                  />
                ))}
              </View>

              <View style={styles.infoSections}>
                <TouchableOpacity onPress={() => setSelectedSection('description')}>
                  <Text style={[styles.sectionTitle, selectedSection === 'description' && styles.activeSection]}>
                    Description
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedSection('reviews')}>
                  <Text style={[styles.sectionTitle, selectedSection === 'reviews' && styles.activeSection]}>
                    Reviews
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedSection === 'description' && (
                <ScrollView style={styles.scrollView}>
                  <Text style={styles.modalDesc}>{selectedBook.description || "No description available."}</Text>
                </ScrollView>
              )}

              {selectedSection === 'reviews' && (
                <ScrollView style={styles.scrollView}>
                  <Text style={styles.modalDesc}>
                    {selectedBook.reviews ? selectedBook.reviews : "No reviews yet. Please add reviews."}
                  </Text>
                </ScrollView>
              )}

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
  header: { fontSize: 40, marginBottom: 10, fontFamily: 'MalibuSunday', color:"#585047" },
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
    borderRadius: 8
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 5,
    color: "#7d7362",
    maxWidth: '100%',
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
  bookInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginRight: 10,
  },
  modalTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalAuthor: {
    fontSize: 16,
    color: "#777",
    marginTop: 5,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  infoSections: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#585047",
  },
  activeSection: {
    fontWeight: "bold",
    color: "#7d7362",
    textDecorationLine: "underline",
  },
  modalDesc: {
    fontSize: 13,
    marginTop: 10,
    textAlign: "left",
    lineHeight: 18,
  },
  scrollView: {
    maxHeight: 150,
    marginTop: 10,
  },
  addButton: {
    backgroundColor: "#7d7362",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ExploreSection;