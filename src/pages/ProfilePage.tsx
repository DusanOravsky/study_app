import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Award,
	BarChart3,
	Bell,
	BookOpen,
	CheckCircle2,
	ChevronRight,
	Clock,
	Copy,
	Download,
	Edit3,
	Flame,
	GraduationCap,
	Lock,
	LogOut,
	Moon,
	RotateCcw,
	Save,
	Settings,
	Sun,
	Sparkles,
	Star,
	Target,
	Trash2,
	Trophy,
	User,
} from "lucide-react";
import ProgressRing from "../components/ProgressRing";
import type { Achievement } from "../types";
import {
	ALL_ACHIEVEMENTS,
	getGamification,
} from "../utils/gamification";
import {
	getCertificates,
	getMockTestResults,
	getQuestionHistory,
	getUserSettings,
	saveUserSettings,
} from "../utils/progress";
import { clearAll, getDarkMode, getItem, setDarkMode, setItem } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../firebase/auth";
import { getChildData } from "../firebase/userRole";
import { generateCertificatePDF } from "../utils/certificates";
import { requestPermission, scheduleStreakReminder } from "../utils/notifications";

const achievementIconMap: Record<string, string> = {
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

export default function ProfilePage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const gamification = getGamification();
	const [parentCode, setParentCode] = useState<string | null>(null);
	const [codeCopied, setCodeCopied] = useState(false);

	useEffect(() => {
		if (!user) return;
		getChildData(user.uid).then((data) => {
			if (data?.parentCode) setParentCode(data.parentCode as string);
		}).catch(() => {});
	}, [user]);

	const handleCopyParentCode = () => {
		if (!parentCode) return;
		navigator.clipboard.writeText(parentCode);
		setCodeCopied(true);
		setTimeout(() => setCodeCopied(false), 2000);
	};
	const settings = getUserSettings();
	const questionHistory = getQuestionHistory();
	const mockTestResults = getMockTestResults();
	const certificates = getCertificates();

	const [editingName, setEditingName] = useState(false);
	const [nameInput, setNameInput] = useState(settings.name || "");
	const [showClearConfirm, setShowClearConfirm] = useState(false);
	const [showExamTypeChange, setShowExamTypeChange] = useState(false);
	const [isDark, setIsDark] = useState(getDarkMode());

	const [notifSettings, setNotifSettings] = useState(
		getItem<{ enabled: boolean; time: string }>("notification-settings", {
			enabled: false,
			time: "18:00",
		}),
	);

	const handleToggleNotifications = async () => {
		if (!notifSettings.enabled) {
			const granted = await requestPermission();
			if (!granted) return;
		}
		const updated = { ...notifSettings, enabled: !notifSettings.enabled };
		setNotifSettings(updated);
		setItem("notification-settings", updated);
		if (updated.enabled) {
			scheduleStreakReminder(updated.time);
		}
	};

	const handleNotifTimeChange = (time: string) => {
		const updated = { ...notifSettings, time };
		setNotifSettings(updated);
		setItem("notification-settings", updated);
		if (updated.enabled) {
			scheduleStreakReminder(updated.time);
		}
	};

	const handleSignOut = async () => {
		await signOut();
		navigate("/login");
	};

	const toggleDarkMode = () => {
		const newValue = !isDark;
		setIsDark(newValue);
		setDarkMode(newValue);
		document.documentElement.classList.toggle("dark", newValue);
	};

	// Stats
	const totalQuestions = questionHistory.length;
	const correctAnswers = questionHistory.filter((q) => q.correct).length;
	const accuracyRate =
		totalQuestions > 0
			? Math.round((correctAnswers / totalQuestions) * 100)
			: 0;

	const handleSaveName = () => {
		saveUserSettings({ ...settings, name: nameInput.trim() });
		setEditingName(false);
	};

	const handleChangeExamType = (type: "8-rocne" | "4-rocne" | "bilingvalne") => {
		saveUserSettings({ ...settings, examType: type });
		setShowExamTypeChange(false);
	};

	const handleClearData = () => {
		clearAll();
		setShowClearConfirm(false);
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			{/* Clear data confirmation dialog */}
			{showClearConfirm && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="w-[90%] max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
						<div className="flex items-center gap-3 mb-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
								<Trash2 className="h-6 w-6 text-red-500" />
							</div>
							<div>
								<h3 className="text-lg font-extrabold text-gray-800">
									Vymazat udaje?
								</h3>
								<p className="text-sm text-gray-500">
									Tato akcia sa neda vratit
								</p>
							</div>
						</div>
						<p className="text-sm text-gray-600 mb-4">
							Vsetky tvoje data budu vymazane: XP body, level,
							seria, uspechy, historia otazok aj vysledky testov.
						</p>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setShowClearConfirm(false)}
								className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 hover:bg-gray-200 transition-colors border-none cursor-pointer"
							>
								Zrusit
							</button>
							<button
								type="button"
								onClick={handleClearData}
								className="flex-1 rounded-xl bg-red-500 py-3 font-bold text-white hover:bg-red-600 transition-colors border-none cursor-pointer"
							>
								Vymazat
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Exam type change dialog */}
			{showExamTypeChange && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="w-[90%] max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
						<h3 className="text-lg font-extrabold text-gray-800 mb-4">
							Zmenit typ skusky
						</h3>
						<div className="space-y-3 mb-4">
							<button
								type="button"
								onClick={() => handleChangeExamType("8-rocne")}
								className={`w-full rounded-xl p-4 border-2 text-left transition-all cursor-pointer ${
									settings.examType === "8-rocne"
										? "border-blue-400 bg-blue-50"
										: "border-gray-200 hover:border-blue-200"
								}`}
							>
								<p className="font-bold text-gray-700">
									8-rocne gymnazium
								</p>
								<p className="text-xs text-gray-400">
									5. rocnik ZS
								</p>
							</button>
							<button
								type="button"
								onClick={() => handleChangeExamType("4-rocne")}
								className={`w-full rounded-xl p-4 border-2 text-left transition-all cursor-pointer ${
									settings.examType === "4-rocne"
										? "border-purple-400 bg-purple-50"
										: "border-gray-200 hover:border-purple-200"
								}`}
							>
								<p className="font-bold text-gray-700">
									4-rocne gymnazium
								</p>
								<p className="text-xs text-gray-400">
									9. rocnik ZS
								</p>
							</button>
							<button
								type="button"
								onClick={() => handleChangeExamType("bilingvalne")}
								className={`w-full rounded-xl p-4 border-2 text-left transition-all cursor-pointer ${
									settings.examType === "bilingvalne"
										? "border-emerald-400 bg-emerald-50"
										: "border-gray-200 hover:border-emerald-200"
								}`}
							>
								<p className="font-bold text-gray-700">
									Bilingvalne gymnazium
								</p>
								<p className="text-xs text-gray-400">
									9. rocnik ZS (nemecke)
								</p>
							</button>
						</div>
						<button
							type="button"
							onClick={() => setShowExamTypeChange(false)}
							className="w-full rounded-xl bg-gray-100 py-3 font-bold text-gray-600 hover:bg-gray-200 transition-colors border-none cursor-pointer"
						>
							Zavriet
						</button>
					</div>
				</div>
			)}

			<main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
				{/* Back button */}
				<button
					type="button"
					onClick={() => navigate("/dashboard")}
					className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors bg-transparent border-none cursor-pointer"
				>
					<ArrowLeft className="h-4 w-4" />
					Dashboard
				</button>

				{/* Profile header */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<div className="flex items-center gap-4 mb-6">
						{/* Avatar */}
						<div className="relative">
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-xl">
								<User className="h-10 w-10 text-white" />
							</div>
							<div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-xs font-extrabold text-white shadow-md border-2 border-white">
								{gamification.level}
							</div>
						</div>

						{/* Name */}
						<div className="flex-1">
							{editingName ? (
								<div className="flex items-center gap-2">
									<input
										type="text"
										value={nameInput}
										onChange={(e) =>
											setNameInput(e.target.value)
										}
										placeholder="Tvoje meno"
										className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
										autoFocus
									/>
									<button
										type="button"
										onClick={handleSaveName}
										className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors border-none cursor-pointer"
									>
										<Save className="h-4 w-4" />
									</button>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<h1 className="text-xl font-extrabold text-gray-800">
										{settings.name || "Student"}
									</h1>
									<button
										type="button"
										onClick={() => setEditingName(true)}
										className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors border-none cursor-pointer"
									>
										<Edit3 className="h-3.5 w-3.5" />
									</button>
								</div>
							)}
							<div className="flex items-center gap-2 mt-1">
								<GraduationCap className="h-4 w-4 text-gray-400" />
								<span className="text-sm text-gray-400">
									{settings.examType === "8-rocne"
										? "8-rocne gymnazium"
										: settings.examType === "bilingvalne"
											? "Bilingvalne gymnazium"
											: "4-rocne gymnazium"}
								</span>
								<button
									type="button"
									onClick={() => setShowExamTypeChange(true)}
									className="text-xs font-bold text-purple-500 hover:text-purple-700 bg-transparent border-none cursor-pointer"
								>
									Zmenit
								</button>
							</div>
						</div>
					</div>

					{/* Gamification stats row */}
					<div className="grid grid-cols-4 gap-3">
						<div className="rounded-xl bg-purple-50 p-3 text-center">
							<Sparkles className="h-4 w-4 text-purple-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-purple-600">
								{gamification.xp}
							</p>
							<p className="text-xs text-purple-400 font-medium">
								XP
							</p>
						</div>
						<div className="rounded-xl bg-yellow-50 p-3 text-center">
							<Star className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-yellow-600">
								{gamification.level}
							</p>
							<p className="text-xs text-yellow-400 font-medium">
								Level
							</p>
						</div>
						<div className="rounded-xl bg-orange-50 p-3 text-center">
							<Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-orange-600">
								{gamification.streak}
							</p>
							<p className="text-xs text-orange-400 font-medium">
								Seria
							</p>
						</div>
						<div className="rounded-xl bg-red-50 p-3 text-center">
							<Trophy className="h-4 w-4 text-red-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-red-600">
								{gamification.longestStreak}
							</p>
							<p className="text-xs text-red-400 font-medium">
								Najdlhsia
							</p>
						</div>
					</div>
				</div>

				{/* Study statistics */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2 mb-4">
						<BarChart3 className="h-5 w-5 text-blue-500" />
						Statistiky ucenia
					</h2>

					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
						<div className="text-center">
							<div className="flex justify-center mb-2">
								<ProgressRing
									percentage={accuracyRate}
									size={64}
									color="#22c55e"
								/>
							</div>
							<p className="text-xs font-bold text-gray-600">
								Presnost
							</p>
						</div>
						<div className="rounded-xl bg-blue-50 p-3 text-center">
							<Target className="h-5 w-5 text-blue-500 mx-auto mb-1" />
							<p className="text-xl font-extrabold text-blue-600">
								{totalQuestions}
							</p>
							<p className="text-xs text-blue-400">
								Celkom otazok
							</p>
						</div>
						<div className="rounded-xl bg-green-50 p-3 text-center">
							<CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
							<p className="text-xl font-extrabold text-green-600">
								{correctAnswers}
							</p>
							<p className="text-xs text-green-400">Spravnych</p>
						</div>
						<div className="rounded-xl bg-purple-50 p-3 text-center">
							<BookOpen className="h-5 w-5 text-purple-500 mx-auto mb-1" />
							<p className="text-xl font-extrabold text-purple-600">
								{mockTestResults.length}
							</p>
							<p className="text-xs text-purple-400">Testov</p>
						</div>
					</div>
				</div>

				{/* Achievements */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2 mb-4">
						<Award className="h-5 w-5 text-yellow-500" />
						Uspechy
						<span className="text-sm font-medium text-gray-400">
							({gamification.achievements.length}/
							{ALL_ACHIEVEMENTS.length})
						</span>
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{ALL_ACHIEVEMENTS.map((achievement) => {
							const unlocked = gamification.achievements.find(
								(a: Achievement) => a.id === achievement.id,
							);
							const emoji =
								achievementIconMap[achievement.icon] ??
								String.fromCodePoint(0x1f3c6);

							return (
								<div
									key={achievement.id}
									className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
										unlocked
											? "bg-yellow-50 border border-yellow-200"
											: "bg-gray-50 border border-gray-200 opacity-60"
									}`}
								>
									<div
										className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
											unlocked
												? "bg-yellow-100"
												: "bg-gray-100"
										}`}
									>
										{unlocked ? (
											emoji
										) : (
											<Lock className="h-5 w-5 text-gray-300" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p
											className={`text-sm font-bold ${
												unlocked
													? "text-gray-700"
													: "text-gray-400"
											}`}
										>
											{achievement.title}
										</p>
										<p className="text-xs text-gray-400 truncate">
											{achievement.description}
										</p>
										{unlocked?.unlockedAt && (
											<p className="text-xs text-yellow-500 font-medium">
												Odomknute{" "}
												{new Date(
													unlocked.unlockedAt,
												).toLocaleDateString("sk-SK")}
											</p>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Certificates */}
				{certificates.length > 0 && (
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2 mb-4">
							<Trophy className="h-5 w-5 text-yellow-500" />
							Certifikáty
							<span className="text-sm font-medium text-gray-400">
								({certificates.length})
							</span>
						</h2>
						<div className="space-y-3">
							{[...certificates].reverse().map((cert) => (
								<div
									key={cert.id}
									className="flex items-center gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-3"
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
										<Award className="h-5 w-5 text-yellow-600" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-bold text-gray-700">
											{cert.subject === "math" ? "Matematika" : cert.subject === "german" ? "Nemčina" : "Slovenčina"}{" "}
											— {cert.percentage}%
										</p>
										<p className="text-xs text-gray-400">
											{new Date(cert.issuedAt).toLocaleDateString("sk-SK")}
											{" · "}
											{cert.id}
										</p>
									</div>
									<button
										type="button"
										onClick={() => generateCertificatePDF(cert)}
										className="flex items-center gap-1 rounded-lg bg-yellow-200 px-3 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-300 transition-colors border-none cursor-pointer"
									>
										<Download className="h-3.5 w-3.5" />
										Stiahnuť
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Mock test history */}
				{mockTestResults.length > 0 && (
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2 mb-4">
							<Clock className="h-5 w-5 text-blue-500" />
							Historia testov
						</h2>

						<div className="space-y-3">
							{[...mockTestResults]
								.reverse()
								.slice(0, 10)
								.map((result, idx) => (
									<div
										key={`${result.testId}-${idx}`}
										className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
									>
										<div
											className={`flex h-10 w-10 items-center justify-center rounded-lg ${
												result.percentage >= 75
													? "bg-green-100"
													: result.percentage >= 50
														? "bg-yellow-100"
														: "bg-red-100"
											}`}
										>
											<ProgressRing
												percentage={result.percentage}
												size={32}
												color={
													result.percentage >= 75
														? "#22c55e"
														: result.percentage >=
																50
															? "#eab308"
															: "#ef4444"
												}
											/>
										</div>
										<div className="flex-1">
											<p className="text-sm font-bold text-gray-700">
												{result.percentage}% -{" "}
												{result.score}/{result.maxScore}{" "}
												spravnych
											</p>
											<p className="text-xs text-gray-400">
												{new Date(
													result.completedAt,
												).toLocaleDateString("sk-SK", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}
											</p>
										</div>
									</div>
								))}
						</div>
					</div>
				)}

				{/* Settings section */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2 mb-4">
						<Settings className="h-5 w-5 text-gray-500" />
						Nastavenia
					</h2>

					<div className="space-y-2">
						{/* Parent code card */}
						{parentCode && (
							<div className="rounded-xl bg-pink-50 border border-pink-200 p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs font-bold text-pink-600">
											Kód pre rodiča
										</p>
										<p className="text-2xl font-extrabold tracking-widest text-pink-700">
											{parentCode}
										</p>
									</div>
									<button
										type="button"
										onClick={handleCopyParentCode}
										className="flex items-center gap-1 rounded-lg bg-pink-200 px-3 py-2 text-xs font-bold text-pink-700 hover:bg-pink-300 transition-colors border-none cursor-pointer"
									>
										<Copy className="h-3.5 w-3.5" />
										{codeCopied ? "Skopírované!" : "Kopírovať"}
									</button>
								</div>
							</div>
						)}

						{/* Auth */}
						<button
							type="button"
							onClick={handleSignOut}
							className="w-full flex items-center justify-between rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition-colors border-none cursor-pointer text-left"
						>
							<div className="flex items-center gap-3">
								<LogOut className="h-5 w-5 text-gray-400" />
								<div>
									<p className="text-sm font-bold text-gray-700">
										Odhlásiť sa
									</p>
									<p className="text-xs text-gray-400">
										{user?.email}
									</p>
								</div>
							</div>
							<ChevronRight className="h-4 w-4 text-gray-400" />
						</button>

						<button
							type="button"
							onClick={() => setShowExamTypeChange(true)}
							className="w-full flex items-center justify-between rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition-colors border-none cursor-pointer text-left"
						>
							<div className="flex items-center gap-3">
								<GraduationCap className="h-5 w-5 text-gray-400" />
								<div>
									<p className="text-sm font-bold text-gray-700">
										Typ skusky
									</p>
									<p className="text-xs text-gray-400">
										{settings.examType === "8-rocne"
											? "8-rocne gymnazium"
											: "4-rocne gymnazium"}
									</p>
								</div>
							</div>
							<ChevronRight className="h-4 w-4 text-gray-400" />
						</button>

						<button
							type="button"
							onClick={toggleDarkMode}
							className="w-full flex items-center justify-between rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition-colors border-none cursor-pointer text-left"
						>
							<div className="flex items-center gap-3">
								{isDark ? (
									<Sun className="h-5 w-5 text-yellow-500" />
								) : (
									<Moon className="h-5 w-5 text-gray-400" />
								)}
								<div>
									<p className="text-sm font-bold text-gray-700">
										{isDark ? "Svetly rezim" : "Tmavy rezim"}
									</p>
									<p className="text-xs text-gray-400">
										{isDark ? "Prepnut na svetlu temu" : "Prepnut na tmavu temu"}
									</p>
								</div>
							</div>
							<div className={`h-6 w-11 rounded-full transition-colors ${isDark ? "bg-purple-500" : "bg-gray-300"} relative`}>
								<div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${isDark ? "translate-x-5" : "translate-x-0.5"}`} />
							</div>
						</button>

						{/* Notifications */}
						<div className="rounded-xl bg-gray-50 p-4">
							<button
								type="button"
								onClick={handleToggleNotifications}
								className="w-full flex items-center justify-between border-none cursor-pointer text-left bg-transparent p-0"
							>
								<div className="flex items-center gap-3">
									<Bell className={`h-5 w-5 ${notifSettings.enabled ? "text-purple-500" : "text-gray-400"}`} />
									<div>
										<p className="text-sm font-bold text-gray-700">
											Pripomienky
										</p>
										<p className="text-xs text-gray-400">
											Denná pripomienka na učenie
										</p>
									</div>
								</div>
								<div className={`h-6 w-11 rounded-full transition-colors ${notifSettings.enabled ? "bg-purple-500" : "bg-gray-300"} relative`}>
									<div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${notifSettings.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
								</div>
							</button>
							{notifSettings.enabled && (
								<div className="mt-3 flex items-center gap-3 pl-8">
									<label className="text-xs font-medium text-gray-500">
										Čas:
									</label>
									<input
										type="time"
										value={notifSettings.time}
										onChange={(e) => handleNotifTimeChange(e.target.value)}
										className="rounded-lg border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
									/>
								</div>
							)}
						</div>

						<button
							type="button"
							onClick={() => navigate("/role-select")}
							className="w-full flex items-center justify-between rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition-colors border-none cursor-pointer text-left"
						>
							<div className="flex items-center gap-3">
								<RotateCcw className="h-5 w-5 text-gray-400" />
								<div>
									<p className="text-sm font-bold text-gray-700">
										Zmenit rolu
									</p>
									<p className="text-xs text-gray-400">
										Spat na vyber roly
									</p>
								</div>
							</div>
							<ChevronRight className="h-4 w-4 text-gray-400" />
						</button>

						<button
							type="button"
							onClick={() => setShowClearConfirm(true)}
							className="w-full flex items-center justify-between rounded-xl bg-red-50 p-4 hover:bg-red-100 transition-colors border-none cursor-pointer text-left"
						>
							<div className="flex items-center gap-3">
								<Trash2 className="h-5 w-5 text-red-400" />
								<div>
									<p className="text-sm font-bold text-red-600">
										Vymazat udaje
									</p>
									<p className="text-xs text-red-400">
										Odstrani vsetky data a nastavenia
									</p>
								</div>
							</div>
							<ChevronRight className="h-4 w-4 text-red-400" />
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}
