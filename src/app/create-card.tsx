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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../hooks/useApi";
import { useTheme } from "../hooks/use-theme";

export default function CreateCardModal() {
  const router = useRouter();
  const { post } = useApi();
  const theme = useTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Missing Fields", "Please enter both First Name and Last Name.");
      return;
    }

    setLoading(true);

    try {
      const data = await post("/api/v1/cards", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        title: title.trim(),
        companyName: companyName.trim(),
      });

      if (data.success && data.card) {
        Alert.alert(
          "Success 🎉", 
          "Your business card has been created!",
          [
            { 
              text: "OK", 
              onPress: () => {
                router.back(); // Dismiss modal
                setTimeout(() => {
                  router.push(`/card/${data.card.id}` as any); // View new card preview
                }, 100);
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", "Failed to create card. Please try again.");
      }
    } catch (error: any) {
      Alert.alert("Creation Failed", error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Custom Header Bar */}
      <View style={[styles.header, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.backgroundSelected }]}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => router.back()}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.foreground }]}>Create Digital Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.form, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Text style={[styles.formSubtitle, { color: theme.textSecondary }]}>
            Enter your foundational details to start crafting your professional digital card.
          </Text>

          {/* First Name & Last Name in same Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: theme.foreground }]}>First Name *</Text>
              <TextInput 
                style={[styles.input, { 
                  borderColor: theme.backgroundSelected, 
                  color: theme.foreground, 
                  backgroundColor: theme.background 
                }]}
                placeholder="John"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
                value={firstName}
                onChangeText={setFirstName}
                editable={!loading}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: theme.foreground }]}>Last Name *</Text>
              <TextInput 
                style={[styles.input, { 
                  borderColor: theme.backgroundSelected, 
                  color: theme.foreground, 
                  backgroundColor: theme.background 
                }]}
                placeholder="Doe"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
                value={lastName}
                onChangeText={setLastName}
                editable={!loading}
              />
            </View>
          </View>

          {/* Job Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Job Title (Optional)</Text>
            <TextInput 
              style={[styles.input, { 
                borderColor: theme.backgroundSelected, 
                color: theme.foreground, 
                backgroundColor: theme.background 
              }]}
              placeholder="e.g. Senior Account Executive"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          {/* Company Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.foreground }]}>Company Name (Optional)</Text>
            <TextInput 
              style={[styles.input, { 
                borderColor: theme.backgroundSelected, 
                color: theme.foreground, 
                backgroundColor: theme.background 
              }]}
              placeholder="e.g. TechCorp Solutions"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              value={companyName}
              onChangeText={setCompanyName}
              editable={!loading}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]} 
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={[styles.submitButtonText, { color: "#ffffff" }]}>
                Create Card
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity 
            style={[styles.cancelButton, { borderColor: theme.backgroundSelected }]} 
            onPress={() => router.back()}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 88 : 56,
    paddingTop: Platform.OS === "ios" ? 44 : 0,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  form: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  formSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
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
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  submitButton: {
    height: 48,
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
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  cancelButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
