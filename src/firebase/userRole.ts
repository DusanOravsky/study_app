import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	updateDoc,
	where,
	arrayUnion,
} from "firebase/firestore";
import { db } from "./config";
import type { ExamType, FirestoreUser, UserRole } from "../types";

// ============ ROLE MANAGEMENT ============

export async function getUserRole(uid: string): Promise<UserRole | null> {
	if (!db) return null;
	const snap = await getDoc(doc(db, "users", uid));
	if (!snap.exists()) return null;
	return (snap.data().role as UserRole) ?? null;
}

export async function setUserRole(
	uid: string,
	role: UserRole,
	extras?: { examType?: ExamType; parentCode?: string },
): Promise<void> {
	if (!db) return;
	await setDoc(
		doc(db, "users", uid),
		{
			role,
			...extras,
			updatedAt: new Date().toISOString(),
		},
		{ merge: true },
	);
}

export async function createUserDoc(
	uid: string,
	email: string,
	displayName: string,
): Promise<void> {
	if (!db) return;
	const snap = await getDoc(doc(db, "users", uid));
	if (snap.exists()) return;
	const userData: FirestoreUser = {
		uid,
		email,
		displayName,
		role: null,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};
	await setDoc(doc(db, "users", uid), userData);
}

// ============ CODE GENERATION ============

function randomCode(length: number): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	for (let i = 0; i < length; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

export function generateCode(prefix: string): string {
	return `${prefix}${randomCode(4)}`;
}

// ============ PARENT-CHILD LINKING ============

export async function setParentCode(uid: string, code: string): Promise<void> {
	if (!db) return;
	await updateDoc(doc(db, "users", uid), {
		parentCode: code,
		updatedAt: new Date().toISOString(),
	});
}

export async function lookupParentCode(
	code: string,
): Promise<{ uid: string; displayName: string } | null> {
	if (!db) return null;
	const q = query(
		collection(db, "users"),
		where("parentCode", "==", code.toUpperCase()),
	);
	const snap = await getDocs(q);
	if (snap.empty) return null;
	const data = snap.docs[0].data();
	return { uid: snap.docs[0].id, displayName: data.displayName ?? "" };
}

export async function linkChildToParent(
	parentUid: string,
	childUid: string,
): Promise<void> {
	if (!db) return;
	await updateDoc(doc(db, "users", parentUid), {
		linkedChildren: arrayUnion(childUid),
		updatedAt: new Date().toISOString(),
	});
}

export async function getLinkedChildren(
	parentUid: string,
): Promise<string[]> {
	if (!db) return [];
	const snap = await getDoc(doc(db, "users", parentUid));
	if (!snap.exists()) return [];
	return (snap.data().linkedChildren as string[]) ?? [];
}

export async function getChildData(
	childUid: string,
): Promise<Record<string, unknown> | null> {
	if (!db) return null;
	const snap = await getDoc(doc(db, "users", childUid));
	if (!snap.exists()) return null;
	return snap.data();
}
