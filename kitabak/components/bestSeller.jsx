// import React, { useState, useEffect } from "react";
// import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
// import { shuffle } from "lodash";
// import { collection, getDocs, setDoc, doc } from "firebase/firestore";
// import { db, auth } from "../kitabak-server/firebaseConfig";
// import Icon from "react-native-vector-icons/FontAwesome";
// import { useRouter } from "expo-router";

// const ExploreSection = () => {
//   const [books, setBooks] = useState([]);
//   const [selectedBook, setSelectedBook] = useState(null);
//   const [favorites, setFavorites] = useState([]);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchBooks = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "books"));
//         const booksData = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })).filter((book) => book.bestseller === true);
//         setBooks(shuffle(booksData));
//       } catch (error) {
//         console.error("Error fetching books:", error);
//       }
//     };

//     fetchBooks();
//   }, []);

//   const addToLibrary = async (book) => {
//     const user = auth.currentUser;

//     if (!user) {
//       console.log("🚫 User not logged in");
//       return;
//     }

//     try {
//       const bookRef = doc(db, "users", user.uid, "library", book.id);
//       await setDoc(bookRef, {
//         id: book.id,
//         title: book.title,
//         author: book.author,
//         description: book.description,
//         image: book.cover || book.image || "https://via.placeholder.com/200x300",
//       });

//       console.log("✅ Book added to Firestore library:", book.title);
//       setSelectedBook(null); // Close modal
//       router.push("/library"); // Navigate to Library page
//     } catch (error) {
//       console.error("❌ Error adding to library:", error);
//     }
//   };

//   const toggleFavorite = (book) => {
//     if (favorites.some((b) => b.id === book.id)) {
//       setFavorites(favorites.filter((b) => b.id !== book.id));
//     } else {
//       setFavorites([...favorites, book]);
//     }
//   };

//   const handleRating = (book, rating) => {
//     setSelectedBook({ ...selectedBook, rating });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>All-Time Bestsellers</Text>
//       <FlatList
//         data={books}
//         keyExtractor={(item) => item.id}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => setSelectedBook(item)} style={styles.bookContainer}>
//             <View style={styles.bestcontainer}>
//               <Image source={{ uri: item.cover }} style={styles.bookImage} />
//             </View>
//             <View style={styles.desc}>
//                <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
//               <Text style={styles.bookAuthor}>{item.author}</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//       />

//       {/* Modal */}
//       {selectedBook && (
//         <Modal transparent animationType="fade">
//           <View style={styles.modalBackground}>
//             <View style={styles.modalContainer}>
//               <TouchableOpacity onPress={() => setSelectedBook(null)} style={styles.closeIcon}>
//                 <Text style={{ fontSize: 18 }}>✖</Text>
//               </TouchableOpacity>

//               <Image source={{ uri: selectedBook.cover }} style={styles.modalImage} />
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>{selectedBook.title}</Text>
//                 <TouchableOpacity onPress={() => toggleFavorite(selectedBook)} style={styles.favoriteBtn}>
//                   <Icon
//                     name={favorites.some((b) => b.id === selectedBook.id) ? "heart" : "heart-o"}
//                     size={20}
//                     color={favorites.some((b) => b.id === selectedBook.id) ? "red" : "#ccc"}
//                   />
//                 </TouchableOpacity>
//               </View>

//               <Text style={styles.modalAuthor}>{selectedBook.author}</Text>

//               <ScrollView style={styles.modalDescContainer}>
//                 <Text style={styles.modalDesc}>{selectedBook.description || "No description available."}</Text>
//               </ScrollView>

//               <Text style={styles.rateText}>Rate this book</Text>
//               <View style={styles.starsContainer}>
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <TouchableOpacity key={star} onPress={() => handleRating(selectedBook, star)}>
//                     <Icon
//                       name="star"
//                       size={20}
//                       color={star <= (selectedBook.rating || 0) ? "#FFD700" : "#ccc"}
//                     />
//                   </TouchableOpacity>
//                 ))}
//                 <Text style={styles.ratingNumber}>{selectedBook.rating ? selectedBook.rating.toFixed(1) : "0.0"}</Text>
//               </View>

