import { View, StyleSheet, TouchableOpacity, Modal ,TouchableWithoutFeedback } from "react-native";
import React, { useEffect, useState,useCallback } from "react";
import { doc, setDoc ,deleteDoc,getDoc} from "firebase/firestore";
import { db, auth } from "../kitabak-server/firebaseConfig";
import { Text,  Image, ScrollView, } from "react-native";
import { useRouter } from "expo-router";
import { Button, AirbnbRating, CheckBox } from "@rneui/themed"; // npm install @rneui/themed @rneui/base

import Icon from "react-native-vector-icons/FontAwesome"; 

export default function BookComponent({ book, visible, onClose }) {
  
  const toggleModal = useCallback(() => {
    onClose();
  }, [onClose]);
  const [activeTab, setActiveTab] = useState("description");
  const [favorites, setFavorites] = useState([]); 
  const [checked, setChecked] = React.useState(false);
  

  const handleAddToLibrary = async () => {
    const user = auth.currentUser;
    if (user && book) {
      const bookRef = doc(db, "users", user.uid, "library", book.id);
      await setDoc(bookRef, book);
      router.push("/(tabs)/library");
      onClose();
    }
  };

  const handletoggleFavorite = (book) => {
    if (favorites.some((b) => b.id === book.id)) {
      setFavorites(favorites.filter((b) => b.id !== book.id));
    } else {
      setFavorites([...favorites, book]);
    }
  };

  
  const router = useRouter();

  
  const handleModalClose = (e) => {
    
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  

  return (
    
        <Modal
          visible={visible}
          animationType="slide"
          transparent={true}
          onRequestClose={toggleModal}
           presentationStyle="overFullScreen"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <TouchableWithoutFeedback onPress={handleModalClose}>
          <View style={styles.modalBackground}
           
          onPress={onClose}

          >
            <View style={styles.modalContent}>
              <View style={{ flexDirection: "row", }}>
              <View style={{ alignItems: "center" }}>
    <Image source={{ uri: book?.cover }} style={styles.bookImageInDialog} />

    
    <View style={{ flexDirection: "row", marginTop: 10 ,marginRight:10}}>
    <TouchableOpacity onPress={handleAddToLibrary} style={styles.addToLibraryBtn}>
    <Text style={styles.addToLibraryText}>Add to library</Text>
  </TouchableOpacity>

 < TouchableOpacity
  onPress={() => {
    if (book?. bookpdf) {
      router.push({
        pathname: "/bookreading",
        params: { url: book.bookpdf }
      });
      onClose(); 
    } else {
      alert("رابط الكتاب غير متاح");
    }
  }}
  style={{
      backgroundColor: "#4CAF50",
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 10,
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "bold" }}>Read</Text>
  </TouchableOpacity>
      
     <TouchableOpacity onPress={() => handletoggleFavorite(book)} style={styles.favoriteBtn}>
                       <Icon
                         name={favorites.some((b) => b.id === book.id) ? "heart" : "heart-o"}
                         size={20}
                         color={favorites.some((b) => b.id === book.id) ? "red" : "#ccc"}
                       />
                     </TouchableOpacity>
    </View>
  </View>
  <View style={{ flex: 1, marginLeft: 15, justifyContent: "space-around" }}>
    <AirbnbRating
      isDisabled={true}
      showRating={false}
      starStyle={{ color: "#585047" }}
      size={25}
    />
    <Text style={styles.bookTitleInDialog}>{book?.title}</Text>
    <Text style={styles.bookAuthorInDialog}>by {book?.author}</Text>
    <Text style={{ color: "#7d7362" }}>Genres:</Text>
    <Text style={styles.bookCategory}>{book?.genres}</Text>
  </View>
</View>

              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: '#7d7362' }}>Rate This Book</Text>
                <AirbnbRating
                  defaultRating={book?.rating || 0}
                  showRating={false}
                  starStyle={{ color: "#585047" }}
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
                    <Text style={styles.bookdescription}>{book?.description}</Text>
                  </ScrollView>
                ) : (
                  <ScrollView>
                    <Text style={styles.bookdescription}>No reviews yet.</Text>
                  </ScrollView>
                )}
              </View>
            </View>
          </View>
          </TouchableWithoutFeedback>
          </ScrollView>
        </Modal>
      
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
  bookdescription: {
    fontFamily: 'Arial',
    color:'#b0ad9a'
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  addToLibraryBtn: {
    backgroundColor: "#7d7362",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addToLibraryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  favoriteBtn: {
    backgroundColor: "#e7e6df",
    padding: 10,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  
});

