import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === 'mariammahmoud880@yahoo.com' || user?.email === 'kitabak.team@gmail.com');
    });

    return () => unsubscribe();
  }, []);

  const [fontsLoaded] = useFonts({
    "MalibuSunday": require("../../assets/fonts/MalibuSundaySerif-gwMnE.ttf"),
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
                (
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
          <Tabs.Screen
            name="admin"
            options={{
              title: "Admin",
              href: isAdmin ? "/admin" : null, // hide tab when not admin
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "book-sharp" : "book-outline"}
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