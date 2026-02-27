import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	BookOpen,
	Brain,
	Calculator,
	Check,
	ChevronLeft,
	ChevronRight,
	Clock,
	FileText,
	Languages,
	RotateCcw,
	Trophy,
	X as XIcon,
} from "lucide-react";
import Timer from "../components/Timer";
import ProgressRing from "../components/ProgressRing";
import type { Question, QuestionResult, Subject } from "../types";
import { generateMockTest } from "../utils/questionGenerator";
import { addMockTestBonus } from "../utils/gamification";
import { getUserSettings, saveMockTestResult } from "../utils/progress";

type TestStage = "setup" | "testing" | "results";

export default function MockTestPage() {
	const navigate = useNavigate();
	const settings = getUserSettings();

	const [stage, setStage] = useState<TestStage>("setup");
	const [subject, setSubject] = useState<Subject>("math");
	const [questions, setQuestions] = useState<Question[]>([]);
	const [timeLimit, setTimeLimit] = useState(0);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<number, { answer: string; correct: boolean }>>({});
	const [testStartTime] = useState(() => Date.now());
	const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

	// Results
	const [results, setResults] = useState<{
		score: number;
		maxScore: number;
		percentage: number;
		timeUsed: number;
		questionResults: QuestionResult[];
	} | null>(null);

	const startTest = () => {
		const test = generateMockTest(subject, settings.examType);
		setQuestions(test.questions);
		setTimeLimit(test.timeLimit);
		setCurrentIndex(0);
		setAnswers({});
		setStage("testing");
	};

	const handleAnswer = (questionIdx: number, answer: string, correct: boolean) => {
		setAnswers((prev) => ({
			...prev,
			[questionIdx]: { answer, correct },
		}));
	};

	const finishTest = useCallback(() => {
		const timeUsed = Math.round((Date.now() - testStartTime) / 1000);
		const questionResults: QuestionResult[] = questions.map((q, idx) => {
			const userAnswer = answers[idx];
			return {
				questionId: q.id,
				correct: userAnswer?.correct ?? false,
				userAnswer: userAnswer?.answer ?? "",
				timeSpent: Math.round(timeUsed / questions.length),
				phase: "solving" as const,
				timestamp: new Date().toISOString(),
			};
		});

		const score = questionResults.filter((r) => r.correct).length;
		const maxScore = questions.length;
		const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

		// Save result
		saveMockTestResult({
			testId: `test-${Date.now()}`,
			answers: questionResults,
			score,
			maxScore,
			percentage,
			timeUsed,
			completedAt: new Date().toISOString(),
		});

		// Add XP bonus
		addMockTestBonus(percentage);

		setResults({ score, maxScore, percentage, timeUsed, questionResults });
		setStage("results");
	}, [questions, answers, testStartTime]);

	const handleTimeUp = useCallback(() => {
		finishTest();
	}, [finishTest]);

	const answeredCount = Object.keys(answers).length;
	const currentQuestion = questions[currentIndex];

	// === SETUP STAGE ===
	if (stage === "setup") {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-8">
					<button
						type="button"
						onClick={() => navigate("/dashboard")}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors bg-transparent border-none cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4" />
						Späť
					</button>

					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
						{/* Header */}
						<div className="flex items-center gap-3 mb-6">
							<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100">
								<Brain className="h-7 w-7 text-orange-500" />
							</div>
							<div>
								<h1 className="text-xl font-extrabold text-gray-800">
									Skúšobný test
								</h1>
								<p className="text-sm text-gray-400">
									Odskúšaj si test ako na prijímačkách
								</p>
							</div>
						</div>

						{/* Subject selection */}
						<div className="mb-6">
							<p className="text-sm font-bold text-gray-600 mb-3">
								Vyber predmet:
							</p>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => setSubject("math")}
									className={`flex items-center gap-3 rounded-2xl p-4 border-2 transition-all cursor-pointer ${
										subject === "math"
											? "border-blue-400 bg-blue-50 shadow-md"
											: "border-gray-200 bg-white hover:border-blue-200"
									}`}
								>
									<Calculator
										className={`h-6 w-6 ${
											subject === "math"
												? "text-blue-500"
												: "text-gray-400"
										}`}
									/>
									<span
										className={`font-bold ${
											subject === "math"
												? "text-blue-700"
												: "text-gray-600"
										}`}
									>
										Matematika
									</span>
								</button>
								<button
									type="button"
									onClick={() => setSubject("slovak")}
									className={`flex items-center gap-3 rounded-2xl p-4 border-2 transition-all cursor-pointer ${
										subject === "slovak"
											? "border-pink-400 bg-pink-50 shadow-md"
											: "border-gray-200 bg-white hover:border-pink-200"
									}`}
								>
									<Languages
										className={`h-6 w-6 ${
											subject === "slovak"
												? "text-pink-500"
												: "text-gray-400"
										}`}
									/>
									<span
										className={`font-bold ${
											subject === "slovak"
												? "text-pink-700"
												: "text-gray-600"
										}`}
									>
										Slovenčina
									</span>
								</button>
							</div>
						</div>

						{/* Test info */}
						<div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 mb-6 space-y-3">
							<h3 className="text-sm font-bold text-gray-600">
								Pravidlá testu:
							</h3>
							<div className="flex items-center gap-3 text-sm text-gray-600">
								<FileText className="h-4 w-4 text-gray-400 shrink-0" />
								<span>
									{settings.examType === "4-rocne"
										? "20 otázok"
										: "15 otázok"}
								</span>
							</div>
							<div className="flex items-center gap-3 text-sm text-gray-600">
								<Clock className="h-4 w-4 text-gray-400 shrink-0" />
								<span>
									Časový limit:{" "}
									{settings.examType === "4-rocne"
										? "45"
										: "30"}{" "}
									minút
								</span>
							</div>
							<div className="flex items-center gap-3 text-sm text-gray-600">
								<BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
								<span>
									Typ:{" "}
									{settings.examType === "8-rocne"
										? "8-ročné gymnázium"
										: settings.examType === "bilingvalne"
											? "Bilingválne gymnázium"
											: "4-ročné gymnázium"}
								</span>
							</div>
							<div className="flex items-center gap-3 text-sm text-orange-600">
								<AlertTriangle className="h-4 w-4 shrink-0" />
								<span>
									Po začatí testu beží čas. Odpovedaj
									postupne.
								</span>
							</div>
						</div>

						{/* Start button */}
						<button
							type="button"
							onClick={startTest}
							className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 font-bold text-white shadow-lg shadow-orange-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all border-none cursor-pointer"
						>
							Začať test
							<ArrowRight className="h-5 w-5" />
						</button>
					</div>
				</main>
			</div>
		);
	}

	// === TESTING STAGE ===
	if (stage === "testing" && currentQuestion) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
				{/* Confirm submit dialog */}
				{showConfirmSubmit && (
					<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
						<div className="w-[90%] max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
							<h3 className="text-lg font-extrabold text-gray-800 mb-2">
								Odovzdať test?
							</h3>
							<p className="text-sm text-gray-500 mb-1">
								Odpovedal si na {answeredCount} z{" "}
								{questions.length} otázok.
							</p>
							{answeredCount < questions.length && (
								<p className="text-sm text-orange-500 font-medium mb-4">
									Máš {questions.length - answeredCount}{" "}
									nezodpovedaných otázok!
								</p>
							)}
							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => setShowConfirmSubmit(false)}
									className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 hover:bg-gray-200 transition-colors border-none cursor-pointer"
								>
									Späť
								</button>
								<button
									type="button"
									onClick={() => {
										setShowConfirmSubmit(false);
										finishTest();
									}}
									className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 font-bold text-white hover:shadow-lg transition-all border-none cursor-pointer"
								>
									Odovzdať
								</button>
							</div>
						</div>
					</div>
				)}

				<div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3">
					<div className="mx-auto max-w-2xl flex items-center justify-between">
						{/* Question counter */}
						<span className="text-sm font-bold text-gray-600">
							Otázka {currentIndex + 1} z {questions.length}
						</span>

						{/* Timer */}
						<Timer
							totalSeconds={timeLimit * 60}
							onTimeUp={handleTimeUp}
						/>

						{/* Submit button */}
						<button
							type="button"
							onClick={() => setShowConfirmSubmit(true)}
							className="rounded-xl bg-orange-100 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-200 transition-colors border-none cursor-pointer"
						>
							Odovzdať
						</button>
					</div>
				</div>

				<main className="mx-auto max-w-2xl px-4 py-6">
					{/* Progress dots */}
					<div className="flex flex-wrap gap-1.5 mb-6 justify-center">
						{questions.map((_, idx) => {
							const isActive = idx === currentIndex;
							const hasAnswer = answers[idx] !== undefined;
							return (
								<button
									key={questions[idx].id}
									type="button"
									onClick={() => setCurrentIndex(idx)}
									className={`h-3 w-3 rounded-full transition-all border-none cursor-pointer ${
										isActive
											? "bg-purple-500 scale-125 shadow-md"
											: hasAnswer
												? "bg-green-400"
												: "bg-gray-300"
									}`}
									aria-label={`Otázka ${idx + 1}`}
								/>
							);
						})}
					</div>

					{/* Question card (inline version for test) */}
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden mb-6">
						{/* Header */}
						<div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium text-white/90">
									{currentQuestion.topic}
								</span>
								<span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
									{currentQuestion.difficulty === 1
										? "Ľahké"
										: currentQuestion.difficulty === 2
											? "Stredné"
											: "Ťažké"}
								</span>
							</div>
						</div>

						{/* Question text */}
						<div className="px-6 pt-6 pb-4">
							<h2 className="text-lg font-bold text-gray-800 leading-relaxed">
								{currentQuestion.question}
							</h2>
						</div>

						{/* Options */}
						<div className="px-6 pb-6 space-y-3">
							{currentQuestion.options?.map((option, optIdx) => {
								const letters = ["A", "B", "C", "D", "E", "F"];
								const isSelected =
									answers[currentIndex]?.answer === option;

								return (
									<button
										key={option}
										type="button"
										onClick={() => {
											handleAnswer(
												currentIndex,
												option,
												option ===
													currentQuestion.correctAnswer,
											);
										}}
										className={`w-full flex items-center gap-3 rounded-xl p-4 text-left transition-all duration-200 border-2 cursor-pointer ${
											isSelected
												? "border-purple-400 bg-purple-50 shadow-md"
												: "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
										}`}
									>
										<div
											className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
												isSelected
													? "bg-purple-500 text-white"
													: "bg-purple-100 text-purple-600"
											}`}
										>
											{letters[optIdx]}
										</div>
										<span className="flex-1 text-sm font-medium text-gray-700">
											{option}
										</span>
										{isSelected && (
											<Check className="h-5 w-5 text-purple-500" />
										)}
									</button>
								);
							})}
						</div>
					</div>

					{/* Navigation */}
					<div className="flex items-center justify-between">
						<button
							type="button"
							onClick={() =>
								setCurrentIndex((i) => Math.max(0, i - 1))
							}
							disabled={currentIndex === 0}
							className={`flex items-center gap-2 rounded-xl px-4 py-3 font-bold transition-all border-none cursor-pointer ${
								currentIndex === 0
									? "bg-gray-100 text-gray-300 cursor-not-allowed"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							<ChevronLeft className="h-4 w-4" />
							Predchádzajúca
						</button>

						{currentIndex < questions.length - 1 ? (
							<button
								type="button"
								onClick={() =>
									setCurrentIndex((i) =>
										Math.min(questions.length - 1, i + 1),
									)
								}
								className="flex items-center gap-2 rounded-xl bg-purple-100 px-4 py-3 font-bold text-purple-600 hover:bg-purple-200 transition-all border-none cursor-pointer"
							>
								Ďalšia
								<ChevronRight className="h-4 w-4" />
							</button>
						) : (
							<button
								type="button"
								onClick={() => setShowConfirmSubmit(true)}
								className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 font-bold text-white hover:shadow-lg transition-all border-none cursor-pointer"
							>
								Odovzdať test
								<ArrowRight className="h-4 w-4" />
							</button>
						)}
					</div>
				</main>
			</div>
		);
	}

	// === RESULTS STAGE ===
	if (stage === "results" && results) {
		const getGrade = (pct: number) => {
			if (pct >= 90) return { label: "Výborný", color: "text-green-600", bg: "bg-green-50" };
			if (pct >= 75) return { label: "Chválitebný", color: "text-blue-600", bg: "bg-blue-50" };
			if (pct >= 50) return { label: "Dobrý", color: "text-yellow-600", bg: "bg-yellow-50" };
			if (pct >= 30) return { label: "Dostatočný", color: "text-orange-600", bg: "bg-orange-50" };
			return { label: "Nedostatočný", color: "text-red-600", bg: "bg-red-50" };
		};

		const grade = getGrade(results.percentage);
		const timeMinutes = Math.floor(results.timeUsed / 60);
		const timeSeconds = results.timeUsed % 60;

		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
				<main className="mx-auto max-w-2xl px-4 py-8">
					{/* Results header */}
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 sm:p-8 text-center mb-6">
						<div className="flex items-center justify-center mb-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100">
								<Trophy className="h-8 w-8 text-yellow-500" />
							</div>
						</div>

						<h1 className="text-2xl font-extrabold text-gray-800 mb-2">
							Test dokončený!
						</h1>

						{/* Score ring */}
						<div className="flex justify-center my-6">
							<ProgressRing
								percentage={results.percentage}
								size={120}
								color={
									results.percentage >= 75
										? "#22c55e"
										: results.percentage >= 50
											? "#eab308"
											: "#ef4444"
								}
								label={`${results.percentage}%`}
							/>
						</div>

						{/* Grade */}
						<div
							className={`inline-block rounded-full px-6 py-2 ${grade.bg} mb-4`}
						>
							<span
								className={`text-lg font-extrabold ${grade.color}`}
							>
								{grade.label}
							</span>
						</div>

						{/* Stats grid */}
						<div className="grid grid-cols-3 gap-4 mt-6">
							<div className="rounded-2xl bg-green-50 p-4">
								<p className="text-2xl font-extrabold text-green-600">
									{results.score}
								</p>
								<p className="text-xs text-green-500 font-medium">
									z {results.maxScore} správnych
								</p>
							</div>
							<div className="rounded-2xl bg-blue-50 p-4">
								<p className="text-2xl font-extrabold text-blue-600">
									{timeMinutes}:{String(timeSeconds).padStart(2, "0")}
								</p>
								<p className="text-xs text-blue-500 font-medium">
									čas
								</p>
							</div>
							<div className="rounded-2xl bg-purple-50 p-4">
								<p className="text-2xl font-extrabold text-purple-600">
									+50
								</p>
								<p className="text-xs text-purple-500 font-medium">
									XP bonus
								</p>
							</div>
						</div>
					</div>

					{/* Per-question review */}
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<h2 className="text-lg font-extrabold text-gray-800 mb-4">
							Prehľad odpovedí
						</h2>
						<div className="space-y-3">
							{questions.map((q, idx) => {
								const answer = answers[idx];
								const correct = answer?.correct ?? false;
								return (
									<div
										key={q.id}
										className={`flex items-start gap-3 rounded-xl p-3 ${
											correct
												? "bg-green-50"
												: "bg-red-50"
										}`}
									>
										<div
											className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
												correct
													? "bg-green-500"
													: "bg-red-500"
											}`}
										>
											{correct ? (
												<Check className="h-4 w-4 text-white" />
											) : (
												<XIcon className="h-4 w-4 text-white" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold text-gray-700 truncate">
												{idx + 1}. {q.question}
											</p>
											{!correct && (
												<p className="text-xs text-gray-500 mt-1">
													Správna odpoveď:{" "}
													<span className="font-bold text-green-600">
														{q.correctAnswer}
													</span>
												</p>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-3">
						<button
							type="button"
							onClick={() => {
								setStage("setup");
								setResults(null);
								setAnswers({});
								setCurrentIndex(0);
							}}
							className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
						>
							<RotateCcw className="h-5 w-5" />
							Nový test
						</button>
						<button
							type="button"
							onClick={() => navigate("/dashboard")}
							className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-6 py-4 font-bold text-gray-600 hover:bg-gray-200 transition-all border-none cursor-pointer"
						>
							Dashboard
						</button>
					</div>
				</main>
			</div>
		);
	}

	return null;
}
