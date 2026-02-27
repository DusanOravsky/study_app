/**
 * LocalStorage persistence layer.
 * Syncs to Firestore when authenticated.
 */

import { getSyncUid, syncToFirestore } from "../firebase/sync";

const PREFIX = "ai-mentor:";

export function getItem<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(PREFIX + key);
		if (raw === null) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

export function setItem<T>(key: string, value: T): void {
	try {
		localStorage.setItem(PREFIX + key, JSON.stringify(value));
	} catch (e) {
		console.warn("Failed to save to localStorage:", e);
	}

	// Fire-and-forget sync to Firestore if authenticated
	const uid = getSyncUid();
	if (uid) syncToFirestore(uid);
}

export function removeItem(key: string): void {
	localStorage.removeItem(PREFIX + key);
}

export function clearAll(): void {
	const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
	for (const k of keys) {
		localStorage.removeItem(k);
	}
}

export function getDarkMode(): boolean {
	return getItem<boolean>("dark-mode", false);
}

export function setDarkMode(enabled: boolean): void {
	setItem("dark-mode", enabled);
}
