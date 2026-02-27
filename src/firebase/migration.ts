import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";
import type { GamificationState } from "../types";

const PREFIX = "ai-mentor:";
const MIGRATED_KEY = PREFIX + "migrated";

export async function migrateToFirestore(uid: string): Promise<void> {
	if (!db) return;
	if (localStorage.getItem(MIGRATED_KEY) === "true") return;

	const userRef = doc(db, "users", uid);
	const snap = await getDoc(userRef);

	if (!snap.exists()) {
		// First login: push all localStorage to Firestore
		const data: Record<string, unknown> = { createdAt: new Date().toISOString() };
		for (const [k, v] of Object.entries(localStorage)) {
			if (k.startsWith(PREFIX) && k !== MIGRATED_KEY) {
				const key = k.slice(PREFIX.length);
				try {
					data[key] = JSON.parse(v);
				} catch {
					data[key] = v;
				}
			}
		}
		await setDoc(userRef, data);
	} else {
		// Firestore exists: merge — keep higher XP, union achievements
		const remote = snap.data();
		const localGamRaw = localStorage.getItem(PREFIX + "gamification");
		if (localGamRaw && remote.gamification) {
			const local: GamificationState = JSON.parse(localGamRaw);
			const remoteGam = remote.gamification as GamificationState;

			const merged: GamificationState = {
				xp: Math.max(local.xp, remoteGam.xp),
				level: Math.max(local.level, remoteGam.level),
				streak: Math.max(local.streak, remoteGam.streak),
				longestStreak: Math.max(local.longestStreak, remoteGam.longestStreak),
				points: Math.max(local.points, remoteGam.points),
				lastActiveDate:
					local.lastActiveDate > remoteGam.lastActiveDate
						? local.lastActiveDate
						: remoteGam.lastActiveDate,
				achievements: unionAchievements(local.achievements, remoteGam.achievements),
			};
			localStorage.setItem(PREFIX + "gamification", JSON.stringify(merged));
			await setDoc(userRef, { gamification: merged }, { merge: true });
		}

		// Pull remaining remote data that doesn't exist locally
		for (const [key, val] of Object.entries(remote)) {
			if (key === "gamification" || key === "createdAt" || key === "updatedAt") continue;
			if (!localStorage.getItem(PREFIX + key)) {
				localStorage.setItem(PREFIX + key, JSON.stringify(val));
			}
		}
	}

	localStorage.setItem(MIGRATED_KEY, "true");
}

function unionAchievements(
	a: GamificationState["achievements"],
	b: GamificationState["achievements"],
): GamificationState["achievements"] {
	const map = new Map(a.map((x) => [x.id, x]));
	for (const item of b) {
		if (!map.has(item.id)) map.set(item.id, item);
	}
	return [...map.values()];
}
