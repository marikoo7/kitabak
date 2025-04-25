import { useLocalSearchParams } from "expo-router";
import { Platform, View, Text } from "react-native";
import { WebView } from "react-native-webview";

export default function ReadBookScreen() {
  const { url } = useLocalSearchParams();

  if (!url) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
      originWhitelist={['*']}
      startInLoadingState
    />
  );
}
