import { createContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  type LoginUserData,
  type RegisterUserData,
} from "../services/authService";
import type { UserProfile } from "../types";

export interface AuthContextData {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (credentials: LoginUserData) => Promise<UserProfile>;
  register: (data: RegisterUserData) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile) {
            setProfile(userProfile);
          } else {
            setProfile({
              uid: user.uid,
              email: user.email ?? "",
              displayName:
                user.displayName ?? user.email?.split("@")[0] ?? "User",
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Failed to load user profile:", err);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function login(credentials: LoginUserData): Promise<UserProfile> {
    const userProfile = await loginUser(credentials);
    setProfile(userProfile);

    return userProfile;
  }

  async function register(data: RegisterUserData): Promise<UserProfile> {
    const userProfile = await registerUser(data);
    setProfile(userProfile);

    return userProfile;
  }

  async function logout() {
    await logoutUser();

    setFirebaseUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
