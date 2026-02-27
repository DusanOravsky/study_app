import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Bot,
	MessageCircle,
	Send,
	Sparkles,
} from "lucide-react";
import ChatBubble from "../components/ChatBubble";
import type { ChatMessage } from "../types";

const WELCOME_MESSAGE: ChatMessage = {
	id: "welcome",
	role: "assistant",
	content:
		"Ahoj! Som tvoj AI mentor. Opytaj sa ma cokolvek o matematike alebo slovencine! Pomozem ti s prikladmi, vysvetlim pravidla a dam ti tipy na ucenie.",
	timestamp: new Date().toISOString(),
};

const quickSuggestions = [
	"Pomoz mi so zlomkami",
	"Vysvetli vybrane slova",
	"Ako pocitam percenta?",
	"Co su slovne druhy?",
	"Pomoz mi s geometriou",
	"Pomoz mi s nemcinou",
	"Ako sa ucit efektivne?",
];

interface BotResponse {
	patterns: RegExp[];
	response: string;
}

const botResponses: BotResponse[] = [
	{
		patterns: [/zlom/i, /fraction/i],
		response:
			"Zlomky su jednoduche, ked ich pochopis! Zlomok ma dve casti:\n\n- Citatel (hore) - kolko casti mas\n- Menovatel (dole) - na kolko casti je celok rozdeleny\n\nNapr. 3/4 znamena, ze mas 3 casti zo 4.\n\nPri scitani zlomkov s rovnakym menovatelom jednoducho scitas citatele:\n2/5 + 1/5 = 3/5\n\nChces vediet aj o zlomkoch s roznym menovatelom?",
	},
	{
		patterns: [/vybran/i, /slova/i],
		response:
			"Vybrane slova su slova, v ktorych sa pise 'y' alebo 'y' po urcitych spoluhlasjach (B, M, P, R, S, V, Z).\n\nNapr. po B: byty, byt, bystriny, byk, byk, bylina...\nPo M: my, myt, myslit, mys, mykat...\n\nTip: Najlepsie je ucit sa ich v skupinach podla spoluhlasky. Skus si kazdy den zopakovat jednu skupinu!",
	},
	{
		patterns: [/percent/i, /procent/i],
		response:
			"Percenta su vlastne zlomky so menovatelom 100!\n\n25% = 25/100 = 1/4\n50% = 50/100 = 1/2\n\nAk chces vypocitat napr. 20% z 150:\n1. Preved na zlomok: 20/100\n2. Vynasob: (20/100) x 150 = 30\n\nAlebo jednoduchsie: 150 x 0.20 = 30\n\nPamataj: 'z' znamena 'krat' (nasobit)!",
	},
	{
		patterns: [/slovn.*druh/i, /slovne/i],
		response:
			"V slovencine pozname 10 slovnych druhov:\n\n1. Podstatne mena (dom, pes)\n2. Pridavne mena (velky, cerveny)\n3. Zamena (ja, ty, on)\n4. Cislovky (jeden, prvy)\n5. Slovesa (jest, pit, behat)\n6. Prislovky (rychlo, daleko)\n7. Predlozky (na, v, pod)\n8. Spojky (a, ale, lebo)\n9. Castice (ano, nie, veru)\n10. Citoslovcia (au, hej, bum)\n\nPrve 4 sa sklonuju, slovesa sa casuju!",
	},
	{
		patterns: [/geometr/i, /tvary/i, /obvod/i, /obsah/i],
		response:
			"Zaklady geometrie:\n\nObvod = sucet vsetkych stran\n- Stvorec: O = 4 x a\n- Obdlznik: O = 2 x (a + b)\n- Trojuholnik: O = a + b + c\n\nObsah = velkost plochy\n- Stvorec: S = a x a\n- Obdlznik: S = a x b\n- Trojuholnik: S = (a x v) / 2\n\nTip: Pri uceni si vzdy nakresli obrazok!",
	},
	{
		patterns: [/ucit/i, /uci[tť]/i, /tip/i, /efektiv/i, /rada/i],
		response:
			"Tu su moje tipy na efektivne ucenie:\n\n1. Pravidelnost - lepsie je 20 min denne ako 3 hodiny raz za tyzden\n2. Aktivne ucenie - riesit ulohy je lepsie ako len citat\n3. Prestávky - po 25 min ucenia si daj 5 min pauzu\n4. Opakovanie - zopakuj si latku po 1 dni, 3 dnoch a 7 dnoch\n5. Vysvetli to niekomu - ak vies nieco vysvetlit, naozaj to rozumies\n\nA nezabudaj: Chyby su sucast ucenia!",
	},
	{
		patterns: [/nemci/i, /nemec/i, /deutsch/i, /german/i, /artikel/i, /clen/i],
		response:
			"Nemcina na bilingvalne gymnazium:\n\n1. **Cleny (Artikel)**: der (muzsky), die (zensky), das (stredny)\n   - Tip: Uc sa slovicka vzdy s clenom!\n   - der Hund, die Katze, das Buch\n\n2. **Slovesa**: Kazda osoba ma iny tvar\n   - ich spiele, du spielst, er/sie spielt\n   - Pozor na nepravidlne: sein (bin, bist, ist), haben (habe, hast, hat)\n\n3. **Slovna zasoba**: Zameraj sa na temy:\n   - Skola, rodina, jedlo, zvierata, farby, cisla\n\nChces precvicit nejaku konkretnu temu?",
	},
	{
		patterns: [/ahoj/i, /hello/i, /cau/i, /zdravim/i, /hey/i],
		response:
			"Ahoj! Rad ta vidim! Ako ti mozem dnes pomoct? Mozem ti vysvetlit matematiku, slovencinu, alebo ti dat nejake tipy na ucenie.",
	},
	{
		patterns: [/dak/i, /vdaka/i, /thank/i],
		response:
			"Nie je za co! Ked budes potrebovat pomoct, kludne sa pytaj. Ucenie je maraton, nie sprint - a ty to zvladnes!",
	},
];

