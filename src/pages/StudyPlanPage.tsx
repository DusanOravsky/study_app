import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	ArrowRight,
	Calendar,
	CheckCircle2,
	PartyPopper,
	Play,
	RotateCcw,
	Target,
	Trophy,
} from "lucide-react";
import type { ExamType, Subject } from "../types";
import { getUserSettings } from "../utils/progress";
import { getSubjectProgress } from "../utils/progress";
import {
	createStudyPlan,
	deleteStudyPlan,
	getStudyPlan,
	getStudyPlanDays,
} from "../utils/studyPlan";

export default function StudyPlanPage() {
	const navigate = useNavigate();
	const settings = getUserSettings();
	const [plan, setPlan] = useState(getStudyPlan());
	const [days, setDays] = useState(getStudyPlanDays());

	const subjects: Subject[] =
		settings.examType === "bilingvalne"
			? ["math", "slovak", "german"]
			: ["math", "slovak"];

	const handleCreatePlan = () => {
		// Gather topic mastery from all subjects
		const mastery: Record<string, number> = {};
		for (const s of subjects) {
			const progress = getSubjectProgress(s);
			for (const [topic, score] of Object.entries(progress.topicMastery)) {
				mastery[topic] = score;
			}
		}

		const newPlan = createStudyPlan(settings.examType, subjects, mastery);
		setPlan(newPlan);
		setDays(getStudyPlanDays());
	};

	const handleDeletePlan = () => {
		deleteStudyPlan();
		setPlan(null);
		setDays([]);
	};

	const today = new Date().toISOString().split("T")[0];

	// No plan: wizard screen
	if (!plan) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-8">
					<button
						type="button"
						onClick={() => navigate("/dashboard")}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors bg-transparent border-none cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4" />
						Dashboard
					</button>

					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8 text-center">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mx-auto mb-6">
							<Calendar className="h-10 w-10 text-purple-500" />
						</div>

						<h1 className="text-2xl font-extrabold text-gray-800 mb-2">
							60-dňový študijný plán
						</h1>
						<p className="text-gray-500 mb-6">
							Priprav sa na prijímačky systematicky. Plán sa prispôsobí tvojim
							slabým stránkam.
						</p>

						<div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 mb-6 text-left space-y-3">
							<div className="flex items-center gap-3">
								<Target className="h-4 w-4 text-purple-500 shrink-0" />
								<span className="text-sm text-gray-600">
									Typ skúšky:{" "}
									<strong>
										{examTypeLabel(settings.examType)}
									</strong>
								</span>
							</div>
							<div className="flex items-center gap-3">
								<Calendar className="h-4 w-4 text-purple-500 shrink-0" />
								<span className="text-sm text-gray-600">
									60 dní od dnes
								</span>
							</div>
							<div className="flex items-center gap-3">
								<CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0" />
								<span className="text-sm text-gray-600">
									Predmety: {subjects.map(subjectLabel).join(", ")}
								</span>
							</div>
						</div>

						<button
							type="button"
							onClick={handleCreatePlan}
							className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 font-bold text-white shadow-lg shadow-purple-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all border-none cursor-pointer"
						>
							Začať 60-dňový plán
							<ArrowRight className="h-5 w-5" />
						</button>
					</div>
				</main>
			</div>
		);
	}

	// Plan complete
	if (plan.completedDays >= plan.totalDays) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-12 text-center">
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 mx-auto mb-6">
							<PartyPopper className="h-10 w-10 text-yellow-500" />
						</div>
						<h1 className="text-2xl font-extrabold text-gray-800 mb-2">
							Plán dokončený!
						</h1>
						<p className="text-gray-500 mb-6">
							Gratulujeme! Zvládol si celý 60-dňový plán. Si pripravený na
							prijímačky!
						</p>
						<div className="grid grid-cols-2 gap-4 mb-6">
							<div className="rounded-2xl bg-green-50 p-4">
								<p className="text-2xl font-extrabold text-green-600">
									{plan.completedDays}
								</p>
								<p className="text-xs text-green-500 font-medium">
									dní splnených
								</p>
							</div>
							<div className="rounded-2xl bg-purple-50 p-4">
								<p className="text-2xl font-extrabold text-purple-600">
									100%
								</p>
								<p className="text-xs text-purple-500 font-medium">
									dokončený
								</p>
							</div>
						</div>
						<div className="flex flex-col gap-3">
							<button
								type="button"
								onClick={handleDeletePlan}
								className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 font-bold text-white shadow-lg transition-all border-none cursor-pointer"
							>
								<RotateCcw className="h-5 w-5" />
								Nový plán
							</button>
							<button
								type="button"
								onClick={() => navigate("/dashboard")}
								className="rounded-2xl bg-gray-100 px-6 py-4 font-bold text-gray-600 hover:bg-gray-200 transition-all border-none cursor-pointer"
							>
								Dashboard
							</button>
						</div>
					</div>
				</main>
			</div>
		);
	}

	// Active plan: calendar view
	const todayDay = days.find((d) => d.date === today);
	const completionPct = Math.round((plan.completedDays / plan.totalDays) * 100);

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			<main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
				<button
					type="button"
					onClick={() => navigate("/dashboard")}
					className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors bg-transparent border-none cursor-pointer"
				>
					<ArrowLeft className="h-4 w-4" />
					Dashboard
				</button>

				{/* Header */}
				<div className="flex items-center gap-3 mb-6">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100">
						<Calendar className="h-7 w-7 text-purple-500" />
					</div>
					<div>
						<h1 className="text-2xl font-extrabold text-gray-800">
							Študijný plán
						</h1>
						<p className="text-sm text-gray-400">
							{plan.completedDays}/{plan.totalDays} dní
							&middot; {completionPct}%
						</p>
					</div>
				</div>

				{/* Today's card */}
				{todayDay && !todayDay.completed && (
					<div className="rounded-3xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-xl p-6 mb-6 text-white">
						<div className="flex items-center gap-2 mb-3">
							<Target className="h-5 w-5" />
							<h2 className="text-lg font-extrabold">
								Dnešný cieľ (Deň {todayDay.dayNumber})
							</h2>
						</div>
						<div className="space-y-2 mb-4">
							{todayDay.targets.map((target, i) => (
								<div
									key={`target-${target.subject}-${target.topic}-${i}`}
									className="flex items-center justify-between rounded-xl bg-white/15 px-4 py-2"
								>
									<span className="text-sm font-medium">
										{subjectLabel(target.subject)} - {target.topic}
									</span>
									<span className="text-xs font-bold bg-white/20 rounded-full px-2 py-0.5">
										{target.questionCount}q
									</span>
								</div>
							))}
						</div>
						<button
							type="button"
							onClick={() =>
								navigate("/learning", {
									state: {
										subject: todayDay.targets[0]?.subject ?? "math",
										planDay: todayDay.dayNumber,
									},
								})
							}
							className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-purple-600 shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
						>
							<Play className="h-5 w-5" />
							Splniť dnešný cieľ
						</button>
					</div>
				)}

				{todayDay?.completed && (
					<div className="rounded-3xl bg-green-50 border-2 border-green-200 shadow-lg p-6 mb-6 text-center">
						<Trophy className="h-10 w-10 text-green-500 mx-auto mb-2" />
						<p className="text-lg font-extrabold text-green-700">
							Dnešný cieľ splnený!
						</p>
						<p className="text-sm text-green-600">
							Výborne, oddýchni si alebo precvičuj ďalej.
						</p>
					</div>
				)}

				{/* Progress bar */}
				<div className="rounded-2xl bg-white shadow-md border border-gray-100 p-4 mb-6">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-bold text-gray-600">
							Progres
						</span>
						<span className="text-sm font-extrabold text-purple-600">
							{completionPct}%
						</span>
					</div>
					<div className="h-3 rounded-full bg-gray-200 overflow-hidden">
						<div
							className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
							style={{ width: `${completionPct}%` }}
						/>
					</div>
				</div>

				{/* Calendar grid */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-4 sm:p-6">
					<h2 className="text-base font-extrabold text-gray-800 mb-4">
						Kalendár (60 dní)
					</h2>

					{/* Day labels */}
					<div className="grid grid-cols-7 gap-1 mb-2">
						{["Po", "Ut", "St", "Št", "Pi", "So", "Ne"].map((d) => (
							<div
								key={d}
								className="text-center text-xs font-bold text-gray-400"
							>
								{d}
							</div>
						))}
					</div>

					{/* Day cells */}
					<div className="grid grid-cols-7 gap-1">
						{days.map((day) => {
							const isToday = day.date === today;
							const isMissed =
								!day.completed && day.date < today;
							const isDone = day.completed;

							let bg = "bg-gray-100 text-gray-400";
							if (isDone)
								bg = "bg-green-400 text-white";
							else if (isToday)
								bg = "bg-purple-500 text-white ring-2 ring-purple-300";
							else if (isMissed) bg = "bg-red-200 text-red-700";

							return (
								<div
									key={day.dayNumber}
									className={`flex items-center justify-center h-9 sm:h-10 rounded-lg text-xs font-bold ${bg} transition-colors`}
									title={`Deň ${day.dayNumber} - ${day.date}`}
								>
									{day.dayNumber}
								</div>
							);
						})}
					</div>
				</div>

				{/* Delete plan */}
				<div className="mt-6 text-center">
					<button
						type="button"
						onClick={handleDeletePlan}
						className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
					>
						Zrušiť plán
					</button>
				</div>
			</main>
		</div>
	);
}

function examTypeLabel(et: ExamType): string {
	if (et === "8-rocne") return "8-ročné gymnázium";
	if (et === "bilingvalne") return "Bilingválne gymnázium";
	return "4-ročné gymnázium";
}

function subjectLabel(s: Subject): string {
	if (s === "math") return "Matematika";
	if (s === "german") return "Nemčina";
	return "Slovenčina";
}
