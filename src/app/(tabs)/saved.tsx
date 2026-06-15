import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  Linking,
  Modal,
  ScrollView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useApi } from "../../hooks/useApi";
import { useTheme } from "../../hooks/use-theme";
import CardPreviewNative from "../../components/CardPreviewNative";

interface SavedCardItem {
  id: string;
  userId: string;
  cardId: string;
  savedAt: string;
  card: {
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
  };
}

export default function SavedTab() {
  const { get, del } = useApi();
  const theme = useTheme();

  const [savedCards, setSavedCards] = useState<SavedCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SavedCardItem["card"] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchSavedCards();
  }, []);

  const fetchSavedCards = async () => {
    try {
      const data = await get("/api/v1/saved-cards");
      if (data.success && data.savedCards) {
        setSavedCards(data.savedCards);
      }
    } catch (e) {
      console.error("Failed to fetch saved cards on mobile tab:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSavedCards();
  };

  const handleOpenCard = (card: SavedCardItem["card"]) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  const handleRemoveSavedCard = async (cardId: string) => {
    Alert.alert(
      "Remove Contact",
      "Are you sure you want to remove this contact from your Kontakts wallet?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              const data = await del(`/api/v1/saved-cards/${cardId}`);
              if (data.success) {
                setSavedCards(prev => prev.filter(sc => sc.cardId !== cardId));
                setModalVisible(false);
                setSelectedCard(null);
                Alert.alert("Success", "Contact removed from wallet!");
              }
            } catch (err) {
              console.error("Failed to delete saved card:", err);
              Alert.alert("Error", "Could not remove contact.");
            }
          }
        }
      ]
    );
  };

  const handleSaveToContacts = async (card: SavedCardItem["card"]) => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need access to your contacts to save this person.");
        return;
      }

      const contact: any = {
        [Contacts.Fields.FirstName]: card.firstName,
        [Contacts.Fields.LastName]: card.lastName,
      };

      if (card.email) {
        contact[Contacts.Fields.Emails] = [{ label: "work", email: card.email }];
      }
      if (card.phone) {
        contact[Contacts.Fields.PhoneNumbers] = [{ label: "mobile", number: card.phone }];
      }
      if (card.companyName) {
        contact[Contacts.Fields.Company] = card.companyName;
      }
      if (card.title) {
        contact[Contacts.Fields.JobTitle] = card.title;
      }
      if (card.bio) {
        contact[Contacts.Fields.Note] = card.bio;
      }

      const contactId = await Contacts.addContactAsync(contact);
      if (contactId) {
        Alert.alert("Success 🎉", `${card.firstName} ${card.lastName} has been saved to your phone contacts!`);
      } else {
        Alert.alert("Failed", "Failed to add contact.");
      }
    } catch (err) {
      console.error("Failed to add contact:", err);
      Alert.alert("Error", "An error occurred while exporting contact.");
    }
  };

  const renderSavedItem = ({ item }: { item: SavedCardItem }) => {
    const card = item.card;
    if (!card) return null;
    
    return (
      <TouchableOpacity 
        style={[styles.contactCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
        onPress={() => handleOpenCard(card)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.avatarCircle, { backgroundColor: card.themeColor || theme.primary }]}>
            <Text style={styles.avatarInitials}>
              {`${card.firstName?.charAt(0) || ""}${card.lastName?.charAt(0) || ""}`.toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={[styles.nameText, { color: theme.foreground }]}>{card.firstName} {card.lastName}</Text>
            {card.title || card.companyName ? (
              <Text style={[styles.titleText, { color: theme.textSecondary }]} numberOfLines={1}>
                {card.title || "Representative"}{card.companyName ? ` at ${card.companyName}` : ""}
              </Text>
            ) : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.foreground }]}>Loading your wallet...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={savedCards}
        renderItem={renderSavedItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <Ionicons name="journal-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>Wallet is empty</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              When you scan other people's Kontakts QR codes, they will show up here as saved contacts.
            </Text>
          </View>
        }
      />

      {/* Card Detail Modal */}
      {selectedCard && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.backgroundSelected }]}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.foreground} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.foreground }]}>Saved Contact</Text>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleRemoveSavedCard(selectedCard.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                contentContainerStyle={styles.scrollContainer} 
                showsVerticalScrollIndicator={false}
              >
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
              </ScrollView>

              <View style={[styles.modalFooter, { borderTopColor: theme.backgroundSelected }]}>
                <TouchableOpacity 
                  style={[styles.exportButton, { backgroundColor: theme.primary }]}
                  onPress={() => handleSaveToContacts(selectedCard)}
                >
                  <Ionicons name="person-add" size={16} color={theme.background} style={{ marginRight: 6 }} />
                  <Text style={[styles.exportButtonText, { color: theme.background }]}>Export to Phone Contacts</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarInitials: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
  infoCol: {
    flex: 1,
    justifyContent: "center",
  },
  nameText: {
    fontSize: 15,
    fontWeight: "700",
  },
  titleText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  scrollContainer: {
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  exportButton: {
    flexDirection: "row",
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
