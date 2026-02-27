import { useEffect, useState } from "react";
import { ArrowRight, PartyPopper, Sparkles, Star } from "lucide-react";

interface LevelUpModalProps {
	level: number;
	onClose: () => void;
}

interface ConfettiPiece {
	id: number;
	left: number;
	delay: number;
	duration: number;
	color: string;
	size: number;
}

const confettiColors = [
	"bg-yellow-400",
	"bg-pink-400",
	"bg-blue-400",
	"bg-green-400",
	"bg-purple-400",
	"bg-orange-400",
	"bg-red-400",
	"bg-cyan-400",
];

export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
	const [visible, setVisible] = useState(false);
	const [confetti] = useState<ConfettiPiece[]>(() =>
		Array.from({ length: 50 }, (_, i) => ({
			id: i,
			left: Math.random() * 100,
			delay: Math.random() * 0.5,
			duration: 1.5 + Math.random() * 2,
			color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
			size: 4 + Math.random() * 8,
		})),
	);

	useEffect(() => {
		const timer = setTimeout(() => setVisible(true), 50);
		return () => clearTimeout(timer);
	}, []);

	const handleClose = () => {
		setVisible(false);
		setTimeout(onClose, 300);
	};

	return (
		<div
			className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-300 ${
				visible ? "opacity-100" : "opacity-0"
			}`}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={handleClose}
				onKeyDown={(e) => {
					if (e.key === "Escape") handleClose();
				}}
				role="button"
				tabIndex={0}
				aria-label="Zavriet"
			/>

			{/* Confetti */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				{confetti.map((piece) => (
					<div
						key={piece.id}
						className={`absolute rounded-sm ${piece.color} animate-bounce`}
						style={{
							left: `${piece.left}%`,
							top: "-10px",
							width: `${piece.size}px`,
							height: `${piece.size}px`,
							animationDelay: `${piece.delay}s`,
							animationDuration: `${piece.duration}s`,
							animationIterationCount: "infinite",
							animationDirection: "alternate",
							opacity: 0.8,
						}}
					/>
				))}
			</div>

			{/* Modal content */}
			<div
				className={`relative z-10 w-[90%] max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl transition-all duration-500 ${
					visible
						? "scale-100 translate-y-0"
						: "scale-75 translate-y-10"
				}`}
			>
				{/* Stars decoration */}
				<div className="absolute -top-3 -left-3">
					<Star className="h-8 w-8 text-yellow-400 fill-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
				</div>
				<div className="absolute -top-2 -right-4">
					<Sparkles className="h-7 w-7 text-purple-400 animate-pulse" />
				</div>
				<div className="absolute -bottom-2 -left-2">
					<Sparkles className="h-6 w-6 text-blue-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
				</div>

				{/* Party icon */}
				<div className="flex items-center justify-center mb-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100">
						<PartyPopper className="h-9 w-9 text-orange-500" />
					</div>
				</div>

				{/* Congratulations text */}
				<h2 className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-2">
					Gratulujeme!
				</h2>

				<p className="text-lg font-bold text-gray-600 mb-4">
					Dosiahol si novu uroven!
				</p>

				{/* Level number */}
				<div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 shadow-2xl shadow-purple-300/50">
					<div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
						<span className="text-5xl font-extrabold bg-gradient-to-br from-purple-600 to-blue-500 bg-clip-text text-transparent">
							{level}
						</span>
					</div>
				</div>

				{/* Encouraging message */}
				<p className="text-sm text-gray-500 mb-6">
					{level <= 5
						? "Skvelý zaciatok! Pokracuj v uceni!"
						: level <= 10
							? "Si na dobrej ceste! Len tak dalej!"
							: level <= 20
								? "Neuveritelne! Si naozaj sikovny!"
								: "Si expert! Nič ta nezastavi!"}
				</p>

				{/* Continue button */}
				<button
					type="button"
					onClick={handleClose}
					className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-purple-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border-none"
				>
					Pokracovat
					<ArrowRight className="h-5 w-5" />
				</button>
			</div>
		</div>
	);
}
