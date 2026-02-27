import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	updateProfile,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	type User,
} from "firebase/auth";
import { auth } from "./config";

export async function signIn(
	email: string,
	password: string,
): Promise<User> {
	if (!auth) throw new Error("Firebase not configured");
	const credential = await signInWithEmailAndPassword(auth, email, password);
	return credential.user;
}

export async function register(
	email: string,
	password: string,
	displayName: string,
): Promise<User> {
	if (!auth) throw new Error("Firebase not configured");
	const credential = await createUserWithEmailAndPassword(auth, email, password);
	await updateProfile(credential.user, { displayName });
	return credential.user;
}

export async function signOut(): Promise<void> {
	if (!auth) return;
	await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
	if (!auth) {
		callback(null);
		return () => {};
	}
	return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
	return auth?.currentUser ?? null;
}
