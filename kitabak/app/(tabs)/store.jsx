import { View, StyleSheet, TouchableOpacity } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";
import { doc, onSnapshot, collection, getDocs ,setDoc ,deleteDoc} from "firebase/firestore";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import { Text, FlatList, Image, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Button, Dialog, AirbnbRating ,CheckBox } from "@rneui/themed"; // npm install @rneui/themed @rneui/base

export default function StoreScreen() {
  const [allBooks, setAllBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [visible1, setVisible1] = useState(false);
  const router = useRouter();

  const toggleDialog1 = () => setVisible1(!visible1);
  const [activeTab, setActiveTab] = useState("description");
  const [checked, setChecked] = React.useState(false);
  const toggleCheckbox = () => setChecked(prevChecked => !prevChecked);


    const handleAddToLibrary = async () => {
      const user = auth.currentUser;
      if (user && selectedBook) {
        const bookRef = doc(db, "users", user.uid, "library", selectedBook.id);
        await setDoc(bookRef, selectedBook);
        toggleDialog1();
        router.push("/library");
      }
    };

    const handleToggleFavorite = async () => {
      const user = auth.currentUser;
      if (user && selectedBook) {
        const favRef = doc(db, "users", user.uid, "favorites", selectedBook.id);
        if (checked) {
          await deleteDoc(favRef);
        } else {
          await setDoc(favRef, selectedBook);
        }
        setChecked(!checked);
      }
    };


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
          <View style ={{height :700 }}>
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            
            <Image source={{ uri: selectedBook?.cover }} style={styles.bookImageInDialog} />
            <View style={{ flex: 1, marginLeft: 15, justifyContent: "space-around" }}>
            <AirbnbRating
            isDisabled={false}
            // defaultRating={selectedBook?.rating || 0}
            showRating={false}
            starStyle={{ color: "#585047" }}
            size={25}
      />
            <Text style={styles.bookTitleInDialog}>{selectedBook?.title}</Text>
            <Text style={styles.bookAuthorInDialog}>by {selectedBook?.author}</Text>
            <Text style={{color :"#7d7362"}}>Greners:</Text>
            <Text style={styles.bookCategory}>{selectedBook?.genres}</Text>
            
            <View style={{ flexDirection: "row" }}>
            <Button
              title="Add to library"
              width='600'
              onPress={() => {handleAddToLibrary;
                router.push("/library")
              }}
              buttonStyle={{ backgroundColor: "#7d7362" , paddingHorizontal: 100, }}
              
            />
            <CheckBox
           checked={checked}
           checkedIcon="heart"
           uncheckedIcon="heart-o"
           checkedColor="red"
           uncheckedColor="#7d7362"
           onPress={() =>{handleToggleFavorite;
            setChecked(!checked);
           }}
           backgroundColor="#e7e6df"
           
           containerStyle={{
            backgroundColor: "transparent",
            borderWidth: 0,
            padding: 0,
            margin: 6,
          }}
           
         />
            </View>
         
         
       
          </View>
          </View>
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Text style={{color :'#7d7362'}}>Rate This Book</Text>
      <AirbnbRating
        
        defaultRating={selectedBook?.rating || 0}
        showRating={false}
        starStyle={{ color: "#585047",}}
        size={25}
      />
    </View>
    
    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
  <TouchableOpacity
    onPress={() => setActiveTab("description")}
    style={{
      padding: 10,
      borderBottomWidth: activeTab === "description" ? 2 : 0,
      borderBottomColor: "#7d7362",
      marginRight: 20,
    }}
  >
    <Text style={{ color: "#7d7362", fontWeight: activeTab === "description" ? "bold" : "normal" }}>
      Description
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setActiveTab("reviews")}
    style={{
      padding: 10,
      borderBottomWidth: activeTab === "reviews" ? 2 : 0,
      borderBottomColor: "#7d7362",
    }}
  >
    <Text style={{ color: "#7d7362", fontWeight: activeTab === "reviews" ? "bold" : "normal" }}>
      Reviews
    </Text>
  </TouchableOpacity>
</View>
<View style={{ marginTop: 10 }}>
      {activeTab === "description" ? (
        <ScrollView>
          <Text style={styles.bookdescription}>{selectedBook?.description}</Text>
        </ScrollView>
      ) : (
        <ScrollView>
          <Text style={styles.bookdescription}>No reviews yet.</Text>
        </ScrollView>
      )}
    </View>
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
     
  },
  bookContainer: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  bookImage: {
    width: 200,
    height: 300,
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
    height: 330,
    borderRadius: 8,
   
   
  },
  bookTitleInDialog: {
    fontWeight: "bold",
    fontFamily: 'MalibuSunday',
    fontSize: 28,
    marginBottom: 5,
    color: "#7d7362",
    
  },
  bookAuthorInDialog: {
    color: "gray",
    marginBottom: 10,
  },
  bookCategory: {
    fontFamily: 'MalibuSunday',
    marginTop: 10,
    marginBottom: 15,
    color:'#b0ad9a'
  },
  bookdescription:{
    fontFamily: 'Arial',
    color:'#b0ad9a'
  }
});
