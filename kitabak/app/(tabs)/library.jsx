import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { db, auth } from "../../kitabak-server/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "expo-router";
import { Button } from "@rneui/themed"; // إذا كنت تستخدم مكتبة @rneui

const LibraryScreen = () => {
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("library"); // بدايةً مع تبويب المكتبة
  const router = useRouter();

  // تحميل الكتب من المكتبة أو المفضلة بناءً على التبويب النشط
  useEffect(() => {
    const fetchBooks = async (collectionName) => {
      const user = auth.currentUser;
      if (user) {
        const booksRef = collection(db, "users", user.uid, collectionName);
        const querySnapshot = await getDocs(booksRef);
        const booksArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return booksArray;
      }
    };

    if (activeTab === "library") {
      fetchBooks("library").then(setLibraryBooks);
    } else {
      fetchBooks("favorites").then(setFavoriteBooks);
    }
  }, [activeTab]); // التحديث بناءً على التبويب النشط

  return (
    <View style={{ flex: 1 }}>
      {/* تبويبات المكتبة والمفضلة */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "library" && styles.activeTab]}
          onPress={() => setActiveTab("library")}
        >
          <Text style={styles.tabText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "favorites" && styles.activeTab]}
          onPress={() => setActiveTab("favorites")}
        >
          <Text style={styles.tabText}>Favorites</Text>
        </TouchableOpacity>
      </View>

      {/* عرض الكتب بناءً على التبويب النشط */}
      <FlatList
        data={activeTab === "library" ? libraryBooks : favoriteBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookContainer}>
            <Text style={styles.bookTitle}>{item.title}</Text>
            <Text style={styles.bookAuthor}>{item.author}</Text>
            <Button
              title="Go to Details"
              onPress={() => router.push(`/bookDetails/${item.id}`)} // توجيه المستخدم إلى تفاصيل الكتاب
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tab: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#7d7362", // اللون المميز للتبويب النشط
  },
  tabText: {
    fontSize: 16,
    color: "#7d7362",
  },
  bookContainer: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7d7362",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#7d7362",
  },
});

export default LibraryScreen;
