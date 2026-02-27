/**
 * Gamification engine: XP, levels, streaks, achievements
 */

import type { Achievement, GamificationState } from "../types";
import { getItem, setItem } from "./storage";
import { getQuestionHistory, getUserSettings } from "./progress";
import { updateLeaderboardEntry } from "../firebase/leaderboard";
import { getSyncUid } from "../firebase/sync";

const STORAGE_KEY = "gamification";

const XP_PER_CORRECT = 10;
const XP_PER_WRONG = 2; // Participation XP
const XP_STREAK_BONUS = 5;
const XP_PER_LEVEL = 100;
const XP_MOCK_TEST_BONUS = 50;

const ALL_ACHIEVEMENTS: Achievement[] = [
	{
		id: "first-question",
		title: "Prvý krok",
		description: "Odpovedal si na prvú otázku",
		icon: "Star",
	},
	{
		id: "streak-3",
		title: "Na vlne",
		description: "3 dni v rade",
		icon: "Flame",
	},
	{
		id: "streak-7",
		title: "Týždenný majster",
		description: "7 dní v rade",
		icon: "Flame",
	},
	{
		id: "streak-30",
		title: "Mesačný šampión",
		description: "30 dní v rade",
		icon: "Trophy",
	},
	{
		id: "streak-100",
		title: "Legendárny streak",
		description: "100 dní v rade",
		icon: "Crown",
	},
	{
		id: "level-5",
		title: "Učeň",
		description: "Dosiahol si level 5",
		icon: "Award",
	},
	{
		id: "level-10",
		title: "Pokročilý",
		description: "Dosiahol si level 10",
		icon: "Award",
	},
	{
		id: "perfect-test",
		title: "Perfektný test",
		description: "100% v skúšobnom teste",
		icon: "Crown",
	},
	{
		id: "100-questions",
		title: "Stovkár",
		description: "Odpovedal si na 100 otázok",
		icon: "BookOpen",
	},
	{
		id: "500-questions",
		title: "Päťstovkár",
		description: "Odpovedal si na 500 otázok",
		icon: "BookOpen",
	},
	{
		id: "speed-demon",
		title: "Rýchlik",
		description: "Správna odpoveď za menej ako 30 sekúnd",
		icon: "Zap",
	},
	{
		id: "night-owl",
		title: "Nočná sova",
		description: "Učenie po 22:00",
		icon: "Moon",
	},
	{
		id: "early-bird",
		title: "Ranné vtáča",
		description: "Učenie pred 7:00",
		icon: "Sun",
	},
];

export function getGamification(): GamificationState {
	return getItem<GamificationState>(STORAGE_KEY, {
		xp: 0,
		level: 1,
		streak: 0,
		longestStreak: 0,
		points: 0,
		lastActiveDate: "",
		achievements: [],
	});
}

export function saveGamification(state: GamificationState): void {
	setItem(STORAGE_KEY, state);
}

export function addXP(correct: boolean, timeSpent?: number): { state: GamificationState; xpGained: number; leveledUp: boolean; newAchievements: Achievement[] } {
	const state = getGamification();
	const today = new Date().toISOString().split("T")[0];

	// Update streak
	if (state.lastActiveDate !== today) {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = yesterday.toISOString().split("T")[0];

		if (state.lastActiveDate === yesterdayStr) {
			state.streak += 1;
		} else if (state.lastActiveDate !== today) {
			state.streak = 1;
		}
		state.lastActiveDate = today;
	}

	if (state.streak > state.longestStreak) {
		state.longestStreak = state.streak;
	}

	// Calculate XP
	let xpGained = correct ? XP_PER_CORRECT : XP_PER_WRONG;
	if (state.streak >= 3) xpGained += XP_STREAK_BONUS;

	state.xp += xpGained;
	state.points += correct ? 1 : 0;

	// Level up check
	const oldLevel = state.level;
	state.level = Math.floor(state.xp / XP_PER_LEVEL) + 1;
	const leveledUp = state.level > oldLevel;

	// Check achievements
	const newAchievements: Achievement[] = [];
	const hasAchievement = (id: string) => state.achievements.some((a) => a.id === id);

	if (!hasAchievement("first-question")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "first-question")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}

	if (state.streak >= 3 && !hasAchievement("streak-3")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "streak-3")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}

	if (state.streak >= 7 && !hasAchievement("streak-7")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "streak-7")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}

	if (state.level >= 5 && !hasAchievement("level-5")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "level-5")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}

	if (state.level >= 10 && !hasAchievement("level-10")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "level-10")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}

	if (state.streak >= 100 && !hasAchievement("streak-100")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "streak-100")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}

	// Question count achievements
	const totalQuestions = getQuestionHistory().length;
	if (totalQuestions >= 100 && !hasAchievement("100-questions")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "100-questions")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}
	if (totalQuestions >= 500 && !hasAchievement("500-questions")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "500-questions")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}

	// Speed demon: correct answer in under 30 seconds
	if (correct && timeSpent !== undefined && timeSpent < 30 && !hasAchievement("speed-demon")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "speed-demon")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}

	// Time-based achievements
	const currentHour = new Date().getHours();
	if (currentHour >= 22 && !hasAchievement("night-owl")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "night-owl")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}
	if (currentHour < 7 && !hasAchievement("early-bird")) {
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "early-bird")!, unlockedAt: today };
		state.achievements.push(ach);
		newAchievements.push(ach);
	}

	saveGamification(state);
	fireLeaderboardUpdate(state);

	return { state, xpGained, leveledUp, newAchievements };
}

export function addMockTestBonus(percentage: number): void {
	const state = getGamification();
	state.xp += XP_MOCK_TEST_BONUS;
	state.level = Math.floor(state.xp / XP_PER_LEVEL) + 1;

	if (percentage === 100 && !state.achievements.some((a) => a.id === "perfect-test")) {
		const today = new Date().toISOString().split("T")[0];
		const ach = { ...ALL_ACHIEVEMENTS.find((a) => a.id === "perfect-test")!, unlockedAt: today };
		state.achievements.push(ach);
	}

	saveGamification(state);
	fireLeaderboardUpdate(state);
}

function fireLeaderboardUpdate(state: GamificationState): void {
	const uid = getSyncUid();
	if (!uid) return;
	const settings = getUserSettings();
	updateLeaderboardEntry(uid, {
		name: settings.name || "Student",
		xp: state.xp,
		level: state.level,
		streak: state.streak,
		examType: settings.examType,
		updatedAt: new Date().toISOString(),
	}).catch(() => {});
}

export function getXPForNextLevel(state: GamificationState): { current: number; needed: number } {
	const currentLevelXP = (state.level - 1) * XP_PER_LEVEL;
	return {
		current: state.xp - currentLevelXP,
		needed: XP_PER_LEVEL,
	};
}

export { ALL_ACHIEVEMENTS };