const defaultResponse =
	"Hmm, na toto teraz neviem presne odpovedat, ale skus sa opytat konkretnejsie na:\n\n- Zlomky alebo percenta\n- Vybrane slova\n- Slovne druhy\n- Geometriu\n- Nemcinu (cleny, slovesa, slovicka)\n- Tipy na ucenie\n\nAlebo pouzi tlacidla s navrhmi nizsie!";

function getBotResponse(userMessage: string): string {
	for (const entry of botResponses) {
		if (entry.patterns.some((p) => p.test(userMessage))) {
			return entry.response;
		}
	}
	return defaultResponse;
}

export default function ChatPage() {
	const navigate = useNavigate();

	const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, isTyping, scrollToBottom]);

	const sendMessage = useCallback(
		(text: string) => {
			if (!text.trim()) return;

			const userMsg: ChatMessage = {
				id: `user-${Date.now()}`,
				role: "user",
				content: text.trim(),
				timestamp: new Date().toISOString(),
			};

			setMessages((prev) => [...prev, userMsg]);
			setInput("");
			setIsTyping(true);

			// Simulate bot thinking
			const delay = 800 + Math.random() * 1200;
			setTimeout(() => {
				const response = getBotResponse(text);
				const botMsg: ChatMessage = {
					id: `bot-${Date.now()}`,
					role: "assistant",
					content: response,
					timestamp: new Date().toISOString(),
				};
				setMessages((prev) => [...prev, botMsg]);
				setIsTyping(false);
			}, delay);
		},
		[],
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		sendMessage(input);
	};

	const handleSuggestion = (suggestion: string) => {
		sendMessage(suggestion);
	};

	// Typing indicator message
	const typingMessage: ChatMessage = {
		id: "typing",
		role: "assistant",
		content: "",
		timestamp: new Date().toISOString(),
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
			{/* Chat header */}
			<div className="border-b border-gray-200 bg-white px-4 py-3">
				<div className="mx-auto max-w-2xl flex items-center gap-3">
					<button
						type="button"
						onClick={() => navigate("/dashboard")}
						className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer sm:hidden"
					>
						<ArrowLeft className="h-4 w-4" />
					</button>
					<div className="flex items-center gap-3">
						<div className="relative">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
								<Bot className="h-5 w-5 text-white" />
							</div>
							<div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-white" />
						</div>
						<div>
							<h2 className="text-sm font-extrabold text-gray-800">
								AI Mentor
							</h2>
							<p className="text-xs text-green-500 font-medium">
								Online
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Messages area */}
			<div className="flex-1 overflow-y-auto px-4 py-4">
				<div className="mx-auto max-w-2xl space-y-4">
					{/* AI intro card */}
					<div className="flex justify-center mb-4">
						<div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 px-4 py-3 text-center max-w-sm">
							<div className="flex items-center justify-center gap-1 mb-1">
								<Sparkles className="h-4 w-4 text-emerald-500" />
								<span className="text-xs font-bold text-emerald-600">
									AI Mentor Chat
								</span>
							</div>
							<p className="text-xs text-gray-500">
								Opytaj sa ma na cokolvek o matematike alebo slovencine
							</p>
						</div>
					</div>

					{/* Chat messages */}
					{messages.map((msg) => (
						<ChatBubble key={msg.id} message={msg} />
					))}

					{/* Typing indicator */}
					{isTyping && (
						<ChatBubble message={typingMessage} isTyping />
					)}

					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Quick suggestions */}
			{messages.length <= 2 && (
				<div className="border-t border-gray-100 bg-white px-4 py-3">
					<div className="mx-auto max-w-2xl">
						<p className="text-xs font-bold text-gray-400 mb-2">
							Navrhované otazky:
						</p>
						<div className="flex flex-wrap gap-2">
							{quickSuggestions.map((suggestion) => (
								<button
									key={suggestion}
									type="button"
									onClick={() =>
										handleSuggestion(suggestion)
									}
									className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-100 hover:border-purple-300 transition-colors cursor-pointer"
								>
									{suggestion}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Input area */}
			<div className="border-t border-gray-200 bg-white px-4 py-3">
				<form
					onSubmit={handleSubmit}
					className="mx-auto max-w-2xl flex items-center gap-3"
				>
					<div className="flex-1 relative">
						<input
							ref={inputRef}
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Napíš správu..."
							className="w-full rounded-2xl bg-gray-100 border-none px-4 py-3 pr-12 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all"
							disabled={isTyping}
						/>
						<div className="absolute right-2 top-1/2 -translate-y-1/2">
							<MessageCircle className="h-4 w-4 text-gray-300" />
						</div>
					</div>
					<button
						type="submit"
						disabled={!input.trim() || isTyping}
						className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all border-none cursor-pointer ${
							input.trim() && !isTyping
								? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
					>
						<Send className="h-5 w-5" />
					</button>
				</form>
			</div>
		</div>
	);
}
