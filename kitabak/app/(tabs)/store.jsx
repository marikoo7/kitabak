import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  collection,
  onSnapshot,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import { useRouter } from "expo-router";
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";
import BookComponent from "../../components/book";
import Icon from "react-native-vector-icons/FontAwesome";

export default function StoreScreen() {
  const [allBooks, setAllBooks] = useState([]);
  const [book, setbook] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const [userUID, setUserUID] = useState(null);
  const [isFavoriteMap, setIsFavoriteMap] = useState({});
  const router = useRouter();

  const handleBookPress = (book) => {
    setbook(book);
    setDialogVisible(true);
  };

  const handleToggleFavorite = async (book) => {
    const isFav = isFavoriteMap[book.id];
    try {
      if (isFav) {
        await deleteDoc(doc(db, "users", userUID, "favorites", book.id));
      } else {
        await setDoc(doc(db, "users", userUID, "favorites", book.id), book);
      }
      setIsFavoriteMap((prev) => ({ ...prev, [book.id]: !isFav }));
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUID(user.uid);

        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            setProfilePicUri(userDoc.data().profilePic);
          }
        });

        // Load favorites
        const favsSnapshot = await getDocs(
          collection(db, "users", user.uid, "favorites")
        );
        const favIds = favsSnapshot.docs.map((doc) => doc.id);
        const favMap = {};
        favIds.forEach((id) => (favMap[id] = true));
        setIsFavoriteMap(favMap);

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

  const renderBook = ({ item }) => (
    <View style={styles.bookContainer}>
      <TouchableOpacity onPress={() => handleBookPress(item)}>
        <Image source={{ uri: item.cover }} style={styles.bookImage} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleToggleFavorite(item)}
        style={styles.heartIcon}
      >
        <Icon
          name={isFavoriteMap[item.id] ? "heart" : "heart-o"}
          size={20}
          color={isFavoriteMap[item.id] ? "red" : "#7d7362"}
        />
      </TouchableOpacity>
      <Text style={styles.bookTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.bookAuthor}>{item.author}</Text>
    </View>
  );

  const categorizeBooks = (genre) =>
    allBooks.filter(
      (book) =>
        book.genres && Array.isArray(book.genres) && book.genres.includes(genre)
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileContainer}>
          <ProfilePic uri={profilePicUri} size={80} />
        </View>

        <View style={styles.searchContainer}>
          <SearchBar onSearch={setbook} setSearchPerformed={setSearchPerformed} />
        </View>

        <View style={styles.searchResult}>
          <SearchResult books={book} searchPerformed={searchPerformed} />
        </View>

        {["Fictional", "Non-Fictional", "Fantasy", "Historical", "Romantic"].map(
          (genre, index) => (
            <View key={genre}>
              <Text style={index === 0 ? styles.header1 : styles.header}>
                {genre}
              </Text>
              <FlatList
                data={categorizeBooks(genre)}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={renderBook}
              />
            </View>
          )
        )}

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
    position: "absolute",
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
    fontFamily: "MalibuSunday",
  },
  header: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    color: "#7d7362",
    fontFamily: "MalibuSunday",
  },
  bookContainer: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    position: "relative",
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
  heartIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 2,
  },
});
