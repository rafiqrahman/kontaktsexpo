import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Modal,
  Platform
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { useApi, BASE_URL } from "../../hooks/useApi";
import { useTheme } from "../../hooks/use-theme";
import { useKontaktsTheme } from "../../store/themeContext";
import CardPreviewNative from "../../components/CardPreviewNative";

const { width } = Dimensions.get("window");

interface CardItem {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  title: string | null;
  companyName: string | null;
  department: string | null;
  headline: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  websiteUrl: string | null;
  socialLinks: any;
  themeColor: string;
  fontFamily: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
}

export default function ShareScreen() {
  const router = useRouter();
  const { get } = useApi();
  const theme = useTheme();
  const { theme: themeName } = useKontaktsTheme();

  const getButtonTextColor = () => {
    if (themeName === "aurora" || themeName === "rose") {
      return "#ffffff";
    }
    return theme.background;
  };

  const buttonTextColor = getButtonTextColor();

  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrType, setQrType] = useState<"vcard" | "page">("vcard");
  const navigation = useNavigation();

  const fetchUserCards = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await get("/api/v1/cards");
      if (data.success && data.cards && data.cards.length > 0) {
        setCards(data.cards);
        setSelectedCard((prev) => {
          if (prev) {
            const found = data.cards.find((c: any) => c.id === prev.id);
            if (found) return found;
          }
          return data.cards[0];
        });
      } else {
        setCards([]);
        setSelectedCard(null);
      }
    } catch (e) {
      console.error("Failed to load cards for QR generation:", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserCards();

    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserCards(false);
    });

    return unsubscribe;
  }, [navigation]);

  const getQrValue = () => {
    if (!selectedCard) return "";
    const base = BASE_URL;
    if (qrType === "vcard") {
      return `${base}/api/v1/share/${selectedCard.id}/vcard`;
    }
    return `${base}/c/${selectedCard.slug}`;
  };

  const getModalSubtitle = () => {
    if (qrType === "vcard") {
      return "Let others scan this code with their camera to download your contact card directly to their phone's address book.";
    }
    return "Let others scan this code with their camera to instantly view your dynamic profile and exchange details.";
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.foreground }]}>Building your sharing space...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Floating Camera Scanner launcher in header */}
      <View style={[styles.header, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.backgroundSelected }]}>
        <TouchableOpacity 
          style={[styles.scanHeaderButton, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]} 
          onPress={() => router.push("/scanner")}
          activeOpacity={0.7}
        >
          <Ionicons name="scan-outline" size={20} color={theme.foreground} />
          <Text style={[styles.scanHeaderText, { color: theme.foreground }]}>Scan QR</Text>
        </TouchableOpacity>
        
        {selectedCard && cards.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardPicker}>
            {cards.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.pickerTab,
                  { backgroundColor: theme.background, borderColor: theme.backgroundSelected },
                  selectedCard.id === c.id && { backgroundColor: `${c.themeColor || theme.primary}15`, borderColor: c.themeColor || theme.primary }
                ]}
                onPress={() => setSelectedCard(c)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pickerText, { color: theme.textSecondary }, selectedCard.id === c.id && { color: c.themeColor || theme.primary }]}>
                  {c.firstName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : <View style={{ flex: 1 }} />}
      </View>

      {cards.length === 0 ? (
        /* Empty State */
        <View style={[styles.emptyContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Ionicons name="card-outline" size={64} color={theme.textSecondary} />
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
      ) : (
        /* Render Premium Layout Card Preview */
        <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
          {selectedCard && (
            <View style={styles.previewContainer}>
              <CardPreviewNative 
                firstName={selectedCard.firstName}
                lastName={selectedCard.lastName}
                title={selectedCard.title}
                companyName={selectedCard.companyName}
                department={selectedCard.department}
                headline={selectedCard.headline}
                bio={selectedCard.bio}
                email={selectedCard.email}
                phone={selectedCard.phone}
                whatsapp={selectedCard.whatsapp}
                address={selectedCard.address}
                websiteUrl={selectedCard.websiteUrl}
                socialLinks={selectedCard.socialLinks}
                themeColor={selectedCard.themeColor}
                fontFamily={selectedCard.fontFamily}
                avatarUrl={selectedCard.avatarUrl}
                bannerUrl={selectedCard.bannerUrl}
              />
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Bottom Share QR Button */}
      {selectedCard ? (
        <View style={styles.bottomBar}>
          <View style={styles.dualButtonRow}>
            <TouchableOpacity 
              style={[styles.shareQrButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setQrType("vcard");
                setQrModalVisible(true);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="qr-code" size={18} color={buttonTextColor} style={{ marginRight: 6 }} />
              <Text style={[styles.shareQrText, { color: buttonTextColor }]}>Share QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Scannable QR Code Overlapping Modal */}
      {selectedCard ? (
        <Modal
          animationType="slide"
          transparent={true}
          visible={qrModalVisible}
          onRequestClose={() => setQrModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement }]}>
              
              {/* Modal Drag/Indicator decorator */}
              <View style={[styles.dragIndicator, { backgroundColor: theme.backgroundSelected }]} />
              
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.foreground }]}>Scan to Connect</Text>
                <TouchableOpacity style={[styles.modalClose, { backgroundColor: theme.background }]} onPress={() => setQrModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                {getModalSubtitle()}
              </Text>

              {/* Segmented Selector for QR Type */}
              <View style={[styles.selectorContainer, { backgroundColor: theme.background, borderColor: theme.backgroundSelected, borderWidth: 1 }]}>
                <TouchableOpacity
                  style={[
                    styles.selectorButton,
                    qrType === "vcard" && { backgroundColor: theme.backgroundSelected }
                  ]}
                  onPress={() => setQrType("vcard")}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.selectorText,
                    { color: theme.textSecondary },
                    qrType === "vcard" && { color: theme.foreground, fontWeight: "800" }
                  ]}>
                    Direct Download
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectorButton,
                    qrType === "page" && { backgroundColor: theme.backgroundSelected }
                  ]}
                  onPress={() => setQrType("page")}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.selectorText,
                    { color: theme.textSecondary },
                    qrType === "page" && { color: theme.foreground, fontWeight: "800" }
                  ]}>
                    View Page
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Vector QR Code drawing inside frame */}
              <View style={[styles.qrFrame, { backgroundColor: "#ffffff", borderColor: theme.backgroundSelected }]}>
                <QRCode
                  value={getQrValue()}
                  size={width * 0.58}
                  color="#09090b"
                  backgroundColor="#ffffff"
                />
              </View>

              <View style={styles.modalOwnerInfo}>
                <Text style={[styles.modalOwnerName, { color: theme.foreground }]}>{selectedCard.firstName} {selectedCard.lastName}</Text>
                <Text style={[styles.modalOwnerTitle, { color: theme.textSecondary }]}>{selectedCard.title || "Representative"}</Text>
              </View>

              <View style={[styles.modalLinkBadge, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
                <Ionicons name="link" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.modalLinkText, { color: theme.foreground }]} numberOfLines={1}>
                  {qrType === "vcard" ? `api/v1/share/.../vcard` : `c/${selectedCard.slug}`}
                </Text>
              </View>

            </View>
          </View>
        </Modal>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 96, // Margin for bottom sticky bar
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
    height: 56,
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  scanHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  scanHeaderText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardPicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    gap: 6,
  },
  pickerTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerText: {
    fontSize: 11,
    fontWeight: "700",
  },
  previewContainer: {
    alignItems: "center",
    width: "100%",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: "center",
  },
  shareQrButton: {
    flex: 1,
    flexDirection: "row",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  shareQrText: {
    fontWeight: "800",
    fontSize: 14,
  },
  dualButtonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    borderWidth: 1,
    borderRadius: 24,
    margin: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
    alignItems: "center",
  },
  dragIndicator: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  modalSubtitle: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  qrFrame: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 16,
  },
  modalOwnerInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalOwnerName: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalOwnerTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  modalLinkBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  modalLinkText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  selectorContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    width: "100%",
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  selectorText: {
    fontSize: 13,
    fontWeight: "600",
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
