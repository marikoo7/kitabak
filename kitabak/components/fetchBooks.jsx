import { collection, getDocs } from "firebase/firestore";
import { db } from "../kitabak-server/firebaseConfig"; 

export const fetchBooks = async () => {
  const booksRef = collection(db, "books");
  const snapshot = await getDocs(booksRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
