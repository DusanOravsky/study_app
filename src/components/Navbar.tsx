import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	BookOpen,
	Brain,
	Flame,
	GraduationCap,
	LayoutDashboard,
	Menu,
	MessageCircle,
	User,
	X,
} from "lucide-react";
import XPBar from "./XPBar";
import { getGamification, getXPForNextLevel } from "../utils/gamification";

const navLinks = [
	{ name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
	{ name: "Ucenie", icon: BookOpen, href: "/learning" },
	{ name: "Test", icon: Brain, href: "/test" },
	{ name: "Chat", icon: MessageCircle, href: "/chat" },
	{ name: "Profil", icon: User, href: "/profile" },
] as const;

export default function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const location = useLocation();

	const gamification = getGamification();
	const { current: xpCurrent, needed: xpNeeded } = getXPForNextLevel(gamification);
	const { level, streak } = gamification;

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-md border-b-2 border-purple-200">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link to="/dashboard" className="flex items-center gap-2 no-underline">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
							<GraduationCap className="h-6 w-6 text-white" />
						</div>
						<span className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
							AI Mentor
						</span>
					</Link>

					{/* Desktop nav links */}
					<div className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => {
							const isActive = location.pathname.startsWith(link.href);
							return (
								<Link
									key={link.name}
									to={link.href}
									className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 no-underline ${
										isActive
											? "bg-purple-100 text-purple-700 shadow-sm"
											: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
									}`}
								>
									<link.icon className="h-4 w-4" />
									{link.name}
								</Link>
							);
						})}
					</div>

					{/* Right side: XP, Streak, Level */}
					<div className="hidden md:flex items-center gap-4">
						<div className="flex items-center gap-1">
							<Flame
								className={`h-5 w-5 ${streak > 0 ? "text-orange-500" : "text-gray-300"}`}
							/>
							<span
								className={`text-sm font-bold ${streak > 0 ? "text-orange-600" : "text-gray-400"}`}
							>
								{streak}
							</span>
						</div>

						<div className="w-32">
							<XPBar xp={xpCurrent} level={level} xpForNext={xpNeeded} compact />
						</div>

						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-extrabold shadow-md">
							{level}
						</div>
					</div>

					{/* Mobile menu button */}
					<button
						type="button"
						className="md:hidden flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-none bg-transparent"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label={mobileMenuOpen ? "Zavriet menu" : "Otvorit menu"}
					>
						{mobileMenuOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
					<div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
						<div className="flex items-center gap-1">
							<Flame
								className={`h-5 w-5 ${streak > 0 ? "text-orange-500" : "text-gray-300"}`}
							/>
							<span className="text-sm font-bold text-orange-600">
								{streak}
							</span>
						</div>
						<div className="flex-1">
							<XPBar xp={xpCurrent} level={level} xpForNext={xpNeeded} compact />
						</div>
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-extrabold shadow-md">
							{level}
						</div>
					</div>

					<div className="px-2 py-2 space-y-1">
						{navLinks.map((link) => {
							const isActive = location.pathname.startsWith(link.href);
							return (
								<Link
									key={link.name}
									to={link.href}
									className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold transition-all no-underline ${
										isActive
											? "bg-purple-100 text-purple-700"
											: "text-gray-600 hover:bg-gray-50"
									}`}
									onClick={() => setMobileMenuOpen(false)}
								>
									<link.icon className="h-5 w-5" />
									{link.name}
								</Link>
							);
						})}
					</div>
				</div>
			)}
		</nav>
	);
}
