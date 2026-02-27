import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Bot,
	Brain,
	Check,
	ChevronDown,
	ChevronUp,
	Crown,
	GraduationCap,
	InfinityIcon,
	MessageCircle,
	Rocket,
	Sparkles,
	Star,
	Trophy,
	Users,
	Zap,
} from "lucide-react";

interface FAQItem {
	question: string;
	answer: string;
}

const faqItems: FAQItem[] = [
	{
		question: "Je AI Mentor zadarmo?",
		answer: "Ano! Zakladna verzia AI Mentora je uplne zadarmo. Obsahuje vsetky otazky, skusobne testy, XP system a AI chat s predprogramovanymi odpovediami.",
	},
	{
		question: "Pre koho je AI Mentor urceny?",
		answer: "AI Mentor je urceny pre slovenskych ziakov, ktori sa pripravuju na prijimacie skusky na gymnazium - ci uz 8-rocne (5. rocnik ZS) alebo 4-rocne (9. rocnik ZS).",
	},
	{
		question: "Ake predmety su k dispozicii?",
		answer: "Momentalne ponukame matematiku a slovensky jazyk. V buducnosti planujeme pridat dalsie predmety ako anglicky jazyk a prirodne vedy.",
	},
	{
		question: "Ako funguje XP system?",
		answer: "Za kazdu spravnu odpoved ziskate 10 XP bodov, za nespravnu 2 XP. Za seriove ucenie (3+ dni v rade) ziskavate bonus +5 XP. Za dokoncenie skusobneho testu ziskate bonus 50 XP.",
	},
	{
		question: "Su moje udaje v bezpeci?",
		answer: "Vsetky udaje su ulozene lokalne vo vasom prehliadaci. Ziadne data sa neodosielajú na server. Ak vymazete data prehliadaca, udaje sa stratia.",
	},
	{
		question: "Kedy bude dostupna Premium verzia?",
		answer: "Premium verzia s AI mentorom v realnom case je v priprave. Sledujte nase aktualizacie pre viac informacii.",
	},
];

