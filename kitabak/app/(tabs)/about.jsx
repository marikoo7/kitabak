import { Text, View ,TextInput, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";
import { useFonts } from "expo-font";
export default function AboutScreen() {
  const [user, setUser] = useState({
    loggedIn: false,
    profilePic: "https://example.com/user-profile.jpg",
  });
  const [books, setBooks] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  return (
    
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
              <ProfilePic uri={user.loggedIn ? user.profilePic : null} size={80} />
            </View>
      
            <View style={styles.searchContainer}>
              <SearchBar onSearch={setBooks} setSearchPerformed={setSearchPerformed} />
            </View>
      
            <View style={styles.searchResult}>
              <SearchResult books={books} searchPerformed={searchPerformed} />
            </View>
      <Text style={styles.title}>Happy reading,</Text>
      <Text style={styles.title}>with kitabak</Text>
      <Text style={styles.paragraph}>Welcome to Kitabak, your personal digital library designed for seamless reading and book management. Inspired by the best in the industry, Kitabak offers an intuitive and immersive experience for book lovers, making it easy to discover, organize, and access your books on multiple devices, ensuring a continuous reading journey.
      </Text>
      <Text style={styles.title}>The Team Behind </Text>
      <Text style={styles.title}>kitabak</Text>
      <Text style={styles.paragraph}>
      Our team includes Mariam Mahmoud, Mai Mohammed, Alaa Najah, Amira Haggag, Aya Aid, Nada Sameh, Rahma Mostafa,
      and Salma Medhat working together to craft an innovative reading platform.</Text>
      <Text style={styles.paragraph}>
      Stay tuned for updates as we continue to enhance Kitabak with new features and improvements!
      </Text>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  profileContainer: {
    position: "absolute",
    top: 23,
    right: 10,
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
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color:"#585047",
    fontFamily:"expo-font",
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 10,
    color:"#7d7362",
    fontFamily: 'Arial',
  },
})

