import { useAuth } from "../store/authContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/kontaktsapp";
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000/kontaktsapp";

export { API_BASE_URL, BASE_URL };

export function useApi() {
  const { userToken, signOut } = useAuth();

  const request = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    if (userToken) {
      headers.set("Authorization", `Bearer ${userToken}`);
    }
    const isFormData = !!(options.body && (
      options.body instanceof FormData ||
      typeof (options.body as any).append === "function" ||
      options.body.constructor?.name === "FormData"
    ));

    if (!headers.has("Content-Type") && !isFormData) {
      headers.set("Content-Type", "application/json");
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        if (!endpoint.includes("/auth/login") && !endpoint.includes("/auth/signup")) {
          await signOut();
          throw new Error("Session expired. Please log in again.");
        }
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error(`API Request error [${endpoint}]:`, error);
      throw error;
    }
  };

  const get = (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: "GET" });
  const post = (endpoint: string, body: any, options?: RequestInit) => request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) });
  const put = (endpoint: string, body: any, options?: RequestInit) => request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) });
  const del = (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: "DELETE" });

  return { get, post, put, del, request };
}
