import { getItem } from "./storage";

let reminderTimeout: ReturnType<typeof setTimeout> | null = null;

export async function requestPermission(): Promise<boolean> {
	if (!("Notification" in window)) return false;
	if (Notification.permission === "granted") return true;
	const result = await Notification.requestPermission();
	return result === "granted";
}

export function showNotification(title: string, body: string): void {
	if (!("Notification" in window)) return;
	if (Notification.permission !== "granted") return;

	new Notification(title, {
		body,
		icon: "/icons/icon-192.png",
	});
}

export function scheduleStreakReminder(time: string): void {
	if (reminderTimeout) {
		clearTimeout(reminderTimeout);
		reminderTimeout = null;
	}

	const [hours, minutes] = time.split(":").map(Number);
	const now = new Date();
	const target = new Date();
	target.setHours(hours, minutes, 0, 0);

	// If the target time already passed today, schedule for tomorrow
	if (target <= now) {
		target.setDate(target.getDate() + 1);
	}

	const ms = target.getTime() - now.getTime();

	reminderTimeout = setTimeout(() => {
		checkAndNotify();
		// Reschedule for tomorrow
		scheduleStreakReminder(time);
	}, ms);
}

function checkAndNotify(): void {
	const today = new Date().toISOString().split("T")[0];
	const activities = getItem<{ date: string }[]>("daily-activities", []);
	const studiedToday = activities.some((a) => a.date === today);

	if (!studiedToday) {
		const gamification = getItem<{ streak: number }>("gamification", { streak: 0 });
		if (gamification.streak > 0) {
			showNotification(
				"Tvoja séria je v ohrození!",
				`Máš sériu ${gamification.streak} dní. Nezabudni sa dnes učiť!`,
			);
		} else {
			showNotification(
				"Nezabudni sa dnes učiť!",
				"Pár minút učenia denne ti pomôže na prijímačkách.",
			);
		}
	}
}
