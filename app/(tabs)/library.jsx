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
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;

export default function LibraryScreen() {
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [userUID, setUserUID] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUID(user.uid);
        fetchBooks(user.uid);
      } else {
        setUserUID(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchBooks = async (uid) => {
    const booksRef = collection(db, "users", uid, "library");
    const booksSnapshot = await getDocs(booksRef);
    const books = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLibraryBooks(books);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library</Text>

      <TouchableOpacity
        style={styles.favoriteTab}
        onPress={() => router.push("/FavoritesScreen")}
      >
        <Text style={styles.favoriteText}>Favorites</Text>
        <Icon name="chevron-right" size={16} color="#7d7362" />
      </TouchableOpacity>

      <FlatList
        data={libraryBooks}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.bookListContainer}
        renderItem={({ item }) => (
          <View style={styles.bookCardGrid}>
            <Image
              source={{ uri: item.image || item.cover || "https://via.placeholder.com/140x210" }}
              style={styles.bookImageGrid}
            />
          </View>
        )}
      />
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
  },
  bookImageGrid: {
    width: screenWidth / 3.5,
    height: 160,
    borderRadius: 10,
    resizeMode: "cover",
  },
});
