import type { ParentSettings } from "../types";
import { getItem, setItem } from "./storage";

const PARENT_KEY = "parent-settings";

async function hashPin(pin: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(pin + "ai-mentor-salt");
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getParentSettings(): ParentSettings | null {
	return getItem<ParentSettings | null>(PARENT_KEY, null);
}

export async function setupParentPin(pin: string): Promise<void> {
	const pinHash = await hashPin(pin);
	const settings: ParentSettings = {
		pinHash,
		dailyGoal: 20,
		createdAt: new Date().toISOString(),
	};
	setItem(PARENT_KEY, settings);
}

export async function verifyParentPin(pin: string): Promise<boolean> {
	const settings = getParentSettings();
	if (!settings) return false;
	const inputHash = await hashPin(pin);
	return inputHash === settings.pinHash;
}

export function getParentDailyGoal(): number {
	const settings = getParentSettings();
	return settings?.dailyGoal ?? 20;
}

export function setParentDailyGoal(goal: number): void {
	const settings = getParentSettings();
	if (settings) {
		settings.dailyGoal = goal;
		setItem(PARENT_KEY, settings);
	}
}
