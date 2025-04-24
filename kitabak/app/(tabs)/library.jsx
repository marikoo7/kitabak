import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProfilePic from "@/components/profilePic";
import Icon from "react-native-vector-icons/FontAwesome";

const screenWidth = Dimensions.get("window").width;

export default function LibraryScreen() {
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("library");
  const [userUID, setUserUID] = useState(null);
  const [search, setSearch] = useState("");
  const [profilePicUri, setProfilePicUri] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUID(user.uid);
        fetchBooks(user.uid);
        setProfilePicUri(user.photoURL);
      } else {
        setUserUID(null);
      }
    });

    return () => unsubscribe();
  }, [activeTab]);

  const fetchBooks = async (uid) => {
    const booksRef = collection(db, "users", uid, "library");
    const favsRef = collection(db, "users", uid, "favorites");

    const booksSnapshot = await getDocs(booksRef);
    const favsSnapshot = await getDocs(favsRef);

    const books = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const favs = favsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setLibraryBooks(books);
    setFavoriteBooks(favs);
  };

  const toggleFavorite = async (book) => {
    if (!userUID) return;
    const favRef = doc(db, "users", userUID, "favorites", book.id);
    const isFav = favoriteBooks.some(b => b.id === book.id);

    if (isFav) {
      await deleteDoc(favRef);
      setFavoriteBooks(favoriteBooks.filter(b => b.id !== book.id));
    } else {
      await setDoc(favRef, book);
      setFavoriteBooks([...favoriteBooks, book]);
    }
  };

  const isFavorite = (bookId) => {
    return favoriteBooks.some(b => b.id === bookId);
  };

  const booksToDisplay =
    activeTab === "library"
      ? libraryBooks.filter((book) =>
          book.title?.toLowerCase().includes(search.toLowerCase())
        )
      : favoriteBooks.filter((book) =>
          book.title?.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View style={styles.topContainer}>
        <TextInput
          placeholder="Search books"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <ProfilePic uri={profilePicUri} size={40} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "library" && styles.activeTab]}
          onPress={() => setActiveTab("library")}
        >
          <Text style={styles.tabText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "favorites" && styles.activeTab]}
          onPress={() => setActiveTab("favorites")}
        >
          <Text style={styles.tabText}>favorites</Text>
        </TouchableOpacity>
      </View>

      {/* Books Grid */}
      <FlatList
        data={booksToDisplay}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bookListContainer}
        renderItem={({ item }) => {
          const percent =
            item.page_count && item.pages_read
              ? Math.floor((item.pages_read / item.page_count) * 100)
              : 0;

          return (
            <View style={styles.bookCardGrid}>
              <Image
                source={{ uri: item.image || item.cover || "https://via.placeholder.com/140x210" }}
                style={styles.bookImageGrid}
              />
              <View style={styles.bookFooter}>
                <Text style={styles.progressText}>
                  {percent === 100 ? "Finished" : `${percent}%`}
                </Text>
                <TouchableOpacity onPress={() => toggleFavorite(item)}>
                  <Icon
                    name={isFavorite(item.id) ? "heart" : "heart-o"}
                    color={isFavorite(item.id) ? "red" : "#7d7362"}
                    size={16}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 15,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f0eee9",
    borderRadius: 25,
    paddingHorizontal: 20,
    marginRight: 10,
    color: "#7d7362",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tab: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#7d7362",
  },
  tabText: {
    fontSize: 16,
    color: "#7d7362",
  },
  bookListContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  bookCardGrid: {
    flexBasis: "30%",
    margin: 6,
    alignItems: "center",
  },
  bookImageGrid: {
    width: screenWidth / 3.5,
    height: 160,
    borderRadius: 10,
    resizeMode: "cover",
  },
  bookFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    paddingHorizontal: 6,
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#7d7362",
  },
});
