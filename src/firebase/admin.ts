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
import { createClass, deleteClass } from "./classes";
import type { SchoolInfo, SchoolTeacher } from "../types";

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

// ============ TEACHERS (with class) ============

export async function addTeacherWithClass(
	schoolId: string,
	name: string,
	email: string,
	className: string,
	grade: "5" | "9" | "bilingvalne",
): Promise<SchoolTeacher> {
	if (!db) throw new Error("Firebase not configured");

	const examType = grade === "5" ? "8-rocne" : grade === "9" ? "4-rocne" : "bilingvalne";

	// Create class — teacherUid unknown until teacher logs in, use email as identifier
	const classInfo = await createClass("", name, className, examType, {
		teacherEmail: email,
		schoolId,
	});

	const teacher: SchoolTeacher = {
		uid: `teacher-${Date.now()}`,
		email,
		className,
		classId: classInfo.id,
		classCode: classInfo.code,
		addedAt: new Date().toISOString(),
	};

	await setDoc(doc(db, "schools", schoolId, "teachers", teacher.uid), teacher);
	return teacher;
}

export async function removeTeacherFromSchool(
	schoolId: string,
	uid: string,
	classId: string,
): Promise<void> {
	if (!db) return;
	await deleteDoc(doc(db, "schools", schoolId, "teachers", uid));
	await deleteClass(classId);
}

export async function getSchoolTeachers(schoolId: string): Promise<SchoolTeacher[]> {
	if (!db) return [];
	const snap = await getDocs(collection(db, "schools", schoolId, "teachers"));
	const teachers = snap.docs.map((d) => d.data() as SchoolTeacher);
	return teachers.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}
