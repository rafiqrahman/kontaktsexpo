import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";
import { useAuth } from "../../store/authContext";
import { useApi, BASE_URL } from "../../hooks/useApi";
import { useKontaktsTheme } from "../../store/themeContext";
import { useTheme } from "../../hooks/use-theme";

interface CardItem {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  themeColor: string;
}

export default function SettingsTab() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useKontaktsTheme();
  const { get } = useApi();
  const themeColor = useTheme();

  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNfcWriting, setIsNfcWriting] = useState(false);

  useEffect(() => {
    fetchCards();
    NfcManager.start().catch((err) => {
      console.warn("NFC hardware not supported or disabled:", err);
    });

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const fetchCards = async () => {
    try {
      const data = await get("/api/v1/cards");
      if (data.success && data.cards) {
        setCards(data.cards);
        if (data.cards.length > 0) {
          setSelectedCard(data.cards[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load cards for NFC programming:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleNfcWrite = async () => {
    if (!selectedCard) {
      Alert.alert("Selection Required", "Please create a card profile first.");
      return;
    }

    const targetUrl = `${BASE_URL}/c/${selectedCard.slug}`;

    setIsNfcWriting(true);
    Alert.alert(
      "NFC Writer Active",
      "Bring the top back of your device close to your physical NTAG chip to program the digital card link...",
      [{ text: "Cancel", onPress: () => stopNfcWrite(), style: "cancel" }]
    );

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(targetUrl)]);
      
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        Alert.alert("Success 🎉", `Your card has been programmed successfully onto the physical tag!`);
      } else {
        throw new Error("Failed to encode URI NDEF bytes.");
      }
    } catch (ex: any) {
      console.warn("NFC Programming error:", ex);
      Alert.alert("Failed ❌", "NFC programming was interrupted or is unsupported.");
    } finally {
      stopNfcWrite();
    }
  };

  const stopNfcWrite = async () => {
    setIsNfcWriting(false);
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (e) {}
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: themeColor.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.container, { backgroundColor: themeColor.background }]}>
        
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: themeColor.backgroundElement, borderColor: themeColor.backgroundSelected }]}>
          <View style={[styles.avatarCircle, { backgroundColor: themeColor.primary }]}>
            <Text style={[styles.avatarText, { color: themeColor.background }]}>
              {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : "U"}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: themeColor.foreground }]}>{user?.firstName} {user?.lastName}</Text>
            <Text style={[styles.email, { color: themeColor.textSecondary }]}>{user?.email}</Text>
          </View>
        </View>

        {/* Theme Panel */}
        <View style={[styles.panel, { backgroundColor: themeColor.backgroundElement, borderColor: themeColor.backgroundSelected }]}>
          <View style={styles.panelHeader}>
            <Ionicons name="color-palette" size={20} color={themeColor.foreground} style={styles.panelIcon} />
            <Text style={[styles.panelTitle, { color: themeColor.foreground }]}>App Theme</Text>
          </View>
          <View style={styles.selectorScroll}>
            {(['classic', 'midnight', 'aurora', 'rose', 'neon', 'forest', 'sunset'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.selectorTab,
                  { backgroundColor: themeColor.background, borderColor: themeColor.backgroundSelected },
                  theme === t && { borderColor: themeColor.primary, backgroundColor: themeColor.backgroundSelected }
                ]}
                onPress={() => setTheme(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.selectorTabText, { color: themeColor.textSecondary }, theme === t && { color: themeColor.primary, fontWeight: '700' }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* NFC Programming Panel */}
        <View style={[styles.panel, { backgroundColor: themeColor.backgroundElement, borderColor: themeColor.backgroundSelected }]}>
          <View style={styles.panelHeader}>
            <Ionicons name="wifi" size={20} color={themeColor.foreground} style={styles.panelIcon} />
            <Text style={[styles.panelTitle, { color: themeColor.foreground }]}>NFC Card Programmer</Text>
          </View>
          <Text style={[styles.panelSubtitle, { color: themeColor.textSecondary }]}>
            Program physical NFC cards (NTAG213/215 chips) instantly. Tap the tag to anyone&apos;s phone to open your business card page.
          </Text>

          {loading ? (
            <ActivityIndicator size="small" color={themeColor.primary} style={{ marginVertical: 20 }} />
          ) : cards.length === 0 ? (
            <Text style={[styles.emptyText, { color: themeColor.textSecondary }]}>Create a card on the web dashboard to start programming NFC tags.</Text>
          ) : (
            <View style={styles.nfcForm}>
              <Text style={[styles.selectLabel, { color: themeColor.textSecondary }]}>Select Profile to Program:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
                {cards.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.selectorTab,
                      { backgroundColor: themeColor.background, borderColor: themeColor.backgroundSelected },
                      selectedCard?.id === c.id && { borderColor: themeColor.primary, backgroundColor: themeColor.backgroundSelected }
                    ]}
                    onPress={() => setSelectedCard(c)}
                    activeOpacity={0.8}
                  >
                    <Text 
                      style={[
                        styles.selectorTabText, 
                        { color: themeColor.textSecondary },
                        selectedCard?.id === c.id && { color: themeColor.primary, fontWeight: "700" }
                      ]}
                    >
                      {c.firstName} {c.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity 
                style={[styles.writeButton, { backgroundColor: themeColor.primary }, isNfcWriting && styles.writeButtonActive]} 
                onPress={handleNfcWrite}
                disabled={isNfcWriting}
                activeOpacity={0.8}
              >
                {isNfcWriting ? (
                  <ActivityIndicator color={themeColor.background} size="small" />
                ) : (
                  <>
                    <Ionicons name="pulse" size={18} color={themeColor.background} />
                    <Text style={[styles.writeButtonText, { color: themeColor.background }]}>Write to NFC Tag</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Support & Logout List */}
        <View style={[styles.list, { backgroundColor: themeColor.backgroundElement, borderColor: themeColor.backgroundSelected }]}>
          <TouchableOpacity style={[styles.listItem, { borderBottomColor: themeColor.backgroundSelected }]} onPress={() => Alert.alert("Version", "BPAM Kontakts v1.0.0 (Expo SDK 56)")}>
            <View style={styles.listItemLeft}>
              <Ionicons name="information-circle-outline" size={20} color={themeColor.textSecondary} />
              <Text style={[styles.listItemText, { color: themeColor.foreground }]}>App Version</Text>
            </View>
            <Text style={[styles.listItemRight, { color: themeColor.textSecondary }]}>1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={styles.listItemLeft}>
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text style={[styles.listItemText, styles.logoutText]}>Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "800",
    fontSize: 16,
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "800",
  },
  email: {
    fontSize: 12,
    marginTop: 2,
  },
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  panelIcon: {
    marginRight: 8,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  panelSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
  },
  nfcForm: {
    marginTop: 16,
  },
  selectLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  selectorScroll: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 2,
    marginBottom: 16,
    gap: 8,
  },
  selectorTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    marginRight: 8,
  },
  selectorTabActive: {
    borderWidth: 2,
  },
  selectorTabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  selectorTabTextActive: {
    fontWeight: "700",
  },
  writeButton: {
    height: 44,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 16,
  },
  writeButtonActive: {
    opacity: 0.7,
  },
  writeButtonText: {
    fontWeight: "700",
    fontSize: 13,
    marginLeft: 8,
  },
  list: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    height: 52,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
  },
  listItemRight: {
    fontSize: 13,
    fontWeight: "600",
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#dc2626",
  },
});
