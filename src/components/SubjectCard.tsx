import type { LucideIcon } from "lucide-react";
import ProgressRing from "./ProgressRing";

interface SubjectCardProps {
	subject: string;
	icon: LucideIcon;
	progress: number;
	onClick: () => void;
}

const subjectColors: Record<string, { gradient: string; ring: string; iconBg: string; iconColor: string; hoverBorder: string }> = {
	Matematika: {
		gradient: "from-blue-500 to-cyan-400",
		ring: "#3b82f6",
		iconBg: "bg-blue-100",
		iconColor: "text-blue-600",
		hoverBorder: "hover:border-blue-300",
	},
	Slovencina: {
		gradient: "from-pink-500 to-rose-400",
		ring: "#ec4899",
		iconBg: "bg-pink-100",
		iconColor: "text-pink-600",
		hoverBorder: "hover:border-pink-300",
	},
};

const defaultColors = {
	gradient: "from-purple-500 to-indigo-400",
	ring: "#8b5cf6",
	iconBg: "bg-purple-100",
	iconColor: "text-purple-600",
	hoverBorder: "hover:border-purple-300",
};

export default function SubjectCard({
	subject,
	icon: Icon,
	progress,
	onClick,
}: SubjectCardProps) {
	const colors = subjectColors[subject] ?? defaultColors;

	const getProgressLabel = () => {
		if (progress === 0) return "Zacni sa ucit!";
		if (progress < 30) return "Zaciatok cesty";
		if (progress < 60) return "Dobre napredovanie";
		if (progress < 90) return "Skoro hotove!";
		return "Zvladnute!";
	};

	return (
		<button
			type="button"
			onClick={onClick}
			className={`group w-full rounded-3xl bg-white border-2 border-gray-100 p-6 text-left shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colors.hoverBorder}`}
		>
			{/* Top colored strip */}
			<div
				className={`h-2 w-16 rounded-full bg-gradient-to-r ${colors.gradient} mb-4 transition-all duration-300 group-hover:w-24`}
			/>

			<div className="flex items-center justify-between">
				{/* Left: Icon + text */}
				<div className="flex items-center gap-4">
					<div
						className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}
					>
						<Icon className={`h-7 w-7 ${colors.iconColor}`} />
					</div>
					<div>
						<h3 className="text-lg font-extrabold text-gray-800">
							{subject}
						</h3>
						<p className="text-sm text-gray-400 font-medium">
							{getProgressLabel()}
						</p>
					</div>
				</div>

				{/* Right: Progress ring */}
				<ProgressRing
					percentage={progress}
					size={56}
					color={colors.ring}
					label={`${progress}%`}
				/>
			</div>

			{/* Bottom progress bar */}
			<div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
				<div
					className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-700 ease-out`}
					style={{ width: `${progress}%` }}
				/>
			</div>
		</button>
	);
}
