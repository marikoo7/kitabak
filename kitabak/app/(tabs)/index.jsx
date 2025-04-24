import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../kitabak-server/firebaseConfig"; 
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";
import ExploreSection from "@/components/explore";
import BestSeller from "@/components/bestSeller";
import BookRead from "@/components/bookRead"


export default function HomeScreen() {
  const [books, setBooks] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfilePicUri(userData.profilePic);
          }
        });

        // Clean up Firestore listener when user changes/logs out
        return () => unsubscribeDoc();
      } else {
        // User logged out
        setProfilePicUri(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <ScrollView style={styles.container}  showsVerticalScrollIndicator={false}>
      <View style={styles.profileContainer}>
              <ProfilePic uri={profilePicUri} size={80} />
            </View>
            
            <View style={styles.searchContainer}>
              <SearchBar onSearch={setBooks} setSearchPerformed={setSearchPerformed} />
            </View>
            
            {searchPerformed && (
              <View style={styles.searchResult}>
                <SearchResult books={books} searchPerformed={searchPerformed} />
              </View>
            )}

      <ScrollView style={styles.scrollContent1} showsVerticalScrollIndicator={false}>
            <ExploreSection />
      </ScrollView>

      <ScrollView style={styles.scrollContent2} showsVerticalScrollIndicator={false}>
         <BestSeller/>
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.bookRead}>
          <BookRead/>
      </ScrollView>

      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f4",
    padding: 10,
  },
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
    position: 'absolute', 
    top: 100, 
    left: 10,
    right: 10,
    zIndex: 10,
  },
  scrollContent1: {
    marginTop: 80,
    padding:10
  }, 
   scrollContent2: {
    marginTop: 40,
    padding:10
  }, 
   bookRead: {
    marginTop: 40,
    padding:10
  },

});
