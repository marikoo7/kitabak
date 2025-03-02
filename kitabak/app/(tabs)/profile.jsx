import { View, StyleSheet , Dimensions} from "react-native";
import { useState } from "react";
import ProfilePic from "@/components/profilePic";

const { width, height } = Dimensions.get("window");

export default function ProfileScreen() {
  const [user, setUser] = useState({
    loggedIn: false,
    profilePic: "https://example.com/user-profile.jpg",
  });

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <ProfilePic uri={user.loggedIn ? user.profilePic : null} size={width * 0.3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f4",
  },
  profileContainer: {
    position: "absolute",
    top: height * 0.04,
    left: width * 0.03,
  },
});
