import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	deleteDoc,
	query,
	where,
} from "firebase/firestore";
import { db } from "./config";
import type { ExamType, SchoolInfo, SchoolStudent, SchoolTeacher } from "../types";

// ============ ADMIN WHITELIST ============

export async function isAdmin(email: string): Promise<boolean> {
	if (!db) return false;
	const snap = await getDoc(doc(db, "admins", email.toLowerCase()));
	return snap.exists();
}

// ============ SCHOOL MANAGEMENT ============

export async function createSchool(
	adminUid: string,
	adminEmail: string,
	name: string,
	city: string,
): Promise<SchoolInfo> {
	if (!db) throw new Error("Firebase not configured");

	const school: SchoolInfo = {
		id: `school-${Date.now()}`,
		name,
		city,
		adminUid,
		adminEmail,
		createdAt: new Date().toISOString(),
	};

	await setDoc(doc(db, "schools", school.id), school);
	return school;
}

export async function getAdminSchool(adminUid: string): Promise<SchoolInfo | null> {
	if (!db) return null;
	const q = query(
		collection(db, "schools"),
		where("adminUid", "==", adminUid),
	);
	const snap = await getDocs(q);
	if (snap.empty) return null;
	return snap.docs[0].data() as SchoolInfo;
}

export async function deleteSchool(schoolId: string): Promise<void> {
	if (!db) return;
	await deleteDoc(doc(db, "schools", schoolId));
}

// ============ TEACHERS ============

export async function addTeacherToSchool(
	schoolId: string,
	name: string,
	email: string,
): Promise<SchoolTeacher> {
	if (!db) throw new Error("Firebase not configured");

	const teacher: SchoolTeacher = {
		uid: `teacher-${Date.now()}`,
		name,
		email,
		addedAt: new Date().toISOString(),
	};

	await setDoc(doc(db, "schools", schoolId, "teachers", teacher.uid), teacher);
	return teacher;
}

export async function removeTeacherFromSchool(
	schoolId: string,
	uid: string,
): Promise<void> {
	if (!db) return;
	await deleteDoc(doc(db, "schools", schoolId, "teachers", uid));
}

export async function getSchoolTeachers(schoolId: string): Promise<SchoolTeacher[]> {
	if (!db) return [];
	const snap = await getDocs(collection(db, "schools", schoolId, "teachers"));
	const teachers = snap.docs.map((d) => d.data() as SchoolTeacher);
	return teachers.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

// ============ STUDENTS ============

export async function addStudentToSchool(
	schoolId: string,
	name: string,
	email: string,
	examType: ExamType,
): Promise<SchoolStudent> {
	if (!db) throw new Error("Firebase not configured");

	const student: SchoolStudent = {
		uid: `student-${Date.now()}`,
		name,
		email,
		examType,
		addedAt: new Date().toISOString(),
	};

	await setDoc(doc(db, "schools", schoolId, "students", student.uid), student);
	return student;
}

export async function removeStudentFromSchool(
	schoolId: string,
	uid: string,
): Promise<void> {
	if (!db) return;
	await deleteDoc(doc(db, "schools", schoolId, "students", uid));
}

export async function getSchoolStudents(schoolId: string): Promise<SchoolStudent[]> {
	if (!db) return [];
	const snap = await getDocs(collection(db, "schools", schoolId, "students"));
	const students = snap.docs.map((d) => d.data() as SchoolStudent);
	return students.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}
