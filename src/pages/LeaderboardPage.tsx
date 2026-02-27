import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Flame, LogIn, Medal, Trophy } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getLeaderboard } from "../firebase/leaderboard";
import { getUserSettings } from "../utils/progress";
import type { ExamType, LeaderboardEntry, LeaderboardPeriod } from "../types";

const examTypes: { value: ExamType; label: string }[] = [
	{ value: "8-rocne", label: "8-ročné" },
	{ value: "4-rocne", label: "4-ročné" },
	{ value: "bilingvalne", label: "Bilingválne" },
];

const periods: { value: LeaderboardPeriod; label: string }[] = [
	{ value: "weekly", label: "Týždeň" },
	{ value: "monthly", label: "Mesiac" },
	{ value: "allTime", label: "Celkovo" },
];

export default function LeaderboardPage() {
	const navigate = useNavigate();
	const { isAuthenticated, user } = useAuth();
	const settings = getUserSettings();

	const [examType, setExamType] = useState<ExamType>(settings.examType);
	const [period, setPeriod] = useState<LeaderboardPeriod>("allTime");
	const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(isAuthenticated);

	useEffect(() => {
		if (!isAuthenticated) return;
		let cancelled = false;
		getLeaderboard(examType, period)
			.then((data) => {
				if (!cancelled) setEntries(data);
			})
			.catch(() => {
				if (!cancelled) setEntries([]);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [isAuthenticated, examType, period]);

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-12 text-center">
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 mx-auto mb-6">
							<Trophy className="h-10 w-10 text-yellow-500" />
						</div>
						<h1 className="text-2xl font-extrabold text-gray-800 mb-2">
							Rebríček
						</h1>
						<p className="text-gray-500 mb-6">
							Prihlásiť sa pre zobrazenie rebríčka
						</p>
						<button
							type="button"
							onClick={() => navigate("/login")}
							className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer mx-auto"
						>
							<LogIn className="h-5 w-5" />
							Prihlásiť sa
						</button>
					</div>
				</main>
			</div>
		);
	}

	const getRankIcon = (rank: number) => {
		if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
		if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
		if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
		return (
			<span className="text-sm font-bold text-gray-400">#{rank}</span>
		);
	};

	const getRankBg = (rank: number, isCurrentUser: boolean) => {
		if (isCurrentUser) return "bg-purple-50 border-purple-200";
		if (rank === 1) return "bg-yellow-50 border-yellow-200";
		if (rank === 2) return "bg-gray-50 border-gray-200";
		if (rank === 3) return "bg-amber-50 border-amber-200";
		return "bg-white border-gray-100";
	};

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
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100">
						<Trophy className="h-7 w-7 text-yellow-500" />
					</div>
					<div>
						<h1 className="text-2xl font-extrabold text-gray-800">
							Rebríček
						</h1>
						<p className="text-sm text-gray-400">
							Porovnaj sa s ostatnými študentmi
						</p>
					</div>
				</div>

				{/* Exam type filter */}
				<div className="flex gap-2 mb-4 overflow-x-auto pb-1">
					{examTypes.map((et) => (
						<button
							key={et.value}
							type="button"
							onClick={() => setExamType(et.value)}
							className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all border-none cursor-pointer ${
								examType === et.value
									? "bg-purple-500 text-white shadow-md"
									: "bg-gray-100 text-gray-500 hover:bg-gray-200"
							}`}
						>
							{et.label}
						</button>
					))}
				</div>

				{/* Period filter */}
				<div className="flex gap-2 mb-6 overflow-x-auto pb-1">
					{periods.map((p) => (
						<button
							key={p.value}
							type="button"
							onClick={() => setPeriod(p.value)}
							className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all border-none cursor-pointer ${
								period === p.value
									? "bg-blue-500 text-white shadow-md"
									: "bg-gray-100 text-gray-500 hover:bg-gray-200"
							}`}
						>
							{p.label}
						</button>
					))}
				</div>

				{/* Leaderboard list */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden">
					{loading ? (
						<div className="p-8 space-y-4">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={`skeleton-${i}`}
									className="flex items-center gap-4 animate-pulse"
								>
									<div className="h-10 w-10 rounded-full bg-gray-200" />
									<div className="flex-1">
										<div className="h-4 w-32 rounded bg-gray-200 mb-2" />
										<div className="h-3 w-20 rounded bg-gray-100" />
									</div>
									<div className="h-6 w-16 rounded bg-gray-200" />
								</div>
							))}
						</div>
					) : entries.length === 0 ? (
						<div className="p-12 text-center">
							<Trophy className="h-12 w-12 text-gray-200 mx-auto mb-4" />
							<p className="text-gray-400 font-medium">
								Zatiaľ žiadni účastníci
							</p>
							<p className="text-sm text-gray-300 mt-1">
								Buď prvý v rebríčku!
							</p>
						</div>
					) : (
						<div className="divide-y divide-gray-100">
							{entries.map((entry, idx) => {
								const rank = idx + 1;
								const isCurrentUser = entry.uid === user?.uid;
								return (
									<div
										key={entry.uid}
										className={`flex items-center gap-4 p-4 border-l-4 transition-colors ${getRankBg(rank, isCurrentUser)}`}
									>
										<div className="flex h-10 w-10 items-center justify-center">
											{getRankIcon(rank)}
										</div>
										<div className="flex-1 min-w-0">
											<p className={`text-sm font-bold truncate ${isCurrentUser ? "text-purple-700" : "text-gray-700"}`}>
												{entry.name}
												{isCurrentUser && (
													<span className="text-xs font-medium text-purple-400 ml-2">
														(ty)
													</span>
												)}
											</p>
											<p className="text-xs text-gray-400">
												Level {entry.level}
											</p>
										</div>
										<div className="flex items-center gap-3">
											{entry.streak > 0 && (
												<div className="flex items-center gap-1">
													<Flame className="h-4 w-4 text-orange-500" />
													<span className="text-xs font-bold text-orange-600">
														{entry.streak}
													</span>
												</div>
											)}
											<div className="rounded-full bg-purple-100 px-3 py-1">
												<span className="text-sm font-extrabold text-purple-600">
													{entry.xp} XP
												</span>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
