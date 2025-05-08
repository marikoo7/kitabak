import { collection, getDocs } from "firebase/firestore";
import { db } from "../kitabak-server/firebaseConfig"; 

export const fetchBooks = async () => {
  const snapshot = await getDocs(collection(db, "books"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title.toLowerCase(), 
    description: doc.data().description,
  }));
};
