import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ScrollView, useWindowDimensions, Alert } from "react-native";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";
import ProfilePic from "@/components/profilePic";
import { Menu, MenuItem } from 'react-native-material-menu';

const SPACING = 10;
const ITEM_MIN_WIDTH = 150;

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
  const [numColumns, setNumColumns] = useState(getNumColumns(width));
  const [listKey, setListKey] = useState(`columns-${getNumColumns(width)}`);
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const router = useRouter();
  const [menuVisibility, setMenuVisibility] = useState({});

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
    return () => unsubscribe();
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

  const handleMarkAsFinished = async (book) => {
    try {
      const finishedData = {
        id: String(book.id),
        title: book.title || "No Title",
        author: book.author || "Unknown Author",
        cover: book.cover || book.image || null,
        description: book.description || "",
        page_count: book.page_count || 0,
        genres: book.genres || [],
        finishedTimestamp: new Date().toISOString(),
      };
      
      await setDoc(doc(db, "users", userUID, "booksRead", book.id), finishedData);
      
      // Optionally update the book in library to show it's completed
      await setDoc(
        doc(db, "users", userUID, "library", book.id),
        {
          ...book,
          pages_read: book.page_count, // Mark as fully read
        },
        { merge: true }
      );
      
      // Update local state to reflect the change
      setLibraryBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.id === book.id ? { ...b, pages_read: book.page_count } : b
        )
      );
      
      // If the book is also in favorites, update that too
      if (isFavorite[book.id]) {
        await setDoc(
          doc(db, "users", userUID, "favorites", book.id),
          {
            ...book,
            pages_read: book.page_count,
          },
          { merge: true }
        );
        
        setFavoriteBooks((prevFavs) =>
          prevFavs.map((b) =>
            b.id === book.id ? { ...b, pages_read: book.page_count } : b
          )
        );
      }
      
      Alert.alert("Success", "Book marked as finished!");
    } catch (error) {
      console.error("Error marking book as finished:", error);
      Alert.alert("Error", "Failed to mark book as finished");
    }
  };

  const handleMarkAsUnfinished = async (book) => {
    try {
      // remove from booksRead collection if it exists there
      await deleteDoc(doc(db, "users", userUID, "booksRead", book.id));
      
      // reset how many pages the user has read
      const newPagesRead = Math.ceil(book.page_count * 0);
      
      await setDoc(
        doc(db, "users", userUID, "library", book.id),
        {
          ...book,
          pages_read: newPagesRead,
        },
        { merge: true }
      );
      
      // update local state to reflect the change
      setLibraryBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.id === book.id ? { ...b, pages_read: newPagesRead } : b
        )
      );
      
      // if the book is also in favorites, update that too
      if (isFavorite[book.id]) {
        await setDoc(
          doc(db, "users", userUID, "favorites", book.id),
          {
            ...book,
            pages_read: newPagesRead,
          },
          { merge: true }
        );
        
        setFavoriteBooks((prevFavs) =>
          prevFavs.map((b) =>
            b.id === book.id ? { ...b, pages_read: newPagesRead } : b
          )
        );
      }
      
      Alert.alert("Success", "Book marked as unfinished!");
    } catch (error) {
      console.error("Error marking book as unfinished:", error);
      Alert.alert("Error", "Failed to mark book as unfinished");
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

      if (isFavorite[book.id]) {
        await setDoc(
          doc(db, "users", userUID, "favorites", book.id),
          {
            ...book,
            pages_read: newPagesRead,
          },
          { merge: true }
        );
      }

      setLibraryBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.id === book.id ? { ...b, pages_read: newPagesRead } : b
        )
      );
      setFavoriteBooks((prevFavs) =>
        prevFavs.map((b) =>
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

  const showMenu = (bookId) => {
    setMenuVisibility(prevState => ({ ...prevState, [bookId]: true }));
  };

  const hideMenu = (bookId) => {
    setMenuVisibility(prevState => ({ ...prevState, [bookId]: false }));
  };

  const renderThreeDots = () => (
    <View style={styles.threeDotsContainer}>
      <View style={styles.dot} />
      <View style={styles.dot} />
      <View style={styles.dot} />
    </View>
  );

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
          color="#585047"
        />
      </TouchableOpacity>

      <FlatList
        key={listKey}
        data={booksToShow}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={{ marginTop: 15, paddingBottom: 20, paddingHorizontal: 16 }}
        columnWrapperStyle={{ gap: SPACING, marginBottom: 15 }}
        renderItem={({ item }) => {
          if (item.empty) return <View style={{ width: CARD_WIDTH }} />;
          const percent =
            item.page_count && item.pages_read
              ? Math.floor((item.pages_read / item.page_count) * 100)
              : 0;
          const isCurrentlyFavorite = favoriteBooks.some((b) => b.id === item.id);
          const isFinished = percent === 100;
          
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
                {!showFavorites && (
                  <Menu
                    visible={menuVisibility[item.id]}
                    onRequestClose={() => hideMenu(item.id)}
                    anchor={
                      <TouchableOpacity onPress={() => showMenu(item.id)}>
                        {renderThreeDots()}
                      </TouchableOpacity>
                    }
                    style={styles.menuContainer}
                  >
                    <MenuItem
                      onPress={() => { hideMenu(item.id); handleFavoriteToggle(item.id); }}
                      textStyle={styles.menuItemText} 
                    >
                      <Icon name={isCurrentlyFavorite ? "heart" : "heart-o"} size={16} color={isCurrentlyFavorite ? "#e74c3c" : "#585047"} style={styles.menuIcon} />
                      {isCurrentlyFavorite ? " Remove from Favorites" : " Add to Favorites"}
                    </MenuItem>
                    
                    {isFinished ? (
                      <MenuItem
                        onPress={() => { hideMenu(item.id); handleMarkAsUnfinished(item); }}
                        textStyle={styles.menuItemText}
                      >
                        <Icon name="undo" size={16} color="#e74c3c" style={styles.menuIcon} />
                        <Text>  Mark as Unfinished</Text>
                      </MenuItem>
                    ) : (
                      <MenuItem
                        onPress={() => { hideMenu(item.id); handleMarkAsFinished(item); }}
                        textStyle={styles.menuItemText}
                      >
                        <Icon name="check-circle-o" size={16} color="#2d502f" style={styles.menuIcon} />
                        <Text>  Mark as Finished</Text>
                      </MenuItem>
                    )}
                    
                    <MenuItem
                      onPress={() => { hideMenu(item.id); handleRemoveBook(item.id); }}
                      textStyle={styles.menuItemText}
                    >
                      <Icon name="trash-o" size={16} color="#e74c3c" style={styles.menuIcon} />
                       <Text>  Remove</Text>
                    </MenuItem>
                  </Menu>
                )}
                {showFavorites && (
                  <TouchableOpacity
                    onPress={() => handleFavoriteToggle(item.id)}
                    style={styles.favoriteIcon}
                  >
                    <Icon name="heart" size={20} color="red" />
                  </TouchableOpacity>
                )}
              </View>
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
    backgroundColor: "#f6f6f4",
    padding: 10,
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
    fontSize: 45,
    color: "#585047",
    marginBottom: 10,
    fontFamily: "MalibuSunday",
    marginTop: 90,
    marginLeft: 10,
  },
  favoriteTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e7e6df",
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 35,
    marginBottom: 14,
    marginLeft: 7,
  },
  favoriteText: {
    fontSize: 25,
    color: "#585047",
    fontFamily: "MalibuSunday",
  },
  bookCardGrid: {
    marginBottom: SPACING, 
    alignItems: "center",
  },
  progressText: {
    fontSize: 13,
    color: "#585047",
    fontWeight: "bold",
    flex: 1,
    textAlign: 'left',
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 10,
  },
  favoriteIcon: {
    marginLeft: 6,
  },
  threeDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#585047',
    marginLeft: 2.5,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuContainer: {
    backgroundColor: '#e7e6df',
    borderRadius: 8,
    width: 210,
  },
  menuItemText: {
    color: '#585047',
    fontSize: 16,
  },
});