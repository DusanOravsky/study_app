import { Bot, User } from "lucide-react";
import type { ChatMessage } from "../types";

interface ChatBubbleProps {
	message: ChatMessage;
	isTyping?: boolean;
}

export default function ChatBubble({
	message,
	isTyping = false,
}: ChatBubbleProps) {
	const isUser = message.role === "user";

	const formatTime = (timestamp: string) => {
		try {
			const date = new Date(timestamp);
			return date.toLocaleTimeString("sk-SK", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return "";
		}
	};

	return (
		<div
			className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
		>
			{/* Avatar */}
			<div
				className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-md ${
					isUser
						? "bg-gradient-to-br from-blue-500 to-purple-500"
						: "bg-gradient-to-br from-emerald-400 to-teal-500"
				}`}
			>
				{isUser ? (
					<User className="h-5 w-5 text-white" />
				) : (
					<Bot className="h-5 w-5 text-white" />
				)}
			</div>

			{/* Message bubble */}
			<div
				className={`max-w-[80%] sm:max-w-[70%] ${
					isUser ? "items-end" : "items-start"
				}`}
			>
				<div
					className={`rounded-2xl px-4 py-3 shadow-sm ${
						isUser
							? "bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-tr-sm"
							: "bg-white border border-gray-200 text-gray-700 rounded-tl-sm"
					}`}
				>
					{isTyping ? (
						<div className="flex items-center gap-1.5 py-1 px-1">
							<span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
							<span
								className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
								style={{ animationDelay: "0.15s" }}
							/>
							<span
								className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
								style={{ animationDelay: "0.3s" }}
							/>
						</div>
					) : (
						<p className="text-sm leading-relaxed whitespace-pre-wrap">
							{message.content}
						</p>
					)}
				</div>

				{/* Timestamp */}
				{!isTyping && (
					<p
						className={`text-xs text-gray-400 mt-1 ${
							isUser ? "text-right" : "text-left"
						}`}
					>
						{formatTime(message.timestamp)}
					</p>
				)}
			</div>
		</div>
	);
}
