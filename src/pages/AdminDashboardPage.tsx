import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	BookOpen,
	Building2,
	LogIn,
	LogOut,
	MapPin,
	Plus,
	Shield,
	Trash2,
	UserCheck,
	Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../firebase/auth";
import {
	isAdmin,
	createSchool,
	getAdminSchool,
	addTeacherToSchool,
	removeTeacherFromSchool,
	getSchoolTeachers,
	addStudentToSchool,
	removeStudentFromSchool,
	getSchoolStudents,
} from "../firebase/admin";
import type { ExamType, SchoolInfo, SchoolStudent, SchoolTeacher } from "../types";

type AdminView = "dashboard" | "create-school";
type ActiveTab = "teachers" | "students";

export default function AdminDashboardPage() {
	const navigate = useNavigate();
	const { isAuthenticated, user } = useAuth();

	const [view, setView] = useState<AdminView>("dashboard");
	const [school, setSchool] = useState<SchoolInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [authorized, setAuthorized] = useState<boolean | null>(null);
	const [activeTab, setActiveTab] = useState<ActiveTab>("teachers");

	// School data
	const [teachers, setTeachers] = useState<SchoolTeacher[]>([]);
	const [students, setStudents] = useState<SchoolStudent[]>([]);

	// Create school form
	const [schoolName, setSchoolName] = useState("");
	const [schoolCity, setSchoolCity] = useState("");

	// Add teacher form
	const [teacherName, setTeacherName] = useState("");
	const [teacherEmail, setTeacherEmail] = useState("");

	// Add student form
	const [studentName, setStudentName] = useState("");
	const [studentEmail, setStudentEmail] = useState("");
	const [studentExamType, setStudentExamType] = useState<ExamType>("8-rocne");

	// Check whitelist + load school on auth
	useEffect(() => {
		if (!isAuthenticated || !user) return;
		let cancelled = false;
		(async () => {
			try {
				const allowed = await isAdmin(user.email ?? "");
				if (cancelled) return;
				setAuthorized(allowed);
				if (!allowed) {
					setLoading(false);
					return;
				}
				const s = await getAdminSchool(user.uid);
				if (cancelled) return;
				if (s) {
					setSchool(s);
					const [t, st] = await Promise.all([
						getSchoolTeachers(s.id),
						getSchoolStudents(s.id),
					]);
					if (!cancelled) {
						setTeachers(t);
						setStudents(st);
					}
				}
			} catch (err) {
				console.error("Failed to load school:", err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [isAuthenticated, user]);

	const handleCreateSchool = async () => {
		if (!user || !schoolName.trim() || !schoolCity.trim()) return;
		const s = await createSchool(
			user.uid,
			user.email ?? "",
			schoolName.trim(),
			schoolCity.trim(),
		);
		setSchool(s);
		setSchoolName("");
		setSchoolCity("");
		setView("dashboard");
	};

	const handleAddTeacher = async () => {
		if (!school || !teacherName.trim() || !teacherEmail.trim()) return;
		const t = await addTeacherToSchool(school.id, teacherName.trim(), teacherEmail.trim());
		setTeachers((prev) => [t, ...prev]);
		setTeacherName("");
		setTeacherEmail("");
	};

	const handleRemoveTeacher = async (uid: string) => {
		if (!school) return;
		await removeTeacherFromSchool(school.id, uid);
		setTeachers((prev) => prev.filter((t) => t.uid !== uid));
	};

	const handleAddStudent = async () => {
		if (!school || !studentName.trim() || !studentEmail.trim()) return;
		const s = await addStudentToSchool(
			school.id,
			studentName.trim(),
			studentEmail.trim(),
			studentExamType,
		);
		setStudents((prev) => [s, ...prev]);
		setStudentName("");
		setStudentEmail("");
	};

	const handleRemoveStudent = async (uid: string) => {
		if (!school) return;
		await removeStudentFromSchool(school.id, uid);
		setStudents((prev) => prev.filter((s) => s.uid !== uid));
	};

	// Not authenticated
	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-12 text-center">
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 mx-auto mb-6">
							<Shield className="h-10 w-10 text-amber-500" />
						</div>
						<h1 className="text-2xl font-extrabold text-gray-800 mb-2">
							Admin panel
						</h1>
						<p className="text-gray-500 mb-6">
							Prihlásiť sa pre správu školy, učiteľov a žiakov
						</p>
						<button
							type="button"
							onClick={() => navigate("/login", { state: { redirectTo: "/admin" } })}
							className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer mx-auto"
						>
							<LogIn className="h-5 w-5" />
							Prihlásiť sa
						</button>
					</div>
				</main>
			</div>
		);
	}

	// Loading
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
				<p className="text-gray-400 animate-pulse">Načítavam...</p>
			</div>
		);
	}

	// Not authorized
	if (authorized === false) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-12 text-center">
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 mx-auto mb-6">
							<Shield className="h-10 w-10 text-red-400" />
						</div>
						<h1 className="text-2xl font-extrabold text-gray-800 mb-2">
							Prístup zamietnutý
						</h1>
						<p className="text-gray-500 mb-2">
							Nemáš oprávnenie na admin panel.
						</p>
						<p className="text-sm text-gray-400 mb-6">
							Prihlásený ako: {user?.email}
						</p>
						<button
							type="button"
							onClick={() => navigate("/")}
							className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-6 py-4 font-bold text-gray-600 hover:bg-gray-200 transition-all border-none cursor-pointer mx-auto"
						>
							<ArrowLeft className="h-5 w-5" />
							Späť na úvod
						</button>
					</div>
				</main>
			</div>
		);
	}

	// Create school form
	if (!school || view === "create-school") {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-8">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 bg-transparent border-none cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4" />
						Späť
					</button>

					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 mb-4">
							<Building2 className="h-7 w-7 text-amber-500" />
						</div>
						<h1 className="text-xl font-extrabold text-gray-800 mb-1">
							Vytvoriť školu
						</h1>
						<p className="text-sm text-gray-400 mb-6">
							Zadaj údaje o škole, ktorú budeš spravovať
						</p>

						<div className="space-y-4">
							<div>
								<label className="text-sm font-bold text-gray-600 mb-1 block">
									Názov školy
								</label>
								<input
									type="text"
									value={schoolName}
									onChange={(e) => setSchoolName(e.target.value)}
									placeholder="napr. ZŠ Kukučínova"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
								/>
							</div>

							<div>
								<label className="text-sm font-bold text-gray-600 mb-1 block">
									Mesto
								</label>
								<input
									type="text"
									value={schoolCity}
									onChange={(e) => setSchoolCity(e.target.value)}
									placeholder="napr. Bratislava"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
								/>
							</div>

							<button
								type="button"
								onClick={handleCreateSchool}
								disabled={!schoolName.trim() || !schoolCity.trim()}
								className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Vytvoriť školu
							</button>
						</div>
					</div>
				</main>
			</div>
		);
	}

	// School dashboard
	return (
		<div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
			<main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
				<button
					type="button"
					onClick={() => navigate("/")}
					className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 bg-transparent border-none cursor-pointer"
				>
					<ArrowLeft className="h-4 w-4" />
					Späť
				</button>

				{/* School header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100">
							<Building2 className="h-7 w-7 text-amber-500" />
						</div>
						<div>
							<h1 className="text-2xl font-extrabold text-gray-800">
								{school.name}
							</h1>
							<p className="text-sm text-gray-400 flex items-center gap-1">
								<MapPin className="h-3.5 w-3.5" />
								{school.city} · {user?.email}
							</p>
						</div>
					</div>
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

				{/* Stats bar */}
				<div className="grid grid-cols-2 gap-3 mb-6">
					<div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-4 text-center">
						<p className="text-2xl font-extrabold text-amber-600">
							{teachers.length}
						</p>
						<p className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1">
							<BookOpen className="h-3.5 w-3.5" />
							Učiteľov
						</p>
					</div>
					<div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-4 text-center">
						<p className="text-2xl font-extrabold text-amber-600">
							{students.length}
						</p>
						<p className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1">
							<Users className="h-3.5 w-3.5" />
							Žiakov
						</p>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex rounded-xl bg-gray-100 p-1 mb-6">
					<button
						type="button"
						onClick={() => setActiveTab("teachers")}
						className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all border-none cursor-pointer ${
							activeTab === "teachers"
								? "bg-white text-gray-800 shadow-sm"
								: "bg-transparent text-gray-400 hover:text-gray-600"
						}`}
					>
						<BookOpen className="h-4 w-4" />
						Učitelia
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("students")}
						className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all border-none cursor-pointer ${
							activeTab === "students"
								? "bg-white text-gray-800 shadow-sm"
								: "bg-transparent text-gray-400 hover:text-gray-600"
						}`}
					>
						<Users className="h-4 w-4" />
						Žiaci
					</button>
				</div>

				{/* Teachers tab */}
				{activeTab === "teachers" && (
					<div className="space-y-4">
						{/* Add teacher form */}
						<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
							<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
								<Plus className="h-5 w-5 text-amber-500" />
								Pridať učiteľa
							</h2>
							<div className="space-y-3">
								<input
									type="text"
									value={teacherName}
									onChange={(e) => setTeacherName(e.target.value)}
									placeholder="Meno učiteľa"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
								/>
								<input
									type="email"
									value={teacherEmail}
									onChange={(e) => setTeacherEmail(e.target.value)}
									placeholder="E-mail učiteľa"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
								/>
								<button
									type="button"
									onClick={handleAddTeacher}
									disabled={!teacherName.trim() || !teacherEmail.trim()}
									className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Pridať učiteľa
								</button>
							</div>
						</div>

						{/* Teachers list */}
						<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
							<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
								<UserCheck className="h-5 w-5 text-amber-500" />
								Učitelia ({teachers.length})
							</h2>

							{teachers.length === 0 ? (
								<div className="py-8 text-center">
									<BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
									<p className="text-sm text-gray-400">
										Zatiaľ žiadni učitelia
									</p>
								</div>
							) : (
								<div className="space-y-2">
									{teachers.map((t) => (
										<div
											key={t.uid}
											className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
										>
											<div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
												<BookOpen className="h-4 w-4 text-amber-600" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-bold text-gray-700 truncate">
													{t.name}
												</p>
												<p className="text-xs text-gray-400 truncate">
													{t.email}
												</p>
											</div>
											<button
												type="button"
												onClick={() => handleRemoveTeacher(t.uid)}
												className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors border-none cursor-pointer"
												title="Odstrániť"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}

				{/* Students tab */}
				{activeTab === "students" && (
					<div className="space-y-4">
						{/* Add student form */}
						<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
							<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
								<Plus className="h-5 w-5 text-amber-500" />
								Pridať žiaka
							</h2>
							<div className="space-y-3">
								<input
									type="text"
									value={studentName}
									onChange={(e) => setStudentName(e.target.value)}
									placeholder="Meno žiaka"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
								/>
								<input
									type="email"
									value={studentEmail}
									onChange={(e) => setStudentEmail(e.target.value)}
									placeholder="E-mail žiaka"
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
								/>
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
													onClick={() => setStudentExamType(et)}
													className={`rounded-xl p-3 text-xs font-bold text-center transition-all border-2 cursor-pointer ${
														studentExamType === et
															? "border-amber-400 bg-amber-50 text-amber-700"
															: "border-gray-200 text-gray-500 hover:border-amber-200"
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
									onClick={handleAddStudent}
									disabled={!studentName.trim() || !studentEmail.trim()}
									className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Pridať žiaka
								</button>
							</div>
						</div>

						{/* Students list */}
						<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
							<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
								<Users className="h-5 w-5 text-amber-500" />
								Žiaci ({students.length})
							</h2>

							{students.length === 0 ? (
								<div className="py-8 text-center">
									<Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
									<p className="text-sm text-gray-400">
										Zatiaľ žiadni žiaci
									</p>
								</div>
							) : (
								<div className="space-y-2">
									{students.map((s) => (
										<div
											key={s.uid}
											className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
										>
											<div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
												<Users className="h-4 w-4 text-amber-600" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-bold text-gray-700 truncate">
													{s.name}
												</p>
												<p className="text-xs text-gray-400 truncate">
													{s.email} ·{" "}
													{s.examType === "8-rocne"
														? "8-ročné"
														: s.examType === "bilingvalne"
															? "Bilingválne"
															: "4-ročné"}
												</p>
											</div>
											<button
												type="button"
												onClick={() => handleRemoveStudent(s.uid)}
												className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors border-none cursor-pointer"
												title="Odstrániť"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
