import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { shuffle } from "lodash";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../kitabak-server/firebaseConfig";

const ExploreSection = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setBooks(shuffle(booksData));
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All-Time Bestsellers</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.bookContainer}>
            <View style={styles.bestcontainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
            </View>
            <View style={styles.desc}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 1 },
  header: { fontSize: 30, marginBottom: 10,fontFamily: 'MalibuSunday' },
  bookContainer: {
    width: 230,
    marginRight: 10,
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 10,
    justifyContent: "center",
  },
  bestcontainer: {
    paddingRight: 20,
  },
  desc: {
    justifyContent: "center",
  },
  bookImage: { width: 200, height: 300, borderRadius: 8 },
  bookTitle: { fontSize: 17, fontWeight: "bold", marginTop: 5, color: "#7d7362" },
  bookAuthor: { fontSize: 12, color: "#b0ad9a" },
});

export default ExploreSection;
