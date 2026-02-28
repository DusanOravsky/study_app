import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	GraduationCap,
	Users,
	BookOpen,
	Shield,
	ArrowRight,
	Sparkles,
	Link,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { isAdmin } from "../firebase/admin";
import { generateCode, linkChildToParent, lookupParentCode } from "../firebase/userRole";
import type { UserRole } from "../types";

interface RoleCard {
	role: UserRole;
	title: string;
	description: string;
	icon: typeof GraduationCap;
	gradient: string;
	iconBg: string;
}

const roles: RoleCard[] = [
	{
		role: "student",
		title: "Študent",
		description:
			"Priprav sa na prijímacie skúšky s pomocou AI mentora. Precvičuj matematiku a slovenčinu.",
		icon: GraduationCap,
		gradient: "from-purple-500 via-blue-500 to-cyan-400",
		iconBg: "bg-purple-100",
	},
	{
		role: "parent",
		title: "Rodič",
		description:
			"Sleduj pokrok svojho dieťaťa, štatistiky a výsledky testov.",
		icon: Users,
		gradient: "from-pink-500 via-rose-400 to-orange-400",
		iconBg: "bg-pink-100",
	},
	{
		role: "teacher",
		title: "Učiteľ",
		description:
			"Spravuj triedy, zadávaj úlohy a sleduj výsledky žiakov.",
		icon: BookOpen,
		gradient: "from-emerald-500 via-teal-400 to-cyan-400",
		iconBg: "bg-emerald-100",
	},
	{
		role: "admin",
		title: "Admin",
		description:
			"Spravuj školu, pridávaj učiteľov a žiakov do systému.",
		icon: Shield,
		gradient: "from-amber-500 via-yellow-400 to-orange-400",
		iconBg: "bg-amber-100",
	},
];

