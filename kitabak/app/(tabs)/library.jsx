import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter,usePathname } from "expo-router";
import BookComponent from "../../components/book"; 

const screenWidth = Dimensions.get("window").width;

export default function LibraryScreen() {
  const [userUID, setUserUID] = useState(null);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isFavorite, setIsFavorite] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUID(user.uid);
        await fetchLibrary(user.uid);
        await fetchFavorites(user.uid);
      } else {
        setUserUID(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchLibrary = async (uid) => {
    const booksRef = collection(db, "users", uid, "library");
    const snapshot = await getDocs(booksRef);
    const books = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setLibraryBooks(books);
  };

  const fetchFavorites = async (uid) => {
    const favsRef = collection(db, "users", uid, "favorites");
    const snapshot = await getDocs(favsRef);
    const favs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFavoriteBooks(favs);

    const favoriteIds = favs.map((item) => item.id);
    const updatedIsFavorite = {};
    libraryBooks.forEach((book) => {
      updatedIsFavorite[book.id] = favoriteIds.includes(book.id);
    });
    setIsFavorite(updatedIsFavorite);
  };

  const handleFavoriteToggle = async (bookId) => {
    const isBookFavorite = isFavorite[bookId];

    if (isBookFavorite) {
      await deleteDoc(doc(db, "users", userUID, "favorites", bookId));
    } else {
      const bookToAdd = libraryBooks.find((book) => book.id === bookId);

      if (bookToAdd) {
        await setDoc(doc(db, "users", userUID, "favorites", bookId), bookToAdd);
      } else {
        console.error("Book not found in library.");
      }
    }

    setIsFavorite((prev) => ({ ...prev, [bookId]: !isBookFavorite }));
  };

  const booksToShow = showFavorites ? favoriteBooks : libraryBooks;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library</Text>

      <TouchableOpacity
        style={styles.favoriteTab}
        onPress={() => setShowFavorites(!showFavorites)}
      >
        <Text style={styles.favoriteText}>
          {showFavorites ? "Back to Library" : "Favorites"}
        </Text>
        <Icon
          name={showFavorites ? "chevron-left" : "chevron-right"}
          size={16}
          color="#7d7362"
        />
      </TouchableOpacity>

      <FlatList
        data={booksToShow}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.bookListContainer}
        renderItem={({ item }) => {
          const percent =
            item.page_count && item.pages_read
              ? Math.floor((item.pages_read / item.page_count) * 100)
              : 0;
          return (
            <View style={styles.bookCardGrid}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedBook(item);
                  setDialogVisible(true);
                }}
              >
                <Image
                  source={{
                    uri:
                      item.image ||
                      item.cover ||
                      "https://via.placeholder.com/140x210",
                  }}
                  style={styles.bookImageGrid}
                />
              </TouchableOpacity>
              <View style={styles.bottomContainer}>
                <Text style={styles.progressText}>{percent}%</Text>
                <TouchableOpacity
                  onPress={() => handleFavoriteToggle(item.id)}
                  style={styles.favoriteIcon}
                >
                  <Icon
                    name={isFavorite[item.id] ? "heart" : "heart-o"}
                    size={24}
                    color={isFavorite[item.id] ? "red" : "#7d7362"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      
      {selectedBook && (
        <BookComponent
          book={selectedBook}
          visible={dialogVisible}
          onClose={() => setDialogVisible(false)}
          readOnly={true} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7d7362",
    marginBottom: 10,
  },
  favoriteTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0eee9",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  favoriteText: {
    fontSize: 16,
    color: "#7d7362",
  },
  bookListContainer: {
    paddingBottom: 20,
  },
  bookCardGrid: {
    flexBasis: "30%",
    margin: 6,
    alignItems: "center",
    position: "relative",
  },
  bookImageGrid: {
    width: screenWidth / 3.5,
    height: 160,
    borderRadius: 10,
    resizeMode: "cover",
  },
  progressText: {
    fontSize: 14,
    color: "#7d7362",
    fontWeight: "bold",
    marginBottom: 8,
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
  },
  favoriteIcon: {
    marginLeft: 10,
  },
});
