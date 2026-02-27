interface ProgressRingProps {
	percentage: number;
	size?: number;
	color?: string;
	label?: string;
}

export default function ProgressRing({
	percentage,
	size = 80,
	color = "#8b5cf6",
	label,
}: ProgressRingProps) {
	const strokeWidth = size * 0.1;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
	const strokeDashoffset = circumference * (1 - clampedPercentage / 100);

	// Derive a lighter background color from the main color
	const bgOpacity = 0.15;

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg width={size} height={size} className="-rotate-90">
				{/* Background circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					opacity={bgOpacity}
				/>
				{/* Progress circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					className="transition-all duration-700 ease-out"
				/>
			</svg>

			{/* Center label */}
			<div className="absolute inset-0 flex items-center justify-center">
				<span
					className="font-extrabold tabular-nums"
					style={{
						color,
						fontSize: size * 0.2,
					}}
				>
					{label ?? `${Math.round(clampedPercentage)}%`}
				</span>
			</div>
		</div>
	);
}
