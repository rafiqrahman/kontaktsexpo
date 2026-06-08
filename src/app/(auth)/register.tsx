import { BpamLogo } from "../../components/BpamLogo";
import React, { useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../store/authContext";
import { useApi } from "../../hooks/useApi";

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { post } = useApi();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    // Password strength check
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Validation Error", 
        "Password must be at least 8 characters long and contain at least one letter and one number."
      );
      return;
    }

    setLoading(true);

    try {
      const data = await post("/api/v1/auth/signup", {
        firstName,
        lastName,
        email,
        password,
      });

      if (data.success && data.token && data.user) {
        await signIn(data.token, data.user);
        Alert.alert("Welcome", `Account created successfully! Welcome ${data.user.firstName}!`);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Registration Failed", "Could not complete account creation.");
      }
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center py-12 px-6">
          
          {/* Header */}
          <View style={styles.header}>
            <BpamLogo width={48} height={52} color="#09090b" />
            <Text style={styles.brandTitle}>BPAM Kontakts</Text>
            <Text style={styles.subtitle}>Sign up to start crafting your digital business card</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>First Name</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="John"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!loading}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={styles.input}
                placeholder="john.doe@company.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <Text style={styles.hint}>Min. 8 chars with 1 letter and 1 number.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput 
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Link to Login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#09090b",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
    marginTop: 6,
    maxWidth: 260,
    lineHeight: 18,
  },
  form: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#09090b",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#09090b",
    backgroundColor: "#fafafa",
  },
  hint: {
    fontSize: 10,
    color: "#71717a",
    marginTop: 4,
  },
  button: {
    height: 46,
    backgroundColor: "#09090b",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#71717a",
  },
  linkText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#09090b",
    textDecorationLine: "underline",
  },
});
