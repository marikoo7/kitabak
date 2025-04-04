import React, { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import { db } from "../../kitabak-server/firebaseConfig";
import { doc, Firestore, getDoc } from "firebase/firestore";
import {  useLocalSearchParams } from "expo-router";


export default function BookDetails() {
  const { id } =  useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      try {
        
        console.log("Book ID:", id);  // تأكيد أن ID يظهر بشكل صحيح
        const docRef = doc(db, "books", id);
        const docSnap = await getDoc(docRef);
        
        

        if (docSnap.exists()) {
          console.log("Book data:", docSnap.data());  // طباعة بيانات الكتاب
          setBook(docSnap.data());
          
        }else {
          console.error("No such document!");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching book details:", error);
        setLoading(false);
      }
    }
    fetchBook();
  }, [id]);
  console.log("Book ID:", id);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!book) {
    return <Text>Book not found- ID: {id}</Text>;
  }

  return (
    <View style={styles.container}>
      {/* <Image source={{ uri: book.image }} style={styles.image} /> */}
      {book?.cover && (
  <img 
    src={book.cover} 
    alt="Book Cover" 
    style={styles.image} 
  />
)}

      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>by {book.author}</Text>
      <Text style={styles.description}>{book.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  image: { width: 200, height: 300, alignSelf: "center",objectFit: 'cover' },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 10 },
  author: { fontSize: 18, color: "gray" },
  description: { marginTop: 20, fontSize: 16 },
});

