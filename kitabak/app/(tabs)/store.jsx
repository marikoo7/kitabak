import { View, StyleSheet,TouchableOpacity } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { useState } from "react";
import ProfilePic from "@/components/profilePic";
import SearchBar from "@/components/searchBar";
import SearchResult from "@/components/searchResult";
import React, { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../kitabak-server/firebaseConfig"; 
import { Text, FlatList, Image, ScrollView , SafeAreaView} from "react-native";
import { shuffle } from "lodash";
import bookImage from '../../assets/images/Howl-s-Moving-Castle.jpg';
import bookImage2 from '../../assets/images/R.jpg';
import bookImage3 from '../../assets/images/OIP.jpg';
import bookImage4 from '../../assets/images/R (1).jpg';
import bookImage5 from '../../assets/images/historical-graphic-novels.jpg';
import bookImage6 from '../../assets/images/ss.jpg';
import bookImage7 from '../../assets/images/aa.jpg';
import bookImage8 from '../../assets/images/bb.jpg';
import bookImage9 from '../../assets/images/cc.jpg';
import bookImage10 from '../../assets/images/dd.jpg';
import { useRouter } from "expo-router";
import {
  Button,
  Dialog,
  AirbnbRating
  } from '@rneui/themed';



export default function StoreScreen() {
  const [bookss, setBookss] = useState([]);
  const [books, setBooks] = useState([]);
  const [books1, setBooks1] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState(null);
  const [visible1, setVisible1] = useState(false);
  
  
  


  const toggleDialog1 = () => {
    setVisible1(!visible1);
  };

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

  useEffect(() => {
      const bookData = [
      { id: "L2LYCeR3wyJe3N2nsYOL", title: "Howl’s Moving Castle", author: "Diana Wynne Jones", image: bookImage, category: "Fantasy" },
      { id: "2", title: "The Age of Doubt", author: "Pak Kyongni", image: bookImage4, category: "Fictional" },
      { id: "kmUDd2fTGEkOQ9KtIwSW", title: "1984", author: "George Orwell", image: bookImage6, category: "Fictional" },
      { id: "4", title: "Brave New World", author: "Aldous Huxley",  image: bookImage2, category: "Historical" },
      { id: "5", title: "Non-Fiction Example", author: "Author Name",image: bookImage3, category: "Non-fictional" },
      { id: "6", title: "Another Fantasy Book", author: "Another Author", image: bookImage7, category: "Fantasy" },
      { id: "7", title: "Historical Novel", author: "History Writer", image: bookImage5, category: "Historical" },
      { id: "8", title: "Non-Fiction Title", author: "Non-Fiction Author", image: bookImage8, category: "Non-fictional" }
      ];
      const bookData2 = [
        { id: "1", title: "Howl’s Moving Castle", author: "Diana Wynne Jones", image: bookImage, category: "Fantasy" },
        { id: "2", title: "The Age of Doubt", author: "Pak Kyongni", image: bookImage4, category: "Fictional" },
        { id: "3", title: "1984", author: "George Orwell", image: bookImage6, category: "Fictional" },
        { id: "4", title: "Brave New World", author: "Aldous Huxley",  image: bookImage9, category: "Historical" },
        { id: "5", title: "Non-Fiction Example", author: "Author Name",image: bookImage3, category: "Non-fictional" },
        { id: "6", title: "Another Fantasy Book", author: "Another Author", image: bookImage10, category: "Fantasy" },
        { id: "7", title: "Historical Novel", author: "History Writer", image: bookImage5, category: "Historical" },
        { id: "8", title: "Non-Fiction Title", author: "Non-Fiction Author", image: bookImage8, category: "Non-fictional" }
        ];
    
      setBookss(shuffle(bookData));
      setBooks1(shuffle(bookData2));
    }, []);

  return (
    <SafeAreaView style={{ flex:1}}>
      
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
          <Text style={styles.header1}>Fictional </Text>
          <FlatList
            data={bookss}
            keyExtractor={(item) => item.id}
            horizontal showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                  onPress={() => {
                  setSelectedBook(item);
                  toggleDialog1();
        
    }}
      
    >
              <View style={styles.bookContainer}>
                <View style={styles.excontainer}>
                <Image source={ item.image } style={styles.bookImage} />
                </View>
                <View style={styles.desc}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>
            
                </View>
                
                
              </View>
              </TouchableOpacity>
            )}
          />
      
          <Text style={styles.header2}>Non-Fictional </Text>
          <FlatList
          
            data={books1}
            keyExtractor={(item) => item.id}
            horizontal showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.bookContainer}>
                <View style={styles.excontainer}>
                <Image source={ item.image } style={styles.bookImage} />
                </View>
                <View style={styles.desc}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>
               
                </View>
              </View>
            )}
          />
          <Dialog 
          isVisible={visible1} 
          onBackdropPress={toggleDialog1}
          overlayStyle={{
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
            backgroundColor: "#e7e6df"
          }}
          >
          <View style={{
              alignItems: 'center',
              height: 500,
              justifyContent: 'space-around',
              }}
              
              >
          <View style={styles.ratingContainer}>
          <AirbnbRating 
          isDisabled={true}
          starStyle={{ color: '#585047' }}  
          size={25}  
          />
        </View>
      
          <Image source={selectedBook?.image} style={styles.bookImageInDialog} />
          <Text style={styles.bookTitleInDialog}>{selectedBook?.title}</Text>
          <Text style={styles.bookAuthorInDialog}>by {selectedBook?.author}</Text>
          <Text style={styles.bookCategory}>{selectedBook?.category}</Text>
          

    <Button
      title="More Details"
      onPress={() => {
        toggleDialog1();
        router.push(`/book/${selectedBook?.id}`);
      }}
      buttonStyle={{ marginTop: 15, backgroundColor: '#7d7362' }}
    />
  </View>
