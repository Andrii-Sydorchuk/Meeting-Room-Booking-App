import { useContext } from "react";
import AuthContext, { type AuthContextData } from "../context/AuthContext";

/**
 * Custom hook to consume AuthContext safely within AuthProvider.
 */
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
