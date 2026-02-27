import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	Calculator,
	GraduationCap,
	Languages,
	Sparkles,
	Users,
} from "lucide-react";
import type { ExamType } from "../types";
import { getUserSettings, saveUserSettings } from "../utils/progress";

interface ExamCard {
	type: ExamType;
	title: string;
	subtitle: string;
	grade: string;
	age: string;
	subjects: string[];
	description: string;
	gradient: string;
	iconBg: string;
	borderHover: string;
}

const examCards: ExamCard[] = [
	{
		type: "8-rocne",
		title: "8-ročné gymnázium",
		subtitle: "Pre žiakov 5. ročníka ZŠ",
		grade: "5. ročník",
		age: "10 - 11 rokov",
		subjects: ["Matematika (zlomky, geometria)", "Slovenský jazyk (vybrané slová, gramatika)"],
		description:
			"Prijímacie skúšky pre nadaných žiakov základných škôl. Test obsahuje základy matematiky a slovenského jazyka.",
		gradient: "from-blue-500 to-cyan-400",
		iconBg: "bg-blue-100",
		borderHover: "hover:border-blue-300",
	},
	{
		type: "4-rocne",
		title: "4-ročné gymnázium",
		subtitle: "Pre žiakov 9. ročníka ZŠ",
		grade: "9. ročník",
		age: "14 - 15 rokov",
		subjects: [
			"Matematika (zlomky, percentá, rovnice)",
			"Slovenský jazyk (literatúra, gramatika, pravopis)",
		],
		description:
			"Prijímacie skúšky pre žiakov ukončujúcich základnú školu. Náročnejší test z matematiky a slovenčiny.",
		gradient: "from-purple-500 to-pink-400",
		iconBg: "bg-purple-100",
		borderHover: "hover:border-purple-300",
	},
	{
		type: "bilingvalne",
		title: "Bilingválne gymnázium",
		subtitle: "Pre žiakov 9. ročníka ZŠ",
		grade: "9. ročník",
		age: "14 - 15 rokov",
		subjects: [
			"Matematika (zlomky, percentá, rovnice)",
			"Slovenský jazyk (literatúra, gramatika, pravopis)",
			"Nemecký jazyk (pripravujeme)",
		],
		description:
			"Prijímacie skúšky na bilingválne gymnázium s nemeckým jazykom. 15 otázok za 30 minút, náročnosť ako 4-ročné.",
		gradient: "from-emerald-500 to-teal-400",
		iconBg: "bg-emerald-100",
		borderHover: "hover:border-emerald-300",
	},
];

export default function ExamTypePage() {
	const navigate = useNavigate();
	const [mounted, setMounted] = useState(false);
	const [selectedType, setSelectedType] = useState<ExamType | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 50);
		return () => clearTimeout(timer);
	}, []);

	const handleSelect = (type: ExamType) => {
		setSelectedType(type);
	};

	const handleContinue = () => {
		if (!selectedType) return;
		const settings = getUserSettings();
		saveUserSettings({ ...settings, examType: selectedType });
		navigate("/dashboard");
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
			{/* Background decorations */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none">
				<div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-blue-200/30 blur-3xl" />
				<div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl" />
			</div>

			<div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
				{/* Back button */}
				<button
					type="button"
					onClick={() => navigate("/")}
					className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-8 transition-colors bg-transparent border-none cursor-pointer"
				>
					<ArrowLeft className="h-4 w-4" />
					<span>Späť</span>
				</button>

				{/* Header */}
				<div
					className={`text-center mb-10 transition-all duration-700 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-8"
					}`}
				>
					<div className="flex items-center justify-center mb-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
							<GraduationCap className="h-7 w-7 text-white" />
						</div>
					</div>
					<h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
						Vyber si typ skúšky
					</h1>
					<p className="text-gray-500 font-medium">
						Na aký typ gymnázia sa pripravuješ?
					</p>
				</div>

				{/* Exam type cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					{examCards.map((card, index) => {
						const isSelected = selectedType === card.type;
						return (
							<button
								key={card.type}
								type="button"
								onClick={() => handleSelect(card.type)}
								className={`group relative rounded-3xl bg-white p-6 text-left shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
									isSelected
										? "border-3 border-purple-400 ring-4 ring-purple-100"
										: `border-2 border-gray-100 ${card.borderHover}`
								} ${
									mounted
										? "opacity-100 translate-y-0"
										: "opacity-0 translate-y-8"
								}`}
								style={{
									transitionDelay: `${200 + index * 150}ms`,
								}}
							>
								{/* Selected badge */}
								{isSelected && (
									<div className="absolute -top-3 -right-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
											<Sparkles className="h-4 w-4 text-white" />
										</div>
									</div>
								)}

								{/* Gradient strip */}
								<div
									className={`h-2 w-16 rounded-full bg-gradient-to-r ${card.gradient} mb-5 transition-all duration-300 group-hover:w-24`}
								/>

								{/* Title row */}
								<div className="flex items-start gap-4 mb-4">
									<div
										className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}
									>
										{card.type === "8-rocne" ? (
											<BookOpen className="h-7 w-7 text-blue-600" />
										) : card.type === "bilingvalne" ? (
											<Languages className="h-7 w-7 text-emerald-600" />
										) : (
											<Calculator className="h-7 w-7 text-purple-600" />
										)}
									</div>
									<div>
										<h2 className="text-xl font-extrabold text-gray-800">
											{card.title}
										</h2>
										<p className="text-sm text-gray-400 font-medium">
											{card.subtitle}
										</p>
									</div>
								</div>

								{/* Info pills */}
								<div className="flex flex-wrap gap-2 mb-4">
									<div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
										<GraduationCap className="h-3.5 w-3.5" />
										{card.grade}
									</div>
									<div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
										<Users className="h-3.5 w-3.5" />
										{card.age}
									</div>
								</div>

								{/* Description */}
								<p className="text-sm text-gray-500 leading-relaxed mb-4">
									{card.description}
								</p>

								{/* Subjects */}
								<div className="space-y-2">
									<p className="text-xs font-bold uppercase tracking-wider text-gray-400">
										Predmety
									</p>
									{card.subjects.map((subject) => (
										<div
											key={subject}
											className="flex items-center gap-2 text-sm text-gray-600"
										>
											<div
												className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${card.gradient}`}
											/>
											{subject}
										</div>
									))}
								</div>
							</button>
						);
					})}
				</div>

				{/* Continue button */}
				<div
					className={`flex justify-center transition-all duration-500 delay-500 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-4"
					}`}
				>
					<button
						type="button"
						onClick={handleContinue}
						disabled={!selectedType}
						className={`flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 border-none cursor-pointer ${
							selectedType
								? "bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-xl hover:-translate-y-0.5 shadow-purple-200/50"
								: "bg-gray-300 cursor-not-allowed shadow-none"
						}`}
					>
						Pokračovať
						<ArrowRight className="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	);
}
