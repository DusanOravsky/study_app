// ============ CORE TYPES ============

export type ExamType = "8-rocne" | "4-rocne" | "bilingvalne";
export type Subject = "math" | "slovak" | "german";
export type UserRole = "student" | "parent" | "teacher" | "admin";

export interface FirestoreUser {
	uid: string;
	email: string;
	displayName: string;
	role: UserRole | null;
	examType?: ExamType;
	parentCode?: string;
	linkedChildren?: string[];
	createdAt: string;
	updatedAt: string;
}

export type LearningPhase = "example" | "planning" | "solving" | "feedback";

export interface UserProfile {
	id: string;
	name: string;
	role: UserRole;
	examType: ExamType;
	subjects: Subject[];
	createdAt: string;
}

// ============ GAMIFICATION ============

export interface GamificationState {
	xp: number;
	level: number;
	streak: number;
	longestStreak: number;
	points: number;
	lastActiveDate: string;
	achievements: Achievement[];
}

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
	unlockedAt?: string;
}

// ============ QUESTIONS ============

export type QuestionType =
	| "multiple-choice"
	| "true-false"
	| "fill-in"
	| "ordering";

export interface Question {
	id: string;
	subject: Subject;
	examType: ExamType;
	topic: string;
	difficulty: 1 | 2 | 3;
	type: QuestionType;
	question: string;
	options?: string[];
	correctAnswer: string;
	explanation: string;
	hint?: string;
}

export interface QuestionResult {
	questionId: string;
	correct: boolean;
	userAnswer: string;
	timeSpent: number; // seconds
	phase: LearningPhase;
	timestamp: string;
}

// ============ MOCK TEST ============

export interface MockTest {
	id: string;
	subject: Subject;
	examType: ExamType;
	questions: Question[];
	timeLimit: number; // minutes
	createdAt: string;
}

export interface MockTestResult {
	testId: string;
	answers: QuestionResult[];
	score: number;
	maxScore: number;
	percentage: number;
	timeUsed: number;
	completedAt: string;
}

// ============ PROGRESS ============

export interface SubjectProgress {
	subject: Subject;
	totalQuestions: number;
	correctAnswers: number;
	averageTime: number;
	topicMastery: Record<string, number>; // topic -> mastery 0-100
}

export interface DailyActivity {
	date: string;
	questionsAnswered: number;
	correctAnswers: number;
	xpEarned: number;
	timeSpent: number; // minutes
}

// ============ CHAT ============

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
}

// ============ LEADERBOARD ============

export interface LeaderboardEntry {
	uid: string;
	name: string;
	xp: number;
	level: number;
	streak: number;
	examType: ExamType;
	updatedAt: string;
}

export type LeaderboardPeriod = "weekly" | "monthly" | "allTime";

// ============ CERTIFICATES ============

export interface CertificateRecord {
	id: string;
	testId: string;
	studentName: string;
	examType: ExamType;
	subject: Subject;
	score: number;
	maxScore: number;
	percentage: number;
	issuedAt: string;
}

// ============ STUDY PLAN ============

export interface StudyPlanConfig {
	id: string;
	examType: ExamType;
	startDate: string;
	totalDays: 60;
	currentDay: number;
	completedDays: number;
	subjects: Subject[];
	weakTopics: Record<string, number>;
	createdAt: string;
}

export interface StudyPlanDay {
	dayNumber: number;
	date: string;
	completed: boolean;
	targets: StudyDayTarget[];
	actualResults?: {
		questionsAnswered: number;
		correctAnswers: number;
	};
}

export interface StudyDayTarget {
	subject: Subject;
	topic: string;
	questionCount: number;
	difficulty: 1 | 2 | 3;
}

// ============ PARENT ============

export interface ParentSettings {
	pinHash: string;
	dailyGoal: number; // min questions per day
	createdAt: string;
}

// ============ TEACHER / CLASS ============

export interface ClassInfo {
	id: string;
	name: string;
	teacherUid: string;
	teacherName: string;
	code: string;
	examType: ExamType;
	createdAt: string;
}

export interface ClassStudent {
	uid: string;
	name: string;
	examType: ExamType;
	joinedAt: string;
}

export interface ClassStudentStats extends ClassStudent {
	xp: number;
	level: number;
	streak: number;
	questionsAnswered: number;
	accuracy: number;
}

export interface Assignment {
	id: string;
	classId: string;
	title: string;
	subject: Subject;
	topic: string;
	questionCount: number;
	difficulty: 1 | 2 | 3;
	dueDate: string;
	createdAt: string;
}

export interface AssignmentSubmission {
	assignmentId: string;
	studentUid: string;
	studentName: string;
	completed: boolean;
	score: number;
	maxScore: number;
	completedAt: string;
}

// ============ SCHOOL / ADMIN ============

export interface SchoolInfo {
	id: string;
	name: string;
	city: string;
	code: string;
	adminUid: string;
	adminEmail: string;
	createdAt: string;
}

export interface SchoolTeacher {
	uid: string;
	name: string;
	email: string;
	addedAt: string;
}

export interface SchoolStudent {
	uid: string;
	name: string;
	email: string;
	examType: ExamType;
	addedAt: string;
}
