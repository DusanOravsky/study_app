import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import RoleSelectionPage from "./pages/RoleSelectionPage";
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
import { getDarkMode, getItem } from "./utils/storage";
import { scheduleStreakReminder } from "./utils/notifications";

// Pages without navbar (onboarding flow)
const ONBOARDING_ROUTES = ["/", "/exam-type", "/login", "/parent", "/teacher", "/admin"];

export default function App() {
	const location = useLocation();
	const showNavbar = !ONBOARDING_ROUTES.includes(location.pathname);

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
					<Route path="/" element={<RoleSelectionPage />} />
					<Route path="/exam-type" element={<ExamTypePage />} />
					<Route path="/dashboard" element={<DashboardPage />} />
					<Route path="/learning" element={<LearningPage />} />
					<Route path="/learning/:subject" element={<LearningPage />} />
					<Route path="/test" element={<MockTestPage />} />
					<Route path="/chat" element={<ChatPage />} />
					<Route path="/profile" element={<ProfilePage />} />
					<Route path="/pricing" element={<PricingPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/leaderboard" element={<LeaderboardPage />} />
					<Route path="/plan" element={<StudyPlanPage />} />
					<Route path="/parent" element={<ParentDashboardPage />} />
					<Route path="/teacher" element={<TeacherDashboardPage />} />
					<Route path="/admin" element={<AdminDashboardPage />} />
					<Route path="/join-class" element={<JoinClassPage />} />
				</Routes>
			</main>
		</div>
	);
}
