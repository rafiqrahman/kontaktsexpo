import React from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Linking, 
  Platform,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../hooks/useApi";
import { useKontaktsTheme } from "../store/themeContext";
import { Colors } from "../constants/theme";

interface SocialLink {
  platform: string;
  url: string;
}

export interface CardPreviewNativeProps {
  firstName: string;
  lastName: string;
  title?: string | null;
  companyName?: string | null;
  department?: string | null;
  headline?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  socialLinks?: SocialLink[] | any;
  themeColor?: string;
  fontFamily?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}

const getSocialDetails = (platform: string) => {
  const normalized = platform.toLowerCase();
  switch (normalized) {
    case "linkedin": return { icon: "logo-linkedin", color: "#0a66c2", label: "LinkedIn" };
    case "instagram": return { icon: "logo-instagram", color: "#e1306c", label: "Instagram" };
    case "twitter":
    case "x": 
      return { icon: "logo-twitter", color: "#000000", label: "Twitter" };
    case "youtube": return { icon: "logo-youtube", color: "#ff0000", label: "YouTube" };
    case "github": return { icon: "logo-github", color: "#24292e", label: "GitHub" };
    case "facebook": return { icon: "logo-facebook", color: "#1877f2", label: "Facebook" };
    default: return { icon: "globe-outline", color: "#71717a", label: platform };
  }
};

