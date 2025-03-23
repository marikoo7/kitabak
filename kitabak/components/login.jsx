import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../kitabak-server/firebaseConfig";

export default function Login({ onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError("Error logging in: " + error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError("Google sign-in failed. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../kitabak/assets/images/photo_2025-03-22_05-01-06-removebg-preview.png")} style={styles.logo} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TextInput 
        style={styles.input} 
        placeholder="email" 
        value={email} 
        onChangeText={setEmail} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Log in</Text>
      </TouchableOpacity>
      
      <Text style={styles.orText}>or</Text>
      
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
        <Image source={require("../../kitabak/assets/images/Google-Symbol.png")} style={styles.googleIcon} />
      </TouchableOpacity>
      
      <Text style={styles.signUpText} onPress={onSwitchToSignUp}>
        Don't have an account? <Text style={styles.signUpLink}>Sign up</Text>
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
    color: "#7d7362"
  },
  loginButton: { 
    width: "85%", 
    padding: 17, 
    borderRadius: 20, 
    backgroundColor: "#b0ad9a", 
    alignItems: "center" 
  },
  loginText: { 
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
  signUpText: { 
    marginTop: 15, 
    color: "#7d7362",
    fontSize: 16
  },
  signUpLink: { 
    fontWeight: "bold", 
    color: "#585047" 
  }
});
