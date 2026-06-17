import React, { useState, useEffect } from "react";
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
  ScrollView,
  Image
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useApi, API_BASE_URL } from "../../hooks/useApi";
import { useTheme } from "../../hooks/use-theme";
import { useAuth } from "../../store/authContext";

const THEME_COLOR_PRESETS = [
  { name: "Slate", hex: "#1E293B" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Sunset", hex: "#f97316" }
];

export default function EditCardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { get, put, request } = useApi();
  const { userToken } = useAuth();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<"avatar" | "banner" | null>(null);

  // Profile data states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [department, setDepartment] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  // Contact states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Social handles states
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [github, setGithub] = useState("");
  const [facebook, setFacebook] = useState("");

  // Style states
  const [themeColor, setThemeColor] = useState("#1E293B");
  const [fontFamily, setFontFamily] = useState("Sans");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCardDetails();
    }
  }, [id]);

  const loadCardDetails = async () => {
    try {
      const data = await get(`/api/v1/cards/${id}`);
      if (data.success && data.card) {
        const card = data.card;
        setFirstName(card.firstName || "");
        setLastName(card.lastName || "");
        setTitle(card.title || "");
        setCompanyName(card.companyName || "");
        setDepartment(card.department || "");
        setHeadline(card.headline || "");
        setBio(card.bio || "");
        setEmail(card.email || "");
        setPhone(card.phone || "");
        setWhatsapp(card.whatsapp || "");
        setAddress(card.address || "");
        setWebsiteUrl(card.websiteUrl || "");
        setThemeColor(card.themeColor || "#1E293B");
        setFontFamily(card.fontFamily || "Sans");
        setAvatarUrl(card.avatarUrl || null);
        setBannerUrl(card.bannerUrl || null);

        // Parse social channels
        let socials: any[] = [];
        try {
          if (typeof card.socialLinks === "string") {
            socials = JSON.parse(card.socialLinks);
          } else if (Array.isArray(card.socialLinks)) {
            socials = card.socialLinks;
          }
        } catch (_) {}

        setLinkedin(socials.find(s => s.platform === "linkedin")?.url || "");
        setInstagram(socials.find(s => s.platform === "instagram")?.url || "");
        setTwitter(socials.find(s => s.platform === "twitter" || s.platform === "x")?.url || "");
        setYoutube(socials.find(s => s.platform === "youtube")?.url || "");
        setGithub(socials.find(s => s.platform === "github")?.url || "");
        setFacebook(socials.find(s => s.platform === "facebook")?.url || "");
      }
    } catch (err: any) {
      console.error("Failed to load card details:", err);
      Alert.alert("Error", "Could not load business card properties.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getAbsoluteUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  const handleImagePick = (type: "avatar" | "banner") => {
    Alert.alert(
      `Update ${type === "avatar" ? "Avatar" : "Banner Banner"}`,
      `Would you like to take a photo using your camera or select an existing file from your gallery?`,
      [
        {
          text: "📷 Take Photo (Camera)",
          onPress: () => pickImage(type, true),
        },
        {
          text: "🖼️ Choose from Gallery (File)",
          onPress: () => pickImage(type, false),
        },
        {
          text: "Cancel",
          style: "cancel",
        }
      ]
    );
  };

  const pickImage = async (type: "avatar" | "banner", useCamera: boolean) => {
    try {
      const permissionResult = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", `Permission to access ${useCamera ? "camera" : "gallery"} is required to update images.`);
        return;
      }

      const aspect: [number, number] = type === "avatar" ? [1, 1] : [3, 1];
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect,
        quality: 0.8,
        base64: true,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadFile(type, asset.uri, asset.base64 || null);
      }
    } catch (err: any) {
      console.error("Image pick error:", err);
      Alert.alert("Error", "Could not capture or choose image.");
    }
  };

  const uploadFile = async (type: "avatar" | "banner", localUri: string, base64Data: string | null) => {
    setUploadingField(type);
    console.log(`[uploadFile] Initializing upload. Type: ${type}, localUri: ${localUri}, hasBase64: ${!!base64Data}`);
    try {
      const filename = localUri.split("/").pop() || "upload.jpg";

      let res: any;

      if (base64Data) {
        console.log(`[uploadFile] Sending Base64 JSON upload...`);
        res = await request("/api/v1/upload", {
          method: "POST",
          body: JSON.stringify({
            file: base64Data,
            name: filename,
          }),
          headers: {
            "Content-Type": "application/json",
          }
        });
      } else {
        console.log(`[uploadFile] Falling back to Blob upload...`);
        const localResponse = await fetch(localUri);
        const blob = await localResponse.blob();
        console.log(`[uploadFile] Local file fetched. Blob size: ${blob.size}, type: ${blob.type}`);

        const formData = new FormData();
        formData.append("file", blob, filename);

        const url = `${API_BASE_URL}/api/v1/upload`;
        console.log(`[uploadFile] Sending fetch to URL: ${url}`);
        
        const headers: Record<string, string> = {};
        if (userToken) {
          headers["Authorization"] = `Bearer ${userToken}`;
        }

        const response = await fetch(url, {
          method: "POST",
          body: formData,
          headers,
        });

        res = await response.json();
      }

      console.log(`[uploadFile] Response:`, JSON.stringify(res));

      if (res.success && res.url) {
        if (type === "avatar") {
          setAvatarUrl(res.url);
        } else {
          setBannerUrl(res.url);
        }
        Alert.alert("Success", `${type === "avatar" ? "Avatar" : "Banner"} uploaded successfully!`);
      } else {
        Alert.alert("Upload Failed", res.error || "Could not save image to server.");
      }
    } catch (err: any) {
      console.error("[uploadFile] Exception occurred:", err);
      Alert.alert("Upload Error", err.message || "An error occurred during file transfer.");
    } finally {
      setUploadingField(null);
    }
  };

  const formatUrl = (input: string, platform: string) => {
    if (!input.trim()) return "";
    const clean = input.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    
    const handle = clean.replace(/^@/, "");
    switch (platform) {
      case "linkedin": return `https://linkedin.com/in/${handle}`;
      case "instagram": return `https://instagram.com/${handle}`;
      case "twitter": return `https://x.com/${handle}`;
      case "youtube": return `https://youtube.com/@${handle}`;
      case "github": return `https://github.com/${handle}`;
      case "facebook": return `https://facebook.com/${handle}`;
      default: return clean;
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Required Fields", "Please make sure First Name and Last Name are entered.");
      return;
    }

    setSaving(true);

    const socialsList = [];
    if (linkedin.trim()) socialsList.push({ platform: "linkedin", url: formatUrl(linkedin, "linkedin") });
    if (instagram.trim()) socialsList.push({ platform: "instagram", url: formatUrl(instagram, "instagram") });
    if (twitter.trim()) socialsList.push({ platform: "twitter", url: formatUrl(twitter, "twitter") });
    if (youtube.trim()) socialsList.push({ platform: "youtube", url: formatUrl(youtube, "youtube") });
    if (github.trim()) socialsList.push({ platform: "github", url: formatUrl(github, "github") });
    if (facebook.trim()) socialsList.push({ platform: "facebook", url: formatUrl(facebook, "facebook") });

    try {
      const res = await put(`/api/v1/cards/${id}`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        title: title.trim(),
        companyName: companyName.trim(),
        department: department.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        address: address.trim(),
        websiteUrl: websiteUrl.trim(),
        socialLinks: socialsList,
        themeColor,
        fontFamily,
        avatarUrl,
        bannerUrl,
      });

      if (res.success) {
        Alert.alert("Changes Saved 🎉", "Your business card has been updated successfully.", [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]);
      } else {
        Alert.alert("Error", "Could not save card modifications.");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      Alert.alert("Save Error", err.message || "Could not write changes to database.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.foreground }]}>Loading card properties...</Text>
      </View>
    );
  }

  const initials = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.backgroundSelected }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} disabled={saving}>
          <Ionicons name="close" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.foreground }]}>Edit Digital Card</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Ionicons name="checkmark" size={24} color={theme.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* Banner and Avatar Visual Preview Section */}
        <View style={styles.visualSection}>
          <TouchableOpacity 
            style={[styles.bannerWrapper, { backgroundColor: themeColor }]} 
            onPress={() => handleImagePick("banner")}
            activeOpacity={0.8}
            disabled={uploadingField !== null}
          >
            {bannerUrl ? (
              <Image source={{ uri: getAbsoluteUrl(bannerUrl)! }} style={styles.bannerImage} />
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Ionicons name="image-outline" size={24} color="#ffffff" style={{ opacity: 0.6 }} />
                <Text style={styles.bannerPlaceholderText}>Tap to add Banner</Text>
              </View>
            )}
            {uploadingField === "banner" && (
              <View style={styles.uploadingOverlay}><ActivityIndicator color="#ffffff" /></View>
            )}
            <View style={styles.editBadge}><Ionicons name="camera" size={12} color="#ffffff" /></View>
          </TouchableOpacity>

          <View style={styles.avatarOverlapContainer}>
            <TouchableOpacity 
              style={[styles.avatarCircle, { borderColor: theme.backgroundElement }]} 
              onPress={() => handleImagePick("avatar")}
              activeOpacity={0.8}
              disabled={uploadingField !== null}
            >
              {avatarUrl ? (
                <Image source={{ uri: getAbsoluteUrl(avatarUrl)! }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: themeColor }]}>
                  <Text style={styles.avatarInitials}>{initials || "K"}</Text>
                </View>
              )}
              {uploadingField === "avatar" && (
                <View style={styles.uploadingOverlay}><ActivityIndicator color="#ffffff" /></View>
              )}
              <View style={[styles.editBadge, styles.avatarEditBadge]}><Ionicons name="camera" size={12} color="#ffffff" /></View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 1: Branding & Appearance */}
        <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Card Design & Style</Text>

          {/* Theme Preset Selector */}
          <Text style={[styles.label, { color: theme.foreground, marginBottom: 10 }]}>Theme Color Accent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorsRow}>
            {THEME_COLOR_PRESETS.map((p) => (
              <TouchableOpacity
                key={p.hex}
                style={[
                  styles.colorBubble, 
                  { backgroundColor: p.hex },
                  themeColor.toLowerCase() === p.hex.toLowerCase() && styles.colorBubbleActive
                ]}
                onPress={() => setThemeColor(p.hex)}
              >
                {themeColor.toLowerCase() === p.hex.toLowerCase() && (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Hex Input */}
          <View style={[styles.inputGroup, { marginTop: 12 }]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Custom Hex Color</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="#000000"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              value={themeColor}
              onChangeText={setThemeColor}
            />
          </View>

          {/* Font Family Selection */}
          <View style={[styles.inputGroup, { marginTop: 8 }]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Font Family</Text>
            <View style={styles.fontFamilySelector}>
              {["Sans", "Serif", "Mono"].map((font) => (
                <TouchableOpacity
                  key={font}
                  style={[
                    styles.fontOption, 
                    { backgroundColor: theme.background, borderColor: theme.backgroundSelected },
                    fontFamily === font && { backgroundColor: themeColor, borderColor: themeColor }
                  ]}
                  onPress={() => setFontFamily(font)}
                >
                  <Text style={[
                    styles.fontOptionText, 
                    { color: theme.foreground },
                    fontFamily === font && { color: "#ffffff", fontWeight: "700" }
                  ]}>
                    {font}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Section 2: Professional Profile */}
        <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Professional Profile</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: theme.foreground }]}>First Name *</Text>
              <TextInput 
                style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
                placeholder="John"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: theme.foreground }]}>Last Name *</Text>
              <TextInput 
                style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
                placeholder="Doe"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Job Title</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="e.g. Senior Regional Manager"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Department</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="e.g. Enterprise Sales"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              value={department}
              onChangeText={setDepartment}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Company Name</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="e.g. TechCorp Dynamics"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Card Headline</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="e.g. Driving innovation through software"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="sentences"
              value={headline}
              onChangeText={setHeadline}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Short Bio / Summary</Text>
            <TextInput 
              style={[styles.input, styles.textArea, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="Tell visitors about your skills, focus, and history..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoCapitalize="sentences"
              value={bio}
              onChangeText={setBio}
            />
          </View>
        </View>

        {/* Section 3: Contact Details */}
        <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Contact Information</Text>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Email Address</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="john@company.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Direct Phone</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="+1 (555) 019-2834"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>WhatsApp Number</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="e.g. +15550192834"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
              value={whatsapp}
              onChangeText={setWhatsapp}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Office Address / Location</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="e.g. 100 Pine St, San Francisco, CA"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Personal / Corporate Website</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="https://company.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              value={websiteUrl}
              onChangeText={setWebsiteUrl}
            />
          </View>
        </View>

        {/* Section 4: Social Accounts */}
        <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected, marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Social Media handles</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Enter either your profile handle/username (e.g. jdoe) or full profile link.
          </Text>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>LinkedIn Username</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="john-doe-representative"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={linkedin}
              onChangeText={setLinkedin}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Instagram Handle</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="john_doe"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={instagram}
              onChangeText={setInstagram}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>X / Twitter Username</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="john_doe"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={twitter}
              onChangeText={setTwitter}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>YouTube Username/Channel</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="john_doe_channel"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={youtube}
              onChangeText={setYoutube}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>GitHub Username</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="johndoe"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={github}
              onChangeText={setGithub}
            />
          </View>

          <View style={[styles.inputGroup]}>
            <Text style={[styles.label, { color: theme.foreground }]}>Facebook Username</Text>
            <TextInput 
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.foreground, backgroundColor: theme.background }]}
              placeholder="john.doe.representative"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={facebook}
              onChangeText={setFacebook}
            />
          </View>
        </View>

        {/* Big prominent Action Buttons at the bottom */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.saveChangesButton, { backgroundColor: theme.primary }, saving && styles.buttonDisabled]} 
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Ionicons name="checkmark-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            )}
            <Text style={[styles.saveChangesText, { color: "#ffffff" }]}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dismissButton, { borderColor: theme.backgroundSelected }]} 
            onPress={() => router.back()}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={[styles.dismissText, { color: theme.textSecondary }]}>Cancel</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  visualSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  bannerWrapper: {
    width: "100%",
    height: 110,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.8,
  },
  bannerPlaceholderText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    opacity: 0.8,
  },
  avatarOverlapContainer: {
    marginTop: -45,
    zIndex: 10,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditBadge: {
    right: 4,
    bottom: 4,
  },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
    marginTop: -10,
  },
  colorsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  colorBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  colorBubbleActive: {
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  fontFamilySelector: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  fontOption: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fontOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputGroup: {
    marginBottom: 14,
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
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  actionButtonsContainer: {
    paddingHorizontal: 4,
    marginBottom: 40,
  },
  saveChangesButton: {
    flexDirection: "row",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  saveChangesText: {
    fontSize: 16,
    fontWeight: "700",
  },
  dismissButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dismissText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