export default function PricingPage() {
	const navigate = useNavigate();

	const [mounted, setMounted] = useState(false);
	const [openFAQ, setOpenFAQ] = useState<number | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 50);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			<main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
				{/* Back button */}
				<button
					type="button"
					onClick={() => navigate("/dashboard")}
					className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-8 transition-colors bg-transparent border-none cursor-pointer"
				>
					<ArrowLeft className="h-4 w-4" />
					Dashboard
				</button>

				{/* Header */}
				<div
					className={`text-center mb-12 transition-all duration-700 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-8"
					}`}
				>
					<div className="flex items-center justify-center gap-2 mb-4">
						<Sparkles className="h-6 w-6 text-purple-500" />
						<span className="text-sm font-bold uppercase tracking-widest text-purple-500">
							Plany a ceny
						</span>
					</div>
					<h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-3">
						Vyber si plan, ktory ti vyhovuje
					</h1>
					<p className="text-gray-500 font-medium max-w-md mx-auto">
						Zakladna verzia je uplne zadarmo. Premium verzia prichadza coskoro!
					</p>
				</div>

				{/* Pricing cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
					{/* Free plan */}
					<div
						className={`rounded-3xl bg-white border-2 border-gray-200 p-6 sm:p-8 shadow-xl transition-all duration-700 delay-200 ${
							mounted
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-8"
						}`}
					>
						<div className="flex items-center gap-3 mb-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
								<Rocket className="h-6 w-6 text-blue-500" />
							</div>
							<div>
								<h2 className="text-xl font-extrabold text-gray-800">
									Zadarmo
								</h2>
								<p className="text-sm text-gray-400">
									Vsetko co potrebujes
								</p>
							</div>
						</div>

						<div className="flex items-baseline gap-1 mb-6">
							<span className="text-4xl font-extrabold text-gray-800">
								0
							</span>
							<span className="text-lg font-bold text-gray-400">
								EUR
							</span>
							<span className="text-sm text-gray-400">
								/ navzdy
							</span>
						</div>

						<div className="space-y-3 mb-6">
							{[
								{
									icon: Brain,
									text: "Neobmedzene otazky z matematiky a slovenciny",
								},
								{
									icon: Trophy,
									text: "Skusobne testy s casom",
								},
								{
									icon: Star,
									text: "XP system, levely a uspechy",
								},
								{
									icon: Zap,
									text: "Serie a motivacne prvky",
								},
								{
									icon: MessageCircle,
									text: "AI chat s predprogramovanymi odpovediami",
								},
								{
									icon: GraduationCap,
									text: "8-rocne, 4-rocne aj bilingvalne gymnazium",
								},
							].map((feature) => (
								<div
									key={feature.text}
									className="flex items-center gap-3"
								>
									<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
										<Check className="h-3.5 w-3.5 text-green-500" />
									</div>
									<span className="text-sm text-gray-600">
										{feature.text}
									</span>
								</div>
							))}
						</div>

						<button
							type="button"
							onClick={() => navigate("/dashboard")}
							className="w-full rounded-2xl bg-gray-100 px-6 py-4 font-bold text-gray-700 hover:bg-gray-200 transition-all border-none cursor-pointer"
						>
							Aktivne - Zacat sa ucit
						</button>
					</div>

					{/* Premium plan */}
					<div
						className={`relative rounded-3xl bg-white border-2 border-purple-300 p-6 sm:p-8 shadow-xl transition-all duration-700 delay-400 ${
							mounted
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-8"
						}`}
					>
						{/* Coming soon badge */}
						<div className="absolute -top-4 left-1/2 -translate-x-1/2">
							<div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1.5 shadow-lg">
								<Crown className="h-4 w-4 text-yellow-300" />
								<span className="text-xs font-bold text-white">
									Coskoro
								</span>
							</div>
						</div>

						<div className="flex items-center gap-3 mb-4 mt-2">
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100">
								<Crown className="h-6 w-6 text-purple-500" />
							</div>
							<div>
								<h2 className="text-xl font-extrabold text-gray-800">
									Premium
								</h2>
								<p className="text-sm text-gray-400">
									S AI mentorom v realnom case
								</p>
							</div>
						</div>

						<div className="flex items-baseline gap-1 mb-6">
							<span className="text-4xl font-extrabold text-gray-800">
								4.99
							</span>
							<span className="text-lg font-bold text-gray-400">
								EUR
							</span>
							<span className="text-sm text-gray-400">
								/ mesiac
							</span>
						</div>

						<div className="space-y-3 mb-6">
							{[
								{
									icon: Check,
									text: "Vsetko z Free planu",
									included: true,
								},
								{
									icon: Bot,
									text: "AI mentor v realnom case (GPT-4)",
									included: false,
								},
								{
									icon: InfinityIcon,
									text: "Neobmedzeny AI chat",
									included: false,
								},
								{
									icon: Users,
									text: "Rodičovský prístup a štatistiky",
									included: false,
								},
								{
									icon: Brain,
									text: "Adaptivne otazky podla urovne",
									included: false,
								},
								{
									icon: Trophy,
									text: "Podrobna analyza slabych stranok",
									included: false,
								},
							].map((feature) => (
								<div
									key={feature.text}
									className="flex items-center gap-3"
								>
									<div
										className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
											feature.included
												? "bg-green-100"
												: "bg-purple-100"
										}`}
									>
										<feature.icon
											className={`h-3.5 w-3.5 ${
												feature.included
													? "text-green-500"
													: "text-purple-500"
											}`}
										/>
									</div>
									<span
										className={`text-sm ${
											feature.included
												? "text-gray-600"
												: "text-gray-600 font-medium"
										}`}
									>
										{feature.text}
									</span>
								</div>
							))}
						</div>

						<button
							type="button"
							disabled
							className="w-full rounded-2xl bg-gradient-to-r from-purple-400 to-blue-400 px-6 py-4 font-bold text-white shadow-lg opacity-70 cursor-not-allowed border-none"
						>
							Coskoro dostupne
						</button>
					</div>
				</div>

				{/* FAQ Section */}
				<div
					className={`max-w-2xl mx-auto transition-all duration-700 delay-600 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-8"
					}`}
				>
					<div className="text-center mb-8">
						<h2 className="text-2xl font-extrabold text-gray-800 mb-2">
							Casto kladene otazky
						</h2>
						<p className="text-gray-500">
							Najdi odpovede na najcastejsie otazky
						</p>
					</div>

					<div className="space-y-3">
						{faqItems.map((item, index) => {
							const isOpen = openFAQ === index;
							return (
								<div
									key={item.question}
									className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden"
								>
									<button
										type="button"
										onClick={() =>
											setOpenFAQ(
												isOpen ? null : index,
											)
										}
										className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-transparent border-none cursor-pointer"
									>
										<span className="text-sm sm:text-base font-bold text-gray-700 pr-4">
											{item.question}
										</span>
										{isOpen ? (
											<ChevronUp className="h-5 w-5 text-gray-400 shrink-0" />
										) : (
											<ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
										)}
									</button>
									{isOpen && (
										<div className="px-4 sm:px-5 pb-4 sm:pb-5">
											<p className="text-sm text-gray-600 leading-relaxed">
												{item.answer}
											</p>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Bottom CTA */}
				<div
					className={`text-center mt-12 transition-all duration-700 delay-800 ${
						mounted
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-4"
					}`}
				>
					<div className="rounded-3xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 p-8 sm:p-12 text-center">
						<h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3">
							Pripraveny na ucenie?
						</h3>
						<p className="text-white/80 mb-6 max-w-md mx-auto">
							Zaregistruj sa zadarmo a zacni sa pripravovat na prijimacie skusky uz dnes!
						</p>
						<button
							type="button"
							onClick={() => navigate("/dashboard")}
							className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-purple-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all border-none cursor-pointer"
						>
							Zacat sa ucit zadarmo
							<Zap className="h-5 w-5" />
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}
