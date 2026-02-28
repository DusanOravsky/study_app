import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { onAuthChange } from "../firebase/auth";
import { isConfigured } from "../firebase/config";
import { initSync, stopSync, syncFromFirestore } from "../firebase/sync";
import { migrateToFirestore } from "../firebase/migration";
import { getUserRole, setUserRole as writeUserRole } from "../firebase/userRole";
import { isAdmin } from "../firebase/admin";
import type { ExamType, UserRole } from "../types";

interface AuthContextValue {
	user: User | null;
	loading: boolean;
	isAuthenticated: boolean;
	role: UserRole | null;
	roleLoading: boolean;
	setRole: (role: UserRole, extras?: { examType?: ExamType; parentCode?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
	user: null,
	loading: true,
	isAuthenticated: false,
	role: null,
	roleLoading: true,
	setRole: async () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
	return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(isConfigured);
	const [role, setRoleState] = useState<UserRole | null>(null);
	const [roleLoading, setRoleLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthChange(async (firebaseUser) => {
			setUser(firebaseUser);
			if (firebaseUser) {
				initSync(firebaseUser.uid);
				try {
					await migrateToFirestore(firebaseUser.uid);
					await syncFromFirestore(firebaseUser.uid);
				} catch (e) {
					console.warn("Auth sync failed:", e);
				}

				// Fetch role from Firestore
				try {
					let fetchedRole = await getUserRole(firebaseUser.uid);
					// Auto-detect admin
					if (!fetchedRole) {
						const adminCheck = await isAdmin(firebaseUser.email ?? "");
						if (adminCheck) {
							fetchedRole = "admin";
							await writeUserRole(firebaseUser.uid, "admin");
						}
					}
					setRoleState(fetchedRole);
				} catch (e) {
					console.warn("Role fetch failed:", e);
					setRoleState(null);
				}
			} else {
				stopSync();
				setRoleState(null);
			}
			setLoading(false);
			setRoleLoading(false);
		});
		return unsubscribe;
	}, []);

	const setRole = useCallback(
		async (newRole: UserRole, extras?: { examType?: ExamType; parentCode?: string }) => {
			if (!user) return;
			await writeUserRole(user.uid, newRole, extras);
			setRoleState(newRole);
		},
		[user],
	);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				isAuthenticated: user !== null,
				role,
				roleLoading,
				setRole,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
