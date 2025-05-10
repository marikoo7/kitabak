import { useState } from 'react';
import { TextInput, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import ChatMessage from '../components/ChatMessage';
import { sendMessageToGPT } from '../components/sendMessageToGPT';
import { useEffect } from 'react';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const aiReply = await sendMessageToGPT(input);
    const aiMessage = { sender: 'ai', text: aiReply };

    setMessages(prev => [...prev, aiMessage]);
  };
  useEffect(() => {
    const welcome = { sender: 'ai', text: 'Hi! How can i help you today 🤖' };
    setMessages([welcome]);
  }, []);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.window}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messageList}
      />
      <TextInput
        style={styles.input}
        placeholder= "write your prompt here..."
        value={input}
        onChangeText={setInput}
        onSubmitEditing={sendMessage}
        returnKeyType="send"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  window: {
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
  messageList: {
    flexGrow: 1,
  },
  input: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
  },
});
