import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal} from "react-native";
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
        })).filter((book) => book.bestseller === false);
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
              <BookComponent book={selectedBook} visible={modalVisible} onClose={closeModal} />
          </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 1 },
  header: { 
    fontSize: 40, 
    marginBottom: 10, 
    fontFamily: 'MalibuSunday', 
    color:"#585047" 
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
  bookAuthor: { 
    fontSize: 12, 
    color: "#e7e6df", 
    marginTop:5 
  },
  bookPages: { 
    fontSize: 17, 
    marginTop: 2, 
    color: "#585047", 
    fontWeight: "bold" 
  },
  pg: { 
    color: "#e7e6df" 
  },
  bkP: { 
    paddingRight: 10, 
    paddingTop: 10 
  },
  review: { 
    flexDirection: "row" 
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default ExploreSection;
