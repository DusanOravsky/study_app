import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { onAuthChange } from "../firebase/auth";
import { isConfigured } from "../firebase/config";
import { initSync, stopSync, syncFromFirestore } from "../firebase/sync";
import { migrateToFirestore } from "../firebase/migration";

interface AuthContextValue {
	user: User | null;
	loading: boolean;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
	user: null,
	loading: true,
	isAuthenticated: false,
});

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
	return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(isConfigured);

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
			} else {
				stopSync();
			}
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	return (
		<AuthContext.Provider
			value={{ user, loading, isAuthenticated: user !== null }}
		>
			{children}
		</AuthContext.Provider>
	);
}
