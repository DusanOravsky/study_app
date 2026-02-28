import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	BookOpen,
	Calendar,
	CheckCircle2,
	ClipboardList,
	Copy,
	ArrowLeft,
	Flame,
	LogOut,
	Plus,
	Sparkles,
	Target,
	Trash2,
	Trophy,
	Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../firebase/auth";
import {
	getClassByTeacherEmail,
	getClassStudentStats,
	createAssignment,
	getAssignments,
	getAssignmentSubmissions,
	deleteAssignment,
} from "../firebase/classes";
import type {
	Assignment,
	AssignmentSubmission,
	ClassInfo,
	ClassStudentStats,
	Subject,
} from "../types";

type TeacherView = "class-detail" | "create-assignment";

const subjectLabels: Record<Subject, string> = {
	math: "Matematika",
	slovak: "Slovenčina",
	german: "Nemčina",
};

export default function TeacherDashboardPage() {
	const navigate = useNavigate();
	const { isAuthenticated, user } = useAuth();

	const [view, setView] = useState<TeacherView>("class-detail");
	const [myClass, setMyClass] = useState<ClassInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [noClass, setNoClass] = useState(false);

	// Class data
	const [students, setStudents] = useState<ClassStudentStats[]>([]);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission[]>>({});
	const [classLoading, setClassLoading] = useState(false);

	// Create assignment form
	const [assignTitle, setAssignTitle] = useState("");
	const [assignSubject, setAssignSubject] = useState<Subject>("math");
	const [assignTopic, setAssignTopic] = useState("");
	const [assignCount, setAssignCount] = useState(10);
	const [assignDifficulty, setAssignDifficulty] = useState<1 | 2 | 3>(2);
	const [assignDueDate, setAssignDueDate] = useState("");

	// Copied code toast
	const [copiedCode, setCopiedCode] = useState(false);

	// Load class by teacher email
	useEffect(() => {
		if (!isAuthenticated || !user?.email) return;
		let cancelled = false;
		(async () => {
			try {
				const cls = await getClassByTeacherEmail(user.email!);
				if (cancelled) return;
				if (cls) {
					setMyClass(cls);
					await loadClassData(cls);
				} else {
					setNoClass(true);
				}
			} catch (err) {
				console.error("Failed to load class:", err);
				setNoClass(true);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [isAuthenticated, user]);

	const loadClassData = async (cls: ClassInfo) => {
		setClassLoading(true);
		try {
			const [studentData, assignmentData] = await Promise.all([
				getClassStudentStats(cls.id),
				getAssignments(cls.id),
			]);
			setStudents(studentData);
			setAssignments(assignmentData);

			const subs: Record<string, AssignmentSubmission[]> = {};
			for (const a of assignmentData) {
				subs[a.id] = await getAssignmentSubmissions(cls.id, a.id);
			}
			setSubmissions(subs);
		} catch (err) {
			console.error("Failed to load class details:", err);
			setStudents([]);
			setAssignments([]);
		}
		setClassLoading(false);
	};

	const handleCreateAssignment = async () => {
		if (!myClass || !assignTitle.trim() || !assignDueDate) return;
		const assignment: Assignment = {
			id: `assign-${Date.now()}`,
			classId: myClass.id,
			title: assignTitle.trim(),
			subject: assignSubject,
			topic: assignTopic.trim() || "Všeobecné",
			questionCount: assignCount,
			difficulty: assignDifficulty,
			dueDate: assignDueDate,
			createdAt: new Date().toISOString(),
		};
		await createAssignment(assignment);
		setAssignments((prev) => [assignment, ...prev]);
		setAssignTitle("");
		setAssignTopic("");
		setAssignCount(10);
		setAssignDueDate("");
		setView("class-detail");
	};

	const handleDeleteAssignment = async (assignmentId: string) => {
		if (!myClass) return;
		await deleteAssignment(myClass.id, assignmentId);
		setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
	};

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 2000);
	};

	// Loading
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
				<p className="text-gray-400 animate-pulse">Načítavam...</p>
			</div>
		);
	}

	// No class assigned
	if (noClass || !myClass) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-8">
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-12 text-center">
						<Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
						<h2 className="text-lg font-extrabold text-gray-700 mb-2">
							Žiadna trieda
						</h2>
						<p className="text-sm text-gray-400 mb-6">
							Trieda ti bude priradená administrátorom školy.
							Kontaktuj svojho admina.
						</p>
						<button
							type="button"
							onClick={async () => {
								await signOut();
								navigate("/login");
							}}
							className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all border-none cursor-pointer"
						>
							<LogOut className="h-4 w-4" />
							Odhlásiť sa
						</button>
					</div>
				</main>
			</div>
		);
	}

	// Create assignment form
	if (view === "create-assignment") {
		return (
			<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-8">
					<button
						type="button"
						onClick={() => setView("class-detail")}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 bg-transparent border-none cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4" />
						Späť
					</button>

					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
						<h1 className="text-xl font-extrabold text-gray-800 mb-6">
							Nová úloha — {myClass.name}
						</h1>

						<div className="space-y-4">
							<div>
								<label className="text-sm font-bold text-gray-600 mb-1 block">
									Názov úlohy
								</label>
								<input
									type="text"
									value={assignTitle}
									onChange={(e) => setAssignTitle(e.target.value)}
									placeholder="napr. Zlomky - domáca úloha"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-bold text-gray-600 mb-1 block">
										Predmet
									</label>
									<select
										value={assignSubject}
										onChange={(e) => setAssignSubject(e.target.value as Subject)}
										className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
									>
										<option value="math">Matematika</option>
										<option value="slovak">Slovenčina</option>
										<option value="german">Nemčina</option>
									</select>
								</div>
								<div>
									<label className="text-sm font-bold text-gray-600 mb-1 block">
										Téma (voliteľná)
									</label>
									<input
										type="text"
										value={assignTopic}
										onChange={(e) => setAssignTopic(e.target.value)}
										placeholder="napr. Zlomky"
										className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
									/>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-4">
								<div>
									<label className="text-sm font-bold text-gray-600 mb-1 block">
										Počet otázok
									</label>
									<input
										type="number"
										min={5}
										max={50}
										value={assignCount}
										onChange={(e) => setAssignCount(Number(e.target.value))}
										className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm font-medium text-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-emerald-300"
									/>
								</div>
								<div>
									<label className="text-sm font-bold text-gray-600 mb-1 block">
										Obtiažnosť
									</label>
									<select
										value={assignDifficulty}
										onChange={(e) =>
											setAssignDifficulty(Number(e.target.value) as 1 | 2 | 3)
										}
										className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
									>
										<option value={1}>Ľahké</option>
										<option value={2}>Stredné</option>
										<option value={3}>Ťažké</option>
									</select>
								</div>
								<div>
									<label className="text-sm font-bold text-gray-600 mb-1 block">
										Termín
									</label>
									<input
										type="date"
										value={assignDueDate}
										onChange={(e) => setAssignDueDate(e.target.value)}
										className="w-full rounded-xl border border-gray-300 px-2 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
									/>
								</div>
							</div>

							<button
								type="button"
								onClick={handleCreateAssignment}
								disabled={!assignTitle.trim() || !assignDueDate}
								className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Zadať úlohu
							</button>
						</div>
					</div>
				</main>
			</div>
		);
	}

	// Class detail (default view)
	const today = new Date().toISOString().split("T")[0];

	return (
		<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
			<main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
							<BookOpen className="h-7 w-7 text-emerald-500" />
						</div>
						<div>
							<h1 className="text-2xl font-extrabold text-gray-800">
								{myClass.name}
							</h1>
							<p className="text-sm text-gray-400">
								{myClass.examType === "8-rocne"
									? "8-ročné"
									: myClass.examType === "bilingvalne"
										? "Bilingválne"
										: "4-ročné"}{" "}
								gymnázium · {user?.email}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={async () => {
							await signOut();
							navigate("/login");
						}}
						className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all border-none cursor-pointer"
						title="Odhlásiť sa"
					>
						<LogOut className="h-4 w-4" />
					</button>
				</div>

				{/* Class code */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
						<div className="flex-1">
							<p className="text-xs font-bold text-emerald-600">
								Kód triedy
							</p>
							<p className="text-2xl font-extrabold tracking-widest text-emerald-700">
								{myClass.code}
							</p>
						</div>
						<button
							type="button"
							onClick={() => handleCopyCode(myClass.code)}
							className="flex items-center gap-1 rounded-lg bg-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-300 transition-colors border-none cursor-pointer"
						>
							<Copy className="h-3.5 w-3.5" />
							{copiedCode ? "Skopírované!" : "Kopírovať"}
						</button>
					</div>
				</div>

				{classLoading ? (
					<div className="p-8 text-center text-gray-400 animate-pulse">
						Načítavam...
					</div>
				) : (
					<>
						{/* Students */}
						<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
							<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
								<Users className="h-5 w-5 text-emerald-500" />
								Žiaci ({students.length})
							</h2>

							{students.length === 0 ? (
								<div className="py-8 text-center">
									<Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
									<p className="text-sm text-gray-400">
										Zatiaľ žiadni žiaci. Zdieľaj kód triedy.
									</p>
								</div>
							) : (
								<div className="space-y-2">
									{students.map((s, idx) => (
										<div
											key={s.uid}
											className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
										>
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-600">
												{idx + 1}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-bold text-gray-700 truncate">
													{s.name}
												</p>
												<div className="flex items-center gap-3 text-xs text-gray-400">
													<span className="flex items-center gap-1">
														<Sparkles className="h-3 w-3" />
														{s.xp} XP
													</span>
													<span className="flex items-center gap-1">
														<Target className="h-3 w-3" />
														{s.accuracy}%
													</span>
													<span className="flex items-center gap-1">
														<Flame className="h-3 w-3" />
														{s.streak}
													</span>
												</div>
											</div>
											<div className="text-right">
												<p className="text-xs font-bold text-gray-500">
													{s.questionsAnswered} otázok
												</p>
												<p className="text-xs text-gray-400">
													Lv.{s.level}
												</p>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Assignments */}
						<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
									<ClipboardList className="h-5 w-5 text-blue-500" />
									Úlohy ({assignments.length})
								</h2>
								<button
									type="button"
									onClick={() => setView("create-assignment")}
									className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-200 transition-colors border-none cursor-pointer"
								>
									<Plus className="h-3.5 w-3.5" />
									Nová úloha
								</button>
							</div>

							{assignments.length === 0 ? (
								<div className="py-8 text-center">
									<ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-3" />
									<p className="text-sm text-gray-400">
										Zatiaľ žiadne úlohy
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{assignments.map((a) => {
										const subs = submissions[a.id] ?? [];
										const completed = subs.filter((s) => s.completed).length;
										const overdue = a.dueDate < today;

										return (
											<div
												key={a.id}
												className={`rounded-xl border p-4 ${
													overdue
														? "bg-red-50 border-red-200"
														: "bg-gray-50 border-gray-200"
												}`}
											>
												<div className="flex items-center justify-between mb-2">
													<div>
														<p className="text-sm font-bold text-gray-700">
															{a.title}
														</p>
														<p className="text-xs text-gray-400">
															{subjectLabels[a.subject]}
															{a.topic !== "Všeobecné" && ` · ${a.topic}`}
															{" · "}
															{a.questionCount} otázok
														</p>
													</div>
													<button
														type="button"
														onClick={() => handleDeleteAssignment(a.id)}
														className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-400 hover:bg-red-200 border-none cursor-pointer"
													>
														<Trash2 className="h-3.5 w-3.5" />
													</button>
												</div>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Calendar className="h-3.5 w-3.5 text-gray-400" />
														<span
															className={`text-xs font-medium ${overdue ? "text-red-500" : "text-gray-500"}`}
														>
															{new Date(a.dueDate).toLocaleDateString("sk-SK")}
															{overdue && " (po termíne)"}
														</span>
													</div>
													<div className="flex items-center gap-1">
														<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
														<span className="text-xs font-bold text-gray-500">
															{completed}/{students.length} splnilo
														</span>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>

						{/* Class stats summary */}
						{students.length > 0 && (
							<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
								<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
									<Trophy className="h-5 w-5 text-yellow-500" />
									Štatistiky triedy
								</h2>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									<div className="rounded-xl bg-purple-50 p-3 text-center">
										<p className="text-xl font-extrabold text-purple-600">
											{Math.round(
												students.reduce((s, st) => s + st.xp, 0) /
													students.length,
											)}
										</p>
										<p className="text-xs text-purple-400">Priem. XP</p>
									</div>
									<div className="rounded-xl bg-green-50 p-3 text-center">
										<p className="text-xl font-extrabold text-green-600">
											{Math.round(
												students.reduce((s, st) => s + st.accuracy, 0) /
													students.length,
											)}
											%
										</p>
										<p className="text-xs text-green-400">Priem. presnosť</p>
									</div>
									<div className="rounded-xl bg-blue-50 p-3 text-center">
										<p className="text-xl font-extrabold text-blue-600">
											{students.reduce(
												(s, st) => s + st.questionsAnswered,
												0,
											)}
										</p>
										<p className="text-xs text-blue-400">Celkom otázok</p>
									</div>
									<div className="rounded-xl bg-orange-50 p-3 text-center">
										<p className="text-xl font-extrabold text-orange-600">
											{Math.max(...students.map((s) => s.streak))}
										</p>
										<p className="text-xs text-orange-400">Najdlhšia séria</p>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</main>
		</div>
	);
}
