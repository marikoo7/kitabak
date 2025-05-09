import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Platform, TextInput, Modal, Alert } from "react-native";
import { useState, useEffect } from "react";
import {Buffer} from 'buffer';
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../kitabak-server/firebaseConfig";
import ProfilePic from "../components/profilePic";
import { Ionicons } from "@expo/vector-icons";
import supabase from "../kitabak-server/supabaseClient";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === 'web';

export default function UserInfoDisplay({ user, selectedProfilePic, setProfilePic, userData, setUserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(userData.username);
  const profilePicSize = isWeb ? Math.min(150, width * 0.19) : 120;

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
    try {
      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert("Camera permission denied.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1, base64: true });
      } else { 
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert("Media library permission denied.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1, base64: true });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) { 
        if (!result.assets[0].base64) {
          console.error("DEBUG: Base64 data is missing from asset even after requesting it.");
          alert("Failed to get image data (base64 missing). Please try again.");
          return;
        }
        const base64Img = result.assets[0].base64;
        const filePath = `${user.uid}/profile.jpg`; 

        const contentType = result.assets[0].mimeType || 'image/jpeg'; 
        const { error } = await supabase.storage
          .from('profile-pics')
          .upload(filePath, Buffer.from(base64Img, 'base64'), {
            contentType: contentType, 
            upsert: true,
          });

        if (error) {
          console.error("DEBUG: Supabase upload error:", JSON.stringify(error, null, 2)); 
          alert("Error uploading image: " + error.message);
          return;
        }

        const { data: publicURLData } = supabase.storage.from('profile-pics').getPublicUrl(filePath);

        if (!publicURLData || !publicURLData.publicUrl) {
            console.error("DEBUG: Failed to get public URL from Supabase response:", publicURLData);
            alert("Error: Could not retrieve image URL after upload.");
            return;
        }
        
        const imageUrl = `${publicURLData.publicUrl}?t=${Date.now()}`;


        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { profilePic: imageUrl }, { merge: true });
        setProfilePic(imageUrl);
      } else if (result.canceled) {
      } else {
        alert("You did not select any image or no assets found.");
      }
    } catch (err) {
      console.error("DEBUG: Image pick/upload failed in catch block:", err); // شوفي الخطأ هنا
      console.error("DEBUG: Error object stringified:", JSON.stringify(err, null, 2));
      alert("Failed to process the image. Please check console for details.");
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
    fontSize: isWeb ? 16:14,},
});
