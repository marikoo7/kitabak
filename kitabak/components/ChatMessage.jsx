import { View, Text, StyleSheet } from 'react-native';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  return (
    <View
      style={[
        styles.bubbleContainer,
        isUser ? styles.userAlign : styles.aiAlign,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={styles.messageText}>{message.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  userAlign: {
    justifyContent: 'flex-end',
  },
  aiAlign: {
    justifyContent: 'flex-start',
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderTopRightRadius: 0,
  },
  aiBubble: {
    backgroundColor: '#333',
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: '#fff',
  },
});