import type {
	ExamType,
	StudyDayTarget,
	StudyPlanConfig,
	StudyPlanDay,
	Subject,
} from "../types";
import { getItem, setItem } from "./storage";

const PLAN_KEY = "study-plan";
const DAYS_KEY = "study-plan-days";

const mathTopics8 = ["Zlomky", "Desatinne cisla", "Geometria", "Slovne ulohy", "Zakladne operacie"];
const mathTopics4 = ["Zlomky", "Percenta", "Rovnice", "Geometria", "Slovne ulohy", "Funkcie"];
const slovakTopics = ["Vybrane slova", "Gramatika", "Pravopis i/y", "Vzory", "Pady", "Literatura"];
const germanTopics = ["Wortschatz", "Grammatik", "Leseverstaendnis", "Artikel", "Praepositionen"];

function getTopicsForSubject(subject: Subject, examType: ExamType): string[] {
	if (subject === "math") {
		return examType === "8-rocne" ? mathTopics8 : mathTopics4;
	}
	if (subject === "german") return germanTopics;
	return slovakTopics;
}

function getDailyQuestionCount(examType: ExamType): number {
	if (examType === "8-rocne") return 20;
	if (examType === "bilingvalne") return 25;
	return 24;
}

export function createStudyPlan(
	examType: ExamType,
	subjects: Subject[],
	topicMastery: Record<string, number>,
): StudyPlanConfig {
	const plan: StudyPlanConfig = {
		id: `plan-${Date.now()}`,
		examType,
		startDate: new Date().toISOString().split("T")[0],
		totalDays: 60,
		currentDay: 1,
		completedDays: 0,
		subjects,
		weakTopics: { ...topicMastery },
		createdAt: new Date().toISOString(),
	};

	setItem(PLAN_KEY, plan);

	// Generate all 60 days
	const days: StudyPlanDay[] = [];
	for (let d = 1; d <= 60; d++) {
		const date = new Date(plan.startDate);
		date.setDate(date.getDate() + d - 1);
		days.push({
			dayNumber: d,
			date: date.toISOString().split("T")[0],
			completed: false,
			targets: generateDayTargets(plan, d, topicMastery),
		});
	}
	setItem(DAYS_KEY, days);

	return plan;
}

export function generateDayTargets(
	plan: StudyPlanConfig,
	dayNumber: number,
	performance: Record<string, number>,
): StudyDayTarget[] {
	const targets: StudyDayTarget[] = [];
	const daily = getDailyQuestionCount(plan.examType);
	const perSubject = Math.ceil(daily / plan.subjects.length);

	for (const subject of plan.subjects) {
		const topics = getTopicsForSubject(subject, plan.examType);

		let difficulty: 1 | 2 | 3;
		let topicPool: string[];

		if (dayNumber <= 20) {
			// Phase 1: weak topics focus, easy-medium
			difficulty = (dayNumber <= 10 ? 1 : 2) as 1 | 2;
			topicPool = getWeakTopics(topics, performance);
		} else if (dayNumber <= 40) {
			// Phase 2: balanced, medium-hard
			difficulty = (dayNumber <= 30 ? 2 : 3) as 2 | 3;
			topicPool = topics;
		} else if (dayNumber <= 55) {
			// Phase 3: remaining weaknesses + mock prep
			difficulty = 3;
			topicPool = getWeakTopics(topics, performance);
			if (topicPool.length === 0) topicPool = topics;
		} else {
			// Phase 4: light review, confidence building
			difficulty = 2;
			topicPool = topics;
		}

		const questionsPerTopic = Math.ceil(perSubject / Math.min(topicPool.length, 3));
		const selectedTopics = topicPool.slice(0, 3);

		for (const topic of selectedTopics) {
			targets.push({
				subject,
				topic,
				questionCount: Math.min(questionsPerTopic, perSubject),
				difficulty,
			});
		}
	}

	return targets;
}

function getWeakTopics(
	topics: string[],
	performance: Record<string, number>,
): string[] {
	const weak = topics.filter((t) => (performance[t] ?? 0) < 60);
	return weak.length > 0 ? weak : topics.slice(0, 3);
}

export function getStudyPlan(): StudyPlanConfig | null {
	return getItem<StudyPlanConfig | null>(PLAN_KEY, null);
}

export function saveStudyPlan(plan: StudyPlanConfig): void {
	setItem(PLAN_KEY, plan);
}

export function getStudyPlanDays(): StudyPlanDay[] {
	return getItem<StudyPlanDay[]>(DAYS_KEY, []);
}

export function saveStudyPlanDay(day: StudyPlanDay): void {
	const days = getStudyPlanDays();
	const idx = days.findIndex((d) => d.dayNumber === day.dayNumber);
	if (idx >= 0) {
		days[idx] = day;
	} else {
		days.push(day);
	}
	setItem(DAYS_KEY, days);
}

export function completeStudyDay(
	dayNumber: number,
	results: { questionsAnswered: number; correctAnswers: number },
): void {
	const days = getStudyPlanDays();
	const day = days.find((d) => d.dayNumber === dayNumber);
	if (day) {
		day.completed = true;
		day.actualResults = results;
		setItem(DAYS_KEY, days);
	}

	const plan = getStudyPlan();
	if (plan) {
		plan.completedDays = days.filter((d) => d.completed).length;
		plan.currentDay = Math.max(plan.currentDay, dayNumber + 1);
		setItem(PLAN_KEY, plan);
	}
}

export function deleteStudyPlan(): void {
	setItem(PLAN_KEY, null);
	setItem(DAYS_KEY, []);
}
