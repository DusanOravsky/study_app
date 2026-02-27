import { Sparkles } from "lucide-react";

interface XPBarProps {
	xp: number;
	level: number;
	xpForNext: number;
	compact?: boolean;
}

export default function XPBar({
	xp,
	level,
	xpForNext,
	compact = false,
}: XPBarProps) {
	const percentage = Math.min((xp / xpForNext) * 100, 100);

	if (compact) {
		return (
			<div className="flex items-center gap-2">
				<div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
					<div
						className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out"
						style={{ width: `${percentage}%` }}
					/>
				</div>
				<span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
					{xp}/{xpForNext}
				</span>
			</div>
		);
	}

	return (
		<div className="rounded-2xl bg-white p-4 shadow-lg border border-purple-100">
			{/* Header */}
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
						<span className="text-sm font-extrabold text-white">
							{level}
						</span>
					</div>
					<div>
						<p className="text-sm font-bold text-gray-700">
							Uroven {level}
						</p>
						<p className="text-xs text-gray-400">
							{xpForNext - xp} XP do dalsej urovne
						</p>
					</div>
				</div>
				<div className="flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1">
					<Sparkles className="h-4 w-4 text-purple-500" />
					<span className="text-sm font-bold text-purple-600">
						{xp} XP
					</span>
				</div>
			</div>

			{/* Progress bar */}
			<div className="relative h-4 rounded-full bg-gray-200 overflow-hidden">
				<div
					className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
					style={{ width: `${percentage}%` }}
				>
					{/* Animated shine effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
				</div>
			</div>

			{/* XP numbers */}
			<div className="flex justify-between mt-1">
				<span className="text-xs font-medium text-gray-400">0 XP</span>
				<span className="text-xs font-medium text-gray-400">
					{xpForNext} XP
				</span>
			</div>
		</div>
	);
}
