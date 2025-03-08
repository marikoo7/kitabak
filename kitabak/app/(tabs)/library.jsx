import { View, StyleSheet } from "react-native";
import { useState } from "react";
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";

export default function LibraryScreen() {
  const [user, setUser] = useState({
    loggedIn: false,
    profilePic: "https://example.com/user-profile.jpg",
  });
  const [books, setBooks] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  return (
    <View style={styles.container}>

      <View style={styles.profileContainer}>
        <ProfilePic uri={user.loggedIn ? user.profilePic : null} size={80} />
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
