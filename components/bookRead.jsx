import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const { width } = Dimensions.get("window");

const BooksReadSection = () => {
  const [readingGoal, setReadingGoal] = useState(3);
  const [modalVisible, setModalVisible] = useState(false);

  const cardWidth = width * 0.20;
  const cardHeight = cardWidth * 1.5;

  const booksToRender = Array.from({ length: readingGoal }, (_, i) => ({
    id: i + 1,
    image: null,
  }));

  const renderItem = ({ item }) => (
    <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
      {item.image ? (
        <Image source={item.image} style={styles.bookImage} />
      ) : (
        <Text style={styles.bookNumber}>{item.id}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2}>Books Read This Year</Text>

      <View style={{ width: "100%", height: cardHeight + 20 }}>
          <FlatList
            horizontal
            data={booksToRender}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 10,
              justifyContent: booksToRender.length <= 4 ? "center" : "flex-start",
              flexGrow: 1,
            }}
          />
      </View>


      <View style={styles.goalRow}>
        <Text style={styles.goalText}>
          {readingGoal} more books to reach your goal
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.arrow}>➔</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subText}>Keep reading!</Text>

      
      <Modal transparent animationType="slide" visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={readingGoal}
              onValueChange={(value) => {
                setReadingGoal(value);
                setModalVisible(false);
              }}
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                <Picker.Item key={num} label={`${num}`} value={`${num}`} />
              ))}
            </Picker>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={{ color: "#333" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 40,
    color: "#585047",
    marginBottom: 20,
    fontFamily: "MalibuSunday",
    textAlign: "center",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginHorizontal: 8,
    backgroundColor: "#b0ad9a",
    justifyContent: "center",
    alignItems: "center",
  },
  bookImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  bookNumber: {
    fontSize: 50,
    color: "#fff",
    fontFamily: "MalibuSunday",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  goalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5a4e3a",
  },
  arrow: {
    fontSize: 18,
    color: "#5a4e3a",
    marginLeft: 5,
  },
  subText: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    paddingBottom: 30,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  closeButton: {
    alignSelf: "center",
    padding: 10,
  },
});

export default BooksReadSection;
