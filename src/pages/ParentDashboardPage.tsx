import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Award,
	BarChart3,
	BookOpen,
	CheckCircle2,
	Flame,
	Link,
	LogOut,
	Plus,
	Sparkles,
	Star,
	Target,
	User,
	Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../firebase/auth";
import {
	getChildData,
	getLinkedChildren,
	linkChildToParent,
	lookupParentCode,
} from "../firebase/userRole";

interface ChildInfo {
	uid: string;
	displayName: string;
	xp: number;
	level: number;
	streak: number;
	longestStreak: number;
	questionsAnswered: number;
	accuracy: number;
	examType: string;
}

export default function ParentDashboardPage() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const [children, setChildren] = useState<ChildInfo[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedChild, setSelectedChild] = useState<ChildInfo | null>(null);

	// Link child form
	const [showLinkForm, setShowLinkForm] = useState(false);
	const [childCode, setChildCode] = useState("");
	const [linkError, setLinkError] = useState("");
	const [linkLoading, setLinkLoading] = useState(false);

	useEffect(() => {
		if (!user) return;
		let cancelled = false;
		(async () => {
			try {
				const childUids = await getLinkedChildren(user.uid);
				const childInfos: ChildInfo[] = [];
				for (const uid of childUids) {
					const data = await getChildData(uid);
					if (data) {
						const gamification = (data.gamification as Record<string, unknown>) ?? {};
						const questionHistory = (data["question-history"] as unknown[]) ?? [];
						const correct = Array.isArray(questionHistory)
							? questionHistory.filter((q: unknown) => (q as Record<string, unknown>).correct).length
							: 0;
						childInfos.push({
							uid,
							displayName: (data.displayName as string) ?? "Študent",
							xp: (gamification.xp as number) ?? 0,
							level: (gamification.level as number) ?? 1,
							streak: (gamification.streak as number) ?? 0,
							longestStreak: (gamification.longestStreak as number) ?? 0,
							questionsAnswered: questionHistory.length,
							accuracy: questionHistory.length > 0
								? Math.round((correct / questionHistory.length) * 100)
								: 0,
							examType: (data.examType as string) ?? "8-rocne",
						});
					}
				}
				if (!cancelled) {
					setChildren(childInfos);
					if (childInfos.length > 0) setSelectedChild(childInfos[0]);
				}
			} catch (err) {
				console.error("Failed to load children:", err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [user]);

	const handleLinkChild = async () => {
		if (!user || !childCode.trim()) return;
		setLinkError("");
		setLinkLoading(true);
		try {
			const child = await lookupParentCode(childCode.trim().toUpperCase());
			if (!child) {
				setLinkError("Kód nebol nájdený. Skontroluj ho a skús znova.");
				setLinkLoading(false);
				return;
			}
			// Check if already linked
			if (children.some((c) => c.uid === child.uid)) {
				setLinkError("Toto dieťa je už prepojené.");
				setLinkLoading(false);
				return;
			}
			await linkChildToParent(user.uid, child.uid);
			// Refresh child data
			const data = await getChildData(child.uid);
			if (data) {
				const gamification = (data.gamification as Record<string, unknown>) ?? {};
				const questionHistory = (data["question-history"] as unknown[]) ?? [];
				const correct = Array.isArray(questionHistory)
					? questionHistory.filter((q: unknown) => (q as Record<string, unknown>).correct).length
					: 0;
				const newChild: ChildInfo = {
					uid: child.uid,
					displayName: child.displayName || "Študent",
					xp: (gamification.xp as number) ?? 0,
					level: (gamification.level as number) ?? 1,
					streak: (gamification.streak as number) ?? 0,
					longestStreak: (gamification.longestStreak as number) ?? 0,
					questionsAnswered: questionHistory.length,
					accuracy: questionHistory.length > 0
						? Math.round((correct / questionHistory.length) * 100)
						: 0,
					examType: (data.examType as string) ?? "8-rocne",
				};
				setChildren((prev) => [...prev, newChild]);
				setSelectedChild(newChild);
			}
			setChildCode("");
			setShowLinkForm(false);
		} catch (err) {
			console.error("Failed to link child:", err);
			setLinkError("Niečo sa pokazilo. Skús to znova.");
		} finally {
			setLinkLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
				<p className="text-gray-400 animate-pulse">Načítavam...</p>
			</div>
		);
	}

	// No children linked — show link form
	if (children.length === 0 && !showLinkForm) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-12">
					<div className="flex items-center justify-between mb-6">
						<span className="text-xs font-bold text-pink-400 bg-pink-100 rounded-full px-3 py-1">
							Rodič
						</span>
						<button
							type="button"
							onClick={async () => {
								await signOut();
								navigate("/login");
							}}
							className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 transition-all border-none cursor-pointer"
						>
							<LogOut className="h-4 w-4" />
						</button>
					</div>

					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8 text-center">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-100 mx-auto mb-6">
							<Users className="h-10 w-10 text-pink-500" />
						</div>
						<h1 className="text-2xl font-extrabold text-gray-800 mb-2">
							Žiadne prepojené deti
						</h1>
						<p className="text-gray-500 mb-6">
							Zadaj kód dieťaťa (R-XXXX) z jeho profilu pre sledovanie pokroku
						</p>
						<button
							type="button"
							onClick={() => setShowLinkForm(true)}
							className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
						>
							<Link className="h-5 w-5" />
							Prepojiť dieťa
						</button>
					</div>
				</main>
			</div>
		);
	}

	// Link child form
	if (showLinkForm) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
				<div className="w-full max-w-sm">
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 shadow-lg mx-auto mb-4">
							<Link className="h-8 w-8 text-white" />
						</div>
						<h1 className="text-xl font-extrabold text-gray-800 text-center mb-2">
							Prepojiť dieťa
						</h1>
						<p className="text-sm text-gray-400 text-center mb-6">
							Zadaj kód dieťaťa (R-XXXX) z jeho profilu
						</p>

						<div className="space-y-4">
							<input
								type="text"
								value={childCode}
								onChange={(e) => setChildCode(e.target.value.toUpperCase())}
								placeholder="R-XXXX"
								maxLength={6}
								className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-xl tracking-widest font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 uppercase"
								autoFocus
							/>

							{linkError && (
								<div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-medium text-red-600">
									{linkError}
								</div>
							)}

							<button
								type="button"
								onClick={handleLinkChild}
								disabled={linkLoading || childCode.trim().length < 3}
								className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{linkLoading ? "Prepájam..." : "Prepojiť"}
							</button>

							<button
								type="button"
								onClick={() => {
									setShowLinkForm(false);
									setLinkError("");
									setChildCode("");
								}}
								className="w-full text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
							>
								Zrušiť
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const child = selectedChild ?? children[0];

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
			<main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
				<div className="flex items-center justify-between mb-6">
					<span className="text-xs font-bold text-pink-400 bg-pink-100 rounded-full px-3 py-1">
						Rodič
					</span>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setShowLinkForm(true)}
							className="flex items-center gap-1 rounded-xl bg-pink-100 px-3 py-2 text-xs font-bold text-pink-600 hover:bg-pink-200 transition-colors border-none cursor-pointer"
						>
							<Plus className="h-3.5 w-3.5" />
							Pridať dieťa
						</button>
						<button
							type="button"
							onClick={async () => {
								await signOut();
								navigate("/login");
							}}
							className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 transition-all border-none cursor-pointer"
						>
							<LogOut className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* Child selector (if multiple) */}
				{children.length > 1 && (
					<div className="flex gap-2 mb-4 overflow-x-auto pb-2">
						{children.map((c) => (
							<button
								key={c.uid}
								type="button"
								onClick={() => setSelectedChild(c)}
								className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-all border-2 cursor-pointer ${
									selectedChild?.uid === c.uid
										? "border-pink-400 bg-pink-50 text-pink-700"
										: "border-gray-200 text-gray-500 hover:border-pink-200"
								}`}
							>
								{c.displayName}
							</button>
						))}
					</div>
				)}

				{/* Child profile card */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<div className="flex items-center gap-4 mb-4">
						<div className="relative">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
								<User className="h-8 w-8 text-white" />
							</div>
							<div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-xs font-extrabold text-white shadow-md border-2 border-white">
								{child.level}
							</div>
						</div>
						<div>
							<h1 className="text-xl font-extrabold text-gray-800">
								{child.displayName}
							</h1>
							<p className="text-sm text-gray-400">
								{child.examType === "8-rocne"
									? "8-ročné gymnázium"
									: child.examType === "bilingvalne"
										? "Bilingválne gymnázium"
										: "4-ročné gymnázium"}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-4 gap-3">
						<div className="rounded-xl bg-purple-50 p-3 text-center">
							<Sparkles className="h-4 w-4 text-purple-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-purple-600">
								{child.xp}
							</p>
							<p className="text-xs text-purple-400">XP</p>
						</div>
						<div className="rounded-xl bg-yellow-50 p-3 text-center">
							<Star className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-yellow-600">
								{child.level}
							</p>
							<p className="text-xs text-yellow-400">Level</p>
						</div>
						<div className="rounded-xl bg-orange-50 p-3 text-center">
							<Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-orange-600">
								{child.streak}
							</p>
							<p className="text-xs text-orange-400">Séria</p>
						</div>
						<div className="rounded-xl bg-green-50 p-3 text-center">
							<CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mb-1" />
							<p className="text-lg font-extrabold text-green-600">
								{child.accuracy}%
							</p>
							<p className="text-xs text-green-400">Presnosť</p>
						</div>
					</div>
				</div>

				{/* Overall stats */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
						<BookOpen className="h-5 w-5 text-green-500" />
						Celkové štatistiky
					</h2>
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-xl bg-blue-50 p-4 text-center">
							<Target className="h-5 w-5 text-blue-500 mx-auto mb-1" />
							<p className="text-2xl font-extrabold text-blue-600">
								{child.questionsAnswered}
							</p>
							<p className="text-xs text-blue-400">Celkom otázok</p>
						</div>
						<div className="rounded-xl bg-green-50 p-4 text-center">
							<CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
							<p className="text-2xl font-extrabold text-green-600">
								{child.accuracy}%
							</p>
							<p className="text-xs text-green-400">Presnosť</p>
						</div>
						<div className="rounded-xl bg-purple-50 p-4 text-center">
							<BarChart3 className="h-5 w-5 text-purple-500 mx-auto mb-1" />
							<p className="text-2xl font-extrabold text-purple-600">
								{child.xp}
							</p>
							<p className="text-xs text-purple-400">Celkom XP</p>
						</div>
						<div className="rounded-xl bg-orange-50 p-4 text-center">
							<Award className="h-5 w-5 text-orange-500 mx-auto mb-1" />
							<p className="text-2xl font-extrabold text-orange-600">
								{child.longestStreak}
							</p>
							<p className="text-xs text-orange-400">Najdlhšia séria</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
