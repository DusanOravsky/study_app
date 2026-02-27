import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	GraduationCap,
	Users,
	BookOpen,
	Shield,
	ArrowRight,
	Sparkles,
} from "lucide-react";
import type { UserRole } from "../types";

interface RoleCard {
	role: UserRole;
	title: string;
	description: string;
	icon: typeof GraduationCap;
	gradient: string;
	iconBg: string;
	available: boolean;
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
		available: true,
	},
	{
		role: "parent",
		title: "Rodič",
		description:
			"Sleduj pokrok svojho dieťaťa, štatistiky a výsledky testov.",
		icon: Users,
		gradient: "from-pink-500 via-rose-400 to-orange-400",
		iconBg: "bg-pink-100",
		available: true,
	},
	{
		role: "teacher",
		title: "Učiteľ",
		description:
			"Spravuj triedy, zadávaj úlohy a sleduj výsledky žiakov.",
		icon: BookOpen,
		gradient: "from-emerald-500 via-teal-400 to-cyan-400",
		iconBg: "bg-emerald-100",
		available: true,
	},
	{
		role: "admin",
		title: "Admin",
		description:
			"Spravuj školu, pridávaj učiteľov a žiakov do systému.",
		icon: Shield,
		gradient: "from-amber-500 via-yellow-400 to-orange-400",
		iconBg: "bg-amber-100",
		available: true,
	},
];

export default function RoleSelectionPage() {
	const navigate = useNavigate();
	const [mounted, setMounted] = useState(false);
	const [toast, setToast] = useState<string | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 50);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	const handleRoleSelect = (card: RoleCard) => {
		if (!card.available) {
			setToast("Čoskoro! Táto funkcia bude dostupná v budúcnosti.");
			return;
		}
		if (card.role === "parent") {
			navigate("/parent");
		} else if (card.role === "teacher") {
			navigate("/teacher");
		} else if (card.role === "admin") {
			navigate("/admin");
		} else {
			navigate("/exam-type");
		}
	};

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
						AI Mentor
					</h1>
					<p className="text-lg text-gray-500 font-medium max-w-md mx-auto">
						Tvoj osobný pomocník na prípravu na prijímacie skúšky na
						gymnázium
					</p>
				</div>

				{/* Role cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full">
					{roles.map((card, index) => (
						<button
							key={card.role}
							type="button"
							onClick={() => handleRoleSelect(card)}
							className={`group relative rounded-3xl bg-white border-2 border-gray-100 p-6 text-left shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
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
							<div className={`flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all duration-300 ${
								card.role === "parent"
									? "text-pink-600"
									: card.role === "teacher"
										? "text-emerald-600"
										: card.role === "admin"
											? "text-amber-600"
											: "text-purple-600"
							}`}>
								<span>Začať</span>
								<ArrowRight className="h-4 w-4" />
							</div>
						</button>
					))}
				</div>

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

			{/* Toast notification */}
			{toast && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-gray-800 px-6 py-3 text-sm font-medium text-white shadow-xl animate-bounce">
					{toast}
				</div>
			)}
		</div>
	);
}
