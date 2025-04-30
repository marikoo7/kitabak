import { useLocalSearchParams } from "expo-router";
import { Platform, View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ReadBookScreen() {
  const { url } = useLocalSearchParams();

  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const sessionTimeInSeconds = Math.floor((endTime - startTime) / 1000);
      const today = new Date().toDateString();

      (async () => {
        const lastDate = await AsyncStorage.getItem("lastReadingDate");

        if (lastDate !== today) {
          await AsyncStorage.setItem("lastReadingDate", today);
          await AsyncStorage.setItem("todayReadingTime", sessionTimeInSeconds.toString());
        } else {
          const stored = await AsyncStorage.getItem("todayReadingTime");
          const previous = stored ? parseInt(stored) : 0;
          const updated = previous + sessionTimeInSeconds;
          await AsyncStorage.setItem("todayReadingTime", updated.toString());
        }
      })();
    };
  }, []);

  if (!url) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>لا يوجد رابط PDF</Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1 }}>
        <div style={{ height: "100vh" }}>
          <iframe
            src={`https://docs.google.com/gview?embedded=true&url=${url}`}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="PDF"
          />
        </div>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: `https://docs.google.com/gview?embedded=true&url=${url}` }}
      style={{ flex: 1 }}
      originWhitelist={["*"]}
      startInLoadingState
    />
  );
}
