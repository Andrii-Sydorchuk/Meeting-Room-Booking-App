import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { UserProfile } from "../types";

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

/**
 * Registers a new user with Firebase Auth, sets their display name,
 * and creates a UserProfile document in Firestore ('users' collection).
 */
export async function registerUser({
  name,
  email,
  password,
}: RegisterUserData): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email ?? email,
    displayName: name,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", user.uid), userProfile);

  return userProfile;
}

export interface LoginUserData {
  email: string;
  password: string;
}

/**
 * Signs in an existing user with Firebase Auth and fetches their Firestore UserProfile.
 */
export async function loginUser({
  email,
  password,
}: LoginUserData): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  const profile = await getUserProfile(user.uid);
  if (profile) return profile;

  return {
    uid: user.uid,
    email: user.email ?? email,
    displayName: user.displayName ?? email.split("@")[0],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Fetches a user's profile document from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }

  return null;
}

/**
 * Signs out the currently authenticated user.
 */
export async function logoutUser() {
  await signOut(auth);
}
