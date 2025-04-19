
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { shuffle } from "lodash";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../kitabak-server/firebaseConfig";
import Icon from "react-native-vector-icons/FontAwesome"; 

const ExploreSection = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [library, setLibrary] = useState([]);
  const [favorites, setFavorites] = useState([]); 
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

  const addToLibrary = (book) => {
    if (!library.some((b) => b.id === book.id)) {
      setLibrary([...library, book]);
    }
    setSelectedBook(null); 
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
      <Text style={styles.header}>All-Time Bestsellers</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedBook(item)} style={styles.bookContainer}>
            <View style={styles.bestcontainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
            </View>
            <View style={styles.desc}>
               <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
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
                <Text style={{ fontSize: 18 }}>✖</Text>
              </TouchableOpacity>

              <Image source={{ uri: selectedBook.cover }} style={styles.modalImage} />
              <View style={styles.modalHeader}>
              
                <Text style={styles.modalTitle}>{selectedBook.title}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(selectedBook)} style={styles.favoriteBtn}>
                  <Icon
                    name={favorites.some((b) => b.id === selectedBook.id) ? "heart" : "heart-o"}
                    size={20}
                    color={favorites.some((b) => b.id === selectedBook.id) ? "red" : "#ccc"}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalAuthor}>{selectedBook.author}</Text>
              
             
              <ScrollView style={styles.modalDescContainer}>
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

             
              <TouchableOpacity onPress={() => addToLibrary(selectedBook)} style={styles.addBtn}>
                <Text style={styles.addBtnText}>Add to Library</Text>
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
  header: { fontSize: 30, marginBottom: 10, fontFamily: 'MalibuSunday' },
  bookContainer: {
    width: 230,
    marginRight: 10,
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
  },
  bestcontainer: { paddingRight: 20 },
  desc: { justifyContent: "center" },
  bookImage: { width: 200, height: 300, borderRadius: 8 },
  bookTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 5,
    color: "#7d7362",
    maxWidth: 170,
    lineHeight: 20, 
  },
  bookAuthor: { fontSize: 12, color: "#b0ad9a" },

  // Modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  modalImage: {
    width: 120,
    height: 180,
    alignSelf: 'center',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',  
    marginLeft:30,
  },
  modalAuthor: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 10,
  },
  modalDescContainer: {
    paddingBottom: 15,
  },
  modalDesc: {
    fontSize: 13,
    marginBottom: 15,
    textAlign: 'center',
    maxHeight: 200, 
  },

  
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: 'center',
    width: '100%',
  },

  // Button to mark favorite
  favoriteBtn: {
    marginLeft: 10,
  },

  // Rate this book text
  rateText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },

  // Star rating container
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },

  // Rating number display
  ratingNumber: {
    fontSize: 18,
    marginLeft: 10,
    color: "#FFD700",
  },

  addBtn: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    marginLeft:22,
    width: '80%',
  },
  addBtnText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default ExploreSection;