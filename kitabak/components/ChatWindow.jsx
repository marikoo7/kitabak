import { View, TextInput, Button, Text, ScrollView, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { sendMessageToGPT } from '../components/sendMessageToGPT';  

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const welcomeMessage = {
      sender: "ai",
      text: "مرحبًا! كيف يمكنني مساعدتك؟",
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const aiResponse = await sendMessageToGPT(input);
      const aiMessage = {
        sender: "ai",
        text: aiResponse,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "ai", text: "حدث خطأ." }]);
    }
  };

  return (
    <View style={styles.chatContainer}>
      <ScrollView style={styles.chatContent}>
        {messages.map((msg, i) => (
          <Text key={i} style={{ color: msg.sender === "user" ? "blue" : "green" }}>
            {msg.text}
          </Text>
        ))}
      </ScrollView>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="اكتب سؤالك..."
        style={styles.input}
        onSubmitEditing={sendMessage} 
      />
      <Button title="إرسال" onPress={sendMessage} />
    </View>
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
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 5,
  },
});

