import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { fetchBooks, searchBooks } from "../../kitabak/kitabak-server/database"; 

export default function SearchBar({ onSearch, setSearchPerformed }) {
  const [query, setQuery] = useState("");
  const [allBooks, setAllBooks] = useState([]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const books = await fetchBooks();
        setAllBooks(books || []); 
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    loadBooks();
  }, []);

  const handleInputChange = (text) => {
    setQuery(text);

    if (!text.trim()) {
      setSearchPerformed(false);
      onSearch([]);
      return;
    }

    setSearchPerformed(true);
    onSearch(searchBooks(text, allBooks));
  };
  
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color="#b0ad9a" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search books by name, author, or genre..."
        placeholderTextColor="#b0ad9a"
        value={query}
        onChangeText={handleInputChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7e6df",
    borderRadius: 50,
    paddingHorizontal: 18,
    height: 50,
    width: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
    color: "#b0ad9a",
    outlineStyle: "none",
  },
});