export default function RoleSelectPage() {
	const navigate = useNavigate();
	const { user, setRole } = useAuth();
	const [mounted, setMounted] = useState(false);
	const [showAdminCard, setShowAdminCard] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Parent linking state
	const [showParentLink, setShowParentLink] = useState(false);
	const [childCode, setChildCode] = useState("");
	const [linkError, setLinkError] = useState("");
	const [linkLoading, setLinkLoading] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 50);
		return () => clearTimeout(timer);
	}, []);

	// Check if user is admin-eligible
	useEffect(() => {
		if (!user?.email) return;
		isAdmin(user.email).then(setShowAdminCard).catch(() => {});
	}, [user?.email]);

	const handleRoleSelect = async (card: RoleCard) => {
		if (loading) return;
		setLoading(true);
		setError("");

		try {
			if (card.role === "student") {
				const parentCode = generateCode("R-");
				await setRole("student", { parentCode });
				navigate("/exam-type");
			} else if (card.role === "parent") {
				setShowParentLink(true);
				setLoading(false);
				return;
			} else if (card.role === "teacher") {
				await setRole("teacher");
				navigate("/teacher");
			} else if (card.role === "admin") {
				await setRole("admin");
				navigate("/admin");
			}
		} catch (err) {
			console.error("Failed to set role:", err);
			setError("Nepodarilo sa nastaviť rolu. Skús to znova.");
		} finally {
			setLoading(false);
		}
	};

	const handleParentLink = async () => {
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
			await setRole("parent");
			await linkChildToParent(user.uid, child.uid);
			navigate("/parent");
		} catch (err) {
			console.error("Failed to link child:", err);
			setLinkError("Niečo sa pokazilo. Skús to znova.");
		} finally {
			setLinkLoading(false);
		}
	};

	const handleSkipParentLink = async () => {
		setLinkLoading(true);
		try {
			await setRole("parent");
			navigate("/parent");
		} catch (err) {
			console.error("Failed to set parent role:", err);
		} finally {
			setLinkLoading(false);
		}
	};

	const visibleRoles = showAdminCard ? roles : roles.filter((r) => r.role !== "admin");

	// Parent child-linking inline panel
	if (showParentLink) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center px-4">
				<div className="w-full max-w-sm">
					<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 shadow-lg mx-auto mb-4">
							<Link className="h-8 w-8 text-white" />
						</div>
						<h1 className="text-xl font-extrabold text-gray-800 text-center mb-2">
							Prepojiť s dieťaťom
						</h1>
						<p className="text-sm text-gray-400 text-center mb-6">
							Zadaj kód dieťaťa (R-XXXX) z jeho profilu
						</p>

						<div className="space-y-4">
							<div>
								<label className="text-sm font-bold text-gray-600 mb-1 block">
									Kód dieťaťa
								</label>
								<input
									type="text"
									value={childCode}
									onChange={(e) => setChildCode(e.target.value.toUpperCase())}
									placeholder="R-XXXX"
									maxLength={6}
									className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-xl tracking-widest font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 uppercase"
									autoFocus
								/>
							</div>

							{linkError && (
								<div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-medium text-red-600">
									{linkError}
								</div>
							)}

							<button
								type="button"
								onClick={handleParentLink}
								disabled={linkLoading || childCode.trim().length < 3}
								className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{linkLoading ? "Prepájam..." : "Prepojiť"}
							</button>

							<button
								type="button"
								onClick={handleSkipParentLink}
								disabled={linkLoading}
								className="w-full text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
							>
								Preskočiť — prepojím neskôr
							</button>

							<button
								type="button"
								onClick={() => setShowParentLink(false)}
								className="w-full text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
							>
								Späť na výber role
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
			{/* Decorative background elements */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl" />
				<div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pink-200/20 blur-3xl" />
			</div>

			<div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
				{/* Logo and title */}
				<div
					className={`text-center mb-12 transition-all duration-700 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-8"
					}`}
				>
					<div className="flex items-center justify-center mb-6">
						<div className="relative">
							<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-2xl shadow-purple-300/50">
								<GraduationCap className="h-10 w-10 text-white" />
							</div>
							<div className="absolute -top-2 -right-2">
								<Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
							</div>
						</div>
					</div>
					<h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent mb-3">
						Vyber si rolu
					</h1>
					<p className="text-lg text-gray-500 font-medium max-w-md mx-auto">
						Prihlásený ako {user?.email}
					</p>
				</div>

				{/* Role cards */}
				<div className={`grid grid-cols-1 sm:grid-cols-2 ${visibleRoles.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6 max-w-5xl w-full`}>
					{visibleRoles.map((card, index) => (
						<button
							key={card.role}
							type="button"
							onClick={() => handleRoleSelect(card)}
							disabled={loading}
							className={`group relative rounded-3xl bg-white border-2 border-gray-100 p-6 text-left shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 disabled:opacity-50 ${
								mounted
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-12"
							}`}
							style={{
								transitionDelay: `${200 + index * 150}ms`,
							}}
						>
							{/* Gradient top strip */}
							<div
								className={`h-2 w-16 rounded-full bg-gradient-to-r ${card.gradient} mb-5 transition-all duration-300 group-hover:w-24`}
							/>

							{/* Icon */}
							<div
								className={`flex h-16 w-16 items-center justify-center rounded-2xl ${card.iconBg} mb-4 transition-transform duration-300 group-hover:scale-110`}
							>
								<card.icon
									className={`h-8 w-8 ${
										card.role === "student"
											? "text-purple-600"
											: card.role === "parent"
												? "text-pink-600"
												: card.role === "admin"
													? "text-amber-600"
													: "text-emerald-600"
									}`}
								/>
							</div>

							{/* Text */}
							<h2 className="text-xl font-extrabold text-gray-800 mb-2">
								{card.title}
							</h2>
							<p className="text-sm text-gray-500 leading-relaxed mb-4">
								{card.description}
							</p>

							{/* CTA */}
							<div
								className={`flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all duration-300 ${
									card.role === "parent"
										? "text-pink-600"
										: card.role === "teacher"
											? "text-emerald-600"
											: card.role === "admin"
												? "text-amber-600"
												: "text-purple-600"
								}`}
							>
								<span>Vybrať</span>
								<ArrowRight className="h-4 w-4" />
							</div>
						</button>
					))}
				</div>

				{/* Error */}
				{error && (
					<div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-medium text-red-600 max-w-md">
						{error}
					</div>
				)}

				{/* Footer */}
				<div
					className={`mt-12 text-center transition-all duration-700 delay-700 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-4"
					}`}
				>
					<p className="text-sm text-gray-400">
						Pripravený na prijímacie skúšky 2026
					</p>
				</div>
			</div>
		</div>
	);
}
