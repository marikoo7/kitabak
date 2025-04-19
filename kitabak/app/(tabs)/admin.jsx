import React, { useState, useEffect } from 'react';
import { View,Text,ScrollView,StyleSheet,TouchableOpacity,TextInput,Image,Alert,Modal,ActivityIndicator,KeyboardAvoidingView,Platform } from 'react-native';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc} from 'firebase/firestore';
import app from '../../kitabak-server/firebaseConfig';

const db = getFirestore(app);

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('');
  const [cover, setCover] = useState('');
  const [bookpdf, setBookpdf] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [bestseller, setBestseller] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const booksRef = collection(db, 'books');
      const snapshot = await getDocs(booksRef);
      const booksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBooks(booksData);
    } catch (error) {
      console.error('Error fetching books:', error);
      Alert.alert('Error', 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setDescription('');
    setGenres('');
    setCover('');
    setBookpdf('');
    setPageCount('');
    setBestseller(false);
    setEditingBook(null);
  };

  const openModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setTitle(book.title);
      setAuthor(book.author);
      setDescription(book.description);
      setGenres(book.genres.join(', '));
      setCover(book.cover);
      setBookpdf(book.bookpdf);
      setPageCount(book.page_count.toString());
      setBestseller(book.bestseller);
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert('Error', 'Title and Author are required');
      return;
    }

    try {
      const bookData = {
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        genres: genres.split(',').map(genre => genre.trim()).filter(Boolean),
        cover: cover.trim(),
        bookpdf: bookpdf.trim(),
        page_count: parseInt(pageCount) || 0,
        bestseller,
        reviews: 0, // New books start with 0 reviews
      };

      if (editingBook) {
        // Update existing book
        const bookRef = doc(db, 'books', editingBook.id);
        await updateDoc(bookRef, bookData);
        Alert.alert('Success', 'Book updated successfully');
      } else {
        // Add new book
        await addDoc(collection(db, 'books'), bookData);
        Alert.alert('Success', 'Book added successfully');
      }

      setModalVisible(false);
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      Alert.alert('Error', 'Failed to save book');
    }
  };

  const filteredBooks = books.filter(book => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.genres.some(genre => genre.toLowerCase().includes(searchTerm))
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add Book</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search books..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#7d7362" style={styles.loader} />
      ) : (
        <ScrollView style={styles.bookList}>
          {filteredBooks.map((book) => (
            <View key={book.id} style={styles.bookItem}>
              <Image source={{ uri: book.cover }} style={styles.bookCover} />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.bookAuthor}>by {book.author}</Text>
                {book.bestseller && <Text style={styles.bestseller}>Bestseller</Text>}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => openModal(book)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={styles.input}
                placeholder="Author"
                value={author}
                onChangeText={setAuthor}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              <TextInput
                style={styles.input}
                placeholder="Genres (comma-separated)"
                value={genres}
                onChangeText={setGenres}
              />

              <TextInput
                style={styles.input}
                placeholder="Cover Image URL"
                value={cover}
                onChangeText={setCover}
              />

              <TextInput
                style={styles.input}
                placeholder="PDF URL"
                value={bookpdf}
                onChangeText={setBookpdf}
              />

              <TextInput
                style={styles.input}
                placeholder="Page Count"
                value={pageCount}
                onChangeText={setPageCount}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setBestseller(!bestseller)}
              >
                <View style={[styles.checkbox, bestseller && styles.checkboxChecked]} />
                <Text style={styles.checkboxLabel}>Bestseller</Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>
                    {editingBook ? 'Update' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#7d7362',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loader: {
    marginTop: 20,
  },
  bookList: {
    flex: 1,
    padding: 16,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    width: 100,
    height: 150,
  },
  bookInfo: {
    flex: 1,
    padding: 12,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bestseller: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  editButton: {
    backgroundColor: '#7d7362',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#7d7362',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#7d7362',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  submitButton: {
    backgroundColor: '#7d7362',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});