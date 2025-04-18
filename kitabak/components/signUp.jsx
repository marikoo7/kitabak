import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; 
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
        profilePic: null,
      });
      
      alert("Account created successfully!");
    } catch (error) {
      setError("Error signing up: " + error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);
  
      if (!userSnapshot.exists()) {
        await setDoc(userDocRef, {
          username: user.displayName,
          email: user.email,
          profilePic: user.photoURL || null,
        });
      }
  
      alert("Signed in with Google!");
    } catch (error) {
      console.error(error);
      setError("Google sign-up failed. Try again.");
    }
  };  

  return (
    <View style={styles.container}>
      <Image source={require("../../kitabak/assets/images/photo_2025-03-22_05-01-06-removebg-preview.png")} style={styles.logo} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput style={styles.input} placeholder="username" placeholderTextColor="#7d7362" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="email" value={email}  placeholderTextColor="#7d7362" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="password" value={password}  placeholderTextColor="#7d7362" onChangeText={setPassword} secureTextEntry />
      
      <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>
      
      <Text style={styles.orText}>or</Text>
      
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
        <Image source={require("../../kitabak/assets/images/Google-Symbol.png")} style={styles.googleIcon} />
      </TouchableOpacity>
      
      <Text style={styles.loginText} onPress={onSwitchToLogin}>
        Already have an account? <Text style={styles.loginLink}>Log in</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#f6f6f4" 
  },
  logo: { 
    width: 140, 
    height: 155, 
    marginBottom: 20 
  },
  error: { 
    color: "red", 
    marginBottom: 10 
  },
  input: { 
    width: "85%", 
    padding: 15, 
    borderRadius: 20, 
    backgroundColor: "#e7e6df", 
    marginBottom: 10,
  },
  signupButton: { 
    width: "85%", 
    padding: 17, 
    borderRadius: 20, 
    backgroundColor: "#b0ad9a", 
    alignItems: "center" 
  },
  signupText: { 
    color: "#f6f6f4", 
    fontSize: 20 
  },
  orText: { 
    marginVertical: 15, 
    color: "#7d7362",
    fontSize: 20
  },
  googleButton: { 
    width: 55, 
    height: 55, 
    borderRadius: 28, 
    borderWidth: 1, 
    backgroundColor: "white",
    borderColor: "#B8B29C", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  googleIcon: { 
    width: 30, 
    height: 30 
  },
  loginText: { 
    marginTop: 15, 
    color: "#7d7362",
    fontSize: 16
  },
  loginLink: { 
    fontWeight: "bold", 
    color: "#585047" 
  }
});
