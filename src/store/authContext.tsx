import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  user: UserProfile | null;
  signIn: (token: string, user: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "kontakts_user_token";
const USER_KEY = "kontakts_user_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Restore session on app load
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const savedUser = await SecureStore.getItemAsync(USER_KEY);
        
        if (token && savedUser) {
          setUserToken(token);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Failed to restore secure auth session:", e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (token: string, profile: UserProfile) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(profile));
      
      setUserToken(token);
      setUser(profile);
    } catch (e) {
      console.error("Failed to store credentials on sign in:", e);
      throw e;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      
      setUserToken(null);
      setUser(null);
    } catch (e) {
      console.error("Failed to delete credentials on sign out:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
