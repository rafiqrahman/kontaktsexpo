import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  Linking 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useApi } from "../../hooks/useApi";
import { useTheme } from "../../hooks/use-theme";

interface LeadItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  jobTitle: string | null;
  note: string | null;
  createdAt: string;
  card: {
    firstName: string;
    lastName: string;
    themeColor: string;
  };
}

export default function LeadsTab() {
  const { get } = useApi();
  const theme = useTheme();

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await get("/api/v1/leads");
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.error("Failed to fetch leads on mobile tab:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert("Error", "Could not trigger phone dialer on this device.");
    });
  };

  const handleEmail = (emailAddress: string) => {
    Linking.openURL(`mailto:${emailAddress}`).catch(() => {
      Alert.alert("Error", "Could not trigger email composer on this device.");
    });
  };

  const handleSaveToContacts = async (item: LeadItem) => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need access to your contacts to save this person.");
        return;
      }

      const contact: any = {
        [Contacts.Fields.FirstName]: item.firstName,
        [Contacts.Fields.LastName]: item.lastName,
        [Contacts.Fields.Emails]: [{ label: "work", email: item.email }],
      };

      if (item.phone) {
        contact[Contacts.Fields.PhoneNumbers] = [{ label: "mobile", number: item.phone }];
      }
      if (item.companyName) {
        contact[Contacts.Fields.Company] = item.companyName;
      }
      if (item.jobTitle) {
        contact[Contacts.Fields.JobTitle] = item.jobTitle;
      }
      if (item.note) {
        contact[Contacts.Fields.Note] = item.note;
      }

      const contactId = await Contacts.addContactAsync(contact);
      if (contactId) {
        Alert.alert("Success 🎉", `${item.firstName} ${item.lastName} has been saved to your phone contacts!`);
      } else {
        Alert.alert("Failed", "Failed to add contact.");
      }
    } catch (err) {
      console.error("Failed to add contact:", err);
      Alert.alert("Error", "An error occurred while exporting contacts.");
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const renderLeadItem = ({ item }: { item: LeadItem }) => {
    return (
      <View style={[styles.leadCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
        <View style={styles.leadHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: theme.foreground }]}>{item.firstName} {item.lastName}</Text>
            {item.jobTitle || item.companyName ? (
              <Text style={[styles.jobInfo, { color: theme.textSecondary }]}>
                {item.jobTitle || "Representative"}{item.companyName ? ` at ${item.companyName}` : ""}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDate(item.createdAt)}</Text>
        </View>

        {item.note ? (
          <View style={[styles.noteBox, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
            <Text style={[styles.noteText, { color: theme.foreground }]} numberOfLines={3}>&quot;{item.note}&quot;</Text>
          </View>
        ) : null}

        {/* Source Tracker display */}
        <View style={styles.sourceRow}>
          <Text style={[styles.sourceLabel, { color: theme.textSecondary }]}>Captured via:</Text>
          <View style={[styles.sourceBadge, { backgroundColor: item.card.themeColor || theme.primary }]}>
            <Text style={styles.sourceText}>{item.card.firstName} {item.card.lastName}</Text>
          </View>
        </View>

        {/* Action Row */}
        <View style={[styles.actionRow, { borderTopColor: theme.backgroundSelected }]}>
          <TouchableOpacity 
            style={[styles.primaryActionButton, { backgroundColor: theme.primary }]} 
            onPress={() => handleSaveToContacts(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add" size={14} color={theme.background} />
            <Text style={[styles.primaryActionText, { color: theme.background }]}>Export Contact</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            {item.phone ? (
              <TouchableOpacity 
                style={[styles.circleButton, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]} 
                onPress={() => handleCall(item.phone!)}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={16} color={theme.foreground} />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity 
              style={[styles.circleButton, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]} 
              onPress={() => handleEmail(item.email)}
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={16} color={theme.foreground} />
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
        <Text style={[styles.loadingText, { color: theme.foreground }]}>Fetching captured leads...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={leads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <Ionicons name="people-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>No leads captured yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Share your business card URL or QR code, and when people share their contacts back, they will appear here.
            </Text>
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
  leadCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  leadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
  },
  jobInfo: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  date: {
    fontSize: 10,
    fontWeight: "600",
  },
  noteBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 12,
  },
  noteText: {
    fontSize: 11,
    fontStyle: "italic",
    lineHeight: 16,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  sourceLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  sourceText: {
    fontSize: 9,
    color: "#ffffff",
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 14,
    justifyContent: "space-between",
    alignItems: "center",
  },
  primaryActionButton: {
    flexDirection: "row",
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  secondaryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
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
});
