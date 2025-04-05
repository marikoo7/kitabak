import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../kitabak-server/firebaseConfig"; 
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";

export default function HomeScreen() {
  const [books, setBooks] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState(null);

  useEffect(() => {
    const fetchUserProfilePic = () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfilePicUri(userData.profilePic);
          }
        });

        return () => unsubscribe();
      }
    };

    fetchUserProfilePic();
  }, []); 

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <ProfilePic uri={profilePicUri} size={80} />
      </View>

      <View style={styles.searchContainer}>
        <SearchBar onSearch={setBooks} setSearchPerformed={setSearchPerformed} />
      </View>

      <View style={styles.searchResult}>
        <SearchResult books={books} searchPerformed={searchPerformed} />
      </View>
    </View>
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
    top: 35,
    left: 10,
  },
  searchResult: {
    flex: 1,
    marginTop: 40,
    paddingHorizontal: 10,
  },
});
