import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	Brain,
	CheckCircle2,
	ClipboardList,
	Lightbulb,
	Sparkles,
	Trophy,
	X,
	Zap,
} from "lucide-react";
import QuestionCard from "../components/QuestionCard";
import AchievementPopup from "../components/AchievementPopup";
import LevelUpModal from "../components/LevelUpModal";
import type { Achievement, LearningPhase, Question, Subject } from "../types";
import { generateQuestionSet } from "../utils/questionGenerator";
import { addXP, getGamification } from "../utils/gamification";
import { addQuestionResult, getUserSettings } from "../utils/progress";

const QUESTIONS_PER_SESSION = 10;

const phaseConfig: Record<
	LearningPhase,
	{ label: string; icon: typeof BookOpen; color: string; bgColor: string }
> = {
	example: {
		label: "Príklad",
		icon: Lightbulb,
		color: "text-yellow-600",
		bgColor: "bg-yellow-100",
	},
	planning: {
		label: "Plánovanie",
		icon: ClipboardList,
		color: "text-blue-600",
		bgColor: "bg-blue-100",
	},
	solving: {
		label: "Riešenie",
		icon: Brain,
		color: "text-purple-600",
		bgColor: "bg-purple-100",
	},
	feedback: {
		label: "Spätná väzba",
		icon: CheckCircle2,
		color: "text-green-600",
		bgColor: "bg-green-100",
	},
};

const phases: LearningPhase[] = ["example", "planning", "solving", "feedback"];

