import { View, TextInput, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { sendMessageToGPT } from '../components/sendMessageToGPT';
import { fetchBooks } from '../components/fetchBooks'; // دالة تجيب الكتب من Firestore

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    const lowerInput = input.toLowerCase();
    setInput("");

    try {
      // جلب بيانات الكتب
      const books = await fetchBooks();
      const matchedBook = books.find(book =>
        lowerInput.includes(book.title.toLowerCase())
      );

      if (matchedBook) {
        const responseText = `📚 ${matchedBook.title}:\n\n${matchedBook.description}`;
        setMessages(prev => [...prev, { sender: "ai", text: responseText }]);
        return;
      }

      // إذا مش كتاب - استخدم GPT
      const aiResponse = await sendMessageToGPT(input);
      setMessages(prev => [...prev, { sender: "ai", text: aiResponse }]);

    } catch (err) {
      setMessages(prev => [...prev, { sender: "ai", text: "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي." }]);
    }
  };

  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter') sendMessage();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={styles.chatContainer}>
      <ScrollView
        style={styles.chatContent}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, i) => (
          <Text key={i} style={{ color: msg.sender === "user" ? "blue" : "green", marginBottom: 4 }}>
            {msg.text}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          placeholder="اكتب سؤالك..."
          style={styles.input}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: "white" }}>إرسال</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 300,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    elevation: 5,
    zIndex: 999,
  },
  chatContent: {
    flex: 1,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 5,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 5,
  },
});
