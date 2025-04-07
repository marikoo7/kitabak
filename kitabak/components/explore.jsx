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
      <Text style={styles.header}>Explore</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.bookContainer}>
            <View style={styles.excontainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
            </View>
            <View style={styles.desc}>
              <Text style={styles.bookTitle}>{item.title}</Text>
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
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 1},
  header: { fontSize: 30, marginBottom: 10,fontFamily: 'MalibuSunday' },
  bookContainer: {
    width: 300,
    marginRight: 10,
    padding: 10,
    backgroundColor: "#b0ad9a",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",

  },
  excontainer: {
    paddingRight: 20,
  },
  desc: {
    justifyContent: "center",
  },
  bookImage: { width: 100, height: 150, borderRadius: 8 },
  bookTitle: { fontSize: 17, fontWeight: "bold", marginTop: 5, color: "#7d7362" },
  bookAuthor: { fontSize: 12, color: "#e7e6df" },
  bookPages: { fontSize: 17, marginTop: 2, color: "#585047", fontWeight: "bold" },
  pg: { color: "#e7e6df" },
  bkP: { paddingRight: 10, paddingTop: 10 },
  review: {
    flexDirection: "row",
  },
});

export default ExploreSection;
