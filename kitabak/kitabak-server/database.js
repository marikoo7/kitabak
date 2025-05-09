// firebaseBooks.js

import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

// Fetch All Books Once
export const fetchBooks = async () => {
    try {
        const booksRef = collection(db, "books");
        const snapshot = await getDocs(booksRef);

        const books = snapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title?.toLowerCase() || "",  
            description: doc.data().description || "",
            author: doc.data().author || "",
            genres: doc.data().genres || [],
            ...doc.data() 
        }));

        console.log(`✅ Fetched ${books.length} books`);
        return books;
    } catch (error) {
        console.error("❌ Error fetching books:", error);
        return [];
    }
};

//  Search Books
export const searchBooks = (query, books) => {
    query = query.trim().toLowerCase();

    return books.filter(book => {
        const { title = "", author = "", genres = [] } = book;

        return (
            title.toLowerCase().includes(query) ||
            author.toLowerCase().includes(query) ||
            genres.some(genre => genre.trim().toLowerCase().includes(query))
        );
    });
};
