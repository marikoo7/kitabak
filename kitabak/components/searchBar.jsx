import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function SearchBar({ onSearch, setSearchPerformed }) {
  const [query, setQuery] = useState("");

  const handleInputChange = async (text) => {
    setQuery(text);

    if (text.trim() === "") {
      setSearchPerformed(false); // Mark that no search has been performed
      onSearch([]); // Clears results if input is empty
      return;
    }

    setSearchPerformed(true); // Search has now started

    try {
      const response = await fetch(`https://kitabak.vercel.app/search-books?query=${text}`);
      const data = await response.json();
      onSearch(data); // Pass results to parent component
    } catch (error) {
      console.error("Error fetching books:", error);
      onSearch([]); // Return empty if there's an error
    }
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
