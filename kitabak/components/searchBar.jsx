import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleInputChange = (text) => {
    setQuery(text);
    onSearch(text);
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
    width: "70%", // Make the search bar take only 60% of the screen width
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
