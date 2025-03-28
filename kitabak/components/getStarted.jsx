import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default function GetStarted({ onSignUp, onLogin }) {
  console.log("GetStarted screen is rendering!"); 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's get started!</Text>

    
      <View style={styles.imageContainer}>
        <Image 
          source={require("../assets/images/photo_2025-03-22_05-01-06-removebg-preview.png")} 
          style={styles.image} 
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={onSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>
        Already have an account? <Text style={styles.loginLink} onPress={onLogin}>Log in</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f6f6f4", 
    alignItems: "center", 
    justifyContent: "center", 
  },

  title: { 
    fontSize: 47, 
    fontFamily: "MalibuSunday",
    fontWeight: "bold", 
    color: "#585047", 
    marginBottom: height * 0.13, 
  },

  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: width * 0.6, 
    height: height * 0.3, 
    marginBottom: height * 0.04, 
    marginLeft: 29, 
  },

  image: { 
    height: height * 0.4, 
    resizeMode: "contain",
  },

  button: { 
    backgroundColor: "#b0ad9a", 
    paddingVertical: 15, 
    paddingHorizontal: 50, 
    borderRadius: 10, 
    marginTop: height * 0.04,
    marginLeft: -10,
  },

  buttonText: { 
    color: "#e7e6df", 
    fontSize: 20 
  },

  loginText: { 
    marginTop: height * 0.03,
    fontSize: 18, 
    color: "#b0ad9a" 
  },

  loginLink: { 
    fontWeight: "bold", 
    color: "#7d7362" 
  },
});
