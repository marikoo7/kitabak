import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { shuffle } from "lodash";
import bookImage1 from '../assets/WhatsApp Image 2025-02-28 at 22.12.03_defd0ce9.jpg';
import bookImage2 from '../assets/WhatsApp Image 2025-02-28 at 22.12.02_9c61f196.jpg';
import bookImage3 from '../assets/WhatsApp Image 2025-02-28 at 22.12.03_4283888e.jpg';
import bookImage4 from '../assets/WhatsApp Image 2025-02-28 at 22.12.03_da3a21c9.jpg';

const ExploreSection = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const bookData = [
      { id: "1", title: "Howl’s Moving Castle", author: "Diana Wynne Jones", pages: 290,review:120, image:bookImage4},
      { id: "2", title: "The Age of Doubt", author: "Pak Kyongni", pages: 128, review:7, image: bookImage1 },
      { id: "3", title: "1984", author: "George Orwell", pages: 328,review:50, image:bookImage3 },
      { id: "4", title: "Brave New World", author: "Aldous Huxley", pages: 311,review:80, image:bookImage2 },
    ];

    setBooks(shuffle(bookData));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        horizontal showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.bookContainer}>
            <View style={styles.excontainer}>
            <Image source={ item.image } style={styles.bookImage} />
            </View>
            <View style={styles.desc}>
            <Text style={styles.bookTitle}>{item.title}</Text>
            <Text style={styles.bookAuthor}>{item.author}</Text>
            <View style={styles.review}>
                <View style={styles.bkP}>
            <Text style={styles.bookPages}>{item.pages}</Text>
            <Text style={styles.pg}>pages</Text>
            </View>
            <View style={styles.bkP}>
            <Text style={styles.bookPages}>{item.review}</Text>
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
  container: { padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  bookContainer: {
    width: 300,
    marginRight: 10,
    padding: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    backgroundColor:'#b0ad9a',
    flexDirection:'row',
    justifyContent:"center"
  },excontainer:{
    paddingRight:20
  },desc:{
    justifyContent:'center',
  },
  bookImage: { width: 100, height: 150, borderRadius: 8 },
  bookTitle: { fontSize: 17, fontWeight: "bold", marginTop: 5 , color:"#7d7362"},
  bookAuthor: { fontSize: 12,color:'#e7e6df'},
  bookPages: { fontSize: 17, marginTop: 2,color:'#585047' ,fontWeight: "bold"},
  pg:{color:'#e7e6df'},
  bkP:{paddingRight:10, paddingTop:10},
  review:{
    flexDirection:'row',
  }
});

export default ExploreSection;