import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Award,
	BarChart3,
	BookOpen,
	Calendar,
	CheckCircle2,
	Clock,
	Download,
	Flame,
	Lock,
	Save,
	Settings,
	Sparkles,
	Star,
	Target,
	Trophy,
	User,
} from "lucide-react";
import ProgressRing from "../components/ProgressRing";
import {
	getGamification,
	getXPForNextLevel,
	ALL_ACHIEVEMENTS,
} from "../utils/gamification";
import {
	getCertificates,
	getDailyActivities,
	getMockTestResults,
	getQuestionHistory,
	getUserSettings,
} from "../utils/progress";
import {
	getParentSettings,
	setupParentPin,
	verifyParentPin,
	getParentDailyGoal,
	setParentDailyGoal,
} from "../utils/parentPin";
import { getStudyPlan } from "../utils/studyPlan";
import { generateCertificatePDF } from "../utils/certificates";

type ParentView = "pin-setup" | "pin-verify" | "dashboard";

export default function ParentDashboardPage() {
	const navigate = useNavigate();
	const parentSettings = getParentSettings();

	const [view, setView] = useState<ParentView>(
		parentSettings ? "pin-verify" : "pin-setup",
	);
	const [pin, setPin] = useState("");
	const [pinConfirm, setPinConfirm] = useState("");
	const [pinError, setPinError] = useState("");
	const [dailyGoal, setDailyGoalState] = useState(getParentDailyGoal());
	const [showGoalSaved, setShowGoalSaved] = useState(false);

	// Handle PIN setup
	const handlePinSetup = async () => {
		if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
			setPinError("PIN musí mať 4 číslice");
			return;
		}
		if (pin !== pinConfirm) {
			setPinError("PIN sa nezhoduje");
			return;
		}
		await setupParentPin(pin);
		setPin("");
		setPinConfirm("");
		setPinError("");
		setView("dashboard");
	};

	// Handle PIN verify
	const handlePinVerify = async () => {
		const valid = await verifyParentPin(pin);
		if (valid) {
			setPin("");
			setPinError("");
			setView("dashboard");
		} else {
			setPinError("Nesprávny PIN");
		}
	};

	const handleSaveDailyGoal = (value: number) => {
		const clamped = Math.max(5, Math.min(100, value));
		setDailyGoalState(clamped);
		setParentDailyGoal(clamped);
		setShowGoalSaved(true);
		setTimeout(() => setShowGoalSaved(false), 2000);
	};

	// PIN setup screen
	if (view === "pin-setup") {
		return (
			<div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
				<div className="w-full max-w-sm">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 bg-transparent border-none cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4" />
						Späť
					</button>

					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 shadow-lg mx-auto mb-4">
							<Lock className="h-8 w-8 text-white" />
						</div>
						<h1 className="text-xl font-extrabold text-gray-800 text-center mb-2">
							Nastavenie rodičovského PIN
						</h1>
						<p className="text-sm text-gray-400 text-center mb-6">
							Vytvor 4-miestny PIN pre prístup k rodičovskému panelu
						</p>

						<div className="space-y-4">
							<div>
								<label className="text-sm font-bold text-gray-600 mb-1 block">
									PIN (4 číslice)
								</label>
								<input
									type="password"
									inputMode="numeric"
									maxLength={4}
									value={pin}
									onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
									placeholder="****"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-2xl tracking-[1em] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
								/>
							</div>
							<div>
								<label className="text-sm font-bold text-gray-600 mb-1 block">
									Potvrdiť PIN
								</label>
								<input
									type="password"
									inputMode="numeric"
									maxLength={4}
									value={pinConfirm}
									onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
									placeholder="****"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-2xl tracking-[1em] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
								/>
							</div>

							{pinError && (
								<p className="text-sm font-medium text-red-500 text-center">
									{pinError}
								</p>
							)}

							<button
								type="button"
								onClick={handlePinSetup}
								className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
							>
								Uložiť PIN
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// PIN verify screen
	if (view === "pin-verify") {
		return (
			<div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
				<div className="w-full max-w-sm">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 bg-transparent border-none cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4" />
						Späť
					</button>

					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 shadow-lg mx-auto mb-4">
							<Lock className="h-8 w-8 text-white" />
						</div>
						<h1 className="text-xl font-extrabold text-gray-800 text-center mb-2">
							Rodičovský panel
						</h1>
						<p className="text-sm text-gray-400 text-center mb-6">
							Zadaj 4-miestny PIN
						</p>

						<div className="space-y-4">
							<input
								type="password"
								inputMode="numeric"
								maxLength={4}
								value={pin}
								onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
								onKeyDown={(e) => {
									if (e.key === "Enter") handlePinVerify();
								}}
								placeholder="****"
								className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-2xl tracking-[1em] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
								autoFocus
							/>

							{pinError && (
								<p className="text-sm font-medium text-red-500 text-center">
									{pinError}
								</p>
							)}

							<button
								type="button"
								onClick={handlePinVerify}
								className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
							>
								Odomknúť
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// ============ DASHBOARD ============
	const gamification = getGamification();
	const xpInfo = getXPForNextLevel(gamification);
	const settings = getUserSettings();
	const questionHistory = getQuestionHistory();
	const dailyActivities = getDailyActivities();
	const mockTestResults = getMockTestResults();
	const certificates = getCertificates();
	const studyPlan = getStudyPlan();

	const today = new Date().toISOString().split("T")[0];
	const todayActivity = dailyActivities.find((a) => a.date === today);
	const todayQuestions = todayActivity?.questionsAnswered ?? 0;
	const goalMet = todayQuestions >= dailyGoal;

	const totalCorrect = questionHistory.filter((q) => q.correct).length;
	const overallAccuracy =
		questionHistory.length > 0
			? Math.round((totalCorrect / questionHistory.length) * 100)
			: 0;

	// Last 7 days activity for chart
	const last7Days = Array.from({ length: 7 }, (_, i) => {
		const d = new Date();
		d.setDate(d.getDate() - (6 - i));
		const dateStr = d.toISOString().split("T")[0];
		const activity = dailyActivities.find((a) => a.date === dateStr);
		return {
			date: dateStr,
			day: d.toLocaleDateString("sk-SK", { weekday: "short" }),
			questions: activity?.questionsAnswered ?? 0,
			correct: activity?.correctAnswers ?? 0,
		};
	});

	const maxQuestions = Math.max(...last7Days.map((d) => d.questions), 1);

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
			<main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
				<div className="flex items-center justify-between mb-6">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium bg-transparent border-none cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4" />
						Späť
					</button>
					<span className="text-xs font-bold text-pink-400 bg-pink-100 rounded-full px-3 py-1">
						Rodič
					</span>
				</div>

				{/* Child profile card */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<div className="flex items-center gap-4 mb-4">
						<div className="relative">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
								<User className="h-8 w-8 text-white" />
							</div>
							<div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-xs font-extrabold text-white shadow-md border-2 border-white">
								{gamification.level}
							</div>
						</div>
						<div>
							<h1 className="text-xl font-extrabold text-gray-800">
								{settings.name || "Študent"}
							</h1>
							<p className="text-sm text-gray-400">
								{settings.examType === "8-rocne"
									? "8-ročné gymnázium"
									: settings.examType === "bilingvalne"
										? "Bilingválne gymnázium"
										: "4-ročné gymnázium"}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-4 gap-3">
						<div className="rounded-xl bg-purple-50 p-3 text-center">
							<Sparkles className="h-4 w-4 text-purple-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-purple-600">
								{gamification.xp}
							</p>
							<p className="text-xs text-purple-400">XP</p>
						</div>
						<div className="rounded-xl bg-yellow-50 p-3 text-center">
							<Star className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-yellow-600">
								{gamification.level}
							</p>
							<p className="text-xs text-yellow-400">Level</p>
						</div>
						<div className="rounded-xl bg-orange-50 p-3 text-center">
							<Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-orange-600">
								{gamification.streak}
							</p>
							<p className="text-xs text-orange-400">Séria</p>
						</div>
						<div className="rounded-xl bg-green-50 p-3 text-center">
							<CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-green-600">
								{overallAccuracy}%
							</p>
							<p className="text-xs text-green-400">Presnosť</p>
						</div>
					</div>

					{/* XP progress bar */}
					<div className="mt-4">
						<div className="flex justify-between text-xs mb-1">
							<span className="font-medium text-gray-400">
								Level {gamification.level}
							</span>
							<span className="font-bold text-purple-500">
								{xpInfo.current}/{xpInfo.needed} XP
							</span>
						</div>
						<div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
							<div
								className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
								style={{ width: `${(xpInfo.current / xpInfo.needed) * 100}%` }}
							/>
						</div>
					</div>
				</div>

				{/* Daily goal */}
				<div className={`rounded-3xl shadow-xl border p-6 mb-6 ${goalMet ? "bg-green-50 border-green-200" : "bg-white border-gray-100"}`}>
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
							<Target className="h-5 w-5 text-pink-500" />
							Denný cieľ
						</h2>
						{goalMet && (
							<span className="text-xs font-bold text-green-600 bg-green-100 rounded-full px-3 py-1">
								Splnený!
							</span>
						)}
					</div>

					<div className="flex items-center gap-4 mb-3">
						<div className="flex-1">
							<div className="flex justify-between text-sm mb-1">
								<span className="font-medium text-gray-500">
									{todayQuestions} / {dailyGoal} otázok
								</span>
								<span className="font-bold text-gray-700">
									{Math.min(100, Math.round((todayQuestions / dailyGoal) * 100))}%
								</span>
							</div>
							<div className="h-3 rounded-full bg-gray-200 overflow-hidden">
								<div
									className={`h-full rounded-full transition-all ${goalMet ? "bg-green-500" : "bg-pink-500"}`}
									style={{ width: `${Math.min(100, (todayQuestions / dailyGoal) * 100)}%` }}
								/>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<label className="text-xs font-bold text-gray-500">
							Nastaviť cieľ:
						</label>
						<input
							type="number"
							min={5}
							max={100}
							value={dailyGoal}
							onChange={(e) => handleSaveDailyGoal(Number(e.target.value))}
							className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm font-bold text-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-pink-300"
						/>
						<span className="text-xs text-gray-400">otázok/deň</span>
						{showGoalSaved && (
							<span className="text-xs font-bold text-green-500 flex items-center gap-1">
								<Save className="h-3 w-3" />
								Uložené
							</span>
						)}
					</div>
				</div>

				{/* Weekly activity chart */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
						<BarChart3 className="h-5 w-5 text-blue-500" />
						Týždenná aktivita
					</h2>

					<div className="flex items-end gap-2 h-40">
						{last7Days.map((day) => {
							const height =
								day.questions > 0
									? Math.max(8, (day.questions / maxQuestions) * 100)
									: 4;
							const isToday = day.date === today;
							const metGoal = day.questions >= dailyGoal;

							return (
								<div
									key={day.date}
									className="flex-1 flex flex-col items-center gap-1"
								>
									<span className="text-xs font-bold text-gray-500">
										{day.questions}
									</span>
									<div
										className={`w-full rounded-t-lg transition-all ${
											metGoal
												? "bg-green-400"
												: isToday
													? "bg-pink-400"
													: day.questions > 0
														? "bg-blue-300"
														: "bg-gray-200"
										}`}
										style={{ height: `${height}%` }}
									/>
									<span
										className={`text-xs font-bold ${isToday ? "text-pink-600" : "text-gray-400"}`}
									>
										{day.day}
									</span>
								</div>
							);
						})}
					</div>

					<div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
						<div className="flex items-center gap-1">
							<div className="h-2.5 w-2.5 rounded-sm bg-green-400" />
							Cieľ splnený
						</div>
						<div className="flex items-center gap-1">
							<div className="h-2.5 w-2.5 rounded-sm bg-blue-300" />
							Aktívny
						</div>
						<div className="flex items-center gap-1">
							<div className="h-2.5 w-2.5 rounded-sm bg-gray-200" />
							Neaktívny
						</div>
					</div>
				</div>

				{/* Study plan progress */}
				{studyPlan && (
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
							<Calendar className="h-5 w-5 text-purple-500" />
							Študijný plán
						</h2>
						<div className="grid grid-cols-3 gap-3">
							<div className="rounded-xl bg-purple-50 p-3 text-center">
								<p className="text-xl font-extrabold text-purple-600">
									{studyPlan.completedDays}
								</p>
								<p className="text-xs text-purple-400">z 60 dní</p>
							</div>
							<div className="rounded-xl bg-blue-50 p-3 text-center">
								<p className="text-xl font-extrabold text-blue-600">
									{Math.round((studyPlan.completedDays / 60) * 100)}%
								</p>
								<p className="text-xs text-blue-400">dokončený</p>
							</div>
							<div className="rounded-xl bg-green-50 p-3 text-center">
								<p className="text-xl font-extrabold text-green-600">
									Deň {studyPlan.currentDay}
								</p>
								<p className="text-xs text-green-400">aktuálny</p>
							</div>
						</div>
					</div>
				)}

				{/* Achievements overview */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
						<Award className="h-5 w-5 text-yellow-500" />
						Úspechy
						<span className="text-sm text-gray-400">
							({gamification.achievements.length}/{ALL_ACHIEVEMENTS.length})
						</span>
					</h2>

					<div className="flex flex-wrap gap-2">
						{gamification.achievements.map((a) => (
							<div
								key={a.id}
								className="rounded-full bg-yellow-50 border border-yellow-200 px-3 py-1 text-xs font-bold text-yellow-700"
							>
								{a.title}
							</div>
						))}
						{gamification.achievements.length === 0 && (
							<p className="text-sm text-gray-400">
								Zatiaľ žiadne úspechy
							</p>
						)}
					</div>
				</div>

				{/* Test history */}
				{mockTestResults.length > 0 && (
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
							<Clock className="h-5 w-5 text-blue-500" />
							Výsledky testov
						</h2>
						<div className="space-y-3">
							{[...mockTestResults]
								.reverse()
								.slice(0, 5)
								.map((result, idx) => (
									<div
										key={`${result.testId}-${idx}`}
										className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
									>
										<ProgressRing
											percentage={result.percentage}
											size={40}
											color={
												result.percentage >= 75
													? "#22c55e"
													: result.percentage >= 50
														? "#eab308"
														: "#ef4444"
											}
										/>
										<div className="flex-1">
											<p className="text-sm font-bold text-gray-700">
												{result.percentage}% — {result.score}/{result.maxScore}
											</p>
											<p className="text-xs text-gray-400">
												{new Date(result.completedAt).toLocaleDateString("sk-SK", {
													day: "numeric",
													month: "long",
												})}
											</p>
										</div>
									</div>
								))}
						</div>
					</div>
				)}

				{/* Certificates */}
				{certificates.length > 0 && (
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
							<Trophy className="h-5 w-5 text-yellow-500" />
							Certifikáty ({certificates.length})
						</h2>
						<div className="space-y-3">
							{certificates.map((cert) => (
								<div
									key={cert.id}
									className="flex items-center gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-3"
								>
									<Award className="h-5 w-5 text-yellow-600 shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-bold text-gray-700">
											{cert.percentage}% —{" "}
											{cert.subject === "math" ? "Mat" : cert.subject === "german" ? "Nem" : "SJ"}
										</p>
										<p className="text-xs text-gray-400">
											{new Date(cert.issuedAt).toLocaleDateString("sk-SK")}
										</p>
									</div>
									<button
										type="button"
										onClick={() => generateCertificatePDF(cert)}
										className="flex items-center gap-1 rounded-lg bg-yellow-200 px-3 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-300 border-none cursor-pointer"
									>
										<Download className="h-3 w-3" />
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Overall stats */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
						<BookOpen className="h-5 w-5 text-green-500" />
						Celkové štatistiky
					</h2>
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-xl bg-blue-50 p-4 text-center">
							<p className="text-2xl font-extrabold text-blue-600">
								{questionHistory.length}
							</p>
							<p className="text-xs text-blue-400">Celkom otázok</p>
						</div>
						<div className="rounded-xl bg-green-50 p-4 text-center">
							<p className="text-2xl font-extrabold text-green-600">
								{totalCorrect}
							</p>
							<p className="text-xs text-green-400">Správnych</p>
						</div>
						<div className="rounded-xl bg-purple-50 p-4 text-center">
							<p className="text-2xl font-extrabold text-purple-600">
								{mockTestResults.length}
							</p>
							<p className="text-xs text-purple-400">Testov</p>
						</div>
						<div className="rounded-xl bg-orange-50 p-4 text-center">
							<p className="text-2xl font-extrabold text-orange-600">
								{gamification.longestStreak}
							</p>
							<p className="text-xs text-orange-400">Najdlhšia séria</p>
						</div>
					</div>
				</div>

				{/* Settings */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
					<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
						<Settings className="h-5 w-5 text-gray-500" />
						Nastavenia
					</h2>
					<button
						type="button"
						onClick={() => {
							setPin("");
							setView("pin-setup");
						}}
						className="w-full flex items-center gap-3 rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition-colors border-none cursor-pointer text-left"
					>
						<Lock className="h-5 w-5 text-gray-400" />
						<div>
							<p className="text-sm font-bold text-gray-700">
								Zmeniť PIN
							</p>
							<p className="text-xs text-gray-400">
								Nastaviť nový rodičovský PIN
							</p>
						</div>
					</button>
				</div>
			</main>
		</div>
	);
}
