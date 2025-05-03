import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Platform, View, Text, AppState, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { db, auth } from "../kitabak-server/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ReadBookScreen() {
  const { url: initialUrl, title: initialTitle } = useLocalSearchParams();
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl); 
  const [currentTitle, setCurrentTitle] = useState(initialTitle);
  const startTimeRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const sessionUpdateScheduled = useRef(false);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  useEffect(() => {
    setCurrentUrl(initialUrl);
    setCurrentTitle(initialTitle);
    setIsWebViewLoading(true);
  }, [initialUrl, initialTitle]);

  const updateReadingStats = useCallback(async (sessionTimeInSeconds) => {
    if (!userId || sessionTimeInSeconds <= 0 || sessionUpdateScheduled.current) {
        return;
    }

    sessionUpdateScheduled.current = true;

    const statsDocRef = doc(db, "users", userId, "readingStats", "daily");
    const todayString = new Date().toDateString();

    try {
        const docSnap = await getDoc(statsDocRef);

        let updates = {
            lastOpenedBookUrl: currentUrl || null,
            lastOpenedBookTitle: currentTitle || null,
        };

        if (docSnap.exists()) {
            const data = docSnap.data();
            const lastDate = data.lastReadingDate;

            if (lastDate !== todayString) {
                updates.lastReadingDate = todayString;
                updates.todayReadingTime = sessionTimeInSeconds;
            } else {
                updates.todayReadingTime = increment(sessionTimeInSeconds);
            }
            await updateDoc(statsDocRef, updates);
        } else {
            updates.lastReadingDate = todayString;
            updates.todayReadingTime = sessionTimeInSeconds;
            updates.readingGoalMinutes = 5;
            await setDoc(statsDocRef, updates);
        }
    } catch (error) {
        console.error("Error updating/setting reading stats in Firestore:", error);
    } finally {
       sessionUpdateScheduled.current = false;
    }
  }, [userId, currentUrl, currentTitle]);

  useEffect(() => {
    if (!userId || !currentUrl) {
        if (startTimeRef.current) {
             startTimeRef.current = null;
        }
        return;
    }

    if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
    }

    const updateLastBookInfo = async () => {
         const statsDocRef = doc(db, "users", userId, "readingStats", "daily");
         try {
             await setDoc(statsDocRef, {
                 lastOpenedBookUrl: currentUrl,
                 lastOpenedBookTitle: currentTitle || null,
             }, { merge: true });
         } catch (error) {
             console.error("Error updating last opened book info:", error);
         }
     };
     updateLastBookInfo();

    const handleAppStateChange = (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (userId && currentUrl) {
             startTimeRef.current = Date.now();
        } else {
             startTimeRef.current = null;
        }
      }
      else if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
         if (startTimeRef.current && userId) {
            const endTime = Date.now();
            const sessionTimeInSeconds = Math.floor((endTime - startTimeRef.current) / 1000);
            if (sessionTimeInSeconds > 0) {
                updateReadingStats(sessionTimeInSeconds);
            }
            startTimeRef.current = null;
         }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();

      if (startTimeRef.current && userId) {
        const endTime = Date.now();
        const sessionTimeInSeconds = Math.floor((endTime - startTimeRef.current) / 1000);
        if (sessionTimeInSeconds > 0) {
            updateReadingStats(sessionTimeInSeconds);
        }
      }
      startTimeRef.current = null;
      sessionUpdateScheduled.current = false;
    };
  }, [userId, currentUrl, currentTitle, updateReadingStats]);

  if (!currentUrl) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ textAlign: 'center', color: "#e74c3c", fontSize: 16 }}>The book URL is missing or invalid.</Text>
         <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 10, backgroundColor: '#7d7362', borderRadius: 5 }}>
            <Text style={{ color: '#fff' }}>Go Back</Text>
         </TouchableOpacity>
      </View>
    );
  }

  const webViewSource = { uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(currentUrl)}` };
  const webViewKey = `webview-${currentUrl}`;

  return (
    <View style={{ flex: 1 }}>
      {isWebViewLoading && Platform.OS !== 'web' && (
        <ActivityIndicator
          style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 1 }}
          size="large"
          color="#585047"
        />
      )}
      {Platform.OS === "web" ? (
        <div style={{ flex: 1, height: "100vh" }}>
          <iframe
            key={webViewKey}
            src={webViewSource.uri}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={currentTitle || "Book"}
            onLoad={() => setIsWebViewLoading(false)}
          />
          {isWebViewLoading && (
             <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading...</div>
          )}
        </div>
      ) : (
        <WebView
          key={webViewKey}
          source={webViewSource}
          style={{ flex: 1, opacity: isWebViewLoading ? 0 : 1 }}
          originWhitelist={["*"]}
          startInLoadingState={false}
          onLoadProgress={({ nativeEvent }) => {
            if (nativeEvent.progress === 1) {
              setIsWebViewLoading(false);
            }
          }}
          onLoadEnd={() => setIsWebViewLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            setIsWebViewLoading(false);
          }}
        />
      )}
    </View>
  );
}
