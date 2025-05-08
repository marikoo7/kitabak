
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Platform, TextInput, Modal, Alert } from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../kitabak-server/firebaseConfig";
import ProfilePic from "../components/profilePic";
import { Ionicons } from "@expo/vector-icons";
import  supabase  from "../kitabak-server/supabaseClient";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === 'web';

export default function UserInfoDisplay({ user, selectedProfilePic, setProfilePic, userData, setUserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(userData.username);
  const profilePicSize = isWeb ? Math.min(150, width * 0.19) : 120;

  // ✅ جلب الصورة من Firestore عند بداية تشغيل الكومبوننت
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (user?.uid) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.profilePic) {
            setProfilePic(data.profilePic);
          }
        }
      }
    };

    fetchProfilePic();
  }, [user]);

  const pickImageAsync = async () => {
    if (isWeb) {
      await pickImage("gallery");
    } else {
      Alert.alert(
        "Choose image source",
        "Pick image from camera or gallery?",
        [
          { text: "Camera", onPress: () => pickImage("camera") },
          { text: "Gallery", onPress: () => pickImage("gallery") },
          { text: "Cancel", style: "cancel" }
        ],
        { cancelable: true }
      );
    }
  };

  const pickImage = async (source) => {
    let result;
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert("Camera permission denied.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert("Media library permission denied.");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
    }

    if (!result.canceled) {
      const fileUri = result.assets[0].uri;
      const filePath = `${user.uid}/profile.jpg`; // ✅ مسار ثابت لكل يوزر

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('profile-pics')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        alert("Error uploading image: " + error.message);
        return;
      }

      const imageUrl = `https://fkifydtvjuxzywprvtub.supabase.co/storage/v1/object/public/profile-pics/${filePath}`;

      // ✅ حفظ رابط الصورة في Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { profilePic: imageUrl }, { merge: true });
      setProfilePic(imageUrl);
    } else {
      alert("You did not select any image.");
    }
  };

  const handleUpdateUsername = async () => {
    if (user && newUsername.trim() !== "") {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        username: newUsername.trim()
      }, { merge: true });

      setUserData({ ...userData, username: newUsername.trim() });
      setIsEditing(false);
    }
  };

  return (
    <View style={styles.userInfoWrapper}>
      <TouchableOpacity onPress={pickImageAsync} style={styles.profileContainer}>
        <ProfilePic uri={selectedProfilePic} size={profilePicSize} />
      </TouchableOpacity>

      <View style={styles.userInfoContainer}>
        <View style={styles.usernameContainer}>
          <Text style={[styles.username, isWeb && styles.webUsername]}>
            {userData.username}
          </Text>
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editIcon}>
            <Ionicons name="pencil-sharp" size={isWeb ? Math.min(32, width * 0.05) : 24} color="#7d7362" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.email, isWeb && styles.webEmail]}>
          {userData.email}
        </Text>
      </View>

      <Modal animationType="fade" transparent={true} visible={isEditing} onRequestClose={() => setIsEditing(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Username</Text>
            <TextInput
              style={styles.usernameInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
              placeholderTextColor="#b0ad9a"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => {
                setNewUsername(userData.username);
                setIsEditing(false);
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUpdateUsername}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  userInfoWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Platform.OS === 'web' ? 10 : 20,
    paddingVertical: Platform.OS === 'web' ? 0 : 30,
  },
  profileContainer: {
    marginRight: Platform.OS === 'web' ? 20 : 17,
    marginBottom: Platform.OS === 'web' ? -35 : 10,
    marginLeft: Platform.OS === 'web' ? -40 : 0,
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#7d7362",
    marginBottom: 5,
    flexWrap: "wrap",
  },
  webUsername: {
    fontSize: Math.min(100, width * 0.16),
  },
  email: {
    fontSize: 14,
    color: "#b0ad9a",
  },
  webEmail: {
    fontSize: Math.min(20, width * 0.1),
  },
  editIcon: {
    marginLeft: 5,
    marginTop: -25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: "#f6f6f4",
    borderRadius: 15,
    padding: 25,
    width: isWeb ? '40%' : '80%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: isWeb ? 24 : 20,
    fontWeight: 'bold',
    color: "#585047",
    marginBottom: 20,
  },
  usernameInput: {
    width: '100%',
    backgroundColor: "#fff",
    borderColor: "#b0ad9a",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: isWeb ? 18 : 16,
    color: "#585047",
    marginBottom: 20,
    outlineStyle: "none",
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: isWeb ? 16 : 14,
  },
  saveButton: {
    backgroundColor: "#585047",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: isWeb ? 16 : 14,
  },
});
