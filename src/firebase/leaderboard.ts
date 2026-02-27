import {
	collection,
	doc,
	getDocs,
	query,
	orderBy,
	limit,
	setDoc,
	where,
} from "firebase/firestore";
import { db } from "./config";
import type { ExamType, LeaderboardEntry, LeaderboardPeriod } from "../types";

export async function updateLeaderboardEntry(
	uid: string,
	entry: Omit<LeaderboardEntry, "uid">,
): Promise<void> {
	if (!db) return;
	const ref = doc(db, "leaderboard", entry.examType, "entries", uid);
	await setDoc(ref, { ...entry, uid, updatedAt: new Date().toISOString() });
}

export async function getLeaderboard(
	examType: ExamType,
	period: LeaderboardPeriod,
	max = 50,
): Promise<LeaderboardEntry[]> {
	if (!db) return [];

	const ref = collection(db, "leaderboard", examType, "entries");
	let q;

	if (period === "weekly") {
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		q = query(
			ref,
			where("updatedAt", ">=", weekAgo.toISOString()),
			orderBy("updatedAt", "desc"),
			limit(max),
		);
	} else if (period === "monthly") {
		const monthAgo = new Date();
		monthAgo.setDate(monthAgo.getDate() - 30);
		q = query(
			ref,
			where("updatedAt", ">=", monthAgo.toISOString()),
			orderBy("updatedAt", "desc"),
			limit(max),
		);
	} else {
		q = query(ref, orderBy("xp", "desc"), limit(max));
	}

	const snap = await getDocs(q);
	const entries = snap.docs.map((d) => d.data() as LeaderboardEntry);

	// Sort by XP descending for period-filtered queries
	if (period !== "allTime") {
		entries.sort((a, b) => b.xp - a.xp);
	}

	return entries;
}
