import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Platform 
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Dynamic verification of Kontakts profile URL
    // e.g., contains /c/slug
    if (data.includes("/c/")) {
      try {
        Alert.alert(
          "Card Detected 🚀",
          "Connecting to digital business card profile...",
          [{ text: "Open Profile", onPress: () => openCardUrl(data) }]
        );
      } catch (err) {
        setScanned(false);
      }
    } else {
      Alert.alert(
        "QR Code Scanned",
        `Scanned Data:\n${data}`,
        [
          { text: "Open Link", onPress: () => {
            if (data.startsWith("http://") || data.startsWith("https://")) {
              openCardUrl(data);
            } else {
              setScanned(false);
            }
          }},
          { text: "Cancel", style: "cancel", onPress: () => setScanned(false) }
        ]
      );
    }
  };

  const openCardUrl = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        readerMode: false,
        enableBarCollapsing: true,
        dismissButtonStyle: "close",
      });
    } catch (error) {
      console.error("Failed to open WebBrowser:", error);
      Alert.alert("Error", "Could not load the web preview.");
    } finally {
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#09090b" />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#71717a" />
        <Text style={styles.title}>Camera Access Required</Text>
        <Text style={styles.subtitle}>
          We need access to your camera to scan recipient business QR codes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay scanning viewfinder reticle */}
        <View style={styles.overlayContainer}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.guideText}>Align QR code inside the frame to scan</Text>
          
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fafafa",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#09090b",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
    marginBottom: 24,
  },
  button: {
    height: 44,
    backgroundColor: "#09090b",
    borderRadius: 10,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  backLink: {
    marginTop: 16,
  },
  backText: {
    fontSize: 13,
    color: "#71717a",
    textDecorationLine: "underline",
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewfinder: {
    width: 240,
    height: 240,
    justifyContent: "space-between",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#ffffff",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  guideText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 24,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 64 : 32,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
