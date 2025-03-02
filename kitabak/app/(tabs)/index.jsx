import { View, StyleSheet } from "react-native";
import { useState } from "react";
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";

export default function HomeScreen() {
  const [user, setUser] = useState({
    loggedIn: false,
    profilePic: "https://example.com/user-profile.jpg",
  });

  return (
    <View style={styles.container}>

      <View style={styles.profileContainer}>
        <ProfilePic uri={user.loggedIn ? user.profilePic : null} size={80} />
      </View>

      <View style={styles.searchContainer}>
        <SearchBar onSearch={(query) => console.log("Searching for:", query)} />
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
});