export default function LearningPage() {
	const navigate = useNavigate();
	const location = useLocation();

	const settings = getUserSettings();
	const subjectFromState =
		(location.state as { subject?: Subject })?.subject ?? "math";

	const [subject] = useState<Subject>(subjectFromState);
	const [questions, setQuestions] = useState<Question[]>(() =>
		generateQuestionSet(subjectFromState, settings.examType, QUESTIONS_PER_SESSION),
	);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [currentPhase, setCurrentPhase] = useState<LearningPhase>("example");
	const [sessionComplete, setSessionComplete] = useState(false);
	const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());

	// Results tracking
	const [correctCount, setCorrectCount] = useState(0);
	const [totalXPGained, setTotalXPGained] = useState(0);
	const [answered, setAnswered] = useState(false);
	const [lastCorrect, setLastCorrect] = useState(false);

	// XP animation
	const [xpPopup, setXpPopup] = useState<{
		amount: number;
		visible: boolean;
	} | null>(null);

	// Achievement and level up
	const [achievementPopup, setAchievementPopup] =
		useState<Achievement | null>(null);
	const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);

	// Gamification state
	const [, setGamification] = useState(getGamification());

	const currentQuestion = questions[currentIndex];

	const showXPAnimation = useCallback((amount: number) => {
		setXpPopup({ amount, visible: true });
		setTimeout(() => setXpPopup(null), 1500);
	}, []);

	const handleAnswer = useCallback(
		(answer: string, correct: boolean) => {
			if (answered) return;

			setAnswered(true);
			setLastCorrect(correct);
			if (correct) setCorrectCount((c) => c + 1);

			// Record time spent
			const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

			// Add XP
			const result = addXP(correct);
			setGamification(result.state);
			setTotalXPGained((t) => t + result.xpGained);
			showXPAnimation(result.xpGained);

			// Save question result
			addQuestionResult({
				questionId: currentQuestion?.id ?? "",
				correct,
				userAnswer: answer,
				timeSpent,
				phase: "solving",
				timestamp: new Date().toISOString(),
			});

			// Check for new achievements
			if (result.newAchievements.length > 0) {
				setTimeout(
					() => setAchievementPopup(result.newAchievements[0]),
					800,
				);
			}

			// Check for level up
			if (result.leveledUp) {
				setTimeout(
					() => setLevelUpLevel(result.state.level),
					result.newAchievements.length > 0 ? 3500 : 800,
				);
			}
		},
		[answered, questionStartTime, currentQuestion, showXPAnimation],
	);

	const advancePhase = () => {
		const phaseIdx = phases.indexOf(currentPhase);

		if (currentPhase === "feedback") {
			// Move to next question
			if (currentIndex + 1 >= questions.length) {
				setSessionComplete(true);
				return;
			}
			setCurrentIndex((i) => i + 1);
			setCurrentPhase("example");
			setAnswered(false);
			setLastCorrect(false);
			setQuestionStartTime(Date.now());
		} else {
			setCurrentPhase(phases[phaseIdx + 1]);
		}
	};

	if (!currentQuestion && !sessionComplete) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-pulse text-gray-400 font-semibold">
					Načítavam otázky...
				</div>
			</div>
		);
	}

	// Session complete screen
	if (sessionComplete) {
		const accuracy =
			questions.length > 0
				? Math.round((correctCount / questions.length) * 100)
				: 0;

		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-12 text-center">
					<div className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
						{/* Trophy icon */}
						<div className="flex items-center justify-center mb-6">
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100">
								<Trophy className="h-10 w-10 text-yellow-500" />
							</div>
						</div>

						<h1 className="text-2xl font-extrabold text-gray-800 mb-2">
							Výborne! Relácia dokončená!
						</h1>
						<p className="text-gray-500 mb-6">
							Skvelá práca, pokračuj v učení!
						</p>

						{/* Stats */}
						<div className="grid grid-cols-3 gap-4 mb-6">
							<div className="rounded-2xl bg-green-50 p-4">
								<p className="text-2xl font-extrabold text-green-600">
									{correctCount}/{questions.length}
								</p>
								<p className="text-xs text-green-500 font-medium">
									Správne
								</p>
							</div>
							<div className="rounded-2xl bg-purple-50 p-4">
								<p className="text-2xl font-extrabold text-purple-600">
									{accuracy}%
								</p>
								<p className="text-xs text-purple-500 font-medium">
									Presnosť
								</p>
							</div>
							<div className="rounded-2xl bg-blue-50 p-4">
								<p className="text-2xl font-extrabold text-blue-600">
									+{totalXPGained}
								</p>
								<p className="text-xs text-blue-500 font-medium">
									XP
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className="flex flex-col gap-3">
							<button
								type="button"
								onClick={() => {
									setQuestions(
										generateQuestionSet(
											subject,
											settings.examType,
											QUESTIONS_PER_SESSION,
										),
									);
									setCurrentIndex(0);
									setCurrentPhase("example");
									setSessionComplete(false);
									setCorrectCount(0);
									setTotalXPGained(0);
									setAnswered(false);
									setLastCorrect(false);
									setQuestionStartTime(Date.now());
								}}
								className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
							>
								<Zap className="h-5 w-5" />
								Ďalšia relácia
							</button>
							<button
								type="button"
								onClick={() => navigate("/dashboard")}
								className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-6 py-4 font-bold text-gray-600 hover:bg-gray-200 transition-all border-none cursor-pointer"
							>
								Späť na Dashboard
							</button>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			{/* Achievement popup */}
			{achievementPopup && (
				<AchievementPopup
					achievement={achievementPopup}
					onClose={() => setAchievementPopup(null)}
				/>
			)}

			{/* Level up modal */}
			{levelUpLevel !== null && (
				<LevelUpModal
					level={levelUpLevel}
					onClose={() => setLevelUpLevel(null)}
				/>
			)}

			{/* XP animation popup */}
			{xpPopup?.visible && (
				<div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
					<div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 shadow-lg">
						<Sparkles className="h-4 w-4 text-white" />
						<span className="text-sm font-extrabold text-white">
							+{xpPopup.amount} XP
						</span>
					</div>
				</div>
			)}

			<main className="mx-auto max-w-2xl px-4 py-6">
				{/* Top bar: back + progress */}
				<div className="flex items-center justify-between mb-6">
					<button
						type="button"
						onClick={() => navigate("/dashboard")}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors bg-transparent border-none cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="hidden sm:inline">Dashboard</span>
					</button>

					<div className="flex items-center gap-2">
						<span className="text-sm font-bold text-gray-400">
							{currentIndex + 1} / {questions.length}
						</span>
						<div className="h-2 w-32 rounded-full bg-gray-200 overflow-hidden">
							<div
								className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
								style={{
									width: `${((currentIndex + 1) / questions.length) * 100}%`,
								}}
							/>
						</div>
					</div>

					<button
						type="button"
						onClick={() => navigate("/dashboard")}
						className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors border-none cursor-pointer"
						aria-label="Zavrieť"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Phase indicator */}
				<div className="flex items-center gap-1 sm:gap-2 mb-6 overflow-x-auto pb-2">
					{phases.map((phase, idx) => {
						const config = phaseConfig[phase];
						const PhaseIcon = config.icon;
						const isCurrent = phase === currentPhase;
						const isPast = phases.indexOf(currentPhase) > idx;

						return (
							<div key={phase} className="flex items-center gap-1 sm:gap-2">
								{idx > 0 && (
									<div
										className={`h-0.5 w-4 sm:w-8 rounded-full ${
											isPast
												? "bg-green-400"
												: isCurrent
													? "bg-purple-300"
													: "bg-gray-200"
										}`}
									/>
								)}
								<div
									className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
										isCurrent
											? `${config.bgColor} ${config.color} shadow-sm`
											: isPast
												? "bg-green-100 text-green-600"
												: "bg-gray-100 text-gray-400"
									}`}
								>
									<PhaseIcon className="h-3.5 w-3.5" />
									<span className="hidden sm:inline">
										{config.label}
									</span>
								</div>
							</div>
						);
					})}
				</div>

				{/* Phase content */}
				{currentPhase === "example" && currentQuestion && (
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
								<Lightbulb className="h-5 w-5 text-yellow-600" />
							</div>
							<div>
								<h2 className="text-lg font-extrabold text-gray-800">
									Pozri sa na príklad
								</h2>
								<p className="text-sm text-gray-400">
									Téma: {currentQuestion.topic}
								</p>
							</div>
						</div>

						<div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-5 mb-4">
							<p className="text-base font-semibold text-gray-700 mb-3">
								{currentQuestion.question}
							</p>
							<div className="rounded-xl bg-white p-4 border border-yellow-200">
								<p className="text-sm font-bold text-yellow-700 mb-1">
									Správna odpoveď:
								</p>
								<p className="text-lg font-extrabold text-gray-800">
									{currentQuestion.correctAnswer}
								</p>
							</div>
						</div>

						<div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
							<p className="text-sm font-bold text-blue-700 mb-1">
								Vysvetlenie:
							</p>
							<p className="text-sm text-gray-600 leading-relaxed">
								{currentQuestion.explanation}
							</p>
						</div>

						<button
							type="button"
							onClick={advancePhase}
							className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
						>
							Rozumiem, pokračovať
							<ArrowRight className="h-5 w-5" />
						</button>
					</div>
				)}

				{currentPhase === "planning" && currentQuestion && (
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
								<ClipboardList className="h-5 w-5 text-blue-600" />
							</div>
							<div>
								<h2 className="text-lg font-extrabold text-gray-800">
									Naplánuj si postup
								</h2>
								<p className="text-sm text-gray-400">
									Premysli si, ako budeš riešiť úlohu
								</p>
							</div>
						</div>

						<div className="rounded-2xl bg-blue-50 border border-blue-200 p-5 mb-4">
							<p className="text-base font-semibold text-gray-700">
								{currentQuestion.question}
							</p>
						</div>

						{currentQuestion.hint && (
							<div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 mb-4">
								<div className="flex items-start gap-2">
									<Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
									<div>
										<p className="text-xs font-bold text-yellow-700 mb-1">
											Nápoveda:
										</p>
										<p className="text-sm text-gray-600">
											{currentQuestion.hint}
										</p>
									</div>
								</div>
							</div>
						)}

						<div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 mb-4">
							<p className="text-xs font-bold text-gray-500 mb-2">
								Tipy na plánovanie:
							</p>
							<ul className="space-y-2 text-sm text-gray-600">
								<li className="flex items-start gap-2">
									<span className="text-blue-400 mt-0.5">
										1.
									</span>
									Prečítaj si otázku pozorne
								</li>
								<li className="flex items-start gap-2">
									<span className="text-blue-400 mt-0.5">
										2.
									</span>
									Identifikuj, čo je treba nájsť
								</li>
								<li className="flex items-start gap-2">
									<span className="text-blue-400 mt-0.5">
										3.
									</span>
									Premysli si postup riešenia
								</li>
							</ul>
						</div>

						<button
							type="button"
							onClick={advancePhase}
							className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
						>
							Mám plán, chcem riešiť!
							<ArrowRight className="h-5 w-5" />
						</button>
					</div>
				)}

				{currentPhase === "solving" && currentQuestion && (
					<div className="mb-6">
						<QuestionCard
							question={currentQuestion}
							onAnswer={handleAnswer}
						/>

						{answered && (
							<button
								type="button"
								onClick={advancePhase}
								className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
							>
								Zobraziť spätnú väzbu
								<ArrowRight className="h-5 w-5" />
							</button>
						)}
					</div>
				)}

				{currentPhase === "feedback" && currentQuestion && (
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<div className="flex items-center gap-2 mb-4">
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-xl ${
									lastCorrect
										? "bg-green-100"
										: "bg-red-100"
								}`}
							>
								<CheckCircle2
									className={`h-5 w-5 ${
										lastCorrect
											? "text-green-600"
											: "text-red-600"
									}`}
								/>
							</div>
							<div>
								<h2 className="text-lg font-extrabold text-gray-800">
									{lastCorrect
										? "Správne! Výborne!"
										: "Nevadí, učíme sa!"}
								</h2>
								<p className="text-sm text-gray-400">
									Pozri si vysvetlenie
								</p>
							</div>
						</div>

						{/* Result indicator */}
						<div
							className={`rounded-2xl p-4 mb-4 ${
								lastCorrect
									? "bg-green-50 border border-green-200"
									: "bg-red-50 border border-red-200"
							}`}
						>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-bold text-gray-600">
									Tvoja odpoveď:
								</span>
								<span
									className={`text-sm font-bold ${
										lastCorrect
											? "text-green-600"
											: "text-red-600"
									}`}
								>
									{lastCorrect ? "Správne" : "Nesprávne"}
								</span>
							</div>
							{!lastCorrect && (
								<p className="text-sm text-gray-600">
									Správna odpoveď:{" "}
									<span className="font-bold">
										{currentQuestion.correctAnswer}
									</span>
								</p>
							)}
						</div>

						{/* Explanation */}
						<div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 mb-4">
							<p className="text-sm font-bold text-blue-700 mb-1">
								Vysvetlenie:
							</p>
							<p className="text-sm text-gray-600 leading-relaxed">
								{currentQuestion.explanation}
							</p>
						</div>

						{/* XP gained */}
						<div className="flex items-center justify-center gap-2 rounded-2xl bg-purple-50 border border-purple-200 p-3 mb-4">
							<Sparkles className="h-4 w-4 text-purple-500" />
							<span className="text-sm font-bold text-purple-600">
								+{lastCorrect ? "10" : "2"} XP získaných
							</span>
						</div>

						<button
							type="button"
							onClick={advancePhase}
							className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
						>
							{currentIndex + 1 < questions.length
								? "Ďalšia otázka"
								: "Dokončiť reláciu"}
							<ArrowRight className="h-5 w-5" />
						</button>
					</div>
				)}
			</main>
		</div>
	);
}
