import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

const PREFIX = "ai-mentor:";
const SYNC_KEYS = [
	"gamification",
	"question-history",
	"daily-activities",
	"mock-test-results",
	"user-settings",
	"dark-mode",
	"certificates",
	"study-plan",
	"study-plan-days",
	"notification-settings",
];

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let currentUid: string | null = null;

export function initSync(uid: string): void {
	currentUid = uid;
}

export function stopSync(): void {
	currentUid = null;
	if (syncTimeout) {
		clearTimeout(syncTimeout);
		syncTimeout = null;
	}
}

export function syncToFirestore(uid?: string): void {
	const targetUid = uid ?? currentUid;
	if (!targetUid || !db) return;

	if (syncTimeout) clearTimeout(syncTimeout);
	syncTimeout = setTimeout(() => {
		doSync(targetUid).catch((e) =>
			console.warn("Firestore sync failed:", e),
		);
	}, 500);
}

async function doSync(uid: string): Promise<void> {
	if (!db) return;
	const data: Record<string, unknown> = { updatedAt: new Date().toISOString() };

	for (const key of SYNC_KEYS) {
		const raw = localStorage.getItem(PREFIX + key);
		if (raw !== null) {
			try {
				data[key] = JSON.parse(raw);
			} catch {
				data[key] = raw;
			}
		}
	}

	await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function syncFromFirestore(uid: string): Promise<void> {
	if (!db) return;
	const snap = await getDoc(doc(db, "users", uid));
	if (!snap.exists()) return;

	const data = snap.data();
	for (const key of SYNC_KEYS) {
		if (key in data) {
			localStorage.setItem(PREFIX + key, JSON.stringify(data[key]));
		}
	}
}

export function getSyncUid(): string | null {
	return currentUid;
}
