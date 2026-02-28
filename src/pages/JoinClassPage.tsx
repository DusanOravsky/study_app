import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, CheckCircle2, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getClassByCode, joinClass, getStudentClasses, leaveClass } from "../firebase/classes";
import { lookupSchoolCode, addStudentToSchool } from "../firebase/admin";
import { getUserSettings } from "../utils/progress";
import type { ClassInfo, SchoolInfo } from "../types";

export default function JoinClassPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const settings = getUserSettings();

	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const [myClasses, setMyClasses] = useState<ClassInfo[]>([]);
	const [mySchool, setMySchool] = useState<SchoolInfo | null>(null);

	useEffect(() => {
		if (!user) return;
		let cancelled = false;
		getStudentClasses(user.uid)
			.then((data) => {
				if (!cancelled) setMyClasses(data);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [user]);

	const handleJoin = async () => {
		if (!user || code.length < 3) return;
		setError("");
		setSuccess("");
		setLoading(true);

		const upperCode = code.toUpperCase();

		try {
			// School code (S-XXXX)
			if (upperCode.startsWith("S-")) {
				const school = await lookupSchoolCode(upperCode);
				if (!school) {
					setError("Škola s týmto kódom neexistuje");
					setLoading(false);
					return;
				}
				await addStudentToSchool(
					school.id,
					settings.name || user.displayName || "Študent",
					user.email ?? "",
					settings.examType,
				);
				setSuccess(`Pripojený k škole: ${school.name}`);
				setMySchool(school);
				setCode("");
				setLoading(false);
				return;
			}

			// Class code (T-XXXX or legacy 6-char)
			const classInfo = await getClassByCode(upperCode);
			if (!classInfo) {
				setError("Trieda ani škola s týmto kódom neexistuje");
				setLoading(false);
				return;
			}

			await joinClass(classInfo.id, {
				uid: user.uid,
				name: settings.name || user.displayName || "Študent",
				examType: settings.examType,
				joinedAt: new Date().toISOString(),
			});

			setSuccess(`Pripojený k triede: ${classInfo.name}`);
			setCode("");
			setMyClasses((prev) => [...prev, classInfo]);
		} catch {
			setError("Nepodarilo sa pripojiť");
		}
		setLoading(false);
	};

	const handleLeave = async (classId: string) => {
		if (!user) return;
		await leaveClass(classId, user.uid);
		setMyClasses((prev) => prev.filter((c) => c.id !== classId));
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			<main className="mx-auto max-w-lg px-4 py-8">
				<button
					type="button"
					onClick={() => navigate("/dashboard")}
					className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 bg-transparent border-none cursor-pointer"
				>
					<ArrowLeft className="h-4 w-4" />
					Dashboard
				</button>

				{/* Join with code */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
					<h1 className="text-xl font-extrabold text-gray-800 mb-2">
						Pripojiť sa
					</h1>
					<p className="text-sm text-gray-400 mb-4">
						Zadaj kód triedy (T-XXXX) alebo školy (S-XXXX)
					</p>

					<div className="flex gap-3">
						<input
							type="text"
							value={code}
							onChange={(e) => setCode(e.target.value.toUpperCase())}
							maxLength={6}
							placeholder="T-XXXX"
							className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-center text-xl tracking-widest font-bold text-gray-700 uppercase focus:outline-none focus:ring-2 focus:ring-purple-300"
						/>
						<button
							type="button"
							onClick={handleJoin}
							disabled={loading || code.length < 3}
							className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "..." : "Pripojiť"}
						</button>
					</div>

					{error && (
						<p className="mt-3 text-sm font-medium text-red-500">
							{error}
						</p>
					)}
					{success && (
						<div className="mt-3 flex items-center gap-2 text-sm font-medium text-green-600">
							<CheckCircle2 className="h-4 w-4" />
							{success}
						</div>
					)}
				</div>

				{/* My school */}
				{mySchool && (
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 mb-6">
						<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-3">
							<Building2 className="h-5 w-5 text-amber-500" />
							Moja škola
						</h2>
						<div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
							<p className="text-sm font-bold text-gray-700">{mySchool.name}</p>
							<p className="text-xs text-gray-400">{mySchool.city}</p>
						</div>
					</div>
				)}

				{/* My classes */}
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6">
					<h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-4">
						<Users className="h-5 w-5 text-purple-500" />
						Moje triedy ({myClasses.length})
					</h2>

					{myClasses.length === 0 ? (
						<p className="text-sm text-gray-400 py-4 text-center">
							Nie si v žiadnej triede
						</p>
					) : (
						<div className="space-y-3">
							{myClasses.map((cls) => (
								<div
									key={cls.id}
									className="flex items-center gap-3 rounded-xl bg-gray-50 p-4"
								>
									<div className="flex-1">
										<p className="text-sm font-bold text-gray-700">
											{cls.name}
										</p>
										<p className="text-xs text-gray-400">
											Učiteľ: {cls.teacherName} · {cls.code}
										</p>
									</div>
									<button
										type="button"
										onClick={() => handleLeave(cls.id)}
										className="text-xs font-medium text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer"
									>
										Opustiť
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