export default function CardPreviewNative(props: CardPreviewNativeProps) {
  const { 
    firstName, lastName, title, companyName, department, headline, bio, 
    email, phone, whatsapp, address, websiteUrl, socialLinks, themeColor, 
    fontFamily, avatarUrl, bannerUrl 
  } = props;
  
  const { theme } = useKontaktsTheme();
  const currentColors = Colors[theme];
  
  const themeValue = themeColor || currentColors.primary;
  const initials = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

  const getAbsoluteUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  let parsedSocials: SocialLink[] = [];
  try {
    if (typeof socialLinks === "string") {
      parsedSocials = JSON.parse(socialLinks);
    } else if (Array.isArray(socialLinks)) {
      parsedSocials = socialLinks;
    }
  } catch (err) {
    console.error("Failed to parse social links:", err);
  }

  const handleDial = (num: string) => Linking.openURL(`tel:${num}`);
  const handleEmail = (mail: string) => Linking.openURL(`mailto:${mail}`);
  const handleWeb = (url: string) => Linking.openURL(url);
  const handleWhatsapp = (num: string) => {
    const cleanNumber = num.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${cleanNumber}`);
  };
  const handleMaps = (addr: string) => {
    const query = encodeURIComponent(addr);
    const mapsUrl = Platform.select({
      ios: `maps://0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    }) || `https://maps.google.com/?q=${query}`;
    Linking.openURL(mapsUrl);
  };

  const getFontFamilyStyle = () => {
    if (fontFamily === "Serif") return Platform.OS === "ios" ? "Georgia" : "serif";
    if (fontFamily === "Mono") return Platform.OS === "ios" ? "CourierNewPSMT" : "monospace";
    return Platform.OS === "ios" ? "System" : "sans-serif";
  };

  return (
    <View style={styles.card}>
      <View style={styles.bannerContainer}>
        {bannerUrl ? (
          <Image source={{ uri: getAbsoluteUrl(bannerUrl)! }} style={styles.bannerImage} />
        ) : (
          <View style={[styles.bannerGradient, { backgroundColor: themeValue }]} />
        )}
      </View>

      <View style={styles.avatarContainer}>
        <View style={[styles.avatarCircle, { borderColor: "#ffffff" }]}>
          {avatarUrl ? (
            <Image source={{ uri: getAbsoluteUrl(avatarUrl)! }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: themeValue }]}>
              <Text style={styles.avatarPlaceholderText}>{initials || "K"}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoWrapper}>
        <Text style={[styles.name, { fontFamily: getFontFamilyStyle() }]}>
          {firstName || "First"} {lastName || "Last"}
        </Text>
        {title ? (
          <Text style={[styles.title, { fontFamily: getFontFamilyStyle() }]}>
            {title}
            {department ? <Text style={styles.department}>, {department}</Text> : null}
          </Text>
        ) : null}
        {companyName ? <Text style={styles.company}>{companyName}</Text> : null}
        {headline ? <Text style={styles.headline}>&quot;{headline}&quot;</Text> : null}
        {bio ? <Text style={styles.bio}>{bio}</Text> : null}
      </View>

      <View style={styles.contactList}>
        {phone && (
          <TouchableOpacity style={[styles.contactCell, { backgroundColor: `${themeValue}0D`, borderColor: `${themeValue}1A` }]} onPress={() => handleDial(phone)} activeOpacity={0.7}>
            <View style={[styles.cellIconWrapper, { backgroundColor: themeValue }]}><Ionicons name="call" size={16} color="#ffffff" /></View>
            <View style={styles.cellContent}><Text style={styles.cellLabel}>Phone</Text><Text style={styles.cellValue}>{phone}</Text></View>
          </TouchableOpacity>
        )}
        {whatsapp && (
          <TouchableOpacity style={[styles.contactCell, { backgroundColor: `#25D3661A`, borderColor: `#25D36633` }]} onPress={() => handleWhatsapp(whatsapp)} activeOpacity={0.7}>
            <View style={[styles.cellIconWrapper, { backgroundColor: "#25D366" }]}><Ionicons name="logo-whatsapp" size={16} color="#ffffff" /></View>
            <View style={styles.cellContent}><Text style={styles.cellLabel}>WhatsApp</Text><Text style={styles.cellValue}>{whatsapp}</Text></View>
          </TouchableOpacity>
        )}
        {email && (
          <TouchableOpacity style={[styles.contactCell, { backgroundColor: `${themeValue}0D`, borderColor: `${themeValue}1A` }]} onPress={() => handleEmail(email)} activeOpacity={0.7}>
            <View style={[styles.cellIconWrapper, { backgroundColor: themeValue }]}><Ionicons name="mail" size={16} color="#ffffff" /></View>
            <View style={styles.cellContent}><Text style={styles.cellLabel}>Email</Text><Text style={styles.cellValue}>{email}</Text></View>
          </TouchableOpacity>
        )}
        {websiteUrl && (
          <TouchableOpacity style={[styles.contactCell, { backgroundColor: `${themeValue}0D`, borderColor: `${themeValue}1A` }]} onPress={() => handleWeb(websiteUrl)} activeOpacity={0.7}>
            <View style={[styles.cellIconWrapper, { backgroundColor: themeValue }]}><Ionicons name="globe" size={16} color="#ffffff" /></View>
            <View style={styles.cellContent}><Text style={styles.cellLabel}>Website</Text><Text style={styles.cellValue}>{websiteUrl}</Text></View>
          </TouchableOpacity>
        )}
        {address && (
          <TouchableOpacity style={[styles.contactCell, { backgroundColor: `${themeValue}0D`, borderColor: `${themeValue}1A` }]} onPress={() => handleMaps(address)} activeOpacity={0.7}>
            <View style={[styles.cellIconWrapper, { backgroundColor: themeValue }]}><Ionicons name="location" size={16} color="#ffffff" /></View>
            <View style={styles.cellContent}><Text style={styles.cellLabel}>Location</Text><Text style={styles.cellValue}>{address}</Text></View>
          </TouchableOpacity>
        )}
      </View>

      {parsedSocials.length > 0 && (
        <View style={styles.socialsSection}>
          <Text style={styles.socialsLabel}>Social Channels</Text>
          <View style={styles.socialsRow}>
            {parsedSocials.map((social, index) => {
              const details = getSocialDetails(social.platform);
              return (
                <TouchableOpacity key={index} style={[styles.socialButton, { backgroundColor: `${details.color}15`, borderColor: `${details.color}25` }]} onPress={() => handleWeb(social.url)} activeOpacity={0.7}>
                  <Ionicons name={details.icon as any} size={18} color={details.color} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.watermark}><Text style={styles.watermarkText}>Powered by </Text><Text style={styles.watermarkBrand}>Kontakts</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", backgroundColor: "#ffffff", borderRadius: 24, borderWidth: 1, borderColor: "#e4e4e7", overflow: "hidden", marginBottom: 16 },
  bannerContainer: { height: 100, width: "100%" },
  bannerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  bannerGradient: { width: "100%", height: "100%", opacity: 0.9 },
  avatarContainer: { alignItems: "center", marginTop: -40, zIndex: 10 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, overflow: "hidden", backgroundColor: "#ffffff" },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  avatarPlaceholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
  avatarPlaceholderText: { fontSize: 22, fontWeight: "800", color: "#ffffff" },
  infoWrapper: { alignItems: "center", paddingHorizontal: 20, paddingTop: 12 },
  name: { fontSize: 20, fontWeight: "800", color: "#09090b" },
  title: { fontSize: 13, fontWeight: "700", color: "#4b5563", marginTop: 4, textAlign: "center" },
  department: { fontWeight: "400", color: "#9ca3af" },
  company: { fontSize: 11, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 },
  headline: { fontSize: 12, color: "#71717a", fontStyle: "italic", textAlign: "center", marginTop: 8 },
  bio: { fontSize: 11, color: "#71717a", textAlign: "center", marginTop: 6 },
  contactList: { paddingHorizontal: 16, marginTop: 18, gap: 10 },
  contactCell: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, padding: 10 },
  cellIconWrapper: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cellContent: { marginLeft: 12, flex: 1 },
  cellLabel: { fontSize: 9, fontWeight: "700", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 0.5 },
  cellValue: { fontSize: 12, fontWeight: "600", color: "#18181b", marginTop: 1 },
  socialsSection: { paddingHorizontal: 16, marginTop: 18, alignItems: "center" },
  socialsLabel: { fontSize: 10, fontWeight: "700", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  socialsRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 8 },
  socialButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  watermark: { flexDirection: "row", justifyContent: "center", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f4f4f5", paddingVertical: 12, marginTop: 20, backgroundColor: "#fafafa" },
  watermarkText: { fontSize: 9, fontWeight: "700", color: "#a1a1aa", textTransform: "uppercase" },
  watermarkBrand: { fontSize: 9, fontWeight: "800", color: "#52525b", textTransform: "uppercase" },
});
