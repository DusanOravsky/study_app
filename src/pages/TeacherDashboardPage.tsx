import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	BookOpen,
	Calendar,
	CheckCircle2,
	ClipboardList,
	Copy,
	Flame,
	LogIn,
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
	createClass,
	getTeacherClasses,
	getClassStudentStats,
	createAssignment,
	getAssignments,
	getAssignmentSubmissions,
	deleteAssignment,
	deleteClass,
} from "../firebase/classes";
import type {
	Assignment,
	AssignmentSubmission,
	ClassInfo,
	ClassStudentStats,
	ExamType,
	Subject,
} from "../types";

type TeacherView = "classes" | "class-detail" | "create-class" | "create-assignment";

const subjectLabels: Record<Subject, string> = {
	math: "Matematika",
	slovak: "Slovenčina",
	german: "Nemčina",
};

export default function TeacherDashboardPage() {
	const navigate = useNavigate();
	const { isAuthenticated, user } = useAuth();

	const [view, setView] = useState<TeacherView>("classes");
	const [classes, setClasses] = useState<ClassInfo[]>([]);
	const [loading, setLoading] = useState(true);

	// Selected class state
	const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
	const [students, setStudents] = useState<ClassStudentStats[]>([]);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission[]>>({});
	const [classLoading, setClassLoading] = useState(false);

	// Create class form
	const [newClassName, setNewClassName] = useState("");
	const [newClassExamType, setNewClassExamType] = useState<ExamType>("8-rocne");

	// Create assignment form
	const [assignTitle, setAssignTitle] = useState("");
	const [assignSubject, setAssignSubject] = useState<Subject>("math");
	const [assignTopic, setAssignTopic] = useState("");
	const [assignCount, setAssignCount] = useState(10);
	const [assignDifficulty, setAssignDifficulty] = useState<1 | 2 | 3>(2);
	const [assignDueDate, setAssignDueDate] = useState("");

	// Copied code toast
	const [copiedCode, setCopiedCode] = useState(false);

	useEffect(() => {
		if (!isAuthenticated || !user) return;
		let cancelled = false;
		getTeacherClasses(user.uid)
			.then((data) => {
				if (!cancelled) setClasses(data);
			})
			.catch((err) => {
				console.error("Failed to load classes:", err);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [isAuthenticated, user]);

	const handleOpenClass = async (cls: ClassInfo) => {
		setSelectedClass(cls);
		setView("class-detail");
		setClassLoading(true);
		try {
			const [studentData, assignmentData] = await Promise.all([
				getClassStudentStats(cls.id),
				getAssignments(cls.id),
			]);
			setStudents(studentData);
			setAssignments(assignmentData);

			// Load submissions for each assignment
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

	const handleCreateClass = async () => {
		if (!user || !newClassName.trim()) return;
		const cls = await createClass(
			user.uid,
			user.displayName ?? user.email ?? "Učiteľ",
			newClassName.trim(),
			newClassExamType,
		);
		setClasses((prev) => [cls, ...prev]);
		setNewClassName("");
		setView("classes");
	};

	const handleDeleteClass = async (classId: string) => {
		await deleteClass(classId);
		setClasses((prev) => prev.filter((c) => c.id !== classId));
		if (selectedClass?.id === classId) {
			setSelectedClass(null);
			setView("classes");
		}
	};

	const handleCreateAssignment = async () => {
		if (!selectedClass || !assignTitle.trim() || !assignDueDate) return;
		const assignment: Assignment = {
			id: `assign-${Date.now()}`,
			classId: selectedClass.id,
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
		if (!selectedClass) return;
		await deleteAssignment(selectedClass.id, assignmentId);
		setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
	};

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 2000);
	};

	// Not authenticated
	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-12 text-center">
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mx-auto mb-6">
							<BookOpen className="h-10 w-10 text-emerald-500" />
						</div>
						<h1 className="text-2xl font-extrabold text-gray-800 mb-2">
							Učiteľský panel
						</h1>
						<p className="text-gray-500 mb-6">
							Prihlásiť sa pre správu tried a zadávanie úloh
						</p>
						<button
							type="button"
							onClick={() => navigate("/login", { state: { redirectTo: "/teacher" } })}
							className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer mx-auto"
						>
							<LogIn className="h-5 w-5" />
							Prihlásiť sa
						</button>
					</div>
				</main>
			</div>
		);
	}

	// Create class form
	if (view === "create-class") {
		return (
			<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-8">
					<button
						type="button"
						onClick={() => setView("classes")}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 bg-transparent border-none cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4" />
						Späť
					</button>

					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
						<h1 className="text-xl font-extrabold text-gray-800 mb-6">
							Nová trieda
						</h1>

						<div className="space-y-4">
							<div>
								<label className="text-sm font-bold text-gray-600 mb-1 block">
									Názov triedy
								</label>
								<input
									type="text"
									value={newClassName}
									onChange={(e) => setNewClassName(e.target.value)}
									placeholder="napr. 5.A Matematika"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
								/>
							</div>

							<div>
								<label className="text-sm font-bold text-gray-600 mb-1 block">
									Typ skúšky
								</label>
								<div className="grid grid-cols-3 gap-2">
									{(["8-rocne", "4-rocne", "bilingvalne"] as ExamType[]).map(
										(et) => (
											<button
												key={et}
												type="button"
												onClick={() => setNewClassExamType(et)}
												className={`rounded-xl p-3 text-xs font-bold text-center transition-all border-2 cursor-pointer ${
													newClassExamType === et
														? "border-emerald-400 bg-emerald-50 text-emerald-700"
														: "border-gray-200 text-gray-500 hover:border-emerald-200"
												}`}
											>
												{et === "8-rocne"
													? "8-ročné"
													: et === "bilingvalne"
														? "Bilingválne"
														: "4-ročné"}
											</button>
										),
									)}
								</div>
							</div>

							<button
								type="button"
								onClick={handleCreateClass}
								disabled={!newClassName.trim()}
								className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Vytvoriť triedu
							</button>
						</div>
					</div>
				</main>
			</div>
		);
	}

	// Create assignment form
	if (view === "create-assignment" && selectedClass) {
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
							Nová úloha — {selectedClass.name}
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

	// Class detail
	if (view === "class-detail" && selectedClass) {
		const today = new Date().toISOString().split("T")[0];

		return (
			<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
				<main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
					<button
						type="button"
						onClick={() => {
							setView("classes");
							setSelectedClass(null);
						}}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 bg-transparent border-none cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4" />
						Moje triedy
					</button>

					{/* Class header */}
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h1 className="text-xl font-extrabold text-gray-800">
									{selectedClass.name}
								</h1>
								<p className="text-sm text-gray-400">
									{selectedClass.examType === "8-rocne"
										? "8-ročné"
										: selectedClass.examType === "bilingvalne"
											? "Bilingválne"
											: "4-ročné"}{" "}
									gymnázium
								</p>
							</div>
							<button
								type="button"
								onClick={() => handleDeleteClass(selectedClass.id)}
								className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors border-none cursor-pointer"
								title="Vymazať triedu"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						</div>

						{/* Class code */}
						<div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
							<div className="flex-1">
								<p className="text-xs font-bold text-emerald-600">
									Kód triedy
								</p>
								<p className="text-2xl font-extrabold tracking-widest text-emerald-700">
									{selectedClass.code}
								</p>
							</div>
							<button
								type="button"
								onClick={() => handleCopyCode(selectedClass.code)}
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

	// Classes list (default view)
	return (
		<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
			<main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
				<button
					type="button"
					onClick={() => navigate("/")}
					className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 bg-transparent border-none cursor-pointer"
				>
					<ArrowLeft className="h-4 w-4" />
					Späť
				</button>

				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
							<BookOpen className="h-7 w-7 text-emerald-500" />
						</div>
						<div>
							<h1 className="text-2xl font-extrabold text-gray-800">
								Moje triedy
							</h1>
							<p className="text-sm text-gray-400">
								{user?.email}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setView("create-class")}
							className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
						>
							<Plus className="h-4 w-4" />
							Nová trieda
						</button>
						<button
							type="button"
							onClick={async () => {
								await signOut();
								navigate("/");
							}}
							className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all border-none cursor-pointer"
							title="Odhlásiť sa"
						>
							<LogOut className="h-4 w-4" />
						</button>
					</div>
				</div>

				{loading ? (
					<div className="p-12 text-center text-gray-400 animate-pulse">
						Načítavam triedy...
					</div>
				) : classes.length === 0 ? (
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-12 text-center">
						<Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
						<h2 className="text-lg font-extrabold text-gray-700 mb-2">
							Zatiaľ žiadne triedy
						</h2>
						<p className="text-sm text-gray-400 mb-6">
							Vytvor triedu a zdieľaj kód so žiakmi
						</p>
						<button
							type="button"
							onClick={() => setView("create-class")}
							className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer"
						>
							<Plus className="h-5 w-5" />
							Vytvoriť triedu
						</button>
					</div>
				) : (
					<div className="space-y-4">
						{classes.map((cls) => (
							<button
								key={cls.id}
								type="button"
								onClick={() => handleOpenClass(cls)}
								className="w-full rounded-2xl bg-white shadow-lg border border-gray-100 p-5 text-left hover:shadow-xl hover:-translate-y-0.5 transition-all border-none cursor-pointer"
							>
								<div className="flex items-center justify-between mb-2">
									<h3 className="text-base font-extrabold text-gray-800">
										{cls.name}
									</h3>
									<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
										{cls.code}
									</span>
								</div>
								<p className="text-xs text-gray-400">
									{cls.examType === "8-rocne"
										? "8-ročné"
										: cls.examType === "bilingvalne"
											? "Bilingválne"
											: "4-ročné"}{" "}
									gymnázium · Vytvorené{" "}
									{new Date(cls.createdAt).toLocaleDateString("sk-SK")}
								</p>
							</button>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
