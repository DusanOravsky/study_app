/**
 * Gamification engine: XP, levels, streaks, achievements
 */

import type { Achievement, GamificationState } from "../types";
import { getItem, setItem } from "./storage";

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

export function addXP(correct: boolean): { state: GamificationState; xpGained: number; leveledUp: boolean; newAchievements: Achievement[] } {
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

	saveGamification(state);

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
}

export function getXPForNextLevel(state: GamificationState): { current: number; needed: number } {
	const currentLevelXP = (state.level - 1) * XP_PER_LEVEL;
	return {
		current: state.xp - currentLevelXP,
		needed: XP_PER_LEVEL,
	};
}

export { ALL_ACHIEVEMENTS };