</Dialog>

          <Text style={styles.header2}>Fantasy</Text>
          <FlatList
            data={bookss}
            keyExtractor={(item) => item.id}
            horizontal showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.bookContainer}>
                <View style={styles.excontainer}>
                <Image source={ item.image } style={styles.bookImage} />
                </View>
                <View style={styles.desc}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>
                
                </View>
              </View>
            )}
          />
          <Text style={styles.header3}>Romantic</Text>
          <FlatList
            data={bookss}
            keyExtractor={(item) => item.id}
            horizontal showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.bookContainer}>
                <View style={styles.excontainer}>
                <Image source={ item.image } style={styles.bookImage} />
                </View>
                <View style={styles.desc}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>
    
                </View>
              </View>
            )}
          />
          <Text style={styles.header4}>Historical </Text>
          <FlatList
            data={bookss}
            keyExtractor={(item) => item.id}
            horizontal showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.bookContainer}>
                <View style={styles.excontainer}>
                <Image source={ item.image } style={styles.bookImage} />
                </View>
                <View style={styles.desc}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>
                
                </View>
              </View>
            )}
          />
          </ScrollView>
          </SafeAreaView>  
    
      );
    };
    
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
      
      header1: { fontSize: 40, fontWeight: "bold", marginBottom: 10 ,fontFamily:"expo-font" },
      header2: { fontSize: 40, fontWeight: "bold", marginBottom: 10 ,fontFamily:"expo-font"},
      header3: { fontSize: 40, fontWeight: "bold", marginBottom: 10 ,fontFamily:"expo-font"},
      header4: { fontSize: 40, fontWeight: "bold", marginBottom: 10 ,fontFamily:"expo-font"},
      header5: { fontSize: 40, fontWeight: "bold", marginBottom: 10 ,fontFamily:"expo-font"},
      
      
      

      bookContainer: {
        padding: 10,
        borderRadius: 10,
        justifyContent:"center"
      },excontainer:{
        paddingRight:20
      },desc:{
        justifyContent:'center',
      },
    
      bookImage: { width: 100, height: 150, borderRadius: 8 },
      bookTitle: { fontSize: 10, fontWeight: "bold", marginTop: 5 , color:"#7d7362"},
      bookAuthor: { fontSize: 10,color:'#b0ad9a'},
      
      
      bkP:{paddingRight:10, paddingTop:10},
      bookImageInDialog: {
        width: 220,
        height: 280,
        borderRadius: 8,
        marginBottom: 15,
        alignSelf: 'flex-start',
        marginTop:-100
      },
      bookTitleInDialog: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5,
        color: '#7d7362',
        marginTop: -200,  
      },
      bookAuthorInDialog: {
        color: 'gray',
        marginBottom: 10,
      },
      bookCategory: {
        marginTop: 10,
        marginBottom: 15,
      },
     
      ratingContainer: {
        alignItems: 'flex-end',
       
      },
    
     
    });
    
    
