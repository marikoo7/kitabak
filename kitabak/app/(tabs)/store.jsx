import { View, StyleSheet, TouchableOpacity } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";
import { doc, onSnapshot, collection, getDocs ,setDoc ,deleteDoc} from "firebase/firestore";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import { Text, FlatList, Image, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import BookComponent from "../../components/book"
export default function StoreScreen() {
  const [allBooks, setAllBooks] = useState([]);
  const [book, setbook] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const router = useRouter();
  
  
    const handleBookPress = (book) => {
      setbook(book);
      setDialogVisible(true);
    };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            setProfilePicUri(userDoc.data().profilePic);
          }
        });
        return () => unsubscribeDoc();
      } else {
        setProfilePicUri(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllBooks(booksArray);
      } catch (error) {
        console.error("Error fetching books: ", error);
      }
    };

    fetchBooks();
  }, []);

  const fictionalBooks = allBooks.filter(
    (book) => book.genres && Array.isArray(book.genres) && book.genres.includes("Fictional")
  );
    const nonFictionBooks = allBooks.filter(
    (book) => book.genres && Array.isArray(book.genres) && book.genres.includes("Non-Fictional")
  );
  
  const fantasyBooks = allBooks.filter(
    (book) => book.genres && Array.isArray(book.genres) && book.genres.includes("Fantasy")
  );
  
  const historicalBooks = allBooks.filter(
    (book) => book.genres && Array.isArray(book.genres) && book.genres.includes("Historical")
  );
  const romanticBooks = allBooks.filter(
    (book) => book.genres && Array.isArray(book.genres) && book.genres.includes("Romantic")
  );
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileContainer}>
        <ProfilePic uri={profilePicUri} size={80} />
      </View>

      <View style={styles.searchContainer}>
        <SearchBar onSearch={setbook} setSearchPerformed={setSearchPerformed} />
      </View>

      <View style={styles.searchResult}>
        <SearchResult books={book} searchPerformed={searchPerformed} />
      </View>
        <Text style={styles.header1}>Fictional</Text>
        <FlatList
          data={fictionalBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleBookPress(item)}>
              
              <View style={styles.bookContainer}>
                <Image source={{ uri: item.cover }} style={styles.bookImage} />
                <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.header}>Non-Fictional</Text>
        <FlatList
          data={nonFictionBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleBookPress(item)}>
            <View style={styles.bookContainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
              <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.header}>Fantasy</Text>
        <FlatList
          data={fantasyBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleBookPress(item)}>
            <View style={styles.bookContainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
              <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.header}>Historical</Text>
        <FlatList
          data={historicalBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleBookPress(item)}>
            <View style={styles.bookContainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
              <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
            </TouchableOpacity>
          )}
        />
        <Text style={styles.header}>Romantic</Text>
        <FlatList
          data={romanticBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleBookPress(item)}>
            <View style={styles.bookContainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
              <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
            </TouchableOpacity>
          )}
        />
        <BookComponent
        book={book}
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
      />

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },

  profileContainer: {
    position: "absolute",
    top: 45,
    right: 30,
  },
  searchContainer: {
    top: 40,
    left: 5,
  },
  searchResult: {
    position: 'absolute', 
    top: 100, 
    left: 20,
    right: 10,
    zIndex: 10,
  },
  header1: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 100,
    color: "#7d7362",
    fontFamily: 'MalibuSunday',
  },
  header: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    color: "#7d7362",
    fontFamily: 'MalibuSunday',
  },
  bookContainer: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  bookImage: {
    width: 200,
    height: 300,
    borderRadius: 8,
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
    fontSize: 10,
    color: "#b0ad9a",
  },
  
});
