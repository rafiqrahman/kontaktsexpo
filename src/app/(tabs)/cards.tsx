import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  FlatList, 
  Share, 
  Clipboard, 
  Alert 
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApi, BASE_URL } from "../../hooks/useApi";
import { useTheme } from "../../hooks/use-theme";

interface CardItem {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  title: string | null;
  companyName: string | null;
  themeColor: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  _count: {
    analytics: number;
    leads: number;
  };
}

export default function CardsTab() {
  const router = useRouter();
  const navigation = useNavigation();
  const { get } = useApi();
  const theme = useTheme();

  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCards();

    const unsubscribe = navigation.addListener("focus", () => {
      fetchCards();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchCards = async () => {
    try {
      const data = await get("/api/v1/cards");
      if (data.success && data.cards) {
        setCards(data.cards);
      }
    } catch (e) {
      console.error("Failed to fetch cards on cards tab:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCards();
  };

  const copyToClipboard = (slug: string) => {
    const url = `${BASE_URL}/c/${slug}`;
    Clipboard.setString(url);
    Alert.alert("Link Copied", "Business card URL copied to clipboard.");
  };

  const shareCard = async (slug: string, firstName: string) => {
    const url = `${BASE_URL}/c/${slug}`;
    try {
      await Share.share({
        message: `Connect with me! View my digital business card: ${url}`,
        url: url,
        title: `${firstName}'s BPAM Kontakts Card`,
      });
    } catch (error: any) {
      console.error("Failed to trigger share sheet:", error);
    }
  };

  const renderCardItem = ({ item }: { item: CardItem }) => {
    const color = item.themeColor || theme.primary;
    
    return (
      <View style={[styles.cardContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
        {/* Left vertical color bar */}
        <View style={[styles.colorBar, { backgroundColor: color }]} />
        
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.foreground }]} numberOfLines={1}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={[styles.title, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.title || "Owner"}
              </Text>
              {item.companyName && (
                <Text style={[styles.company, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.companyName}
                </Text>
              )}
            </View>
            <View style={[
              styles.statusBadge, 
              item.status === "ACTIVE" ? styles.statusActive : styles.statusPaused
            ]}>
              <Text style={[
                styles.statusText,
                item.status === "ACTIVE" ? styles.statusTextActive : styles.statusTextPaused
              ]}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Quick Metrics display */}
          <View style={[styles.metricsRow, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
            <View style={styles.metric}>
              <Ionicons name="eye" size={14} color={theme.textSecondary} />
              <Text style={[styles.metricValue, { color: theme.foreground }]}>
                {item._count?.analytics || 0} <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>views</Text>
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: theme.backgroundSelected }]} />
            <View style={styles.metric}>
              <Ionicons name="people" size={14} color={theme.textSecondary} />
              <Text style={[styles.metricValue, { color: theme.foreground }]}>
                {item._count?.leads || 0} <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>leads</Text>
              </Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={[styles.actionRow, { borderTopColor: theme.backgroundSelected }]}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]} 
              onPress={() => router.push(`/card/${item.id}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="eye-outline" size={16} color={theme.foreground} />
              <Text style={[styles.actionText, { color: theme.foreground }]}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]} 
              onPress={() => router.push(`/edit-card/${item.id}` as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color={theme.foreground} />
              <Text style={[styles.actionText, { color: theme.foreground }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]} 
              onPress={() => shareCard(item.slug, item.firstName)}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={16} color={theme.foreground} />
              <Text style={[styles.actionText, { color: theme.foreground }]}>Share</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.foreground }]}>Fetching your cards...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={cards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <Ionicons name="card-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>No business cards found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Create your first professional digital business card right here to start sharing!
            </Text>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: theme.primary }]} 
              onPress={() => router.push("/create-card" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={[styles.createButtonText, { color: "#ffffff" }]}>
                Create Digital Card
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
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
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  cardContainer: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  colorBar: {
    width: 6,
    height: "100%",
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },
  company: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: "#dcfce7", // green-100
  },
  statusPaused: {
    backgroundColor: "#fef3c7", // amber-100
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statusTextActive: {
    color: "#166534",
  },
  statusTextPaused: {
    color: "#92400e",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  metricLabel: {
    fontWeight: "500",
  },
  metricDivider: {
    width: 1,
    height: 16,
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 14,
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 240,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
