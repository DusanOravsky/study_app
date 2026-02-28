import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	BookOpen,
	Building2,
	Copy,
	LogOut,
	MapPin,
	Plus,
	Trash2,
	UserCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../firebase/auth";
import {
	createSchool,
	getAdminSchool,
	deleteSchool,
	addTeacherWithClass,
	removeTeacherFromSchool,
	getSchoolTeachers,
} from "../firebase/admin";
import type { SchoolInfo, SchoolTeacher } from "../types";

type AdminView = "dashboard" | "create-school";

export default function AdminDashboardPage() {
	const navigate = useNavigate();
	const { isAuthenticated, user } = useAuth();

	const [view, setView] = useState<AdminView>("dashboard");
	const [school, setSchool] = useState<SchoolInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [copiedCode, setCopiedCode] = useState<string | null>(null);

	// School data
	const [teachers, setTeachers] = useState<SchoolTeacher[]>([]);

	// Create school form
	const [schoolName, setSchoolName] = useState("");
	const [schoolCity, setSchoolCity] = useState("");

	// Add teacher form
	const [teacherName, setTeacherName] = useState("");
	const [teacherEmail, setTeacherEmail] = useState("");
	const [teacherClassName, setTeacherClassName] = useState("");
	const [teacherGrade, setTeacherGrade] = useState<"5" | "9" | "bilingvalne">("5");

	// Load school data
	useEffect(() => {
		if (!isAuthenticated || !user) return;
		let cancelled = false;
		(async () => {
			try {
				const s = await getAdminSchool(user.uid);
				if (cancelled) return;
				if (s) {
					setSchool(s);
					const t = await getSchoolTeachers(s.id);
					if (!cancelled) {
						setTeachers(t);
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

	const handleDeleteSchool = async () => {
		if (!school) return;
		await deleteSchool(school.id);
		setSchool(null);
		setTeachers([]);
	};

	const handleAddTeacher = async () => {
		if (!school || !teacherName.trim() || !teacherEmail.trim() || !teacherClassName.trim()) return;
		const t = await addTeacherWithClass(
			school.id,
			teacherName.trim(),
			teacherEmail.trim(),
			teacherClassName.trim(),
			teacherGrade,
		);
		setTeachers((prev) => [t, ...prev]);
		setTeacherName("");
		setTeacherEmail("");
		setTeacherClassName("");
		setTeacherGrade("5");
	};

	const handleRemoveTeacher = async (uid: string, classId: string) => {
		if (!school) return;
		await removeTeacherFromSchool(school.id, uid, classId);
		setTeachers((prev) => prev.filter((t) => t.uid !== uid));
	};

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		setCopiedCode(code);
		setTimeout(() => setCopiedCode(null), 2000);
	};

	// Loading
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
				<p className="text-gray-400 animate-pulse">Načítavam...</p>
			</div>
		);
	}

	// Create school form
	if (!school || view === "create-school") {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
				<main className="mx-auto max-w-lg px-4 py-8">
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
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={handleDeleteSchool}
							className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-400 hover:bg-red-100 hover:text-red-600 transition-all border-none cursor-pointer"
							title="Zmazať školu"
						>
							<Trash2 className="h-4 w-4" />
						</button>
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
				</div>

				{/* Stats bar */}
				<div className="mb-6">
					<div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-4 text-center">
						<p className="text-2xl font-extrabold text-amber-600">
							{teachers.length}
						</p>
						<p className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1">
							<BookOpen className="h-3.5 w-3.5" />
							Učiteľov
						</p>
					</div>
				</div>

				{/* Teachers */}
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
							<input
								type="text"
								value={teacherClassName}
								onChange={(e) => setTeacherClassName(e.target.value)}
								placeholder="Názov triedy (napr. 5.A)"
								className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
							/>
							<div>
								<label className="text-sm font-bold text-gray-600 mb-2 block">
									Ročník
								</label>
								<div className="grid grid-cols-3 gap-2">
									<button
										type="button"
										onClick={() => setTeacherGrade("5")}
										className={`rounded-xl p-3 text-xs font-bold text-center transition-all border-2 cursor-pointer ${
											teacherGrade === "5"
												? "border-amber-400 bg-amber-50 text-amber-700"
												: "border-gray-200 text-gray-500 hover:border-amber-200"
										}`}
									>
										5. ročník (8-ročné)
									</button>
									<button
										type="button"
										onClick={() => setTeacherGrade("9")}
										className={`rounded-xl p-3 text-xs font-bold text-center transition-all border-2 cursor-pointer ${
											teacherGrade === "9"
												? "border-amber-400 bg-amber-50 text-amber-700"
												: "border-gray-200 text-gray-500 hover:border-amber-200"
										}`}
									>
										9. ročník (4-ročné)
									</button>
									<button
										type="button"
										onClick={() => setTeacherGrade("bilingvalne")}
										className={`rounded-xl p-3 text-xs font-bold text-center transition-all border-2 cursor-pointer ${
											teacherGrade === "bilingvalne"
												? "border-amber-400 bg-amber-50 text-amber-700"
												: "border-gray-200 text-gray-500 hover:border-amber-200"
										}`}
									>
										9. ročník (bilingválne)
									</button>
								</div>
							</div>
							<button
								type="button"
								onClick={handleAddTeacher}
								disabled={!teacherName.trim() || !teacherEmail.trim() || !teacherClassName.trim()}
								className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Pridať učiteľa s triedou
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
												{t.email}
											</p>
											<p className="text-xs text-gray-400 truncate">
												{t.className}
											</p>
										</div>
										<button
											type="button"
											onClick={() => handleCopyCode(t.classCode)}
											className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors border-none cursor-pointer"
											title="Kopírovať kód triedy"
										>
											<Copy className="h-3 w-3" />
											{copiedCode === t.classCode ? "OK!" : t.classCode}
										</button>
										<button
											type="button"
											onClick={() => handleRemoveTeacher(t.uid, t.classId)}
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
			</main>
		</div>
	);
}
