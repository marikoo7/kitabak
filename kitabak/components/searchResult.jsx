
import React, { useState } from "react";
import BookComponent from './book'; 
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from "react-native";

export default function BookList({ books, searchPerformed }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookForDetails, setBookForDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);


  if (searchPerformed && !books.length) {
    return <Text style={styles.noResults}>No books found</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookItem}
            onPress={() => setSelectedBook(item)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.author}>{item.author}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedBook && (
        <Modal transparent={true} animationType="slide" visible={true}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedBook(null)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>

              <Image
                source={{ uri: selectedBook.cover }}
                style={styles.bookImage}
              />

              <Text style={styles.modalTitle}>{selectedBook.title}</Text>
              <Text style={styles.modalAuthor}>BY {selectedBook.author}</Text>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setShowDetails(true);
                  setBookForDetails(selectedBook);
                  setSelectedBook(null);
                }}
              >
                <Text style={styles.addButtonText}>SHOW MORE DETAILS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showDetails && bookForDetails && (
        <BookComponent
          book={bookForDetails}
          visible={true}
          onClose={() => {
            setShowDetails(false);
            setBookForDetails(null);
          }}
        />
      )}
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
    backgroundColor: "#e7e6df",
    marginVertical: 2,
    borderRadius: 30,
    width: "70%",
  },
  bookItem: {
    padding: 12,
    backgroundColor: "#e7e6df",
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
  modalBackground: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "50%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "transparent",
  },
  closeButtonText: {
    fontSize: 30,
    color: "#333",
  },
  bookImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalAuthor: {
    fontSize: 16,
    color: "#777",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