//               <TouchableOpacity onPress={() => addToLibrary(selectedBook)} style={styles.addBtn}>
//                 <Text style={styles.addBtnText}>Add to Library</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 1 },
//   header: { fontSize: 40, marginBottom: 10, fontFamily: 'MalibuSunday',color:"#585047" },
//   bookContainer: {
//     width: 200,
//     marginRight: 12,
//     padding: 10,
//     borderRadius: 10,
//     justifyContent: "center",
//   },
//   bestcontainer: { paddingRight: 20 },
//   desc: { justifyContent: "center" },
//   bookImage: { width: 200, height: 300, borderRadius: 8 },
//   bookTitle: {
//     fontSize: 17,
//     fontWeight: "bold",
//     marginTop: 5,
//     color: "#7d7362",
//     maxWidth: 170,
//     lineHeight: 20, 
//   },
//   bookAuthor: { fontSize: 12, color: "#b0ad9a" },

//   // Modal styles
//   modalBackground: {
//     flex: 1,
//     backgroundColor: '#000000aa',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: 300,
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 20,
//     position: 'relative',
//   },
//   closeIcon: {
//     position: 'absolute',
//     right: 10,
//     top: 10,
//     zIndex: 1,
//   },
//   modalImage: {
//     width: 120,
//     height: 180,
//     alignSelf: 'center',
//     borderRadius: 10,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 10,
//     textAlign: 'center',
//     marginLeft: 30,
//   },
//   modalAuthor: {
//     textAlign: 'center',
//     color: '#555',
//     marginBottom: 10,
//   },
//   modalDescContainer: {
//     paddingBottom: 15,
//   },
//   modalDesc: {
//     fontSize: 13,
//     marginBottom: 15,
//     textAlign: 'center',
//     maxHeight: 200,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     textAlign: 'center',
//     width: '100%',
//   },
//   favoriteBtn: {
//     marginLeft: 10,
//   },
//   rateText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginTop: 10,
//   },
//   starsContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   ratingNumber: {
//     fontSize: 18,
//     marginLeft: 10,
//     color: "#FFD700",
//   },
//   addBtn: {
//     backgroundColor: '#222',
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 20,
//     marginLeft: 22,
//     width: '80%',
//   },
//   addBtnText: {
//     color: '#fff',
//     textAlign: 'center',     
//   },
// });

// export default ExploreSection;
       








// import React, { useState, useEffect } from "react";
// import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
// import { shuffle } from "lodash";
// import { collection, getDocs, setDoc, doc } from "firebase/firestore";
// import { db, auth } from "../kitabak-server/firebaseConfig";
// import Icon from "react-native-vector-icons/FontAwesome";
// import { useRouter } from "expo-router";

// const ExploreSection = () => {
//   const [books, setBooks] = useState([]);
//   const [selectedBook, setSelectedBook] = useState(null);
//   const [favorites, setFavorites] = useState([]);
//   const [activeTab, setActiveTab] = useState("description");
//   const router = useRouter();

//   useEffect(() => {
//     const fetchBooks = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "books"));
//         const booksData = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })).filter((book) => book.bestseller === true);
//         setBooks(shuffle(booksData));
//       } catch (error) {
//         console.error("Error fetching books:", error);
//       }
//     };

//     fetchBooks();
//   }, []);

//   const addToLibrary = async (book) => {
//     const user = auth.currentUser;

//     if (!user) {
//       console.log("🚫 User not logged in");
//       return;
//     }

//     try {
//       const bookRef = doc(db, "users", user.uid, "library", book.id);
//       await setDoc(bookRef, {
//         id: book.id,
//         title: book.title,
//         author: book.author,
//         description: book.description,
//         image: book.cover || book.image || "https://via.placeholder.com/200x300",
//       });

//       console.log("✅ Book added to Firestore library:", book.title);
//       setSelectedBook(null); // Close modal
//       router.push("/library"); // Navigate to Library page
//     } catch (error) {
//       console.error("❌ Error adding to library:", error);
//     }
//   };

//   const toggleFavorite = (book) => {
//     if (favorites.some((b) => b.id === book.id)) {
//       setFavorites(favorites.filter((b) => b.id !== book.id));
//     } else {
//       setFavorites([...favorites, book]);
//     }
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>All-Time Bestsellers</Text>
//       <FlatList
//         data={books}
//         keyExtractor={(item) => item.id}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => setSelectedBook(item)} style={styles.bookContainer}>
//             <View style={styles.bestcontainer}>
//               <Image source={{ uri: item.cover }} style={styles.bookImage} />
//             </View>
//             <View style={styles.desc}>
//               <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
//               <Text style={styles.bookAuthor}>{item.author}</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//       />

