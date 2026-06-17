import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  Platform
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../hooks/useApi";
import CardPreviewNative from "../../components/CardPreviewNative";

export default function CardDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { get } = useApi();
  const navigation = useNavigation();

  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCard();

      const unsubscribe = navigation.addListener("focus", () => {
        fetchCard(false);
      });

      return unsubscribe;
    }
  }, [id, navigation]);

  const fetchCard = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await get(`/api/v1/cards/${id}`);
      if (data.success && data.card) {
        setCard(data.card);
      }
    } catch (err) {
      console.error("Failed to load in-app card preview:", err);
      Alert.alert("Error", "Could not load business card preview.");
      router.back();
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#09090b" />
        <Text style={styles.loadingText}>Structuring card layout...</Text>
      </View>
    );
  }

  if (!card) return null;

  return (
    <View style={styles.container}>
      {/* Header bar with Back trigger */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#09090b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Preview</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => router.push(`/edit-card/${id}` as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={24} color="#09090b" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.previewContainer}>
          <CardPreviewNative 
            firstName={card.firstName}
            lastName={card.lastName}
            title={card.title}
            companyName={card.companyName}
            department={card.department}
            headline={card.headline}
            bio={card.bio}
            email={card.email}
            phone={card.phone}
            whatsapp={card.whatsapp}
            address={card.address}
            websiteUrl={card.websiteUrl}
            socialLinks={card.socialLinks}
            themeColor={card.themeColor}
            fontFamily={card.fontFamily}
            avatarUrl={card.avatarUrl}
            bannerUrl={card.bannerUrl}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#71717a",
  },
  header: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 88 : 56,
    paddingTop: Platform.OS === "ios" ? 44 : 0,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#09090b",
  },
  previewContainer: {
    alignItems: "center",
    width: "100%",
  },
});
