import { Flame } from "lucide-react";

interface StreakBadgeProps {
	streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
	const isGlowing = streak > 3;
	const isActive = streak > 0;

	const streakLabel = () => {
		if (streak === 0) return "Zacni seriu!";
		if (streak === 1) return "1 den v rade";
		if (streak >= 2 && streak <= 4) return `${streak} dni v rade`;
		return `${streak} dni v rade`;
	};

	return (
		<div
			className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-bold transition-all duration-300 ${
				isGlowing
					? "bg-gradient-to-r from-orange-100 to-red-100 shadow-lg shadow-orange-200/50"
					: isActive
						? "bg-orange-50 shadow-md"
						: "bg-gray-100 shadow-sm"
			}`}
		>
			{/* Flame icon with glow */}
			<div className="relative">
				<Flame
					className={`h-6 w-6 transition-all duration-300 ${
						isGlowing
							? "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.7)]"
							: isActive
								? "text-orange-400"
								: "text-gray-300"
					}`}
					fill={isActive ? "currentColor" : "none"}
				/>
				{isGlowing && (
					<div className="absolute -inset-1 rounded-full bg-orange-400/20 animate-ping" />
				)}
			</div>

			{/* Streak number */}
			<span
				className={`text-lg tabular-nums ${
					isGlowing
						? "text-orange-600"
						: isActive
							? "text-orange-500"
							: "text-gray-400"
				}`}
			>
				{streak}
			</span>

			{/* Label */}
			<span
				className={`text-sm hidden sm:inline ${
					isGlowing
						? "text-orange-600"
						: isActive
							? "text-orange-400"
							: "text-gray-400"
				}`}
			>
				{streakLabel()}
			</span>
		</div>
	);
}
