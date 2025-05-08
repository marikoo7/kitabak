import axios from "axios";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../kitabak-server/firebaseConfig";

const API_KEY = "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";
let cachedBooks = [];


const fetchBooks = async () => {
  const snapshot = await getDocs(collection(db, "books"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title.toLowerCase(),
    description: doc.data().description,
  }));
};

export const sendMessageToGPT = async (message) => {
  try {
    
    if (cachedBooks.length === 0) {
      cachedBooks = await fetchBooks();
    }

    const lowerMessage = message.toLowerCase();

    
    const foundBook = cachedBooks.find(book =>
      lowerMessage.includes(book.title)
    );

    if (foundBook) {
      return `📚 *${foundBook.title}*\n\n${foundBook.description}`;
    }

    
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "HTTP-Referer": "https://kitabak/kitabak/app.com", // تأكدي من الرابط
        },
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.error("OpenRouter API Error:", error.response?.data || error.message);
    return "عذرًا، حدث خطأ أثناء التواصل مع المساعد.";
  }
};
