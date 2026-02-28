import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types";

function roleDashboard(role: UserRole): string {
	switch (role) {
		case "student":
			return "/dashboard";
		case "parent":
			return "/parent";
		case "teacher":
			return "/teacher";
		case "admin":
			return "/admin";
	}
}

/**
 * Requires auth + role. Optionally restricts to specific allowed roles.
 * - Not authenticated → /login
 * - Authenticated, no role → /role-select
 * - Authenticated, wrong role → redirect to own dashboard
 */
export function ProtectedRoute({
	children,
	allowedRoles,
}: {
	children: React.ReactNode;
	allowedRoles?: UserRole[];
}) {
	const { isAuthenticated, loading, role, roleLoading } = useAuth();

	if (loading || roleLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-gray-400 animate-pulse">Načítavam...</p>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (!role) {
		return <Navigate to="/role-select" replace />;
	}

	if (allowedRoles && !allowedRoles.includes(role)) {
		return <Navigate to={roleDashboard(role)} replace />;
	}

	return <>{children}</>;
}

/**
 * For /login page: if already authenticated with a role, redirect to dashboard.
 */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, loading, role, roleLoading } = useAuth();

	if (loading || roleLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-gray-400 animate-pulse">Načítavam...</p>
			</div>
		);
	}

	if (isAuthenticated && role) {
		return <Navigate to={roleDashboard(role)} replace />;
	}

	if (isAuthenticated && !role) {
		return <Navigate to="/role-select" replace />;
	}

	return <>{children}</>;
}
