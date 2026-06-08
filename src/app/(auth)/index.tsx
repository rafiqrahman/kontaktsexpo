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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { post } = useApi();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await post("/api/v1/auth/login", { email, password });
      
      if (data.success && data.token && data.user) {
        await signIn(data.token, data.user);
        Alert.alert("Welcome", `Logged in successfully as ${data.user.firstName}!`);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Authentication Failed", "Could not verify your credentials.");
      }
    } catch (error: any) {
      Alert.alert("Login Error", error.message || "Invalid credentials or network failure.");
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
            <Text style={styles.subtitle}>Sign in to manage your digital business cards on the go</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={styles.input}
                placeholder="you@company.com"
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
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Link to Register */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Create one</Text>
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
    backgroundColor: "#fafafa", // slate-50 background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#09090b", // slate-950
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: "#71717a", // slate-500
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 20,
  },
  form: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e4e4e7", // slate-200 border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#09090b",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#09090b",
    backgroundColor: "#fafafa",
  },
  button: {
    height: 48,
    backgroundColor: "#09090b", // Slate-900 main action buttons
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: "#71717a",
  },
  linkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#09090b",
    textDecorationLine: "underline",
  },
});
