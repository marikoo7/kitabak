import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db, provider } from "../kitabak-server/firebaseConfig";

export default function SignUp({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: user.email,
        profilePic: "https://example.com/default-profile.jpg", // Default profile image
        createdAt: new Date(),
      });
  
      alert("Account created successfully!");
    } catch (error) {
      setError("Error signing up: " + error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError("Google sign-up failed. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign Up" onPress={handleSignUp} />
      
      <Text style={styles.orText}>or</Text>
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
        <Image source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" }} style={styles.googleIcon} />
        <Text style={styles.googleText}>Sign up with Google</Text>
      </TouchableOpacity>

      <Text style={styles.switchText} onPress={onSwitchToLogin}>Already have an account? Login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  error: { color: "red", marginBottom: 10 },
  input: { width: "80%", padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  orText: { marginVertical: 10 },
  googleButton: { flexDirection: "row", alignItems: "center", padding: 10, borderWidth: 1, borderRadius: 5 },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleText: { fontSize: 16 },
  switchText: { color: "blue", marginTop: 10 },
});
