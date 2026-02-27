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

// Pages without navbar (onboarding flow)
const ONBOARDING_ROUTES = ["/", "/exam-type"];

export default function App() {
	const location = useLocation();
	const showNavbar = !ONBOARDING_ROUTES.includes(location.pathname);

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
				</Routes>
			</main>
		</div>
	);
}
