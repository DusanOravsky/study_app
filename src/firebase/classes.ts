import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	deleteDoc,
	query,
	where,
	orderBy,
} from "firebase/firestore";
import { db } from "./config";
import type {
	Assignment,
	AssignmentSubmission,
	ClassInfo,
	ClassStudent,
	ClassStudentStats,
	ExamType,
	GamificationState,
} from "../types";

function generateClassCode(): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

// ============ CLASS MANAGEMENT ============

export async function createClass(
	teacherUid: string,
	teacherName: string,
	name: string,
	examType: ExamType,
): Promise<ClassInfo> {
	if (!db) throw new Error("Firebase not configured");

	const classInfo: ClassInfo = {
		id: `class-${Date.now()}`,
		name,
		teacherUid,
		teacherName,
		code: generateClassCode(),
		examType,
		createdAt: new Date().toISOString(),
	};

	await setDoc(doc(db, "classes", classInfo.id), classInfo);
	return classInfo;
}

export async function getTeacherClasses(teacherUid: string): Promise<ClassInfo[]> {
	if (!db) return [];
	const q = query(
		collection(db, "classes"),
		where("teacherUid", "==", teacherUid),
		orderBy("createdAt", "desc"),
	);
	const snap = await getDocs(q);
	return snap.docs.map((d) => d.data() as ClassInfo);
}

export async function getClassByCode(code: string): Promise<ClassInfo | null> {
	if (!db) return null;
	const q = query(
		collection(db, "classes"),
		where("code", "==", code.toUpperCase()),
	);
	const snap = await getDocs(q);
	if (snap.empty) return null;
	return snap.docs[0].data() as ClassInfo;
}

export async function deleteClass(classId: string): Promise<void> {
	if (!db) return;
	await deleteDoc(doc(db, "classes", classId));
}

// ============ STUDENTS ============

export async function joinClass(
	classId: string,
	student: ClassStudent,
): Promise<void> {
	if (!db) return;
	await setDoc(
		doc(db, "classes", classId, "students", student.uid),
		student,
	);
}

export async function leaveClass(
	classId: string,
	studentUid: string,
): Promise<void> {
	if (!db) return;
	await deleteDoc(doc(db, "classes", classId, "students", studentUid));
}

export async function getClassStudents(classId: string): Promise<ClassStudent[]> {
	if (!db) return [];
	const snap = await getDocs(collection(db, "classes", classId, "students"));
	return snap.docs.map((d) => d.data() as ClassStudent);
}

export async function getClassStudentStats(
	classId: string,
): Promise<ClassStudentStats[]> {
	if (!db) return [];
	const students = await getClassStudents(classId);
	const stats: ClassStudentStats[] = [];

	for (const student of students) {
		const userSnap = await getDoc(doc(db, "users", student.uid));
		if (userSnap.exists()) {
			const data = userSnap.data();
			const gam = (data.gamification as GamificationState) ?? {
				xp: 0,
				level: 1,
				streak: 0,
			};
			const history = (data["question-history"] ?? []) as {
				correct: boolean;
			}[];
			const total = history.length;
			const correct = history.filter((q) => q.correct).length;

			stats.push({
				...student,
				xp: gam.xp,
				level: gam.level,
				streak: gam.streak,
				questionsAnswered: total,
				accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
			});
		} else {
			stats.push({
				...student,
				xp: 0,
				level: 1,
				streak: 0,
				questionsAnswered: 0,
				accuracy: 0,
			});
		}
	}

	return stats.sort((a, b) => b.xp - a.xp);
}

// ============ STUDENT: my classes ============

export async function getStudentClasses(studentUid: string): Promise<ClassInfo[]> {
	if (!db) return [];
	// Query all classes, check membership
	const allClasses = await getDocs(collection(db, "classes"));
	const result: ClassInfo[] = [];
	for (const classDoc of allClasses.docs) {
		const studentSnap = await getDoc(
			doc(db, "classes", classDoc.id, "students", studentUid),
		);
		if (studentSnap.exists()) {
			result.push(classDoc.data() as ClassInfo);
		}
	}
	return result;
}

// ============ ASSIGNMENTS ============

export async function createAssignment(assignment: Assignment): Promise<void> {
	if (!db) return;
	await setDoc(
		doc(db, "classes", assignment.classId, "assignments", assignment.id),
		assignment,
	);
}

export async function getAssignments(classId: string): Promise<Assignment[]> {
	if (!db) return [];
	const q = query(
		collection(db, "classes", classId, "assignments"),
		orderBy("dueDate", "desc"),
	);
	const snap = await getDocs(q);
	return snap.docs.map((d) => d.data() as Assignment);
}

export async function deleteAssignment(
	classId: string,
	assignmentId: string,
): Promise<void> {
	if (!db) return;
	await deleteDoc(doc(db, "classes", classId, "assignments", assignmentId));
}

export async function submitAssignment(
	classId: string,
	submission: AssignmentSubmission,
): Promise<void> {
	if (!db) return;
	const key = `${submission.assignmentId}_${submission.studentUid}`;
	await setDoc(
		doc(db, "classes", classId, "submissions", key),
		submission,
	);
}

export async function getAssignmentSubmissions(
	classId: string,
	assignmentId: string,
): Promise<AssignmentSubmission[]> {
	if (!db) return [];
	const q = query(
		collection(db, "classes", classId, "submissions"),
		where("assignmentId", "==", assignmentId),
	);
	const snap = await getDocs(q);
	return snap.docs.map((d) => d.data() as AssignmentSubmission);
}
