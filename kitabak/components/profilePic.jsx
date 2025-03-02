import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfilePic({ uri, size = 50 }) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.profilePic, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <Ionicons name="person-circle-outline" size={size} color="#b0ad9a" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profilePic: {
    borderWidth: 1,
    borderColor: "#585047",
  },
});
