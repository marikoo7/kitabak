import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";
import ProfilePic from "@/components/profilePic";

const SPACING = 6;
const ITEM_MIN_WIDTH = 130;

function getNumColumns(width) {
  return Math.max(2, Math.floor(width / ITEM_MIN_WIDTH));
}

function formatData(data, numColumns) {
  const fullRows = Math.floor(data.length / numColumns);
  let remaining = data.length - fullRows * numColumns;
  while (remaining !== 0 && remaining < numColumns) {
    data.push({ id: `empty-${remaining}`, empty: true });
    remaining++;
  }
  return data;
}

export default function LibraryScreen() {
  const { width } = useWindowDimensions();
  const [userUID, setUserUID] = useState(null);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isFavorite, setIsFavorite] = useState({});
  const [numColumns, setNumColumns] = useState(3);
  const [listKey, setListKey] = useState("columns-3");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const router = useRouter();

  const CARD_WIDTH = (width - 32 - (numColumns - 1) * SPACING) / numColumns;

  useEffect(() => {
    const newColumns = getNumColumns(width);
    setNumColumns(newColumns);
    setListKey(`columns-${newColumns}`);
  }, [width]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUID(user.uid);
        await fetchLibrary(user.uid);
        await fetchFavorites(user.uid);

        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach((docu) => {
          if (docu.id === user.uid) {
            setProfilePicUri(docu.data().profilePic);
          }
        });
      } else {
        setUserUID(null);
      }
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userUID) {
        fetchLibrary(userUID);
        fetchFavorites(userUID);
      }
    }, [userUID])
  );

  const fetchLibrary = async (uid) => {
    const booksRef = collection(db, "users", uid, "library");
    const snapshot = await getDocs(booksRef);
    const books = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setLibraryBooks(books);
    const favIds = favoriteBooks.map((f) => f.id);
    const updated = {};
    books.forEach((b) => (updated[b.id] = favIds.includes(b.id)));
    setIsFavorite(updated);
    return books;
  };

  const fetchFavorites = async (uid) => {
    const favsRef = collection(db, "users", uid, "favorites");
    const snapshot = await getDocs(favsRef);
    const favs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFavoriteBooks(favs);
    return favs;
  };

  const handleFavoriteToggle = async (bookId) => {
    const bookIsFav = favoriteBooks.some((book) => book.id === bookId);

    if (bookIsFav) {
      await deleteDoc(doc(db, "users", userUID, "favorites", bookId));
      setFavoriteBooks((prev) => prev.filter((book) => book.id !== bookId));
      setIsFavorite((prev) => {
        const updated = { ...prev };
        updated[bookId] = false;
        return updated;
      });
    } else {
      let bookToAdd = libraryBooks.find((book) => book.id === bookId);

      if (!bookToAdd) {
        try {
          const booksSnapshot = await getDocs(collection(db, "books"));
          const allBooks = booksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          bookToAdd = allBooks.find((b) => b.id === bookId);
        } catch (e) {
          console.error("Error fetching book from books collection:", e);
          return;
        }
      }

      if (bookToAdd) {
        await setDoc(doc(db, "users", userUID, "favorites", bookId), bookToAdd);
        setFavoriteBooks((prev) => [...prev, bookToAdd]);
        setIsFavorite((prev) => ({ ...prev, [bookId]: true }));
      } else {
        console.error("Book not found anywhere.");
      }
    }
  };

  const handleRemoveBook = async (bookId) => {
    try {
      await deleteDoc(doc(db, "users", userUID, "library", bookId));
      setLibraryBooks((prevBooks) =>
        prevBooks.filter((book) => book.id !== bookId)
      );
      setIsFavorite((prev) => {
        const updated = { ...prev };
        delete updated[bookId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to remove book:", error);
    }
  };

  const booksToShow = useMemo(() => {
    const data = showFavorites ? favoriteBooks : libraryBooks;
    return formatData([...data], numColumns);
  }, [favoriteBooks, libraryBooks, showFavorites, numColumns]);

const handleBookPress = async (book) => {
    const newPagesRead = book.pages_read
      ? Math.min(
          book.page_count,
          book.pages_read + Math.ceil(book.page_count * 0.03)
        )
      : Math.ceil(book.page_count * 0.03);

    try {
      await setDoc(
        doc(db, "users", userUID, "library", book.id),
        {
          ...book,
          pages_read: newPagesRead,
        },
        { merge: true }
      );

      setLibraryBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.id === book.id ? { ...b, pages_read: newPagesRead } : b
        )
      );
    } catch (error) {
      console.error("Error updating pages_read:", error);
    }
  

    router.push({
      pathname: "/bookreading",
      params: {
        url: book.bookpdf,
        title: book.title,
        id: book.id,
      },
    });
  };
  
   

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileContainer}>
        <ProfilePic uri={profilePicUri} size={80} />
      </View>

      <View style={styles.searchContainer}>
        <SearchBar onSearch={setSearchResults} setSearchPerformed={setSearchPerformed} />
      </View>

      {searchPerformed && (
        <View style={styles.searchResult}>
          <SearchResult books={searchResults} searchPerformed={searchPerformed} />
        </View>
      )}

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
        key={listKey}
        data={booksToShow}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 12 }}
        columnWrapperStyle={{ gap: SPACING }}
        renderItem={({ item }) => {
          if (item.empty) return <View style={{ width: CARD_WIDTH }} />;
          const percent =
            item.page_count && item.pages_read
              ? Math.floor((item.pages_read / item.page_count) * 100)
              : 0;
          return (
            <View style={[styles.bookCardGrid, { width: CARD_WIDTH }]}>
              <TouchableOpacity onPress={() => handleBookPress(item)}>
                <Image
                  source={{
                    uri:
                      item.image ||
                      item.cover ||
                      "https://via.placeholder.com/140x210",
                  }}
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_WIDTH * 1.5,
                    borderRadius: 8,
                    resizeMode: "cover",
                  }}
                />
              </TouchableOpacity>

              <View style={styles.bottomContainer}>
                <Text style={styles.progressText}>{percent}%</Text>
                <TouchableOpacity
                  onPress={() => handleFavoriteToggle(item.id)}
                  style={styles.favoriteIcon}
                >
                  <Icon
                    name={
                      showFavorites || favoriteBooks.some((b) => b.id === item.id)
                        ? "heart"
                        : "heart-o"
                    }
                    size={20}
                    color={
                      showFavorites || favoriteBooks.some((b) => b.id === item.id)
                        ? "red"
                        : "#7d7362"
                    }
                  />
                </TouchableOpacity>
              </View>

              {!showFavorites && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveBook(item.id)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING,
    paddingTop: 20,
    backgroundColor: "#f4f6f5",
  },
  profileContainer: {
    position: "absolute",
    top: 33,
    right: 20,
  },
  searchContainer: {
    top: 45,
    left: 10,
  },
  searchResult: {
    position: "absolute",
    top: 100,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#585047",
    marginBottom: 10,
    fontFamily: "serif",
    marginTop: 60,
  },
  favoriteTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0eee9",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 14,
  },
  favoriteText: {
    fontSize: 20,
    color: "#585047",
    fontWeight: "bold",
    fontFamily: "serif",
  },
  bookCardGrid: {
    marginBottom: SPACING,
    alignItems: "center",
  },
  progressText: {
    fontSize: 13,
    color: "#7d7362",
    fontWeight: "bold",
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  favoriteIcon: {
    marginLeft: 6,
  },
  removeButton: {
    marginTop: 6,
    backgroundColor: "#eeeeee",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#444",
    fontSize: 12,
    fontWeight: "500",
  },
});
