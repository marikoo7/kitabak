import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";
import ExploreSection from "@/components/explore";
import BestSeller from "@/components/bestSeller";
import BookRead from "@/components/bookRead";
import ChatBubble from "@/components/ChatBubble";

export default function HomeScreen() {
  const [books, setBooks] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfilePicUri(userData.profilePic);
          } else {
            setProfilePicUri(null);
          }
        }, (error) => {
            console.error("Error fetching user document for profile pic:", error);
            setProfilePicUri(null);
        });
        return () => unsubscribeDoc();
      } else {
        setProfilePicUri(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  return (
    <View style={styles.rootContainer}>
      <ScrollView style={styles.scrollableContentContainer} showsVerticalScrollIndicator={false}>
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

        <View style={styles.scrollContent1}>
          <ExploreSection />
        </View>

        <View style={styles.scrollContent2}>
          <BestSeller />
        </View>

        <View style={styles.bookReadContainer}>
          {currentUser === undefined ? (
            <ActivityIndicator size="large" color="#585047" style={{ marginTop: 20 }}/>
          ) : (
            <BookRead userId={currentUser ? currentUser.uid : null} />
          )}
        </View>
      </ScrollView>
      <ChatBubble style={styles.chatBubbleFixed} />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#f6f6f4",
    padding: 10,
  },
  profileContainer: {
    position: "absolute",
    top: 33,
    right: 20,
    zIndex: 20,
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
    padding: 10,
  },
  scrollContent2: {
    marginTop: 40,
    padding: 10,
  },
  bookReadContainer: {
    marginTop: 40,
    marginBottom: 40,
  },
  chatBubbleFixed: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 100,
  }
});