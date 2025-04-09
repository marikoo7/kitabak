import { View, StyleSheet, TouchableOpacity } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import { Text, FlatList, Image, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Button, Dialog, AirbnbRating } from "@rneui/themed"; // npm install @rneui/themed @rneui/base

export default function StoreScreen() {
  const [allBooks, setAllBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [visible1, setVisible1] = useState(false);
  const router = useRouter();

  const toggleDialog1 = () => setVisible1(!visible1);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            setProfilePicUri(userDoc.data().profilePic);
          }
        });
        return () => unsubscribeDoc();
      } else {
        setProfilePicUri(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllBooks(booksArray);
      } catch (error) {
        console.error("Error fetching books: ", error);
      }
    };

    fetchBooks();
  }, []);

  const fictionalBooks = allBooks.filter(
    (book) => book.genres && Array.isArray(book.genres) && book.genres.includes("Fictional")
  );
    const nonFictionBooks = allBooks.filter(
    (book) => book.genres && Array.isArray(book.genres) && book.genres.includes("Non-Fictional")
  );
  
  const fantasyBooks = allBooks.filter(
    (book) => book.genres && Array.isArray(book.genres) && book.genres.includes("Fantasy")
  );
  
  const historicalBooks = allBooks.filter(
    (book) => book.genres && Array.isArray(book.genres) && book.genres.includes("Historical")
  );
  const romanticBooks = allBooks.filter(
    (book) => book.genres && Array.isArray(book.genres) && book.genres.includes("Romantic")
  );
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.profileContainer}>
        <ProfilePic uri={profilePicUri} size={80} />
      </View>

      <View style={styles.searchContainer}>
        <SearchBar onSearch={setBooks} setSearchPerformed={setSearchPerformed} />
      </View>

      <View style={styles.searchResult}>
        <SearchResult books={books} searchPerformed={searchPerformed} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Fictional</Text>
        <FlatList
          data={fictionalBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setSelectedBook(item); toggleDialog1(); }}>
              <View style={styles.bookContainer}>
                <Image source={{ uri: item.cover }} style={styles.bookImage} />
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.header}>Non-Fictional</Text>
        <FlatList
          data={nonFictionBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.bookContainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
          )}
        />

        <Text style={styles.header}>Fantasy</Text>
        <FlatList
          data={fantasyBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.bookContainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
          )}
        />

        <Text style={styles.header}>Historical</Text>
        <FlatList
          data={historicalBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.bookContainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
          )}
        />
        <Text style={styles.header}>Romantic</Text>
        <FlatList
          data={romanticBooks}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.bookContainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
          )}
        />

        <Dialog
          isVisible={visible1}
          onBackdropPress={toggleDialog1}
          overlayStyle={{
            borderRadius: 20,
            backgroundColor: "#e7e6df",
          }}
        >
          <View style={{ alignItems: "center", height: 500, justifyContent: "space-around" }}>
            <AirbnbRating isDisabled={true} starStyle={{ color: "#585047" }} size={25} />
            <Image source={{ uri: selectedBook?.cover }} style={styles.bookImageInDialog} />
            <Text style={styles.bookTitleInDialog}>{selectedBook?.title}</Text>
            <Text style={styles.bookAuthorInDialog}>by {selectedBook?.author}</Text>
            <Text style={styles.bookCategory}>{selectedBook?.genres}</Text>

            <Button
              title="More Details"
              onPress={() => {
                toggleDialog1();
                router.push(`/book/${selectedBook?.id}`);
              }}
              buttonStyle={{ backgroundColor: "#7d7362" }}
            />
          </View>
        </Dialog>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  profileContainer: {
    position: "absolute",
    top: 33,
    right: 20,
  },
  searchContainer: {
    top: 45,
    left: 10,
  },
  searchResult: {
    marginTop: 40,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    color: "#7d7362",
     fontFamily: 'MalibuSunday'
  },
  bookContainer: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  bookImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
    color: "#7d7362",
  },
  bookAuthor: {
    fontSize: 10,
    color: "#b0ad9a",
  },
  bookImageInDialog: {
    width: 220,
    height: 280,
    borderRadius: 8,
    marginBottom: 15,
    marginTop: -100,
  },
  bookTitleInDialog: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
    color: "#7d7362",
    marginTop: -200,
  },
  bookAuthorInDialog: {
    color: "gray",
    marginBottom: 10,
  },
  bookCategory: {
    marginTop: 10,
    marginBottom: 15,
  },
});
