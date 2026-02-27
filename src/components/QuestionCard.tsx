import { useState } from "react";
import {
	Check,
	HelpCircle,
	Lightbulb,
	Star,
	X as XIcon,
} from "lucide-react";
import type { Question } from "../types";

interface QuestionCardProps {
	question: Question;
	onAnswer: (answer: string, correct: boolean) => void;
	showResult?: boolean;
}

const difficultyLabels: Record<number, { label: string; color: string }> = {
	1: { label: "Lahke", color: "bg-green-100 text-green-700" },
	2: { label: "Stredne", color: "bg-yellow-100 text-yellow-700" },
	3: { label: "Tazke", color: "bg-red-100 text-red-700" },
};

export default function QuestionCard({
	question,
	onAnswer,
	showResult = false,
}: QuestionCardProps) {
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [answered, setAnswered] = useState(false);
	const [showHint, setShowHint] = useState(false);

	const isCorrect = selectedAnswer === question.correctAnswer;
	const difficulty = difficultyLabels[question.difficulty] ?? difficultyLabels[1];

	const handleSelect = (option: string) => {
		if (answered) return;
		setSelectedAnswer(option);
		setAnswered(true);
		onAnswer(option, option === question.correctAnswer);
	};

	const getOptionStyle = (option: string) => {
		if (!answered) {
			return "bg-white border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md cursor-pointer";
		}

		if (option === question.correctAnswer) {
			return "bg-green-50 border-2 border-green-400 shadow-md shadow-green-100";
		}

		if (option === selectedAnswer && !isCorrect) {
			return "bg-red-50 border-2 border-red-400 shadow-md shadow-red-100";
		}

		return "bg-gray-50 border-2 border-gray-200 opacity-60";
	};

	const getOptionIcon = (option: string) => {
		if (!answered) return null;

		if (option === question.correctAnswer) {
			return <Check className="h-5 w-5 text-green-500" />;
		}

		if (option === selectedAnswer && !isCorrect) {
			return <XIcon className="h-5 w-5 text-red-500" />;
		}

		return null;
	};

	const optionLetters = ["A", "B", "C", "D", "E", "F"];

	return (
		<div className="rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden">
			{/* Header with topic & difficulty */}
			<div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<HelpCircle className="h-5 w-5 text-white/80" />
						<span className="text-sm font-medium text-white/90">
							{question.topic}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span
							className={`rounded-full px-3 py-0.5 text-xs font-bold ${difficulty.color}`}
						>
							{difficulty.label}
						</span>
						<div className="flex">
							{[1, 2, 3].map((s) => (
								<Star
									key={s}
									className={`h-4 w-4 ${
										s <= question.difficulty
											? "text-yellow-300 fill-yellow-300"
											: "text-white/30"
									}`}
								/>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Question text */}
			<div className="px-6 pt-6 pb-4">
				<h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-relaxed">
					{question.question}
				</h2>
			</div>

			{/* Hint button and content */}
			{question.hint && !answered && (
				<div className="px-6 pb-2">
					<button
						type="button"
						onClick={() => setShowHint(!showHint)}
						className="flex items-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700 hover:bg-yellow-100 transition-colors border border-yellow-200"
					>
						<Lightbulb className="h-4 w-4" />
						{showHint ? "Skryt napovedu" : "Zobrazit napovedu"}
					</button>
					{showHint && (
						<div className="mt-2 rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
							<div className="flex items-start gap-2">
								<Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
								<p>{question.hint}</p>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Answer options */}
			<div className="px-6 pb-4 space-y-3">
				{question.options?.map((option, index) => (
					<button
						key={option}
						type="button"
						onClick={() => handleSelect(option)}
						disabled={answered}
						className={`w-full flex items-center gap-3 rounded-xl p-4 text-left transition-all duration-200 ${getOptionStyle(option)}`}
					>
						{/* Letter badge */}
						<div
							className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
								answered && option === question.correctAnswer
									? "bg-green-500 text-white"
									: answered && option === selectedAnswer && !isCorrect
										? "bg-red-500 text-white"
										: "bg-purple-100 text-purple-600"
							}`}
						>
							{optionLetters[index]}
						</div>

						{/* Option text */}
						<span className="flex-1 text-sm sm:text-base font-medium text-gray-700">
							{option}
						</span>

						{/* Result icon */}
						{getOptionIcon(option)}
					</button>
				))}
			</div>

			{/* Result feedback */}
			{(answered || showResult) && selectedAnswer && (
				<div
					className={`mx-6 mb-4 rounded-2xl p-5 ${
						isCorrect
							? "bg-green-50 border border-green-200"
							: "bg-red-50 border border-red-200"
					}`}
				>
					<div className="flex items-center gap-2 mb-2">
						{isCorrect ? (
							<>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
									<Check className="h-5 w-5 text-white" />
								</div>
								<span className="text-lg font-bold text-green-700">
									Spravne! Vyborne!
								</span>
							</>
						) : (
							<>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
									<XIcon className="h-5 w-5 text-white" />
								</div>
								<span className="text-lg font-bold text-red-700">
									Nespravne
								</span>
							</>
						)}
					</div>

					{!isCorrect && (
						<p className="text-sm text-red-600 mb-2">
							Spravna odpoved:{" "}
							<span className="font-bold">{question.correctAnswer}</span>
						</p>
					)}

					{/* Explanation */}
					<div className="mt-3 rounded-xl bg-white/70 p-3">
						<p className="text-sm font-semibold text-gray-600 mb-1">
							Vysvetlenie:
						</p>
						<p className="text-sm text-gray-700 leading-relaxed">
							{question.explanation}
						</p>
					</div>
				</div>
			)}

			{/* Bottom padding */}
			<div className="h-2" />
		</div>
	);
}
