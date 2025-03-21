import React from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function BookList({ books, searchPerformed }) {
  if (searchPerformed && !books.length) {
    return <Text style={styles.noResults}>No books found</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.bookItem}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.author}>{item.author}</Text>
          </TouchableOpacity>
        )}
        style={{ scrollbarWidth: "none"}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noResults: {
    textAlign: "center",
    marginTop: 5,
    fontSize: 16,
    color: "#b0ad9a",
    padding: 12,
    backgroundColor: "rgba(231, 230, 223, 0.5)",
    marginVertical: 2,
    borderRadius: 30,
    width: "70%",
  },
  bookItem: {
    padding: 12,
    backgroundColor: "rgba(231, 230, 223, 0.5)",
    marginVertical: 2,
    borderRadius: 30,
    width: "70%",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7d7362",
    marginLeft: 15,
  },
  author: {
    fontSize: 14,
    color: "#b0ad9a",
    marginLeft: 15,
  },
});