//       {/* Modal */}
//       // ✨ هذا داخل ExploreSection.jsx ✨

// {selectedBook && (
//   <Modal transparent animationType="fade">
//     <View style={styles.modalBackground}>
//       <View style={styles.modalContainer}>
//         <TouchableOpacity onPress={() => setSelectedBook(null)} style={styles.closeIcon}>
//           <Text style={{ fontSize: 18 }}>✖</Text>
//         </TouchableOpacity>

//         <View style={styles.modalTopContent}>
//           <Image source={{ uri: selectedBook.cover }} style={styles.modalImage} />
//           <View style={styles.modalTextContainer}>
//             <Text style={styles.modalTitle}>{selectedBook.title}</Text>
//             <Text style={styles.modalAuthor}>{selectedBook.author}</Text>

//             <View style={styles.starsContainer}>
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <Icon
//                   key={star}
//                   name="star"
//                   size={20}
//                   color={star <= 3 ? "#FFD700" : "#ccc"}
//                 />
//               ))}
//             </View>
//           </View>
//         </View>

//         {/* Tabs */}
//         <View style={styles.tabContainer}>
//           <TouchableOpacity onPress={() => handleTabChange("description")}>
//             <Text style={[styles.tabText, activeTab === "description" && styles.activeTab]}>Description</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => handleTabChange("reviews")}>
//             <Text style={[styles.tabText, activeTab === "reviews" && styles.activeTab]}>Reviews</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Description / Reviews */}
//         <ScrollView style={styles.modalDescContainer}>
//           {activeTab === "description" ? (
//             <Text style={styles.modalDesc}>{selectedBook.description || "No description available."}</Text>
//           ) : (
//             <Text style={styles.modalDesc}>No reviews yet. Please add reviews.</Text>
//           )}
//         </ScrollView>

//         {/* Add to Library Button */}
//         <TouchableOpacity onPress={() => addToLibrary(selectedBook)} style={styles.addBtn}>
//           <Text style={styles.addBtnText}>Add to Library</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   </Modal>
// )}

//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 1 },
//   header: { fontSize: 40, marginBottom: 10, fontFamily: 'MalibuSunday', color: "#585047" },
//   bookContainer: {
//     width: 200,
//     marginRight: 12,
//     padding: 10,
//     borderRadius: 10,
//     justifyContent: "center",
//   },
//   bestcontainer: { paddingRight: 20 },
//   desc: { justifyContent: "center" },
//   bookImage: { width: 200, height: 300, borderRadius: 8 },
//   bookTitle: {
//     fontSize: 17,
//     fontWeight: "bold",
//     marginTop: 5,
//     color: "#7d7362",
//     maxWidth: 170,
//     lineHeight: 20,
//   },
//   bookAuthor: { fontSize: 12, color: "#b0ad9a" },

//   // Modal styles
//   modalBackground: {
//     flex: 1,
//     backgroundColor: '#000000aa',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: 320,
//     height:350,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     elevation: 5,
//     position: 'relative',
//   },
//   closeIcon: {
//     position: 'absolute',
//     right: 10,
//     top: 10,
//     zIndex: 1,
//   },
//   modalTopContent: {
//     height:90,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//     marginTop: 10,
//   },
//   modalImage: {
//     width: 100,
//     height: 150,
//     borderRadius: 10,
//   },
//   modalTextContainer: {
//     marginLeft: 15,
//     flex: 1,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   modalAuthor: {
//     fontSize: 14,
//     color: '#777',
//     marginBottom: 10,
//   },
//   starsContainer: {
//     flexDirection: "row",
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 10,
//     marginBottom: 5,
//   },
//   tabText: {
//     fontSize: 16,
//     color: "#585047",
//   },
//   activeTab: {
//     color: "#7d7362",
//     textDecorationLine: 'underline',
//     fontWeight: 'bold',
//   },
//   modalDescContainer: {
//     maxHeight: 180,
//     marginTop: 10,
//   },
//   modalDesc: {
//     fontSize: 14,
//     textAlign: 'center',
//     color: '#444',
//     paddingHorizontal: 10,
//   },
//   addBtn: {
//     backgroundColor: '#7d7362',
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 20,
//     width: '100%',
//   },
//   addBtnText: {
//     color: '#fff',
//     textAlign: 'center',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default ExploreSection;










