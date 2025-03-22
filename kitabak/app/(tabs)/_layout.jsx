import { Tabs } from "expo-router";
import { useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";

export default function TabLayout() {
  // to know if the user is logged in or not
  const [user, setUser] = useState({
    loggedIn: false,
    profilePic: "https://example.com/user-profile.jpg",
  });

  const [fontsLoaded] = useFonts({
    "MalibuSunday": require("../../assets/fonts/MalibuSundaySerif-gwMnE.ttf"), // Update with your font file name
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#7d7362",
            tabBarStyle: {
              backgroundColor: "#f6f6f4",
            },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "home-sharp" : "home-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="library"
            options={{
              title: "Library",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "library-sharp" : "library-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="store"
            options={{
              title: "Bookstore",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "bag-handle-sharp" : "bag-handle-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, focused }) =>
                user.loggedIn && user.profilePic ? (
                  <Image
                    source={{ uri: user.profilePic }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: focused ? 2 : 0,
                      borderColor: focused ? color : "transparent",
                    }}
                  />
                ) : (
                  <Ionicons
                    name={
                      focused ? "person-circle-sharp" : "person-circle-outline"
                    }
                    color={color}
                    size={24}
                  />
                ),
            }}
          />
          <Tabs.Screen
            name="about"
            options={{
              title: "About",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={
                    focused
                      ? "information-circle"
                      : "information-circle-outline"
                  }
                  color={color}
                  size={24}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f6f4",
  },
  container: {
    flex: 1,
    marginTop: -21,
  },
});
