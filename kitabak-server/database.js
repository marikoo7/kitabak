import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

// Function to fetch all books once
export const fetchBooks = async () => {
    try {
        const booksRef = collection(db, "books");
        const snapshot = await getDocs(booksRef);
        const books = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        console.log(`Fetched ${books.length} books`); // for debugging
        return books;
    } catch (error) {
        console.error("Error fetching books:", error);
        return [];
    }
};

// Function to search books
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
