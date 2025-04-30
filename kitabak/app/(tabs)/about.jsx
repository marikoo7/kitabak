import { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, Dimensions, Image } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";

const { width } = Dimensions.get('window');

export default function AboutScreen() {
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
            setProfilePicUri(userData.profilePic); // Set the profilePic URI from Firestore
          }
        });

        // Clean up Firestore listener when user changes thier profile pic/logs out
        return () => unsubscribeDoc();
      } else {
        // User logged out
        setProfilePicUri(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      <View style={styles.contentContainer}>
        <Image 
          source={require('../../assets/images/photo_2025-03-22_05-01-06-removebg-preview.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Happy Reading, With Kitabak</Text>
          <Text style={styles.paragraph}>
            Welcome to Kitabak, your personal digital library designed for seamless reading and book management. Inspired by the best in the industry, Kitabak offers an intuitive and immersive experience for book lovers, making it easy to discover, organize, and access your books on multiple devices, ensuring a continuous reading journey.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>The Team Behind Kitabak</Text>
          <Text style={styles.paragraph}>
            Our team includes Alaa Najah, Amira Haggag, Aya Aid, Mai Mohammed, Mariam Mahmoud, Nada Sameh, Rahma Mostafa, and Salma Medhat. Together, we're crafting an innovative reading platform that transforms how you experience books.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
         <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            Can’t find the book you’re looking for? Reach out to us at{" "}
            <Text style={{ fontWeight: "bold" }}>kitabak.team@gmail.com</Text>,  
            and we’ll do our best to make it available as soon as possible!
          </Text>
        </View>

        <Text style={styles.tagline}>
          Stay tuned for exciting updates and new features!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f5',
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
  contentContainer: {
    alignItems: 'center',
    marginTop: 120,
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 170,
    marginBottom: 20,
    marginTop: -30,
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 30,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 27,
    fontFamily: 'MalibuSunday',
    fontWeight: 'bold',
    color: '#585047',
    marginBottom: 10,
    textAlign: 'left',
  },
  paragraph: {
    fontSize: 20,
    color: '#b0ad9a',
    textAlign: 'left',
    lineHeight: 25,
  },
  tagline: {
    fontSize: 18,
    color: '#585047',
    fontWeight: 'bold',
    fontFamily: 'MalibuSunday',
    textAlign: 'center',
    marginTop: -5,
    marginBottom: 30,
  },
});