import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { shuffle } from "lodash";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db, auth } from "../kitabak-server/firebaseConfig";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";

const ExploreSection = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const router = useRouter();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).filter((book) => book.bestseller === true);
        setBooks(shuffle(booksData));
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  const addToLibrary = async (book) => {
    const user = auth.currentUser;

    if (!user) {
      console.log("🚫 User not logged in");
      return;
    }

    try {
      const bookRef = doc(db, "users", user.uid, "library", book.id);
      await setDoc(bookRef, {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        image: book.cover || book.image || "https://via.placeholder.com/200x300",
      });

      console.log("✅ Book added to Firestore library:", book.title);
      setSelectedBook(null); // Close modal
      router.push("/library"); // Navigate to Library page
    } catch (error) {
      console.error("❌ Error adding to library:", error);
    }
  };

  const toggleFavorite = (book) => {
    if (favorites.some((b) => b.id === book.id)) {
      setFavorites(favorites.filter((b) => b.id !== book.id));
    } else {
      setFavorites([...favorites, book]);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All-Time Bestsellers</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedBook(item)} style={styles.bookContainer}>
            <View style={styles.bestcontainer}>
              <Image source={{ uri: item.cover }} style={styles.bookImage} />
            </View>
            <View style={styles.desc}>
              <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal */}
      {selectedBook && (
        <Modal transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={() => setSelectedBook(null)} style={styles.closeIcon}>
                <Text style={{ fontSize: 18 }}>✖</Text>
              </TouchableOpacity>

              <View style={styles.modalTopContent}>
                <Image source={{ uri: selectedBook.cover }} style={styles.modalImage} />
                <View style={styles.modalTextContainer}>
                  <Text style={styles.modalTitle}>{selectedBook.title}</Text>
                  <Text style={styles.modalAuthor}>BY {selectedBook.author}</Text>
                </View>
              </View>

              {/* Stars */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    size={20}
                    color={star <= 3 ? "#FFD700" : "#ccc"}
                  />
                ))}
              </View>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => handleTabChange("description")}>
                  <Text style={[styles.tabText, activeTab === "description" && styles.activeTab]}>Description</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTabChange("reviews")}>
                  <Text style={[styles.tabText, activeTab === "reviews" && styles.activeTab]}>Reviews</Text>
                </TouchableOpacity>
              </View>

              {/* Description / Reviews */}
              <ScrollView style={styles.modalDescContainer}>
                {activeTab === "description" ? (
                  <Text style={styles.modalDesc}>{selectedBook.description || "No description available."}</Text>
                ) : (
                  <Text style={styles.modalDesc}>No reviews yet. Please add reviews.</Text>
                )}
              </ScrollView>

              {/* Add to Library Button */}
              <TouchableOpacity onPress={() => addToLibrary(selectedBook)} style={styles.addBtn}>
                <Text style={styles.addBtnText}>Add to Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 1 },
  header: { fontSize: 40, marginBottom: 10, fontFamily: 'MalibuSunday', color: "#585047" },
  bookContainer: {
    width: 220,  // Increased width
    marginRight: 12,
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
  },
  bestcontainer: { paddingRight: 20 },
  desc: { justifyContent: "center" },
  bookImage: { width: 220, height: 330, borderRadius: 8 },  // Increased image size
  bookTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 5,
    color: "#7d7362",
    maxWidth: 170,
    lineHeight: 20,
  },
  bookAuthor: { fontSize: 12, color: "#b0ad9a" },

  // Modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    position: "relative",
  },
  closeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  modalTopContent: {
    height: 150,  // Increased height
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 25,  // Increased margin to move image further down
  },
  modalImage: {
    width: 160,  // Increased image size
    height: 240,  // Increased image size
    borderRadius: 10,
    marginTop: 15,  // Increased margin for further separation from top
  },
  modalTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalAuthor: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center", // Center stars
    marginTop: 50,
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 5,
  },
  tabText: {
    fontSize: 16,
    color: "#585047",
  },
  activeTab: {
    color: "#7d7362",
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  modalDescContainer: {
    maxHeight: 150,
    marginTop: 10,
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    color: '#444',
    paddingHorizontal: 20,
  },
  addBtn: {
    backgroundColor: '#7d7362',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
  },
  addBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ExploreSection;
