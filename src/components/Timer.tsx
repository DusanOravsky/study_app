import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
	totalSeconds: number;
	onTimeUp: () => void;
}

export default function Timer({ totalSeconds, onTimeUp }: TimerProps) {
	const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

	useEffect(() => {
		setSecondsLeft(totalSeconds);
	}, [totalSeconds]);

	useEffect(() => {
		if (secondsLeft <= 0) {
			onTimeUp();
			return;
		}

		const interval = setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [secondsLeft, onTimeUp]);

	const minutes = Math.floor(secondsLeft / 60);
	const seconds = secondsLeft % 60;
	const progress = secondsLeft / totalSeconds;
	const isWarning = secondsLeft < 300; // < 5 minutes
	const isCritical = secondsLeft < 60; // < 1 minute

	// SVG circle properties
	const size = 120;
	const strokeWidth = 8;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference * (1 - progress);

	const getColor = () => {
		if (isCritical) return { stroke: "#ef4444", text: "text-red-500", bg: "bg-red-50" };
		if (isWarning) return { stroke: "#f97316", text: "text-orange-500", bg: "bg-orange-50" };
		return { stroke: "#8b5cf6", text: "text-purple-500", bg: "bg-purple-50" };
	};

	const color = getColor();

	return (
		<div className={`inline-flex flex-col items-center gap-2 rounded-2xl p-4 ${color.bg}`}>
			{/* Circular timer */}
			<div className="relative">
				<svg
					width={size}
					height={size}
					className="-rotate-90 transition-all duration-1000"
				>
					{/* Background circle */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke="#e5e7eb"
						strokeWidth={strokeWidth}
					/>
					{/* Progress circle */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke={color.stroke}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						className="transition-all duration-1000 ease-linear"
					/>
				</svg>

				{/* Center text */}
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<Clock className={`h-4 w-4 ${color.text} mb-0.5`} />
					<span
						className={`text-2xl font-extrabold tabular-nums ${color.text} ${
							isCritical ? "animate-pulse" : ""
						}`}
					>
						{String(minutes).padStart(2, "0")}:
						{String(seconds).padStart(2, "0")}
					</span>
				</div>
			</div>

			{/* Label */}
			<span className={`text-xs font-semibold ${color.text}`}>
				{isCritical
					? "Ponahaj sa!"
					: isWarning
						? "Cas sa krati!"
						: "Zostava"}
			</span>
		</div>
	);
}
