import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;

export default function FavoritesScreen() {
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [userUID, setUserUID] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUID(user.uid);
        fetchFavorites(user.uid);
      } else {
        setUserUID(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchFavorites = async (uid) => {
    const favsRef = collection(db, "users", uid, "favorites");
    const favsSnapshot = await getDocs(favsRef);
    const favs = favsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFavoriteBooks(favs);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>

      <FlatList
        data={favoriteBooks}
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
    marginBottom: 20,
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
