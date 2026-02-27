/**
 * Progress tracking utilities
 */

import type { CertificateRecord, DailyActivity, ExamType, MockTestResult, QuestionResult, Subject, SubjectProgress } from "../types";
import { getItem, setItem } from "./storage";

export function getQuestionHistory(): QuestionResult[] {
	return getItem<QuestionResult[]>("question-history", []);
}

export function addQuestionResult(result: QuestionResult): void {
	const history = getQuestionHistory();
	history.push(result);
	// Keep last 500 results
	if (history.length > 500) history.splice(0, history.length - 500);
	setItem("question-history", history);

	// Update daily activity
	updateDailyActivity(result);
}

export function getSubjectProgress(subject: Subject): SubjectProgress {
	const history = getQuestionHistory().filter(
		(r) => r.questionId.includes(subject) || true, // TODO: better filtering
	);
	const correct = history.filter((r) => r.correct).length;
	const avgTime =
		history.length > 0
			? history.reduce((sum, r) => sum + r.timeSpent, 0) / history.length
			: 0;

	return {
		subject,
		totalQuestions: history.length,
		correctAnswers: correct,
		averageTime: Math.round(avgTime),
		topicMastery: {},
	};
}

export function getDailyActivities(): DailyActivity[] {
	return getItem<DailyActivity[]>("daily-activities", []);
}

function updateDailyActivity(result: QuestionResult): void {
	const activities = getDailyActivities();
	const today = new Date().toISOString().split("T")[0];

	let todayActivity = activities.find((a) => a.date === today);
	if (!todayActivity) {
		todayActivity = {
			date: today,
			questionsAnswered: 0,
			correctAnswers: 0,
			xpEarned: 0,
			timeSpent: 0,
		};
		activities.push(todayActivity);
	}

	todayActivity.questionsAnswered += 1;
	if (result.correct) todayActivity.correctAnswers += 1;
	todayActivity.xpEarned += result.correct ? 10 : 2;
	todayActivity.timeSpent += Math.round(result.timeSpent / 60);

	// Keep last 90 days
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - 90);
	const filtered = activities.filter(
		(a) => new Date(a.date) >= cutoff,
	);

	setItem("daily-activities", filtered);
}

export function getMockTestResults(): MockTestResult[] {
	return getItem<MockTestResult[]>("mock-test-results", []);
}

export function saveMockTestResult(result: MockTestResult): void {
	const results = getMockTestResults();
	results.push(result);
	setItem("mock-test-results", results);
}

export function getUserSettings(): { examType: ExamType; name: string } {
	return getItem("user-settings", { examType: "8-rocne" as ExamType, name: "" });
}

export function saveUserSettings(settings: { examType: ExamType; name: string }): void {
	setItem("user-settings", settings);
}

// ============ CERTIFICATES ============

export function getCertificates(): CertificateRecord[] {
	return getItem<CertificateRecord[]>("certificates", []);
}

export function saveCertificate(cert: CertificateRecord): void {
	const certs = getCertificates();
	certs.push(cert);
	setItem("certificates", certs);
}
