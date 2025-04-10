import React from "react";
import {View,Text,StyleSheet,Image,Dimensions,ScrollView} from "react-native";
import book1 from "../assets/images/1 (3).png"
import book2 from "../assets/images/1 (4).png"
import book3 from "../assets/images/1 (5).png"
const { width } = Dimensions.get("window");

const BooksReadSection = () => {
  const booksRead = [
    { id: 1, image: book1 },
    { id: 2, image: book2 },
    { id: 3, image: book3 },
  ];

  const cardWidth = width * 0.20;
  const cardHeight = cardWidth * 1.5;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Books Read This Year</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {booksRead.map((book) => (
          <View
            key={book.id}
            style={[styles.card, { width: cardWidth, height: cardHeight }]}
          >
            <Image source={book.image} style={styles.bookImage} />
          </View>
        ))}
      </ScrollView>

      <Text style={styles.goalText}>3 more books to reach your goal ➔</Text>
      <Text style={styles.subText}>Keep reading!</Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    color: "#585047",
    marginBottom: 20,
    fontFamily: 'MalibuSunday'
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    margin:10
  },
  bookImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,

  },
  goalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5a4e3a",
  },
  subText: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
});

export default BooksReadSection;
