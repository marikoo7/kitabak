// import { Link } from "expo-router";
import { Text, View ,TextInput, StyleSheet, ScrollView } from "react-native";
// import hh from "assets/fo.png";

export default function AboutScreen() {
  return (
    // <View style={styles.container}>
    //   <Image
    //     source={require('./assets/search-icon.png')} // استبدل بمسار أيقونة البحث الخاصة بك
    //     style={styles.icon}
    //   />
    //   <TextInput
    //     style={styles.input}
    //     placeholder="ابحث عن اسم الكتاب، المؤلف، أو النوع"
    //   />
    // </View>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Happy reading,</Text>
      <Text style={styles.title}>with kitabak</Text>
      <Text style={styles.paragraph}>Welcome to Kitabak, your personal digital library designed for seamless reading and book management. Inspired by the best in the industry, Kitabak offers an intuitive and immersive experience for book lovers, making it easy to discover, organize, and access your books on multiple devices, ensuring a continuous reading journey.
      </Text>
      <Text style={styles.title}>The Team Behind </Text>
      <Text style={styles.title}>kitabak</Text>
      <Text style={styles.paragraph}>
      Our team includes Mariam Mahmoud, Mai Mohammed, Alaa Najah, Amira Haggag, Aya Aid, Nada Sameh, Rahma Mostafa,
      and Salma Medhat working together to craft an innovative reading platform.</Text>
      <Text style={styles.paragraph}>
      Stay tuned for updates as we continue to enhance Kitabak with new features and improvements!
      </Text>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color:"#585047",

  },
  paragraph: {
    fontSize: 16,
    marginBottom: 10,
    color:"#7d7362",
    fontFamily: 'Arial',
  },
})

