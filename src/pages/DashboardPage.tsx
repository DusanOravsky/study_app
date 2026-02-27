import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowRight,
	BookOpen,
	Brain,
	Calculator,
	Calendar,
	CheckCircle2,
	Clock,
	Flame,
	Globe,
	Languages,
	Sparkles,
	Target,
	Trophy,
	Zap,
} from "lucide-react";
import SubjectCard from "../components/SubjectCard";
import StreakBadge from "../components/StreakBadge";
import XPBar from "../components/XPBar";
import AchievementPopup from "../components/AchievementPopup";
import type { Achievement } from "../types";
import { getGamification, getXPForNextLevel } from "../utils/gamification";
import {
	getDailyActivities,
	getQuestionHistory,
	getUserSettings,
	getMockTestResults,
} from "../utils/progress";
import { getStudyPlan, getStudyPlanDays } from "../utils/studyPlan";

export default function DashboardPage() {
	const navigate = useNavigate();
	const [mounted, setMounted] = useState(false);
	const [achievementPopup, setAchievementPopup] =
		useState<Achievement | null>(null);

	const gamification = getGamification();
	const xpInfo = getXPForNextLevel(gamification);
	const settings = getUserSettings();
	const questionHistory = getQuestionHistory();
	const dailyActivities = getDailyActivities();
	const mockTestResults = getMockTestResults();

	// Today's stats
	const today = new Date().toISOString().split("T")[0];
	const todayActivity = dailyActivities.find((a) => a.date === today);
	const todayQuestions = todayActivity?.questionsAnswered ?? 0;
	const todayCorrect = todayActivity?.correctAnswers ?? 0;
	const todayAccuracy =
		todayQuestions > 0
			? Math.round((todayCorrect / todayQuestions) * 100)
			: 0;

	// Overall stats
	const totalCorrect = questionHistory.filter((q) => q.correct).length;
	const overallAccuracy =
		questionHistory.length > 0
			? Math.round((totalCorrect / questionHistory.length) * 100)
			: 0;

	// Subject progress (simplified)
	const mathProgress = Math.min(
		Math.round(
			(questionHistory.filter((q) => q.phase === "solving").length / 50) *
				100,
		),
		100,
	);
	const slovakProgress = Math.min(
		Math.round(
			(questionHistory.filter((q) => q.phase === "feedback").length /
				50) *
				100,
		),
		100,
	);
	const germanProgress = Math.min(
		Math.round(
			(questionHistory.filter((q) => q.phase === "solving").length / 30) *
				100,
		),
		100,
	);
	const isBilingvalne = settings.examType === "bilingvalne";

	// Study plan
	const studyPlan = getStudyPlan();
	const studyPlanDays = getStudyPlanDays();
	const todayPlanDay = studyPlanDays.find((d) => d.date === today);

	// Latest 3 achievements
	const latestAchievements = [...gamification.achievements]
		.sort(
			(a, b) =>
				new Date(b.unlockedAt ?? "").getTime() -
				new Date(a.unlockedAt ?? "").getTime(),
		)
		.slice(0, 3);

	const iconMap: Record<string, string> = {
		Star: String.fromCodePoint(0x2b50),
		Flame: String.fromCodePoint(0x1f525),
		Trophy: String.fromCodePoint(0x1f3c6),
		Award: String.fromCodePoint(0x1f3c5),
		Crown: String.fromCodePoint(0x1f451),
		BookOpen: String.fromCodePoint(0x1f4da),
		Zap: String.fromCodePoint(0x26a1),
		Moon: String.fromCodePoint(0x1f319),
		Sun: String.fromCodePoint(0x2600),
	};

	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 50);
		return () => clearTimeout(timer);
	}, []);

	const userName = settings.name || "Študent";

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			{/* Achievement popup */}
			{achievementPopup && (
				<AchievementPopup
					achievement={achievementPopup}
					onClose={() => setAchievementPopup(null)}
				/>
			)}

			<main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
				{/* Welcome section */}
				<div
					className={`mb-8 transition-all duration-700 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-6"
					}`}
				>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
								Ahoj, {userName}!
							</h1>
							<p className="text-gray-500 font-medium mt-1">
								{todayQuestions > 0
									? `Dnes si odpovedal na ${todayQuestions} otázok. Len tak ďalej!`
									: "Začni dnešné učenie a získaj XP body!"}
							</p>
						</div>
						<StreakBadge streak={gamification.streak} />
					</div>
				</div>

				{/* XP Bar */}
				<div
					className={`mb-8 transition-all duration-700 delay-100 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-6"
					}`}
				>
					<XPBar
						xp={xpInfo.current}
						level={gamification.level}
						xpForNext={xpInfo.needed}
					/>
				</div>

				{/* Quick stats */}
				<div
					className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 transition-all duration-700 delay-200 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-6"
					}`}
				>
					<div className="rounded-2xl bg-white p-4 shadow-md border border-blue-100">
						<div className="flex items-center gap-2 mb-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
								<Target className="h-4 w-4 text-blue-600" />
							</div>
							<span className="text-xs font-semibold text-gray-400">
								Dnes
							</span>
						</div>
						<p className="text-2xl font-extrabold text-gray-800">
							{todayQuestions}
						</p>
						<p className="text-xs text-gray-400">otázok</p>
					</div>

					<div className="rounded-2xl bg-white p-4 shadow-md border border-green-100">
						<div className="flex items-center gap-2 mb-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
							</div>
							<span className="text-xs font-semibold text-gray-400">
								Presnosť
							</span>
						</div>
						<p className="text-2xl font-extrabold text-gray-800">
							{todayAccuracy}%
						</p>
						<p className="text-xs text-gray-400">dnes</p>
					</div>

					<div className="rounded-2xl bg-white p-4 shadow-md border border-orange-100">
						<div className="flex items-center gap-2 mb-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
								<Flame className="h-4 w-4 text-orange-600" />
							</div>
							<span className="text-xs font-semibold text-gray-400">
								Séria
							</span>
						</div>
						<p className="text-2xl font-extrabold text-gray-800">
							{gamification.streak}
						</p>
						<p className="text-xs text-gray-400">dní</p>
					</div>

					<div className="rounded-2xl bg-white p-4 shadow-md border border-purple-100">
						<div className="flex items-center gap-2 mb-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
								<Sparkles className="h-4 w-4 text-purple-600" />
							</div>
							<span className="text-xs font-semibold text-gray-400">
								Celkom
							</span>
						</div>
						<p className="text-2xl font-extrabold text-gray-800">
							{gamification.xp}
						</p>
						<p className="text-xs text-gray-400">XP bodov</p>
					</div>
				</div>

				{/* Subject cards */}
				<div
					className={`mb-8 transition-all duration-700 delay-300 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-6"
					}`}
				>
					<h2 className="text-lg font-extrabold text-gray-800 mb-4">
						Predmety
					</h2>
					<div className={`grid grid-cols-1 ${isBilingvalne ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4`}>
						<SubjectCard
							subject="Matematika"
							icon={Calculator}
							progress={mathProgress}
							onClick={() =>
								navigate("/learning", {
									state: { subject: "math" },
								})
							}
						/>
						<SubjectCard
							subject="Slovencina"
							icon={Languages}
							progress={slovakProgress}
							onClick={() =>
								navigate("/learning", {
									state: { subject: "slovak" },
								})
							}
						/>
						{isBilingvalne && (
							<SubjectCard
								subject="Nemcina"
								icon={Globe}
								progress={germanProgress}
								onClick={() =>
									navigate("/learning", {
										state: { subject: "german" },
									})
								}
							/>
						)}
					</div>
				</div>

				{/* Quick action buttons */}
				<div
					className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 transition-all duration-700 delay-400 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-6"
					}`}
				>
					<button
						type="button"
						onClick={() => navigate("/learning")}
						className="group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 p-5 text-left shadow-lg shadow-purple-200/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-none cursor-pointer"
					>
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
							<BookOpen className="h-6 w-6 text-white" />
						</div>
						<div className="flex-1">
							<h3 className="text-base font-bold text-white">
								Pokračovať v učení
							</h3>
							<p className="text-sm text-white/70">
								Precvičuj otázky a získaj XP
							</p>
						</div>
						<ArrowRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform" />
					</button>

					<button
						type="button"
						onClick={() => navigate("/test")}
						className="group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 p-5 text-left shadow-lg shadow-orange-200/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-none cursor-pointer"
					>
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
							<Brain className="h-6 w-6 text-white" />
						</div>
						<div className="flex-1">
							<h3 className="text-base font-bold text-white">
								Skúšobný test
							</h3>
							<p className="text-sm text-white/70">
								Odskúšaj si test na čas
							</p>
						</div>
						<ArrowRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform" />
					</button>
				</div>

				{/* Study plan card */}
				{studyPlan && (
					<div
						className={`mb-8 transition-all duration-700 delay-[450ms] ${
							mounted
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-6"
						}`}
					>
						<button
							type="button"
							onClick={() => navigate("/plan")}
							className="w-full group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-lg border border-purple-100 hover:border-purple-300 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-none cursor-pointer text-left"
						>
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
								<Calendar className="h-6 w-6 text-purple-600" />
							</div>
							<div className="flex-1">
								<h3 className="text-base font-bold text-gray-800">
									Študijný plán
								</h3>
								<p className="text-sm text-gray-400">
									Deň {studyPlan.currentDay}/60
									{" · "}
									{studyPlan.completedDays} splnených
									{todayPlanDay && !todayPlanDay.completed && (
										<span className="text-purple-500 font-medium ml-1">
											· Dnešný cieľ čaká
										</span>
									)}
								</p>
							</div>
							<ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
						</button>
					</div>
				)}

				{/* Bottom section: Achievements + Recent Activity */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Achievements */}
					<div
						className={`rounded-2xl bg-white p-6 shadow-lg border border-gray-100 transition-all duration-700 delay-500 ${
							mounted
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-6"
						}`}
					>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
								<Trophy className="h-5 w-5 text-yellow-500" />
								Úspechy
							</h3>
							<button
								type="button"
								onClick={() => navigate("/profile")}
								className="text-xs font-semibold text-purple-500 hover:text-purple-700 bg-transparent border-none cursor-pointer"
							>
								Všetky
							</button>
						</div>

						{latestAchievements.length > 0 ? (
							<div className="space-y-3">
								{latestAchievements.map((achievement) => (
									<button
										key={achievement.id}
										type="button"
										onClick={() =>
											setAchievementPopup(achievement)
										}
										className="flex w-full items-center gap-3 rounded-xl bg-yellow-50 p-3 hover:bg-yellow-100 transition-colors border-none text-left cursor-pointer"
									>
										<span className="text-2xl">
											{iconMap[achievement.icon] ??
												String.fromCodePoint(0x1f3c6)}
										</span>
										<div>
											<p className="text-sm font-bold text-gray-700">
												{achievement.title}
											</p>
											<p className="text-xs text-gray-400">
												{achievement.description}
											</p>
										</div>
									</button>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="text-4xl mb-3">
									{String.fromCodePoint(0x1f3c6)}
								</div>
								<p className="text-sm text-gray-400 font-medium">
									Začni sa učiť a získaj prvý úspech!
								</p>
							</div>
						)}
					</div>

					{/* Recent activity */}
					<div
						className={`rounded-2xl bg-white p-6 shadow-lg border border-gray-100 transition-all duration-700 delay-600 ${
							mounted
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-6"
						}`}
					>
						<h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
							<Clock className="h-5 w-5 text-blue-500" />
							Posledná aktivita
						</h3>

						{dailyActivities.length > 0 ||
						mockTestResults.length > 0 ? (
							<div className="space-y-3">
								{/* Last mock test */}
								{mockTestResults.length > 0 && (
									<div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
											<Brain className="h-5 w-5 text-blue-600" />
										</div>
										<div className="flex-1">
											<p className="text-sm font-bold text-gray-700">
												Skúšobný test
											</p>
											<p className="text-xs text-gray-400">
												Skóre:{" "}
												{
													mockTestResults[
														mockTestResults.length -
															1
													].percentage
												}
												%
											</p>
										</div>
										<div className="text-xs font-semibold text-blue-500">
											{new Date(
												mockTestResults[
													mockTestResults.length - 1
												].completedAt,
											).toLocaleDateString("sk-SK")}
										</div>
									</div>
								)}

								{/* Recent daily activities */}
								{dailyActivities
									.slice(-3)
									.reverse()
									.map((activity) => (
										<div
											key={activity.date}
											className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
										>
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
												<Zap className="h-5 w-5 text-purple-600" />
											</div>
											<div className="flex-1">
												<p className="text-sm font-bold text-gray-700">
													{activity.questionsAnswered}{" "}
													otázok
												</p>
												<p className="text-xs text-gray-400">
													{activity.correctAnswers}{" "}
													správnych &middot; +
													{activity.xpEarned} XP
												</p>
											</div>
											<div className="text-xs font-semibold text-gray-400">
												{new Date(
													activity.date,
												).toLocaleDateString("sk-SK")}
											</div>
										</div>
									))}

								{/* Overall stats summary */}
								<div className="mt-2 pt-3 border-t border-gray-100">
									<div className="flex justify-between text-xs">
										<span className="text-gray-400">
											Celková presnosť
										</span>
										<span className="font-bold text-gray-600">
											{overallAccuracy}%
										</span>
									</div>
									<div className="flex justify-between text-xs mt-1">
										<span className="text-gray-400">
											Celkom otázok
										</span>
										<span className="font-bold text-gray-600">
											{questionHistory.length}
										</span>
									</div>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="text-4xl mb-3">
									{String.fromCodePoint(0x1f4ca)}
								</div>
								<p className="text-sm text-gray-400 font-medium">
									Tu sa zobrazí tvoja aktivita
								</p>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
