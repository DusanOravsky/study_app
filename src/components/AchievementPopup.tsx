import { useEffect, useState } from "react";
import { Award, X } from "lucide-react";
import type { Achievement } from "../types";

interface AchievementPopupProps {
	achievement: Achievement;
	onClose: () => void;
}

const iconMap: Record<string, string> = {
	star: String.fromCodePoint(0x2b50),
	fire: String.fromCodePoint(0x1f525),
	trophy: String.fromCodePoint(0x1f3c6),
	rocket: String.fromCodePoint(0x1f680),
	brain: String.fromCodePoint(0x1f9e0),
	book: String.fromCodePoint(0x1f4da),
	medal: String.fromCodePoint(0x1f3c5),
	lightning: String.fromCodePoint(0x26a1),
	crown: String.fromCodePoint(0x1f451),
	diamond: String.fromCodePoint(0x1f48e),
	muscle: String.fromCodePoint(0x1f4aa),
	hundred: String.fromCodePoint(0x1f4af),
	check: String.fromCodePoint(0x2705),
	heart: String.fromCodePoint(0x2764),
};

export default function AchievementPopup({
	achievement,
	onClose,
}: AchievementPopupProps) {
	const [visible, setVisible] = useState(false);
	const [exiting, setExiting] = useState(false);

	useEffect(() => {
		// Animate in
		const showTimer = setTimeout(() => setVisible(true), 50);

		// Auto-dismiss after 3 seconds
		const dismissTimer = setTimeout(() => {
			handleClose();
		}, 3000);

		return () => {
			clearTimeout(showTimer);
			clearTimeout(dismissTimer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleClose = () => {
		setExiting(true);
		setTimeout(() => {
			onClose();
		}, 300);
	};

	const emoji = iconMap[achievement.icon] ?? String.fromCodePoint(0x1f3c6);

	return (
		<div
			className={`fixed top-4 left-1/2 z-[100] w-[90%] max-w-sm transition-all duration-300 ease-out ${
				visible && !exiting
					? "translate-x-[-50%] translate-y-0 opacity-100"
					: "translate-x-[-50%] translate-y-[-120%] opacity-0"
			}`}
		>
			<div className="rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-0.5 shadow-2xl shadow-orange-200/50">
				<div className="rounded-[14px] bg-white p-4 flex items-center gap-4">
					{/* Icon */}
					<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 text-3xl">
						{emoji}
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-1.5 mb-0.5">
							<Award className="h-4 w-4 text-orange-500" />
							<span className="text-xs font-bold uppercase tracking-wider text-orange-500">
								Novy uspech!
							</span>
						</div>
						<h3 className="text-base font-extrabold text-gray-800 truncate">
							{achievement.title}
						</h3>
						<p className="text-sm text-gray-500 truncate">
							{achievement.description}
						</p>
					</div>

					{/* Close button */}
					<button
						type="button"
						onClick={handleClose}
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors border-none"
						aria-label="Zavriet"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
