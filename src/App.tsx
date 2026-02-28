import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import ExamTypePage from "./pages/ExamTypePage";
import DashboardPage from "./pages/DashboardPage";
import LearningPage from "./pages/LearningPage";
import MockTestPage from "./pages/MockTestPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import StudyPlanPage from "./pages/StudyPlanPage";
import ParentDashboardPage from "./pages/ParentDashboardPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import JoinClassPage from "./pages/JoinClassPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import { getDarkMode, getItem } from "./utils/storage";
import { scheduleStreakReminder } from "./utils/notifications";

// Pages without navbar
const NO_NAVBAR_ROUTES = ["/login", "/role-select", "/exam-type", "/parent", "/teacher", "/admin"];

function RootRedirect() {
	const { isAuthenticated, loading, role, roleLoading } = useAuth();

	if (loading || roleLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-gray-400 animate-pulse">Načítavam...</p>
			</div>
		);
	}

	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (!role) return <Navigate to="/role-select" replace />;

	switch (role) {
		case "student":
			return <Navigate to="/dashboard" replace />;
		case "parent":
			return <Navigate to="/parent" replace />;
		case "teacher":
			return <Navigate to="/teacher" replace />;
		case "admin":
			return <Navigate to="/admin" replace />;
	}
}

export default function App() {
	const location = useLocation();
	const showNavbar = !NO_NAVBAR_ROUTES.includes(location.pathname);

	useEffect(() => {
		if (getDarkMode()) {
			document.documentElement.classList.add("dark");
		}
	}, []);

	// Schedule notification reminder if enabled
	useEffect(() => {
		const settings = getItem<{ enabled: boolean; time: string }>(
			"notification-settings",
			{ enabled: false, time: "18:00" },
		);
		if (settings.enabled) {
			scheduleStreakReminder(settings.time);
		}
	}, []);

	return (
		<div className="min-h-screen bg-slate-50">
			{showNavbar && <Navbar />}
			<main className={showNavbar ? "pt-16" : ""}>
				<Routes>
					{/* Root redirect */}
					<Route path="/" element={<RootRedirect />} />

					{/* Public: login only when not auth'd */}
					<Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

					{/* Role selection: auth required, no role yet */}
					<Route path="/role-select" element={<ProtectedRoute requireRole={false}><RoleSelectPage /></ProtectedRoute>} />

					{/* Exam type: students only */}
					<Route path="/exam-type" element={<ProtectedRoute allowedRoles={["student"]}><ExamTypePage /></ProtectedRoute>} />

					{/* Student pages */}
					<Route path="/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><DashboardPage /></ProtectedRoute>} />
					<Route path="/learning" element={<ProtectedRoute allowedRoles={["student"]}><LearningPage /></ProtectedRoute>} />
					<Route path="/learning/:subject" element={<ProtectedRoute allowedRoles={["student"]}><LearningPage /></ProtectedRoute>} />
					<Route path="/test" element={<ProtectedRoute allowedRoles={["student"]}><MockTestPage /></ProtectedRoute>} />
					<Route path="/chat" element={<ProtectedRoute allowedRoles={["student"]}><ChatPage /></ProtectedRoute>} />
					<Route path="/profile" element={<ProtectedRoute allowedRoles={["student"]}><ProfilePage /></ProtectedRoute>} />
					<Route path="/pricing" element={<ProtectedRoute allowedRoles={["student"]}><PricingPage /></ProtectedRoute>} />
					<Route path="/leaderboard" element={<ProtectedRoute allowedRoles={["student"]}><LeaderboardPage /></ProtectedRoute>} />
					<Route path="/plan" element={<ProtectedRoute allowedRoles={["student"]}><StudyPlanPage /></ProtectedRoute>} />
					<Route path="/join-class" element={<ProtectedRoute allowedRoles={["student"]}><JoinClassPage /></ProtectedRoute>} />

					{/* Parent */}
					<Route path="/parent" element={<ProtectedRoute allowedRoles={["parent"]}><ParentDashboardPage /></ProtectedRoute>} />

					{/* Teacher */}
					<Route path="/teacher" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboardPage /></ProtectedRoute>} />

					{/* Admin */}
					<Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboardPage /></ProtectedRoute>} />
				</Routes>
			</main>
		</div>
	);
}
