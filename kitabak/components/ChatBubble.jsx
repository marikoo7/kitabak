import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import ChatWindow from './ChatWindow';

export default function ChatBubble() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {visible && <ChatWindow />}
      <TouchableOpacity
        style={styles.bubble}
        onPress={() => setVisible(!visible)}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>AI</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4A90E2',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
});
