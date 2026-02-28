import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, LogIn, UserPlus, Mail, Lock, User } from "lucide-react";
import { signIn, register } from "../firebase/auth";
import { isConfigured } from "../firebase/config";
import { createUserDoc } from "../firebase/userRole";

export default function LoginPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"login" | "register">("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (mode === "register") {
			if (!name.trim()) {
				setError("Zadaj meno");
				return;
			}
			if (password.length < 6) {
				setError("Heslo musí mať aspoň 6 znakov");
				return;
			}
			if (password !== confirmPassword) {
				setError("Heslá sa nezhodujú");
				return;
			}
		}

		setLoading(true);

		try {
			if (mode === "register") {
				const firebaseUser = await register(email, password, name.trim());
				await createUserDoc(firebaseUser.uid, email, name.trim());
			} else {
				await signIn(email, password);
			}
			// AuthContext will detect the role and ProtectedRoute/PublicOnlyRoute handles redirect
			navigate("/role-select");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "";
			if (msg.includes("invalid-credential") || msg.includes("wrong-password")) {
				setError("Nesprávny e-mail alebo heslo");
			} else if (msg.includes("user-not-found")) {
				setError("Účet neexistuje");
			} else if (msg.includes("email-already-in-use")) {
				setError("Tento e-mail je už registrovaný");
			} else if (msg.includes("weak-password")) {
				setError("Heslo je príliš slabé (min. 6 znakov)");
			} else if (msg.includes("invalid-email")) {
				setError("Neplatný e-mail");
			} else if (msg.includes("not configured")) {
				setError("Firebase nie je nakonfigurovaný");
			} else {
				setError(mode === "register" ? "Registrácia zlyhala. Skús to znova." : "Prihlásenie zlyhalo. Skús to znova.");
			}
		} finally {
			setLoading(false);
		}
	};

	const switchMode = () => {
		setMode(mode === "login" ? "register" : "login");
		setError("");
	};

	if (!isConfigured) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center px-4">
				<div className="w-full max-w-sm rounded-3xl bg-white shadow-xl border border-gray-100 p-8 text-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-4">
						<Lock className="h-8 w-8 text-gray-400" />
					</div>
					<h1 className="text-xl font-extrabold text-gray-800 mb-2">
						Prihlásenie nedostupné
					</h1>
					<p className="text-sm text-gray-500 mb-6">
						Firebase nie je nakonfigurovaný. Aplikácia vyžaduje prihlásenie.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center px-4">
			<div className="w-full max-w-sm">
				<div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
					{/* Header */}
					<div className="flex flex-col items-center mb-6">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg mb-4">
							<GraduationCap className="h-8 w-8 text-white" />
						</div>
						<h1 className="text-2xl font-extrabold text-gray-800">
							{mode === "login" ? "Prihlásiť sa" : "Registrácia"}
						</h1>
						<p className="text-sm text-gray-400 mt-1">
							{mode === "login"
								? "Prihlás sa do AI Mentora"
								: "Vytvor si účet pre ukladanie pokroku"}
						</p>
					</div>

					{/* Mode toggle */}
					<div className="flex rounded-xl bg-gray-100 p-1 mb-6">
						<button
							type="button"
							onClick={() => switchMode()}
							className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all border-none cursor-pointer ${
								mode === "login"
									? "bg-white text-gray-800 shadow-sm"
									: "bg-transparent text-gray-400 hover:text-gray-600"
							}`}
						>
							Prihlásenie
						</button>
						<button
							type="button"
							onClick={() => switchMode()}
							className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all border-none cursor-pointer ${
								mode === "register"
									? "bg-white text-gray-800 shadow-sm"
									: "bg-transparent text-gray-400 hover:text-gray-600"
							}`}
						>
							Registrácia
						</button>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						{mode === "register" && (
							<div>
								<label className="text-sm font-bold text-gray-600 mb-1 block">
									Meno
								</label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Tvoje meno"
										required
										className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
									/>
								</div>
							</div>
						)}

						<div>
							<label className="text-sm font-bold text-gray-600 mb-1 block">
								E-mail
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="tvoj@email.sk"
									required
									className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
								/>
							</div>
						</div>

						<div>
							<label className="text-sm font-bold text-gray-600 mb-1 block">
								Heslo
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder={mode === "register" ? "Min. 6 znakov" : "Tvoje heslo"}
									required
									className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
								/>
							</div>
						</div>

						{mode === "register" && (
							<div>
								<label className="text-sm font-bold text-gray-600 mb-1 block">
									Potvrdiť heslo
								</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="Zopakuj heslo"
										required
										className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
									/>
								</div>
							</div>
						)}

						{error && (
							<div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-medium text-red-600">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 font-bold text-white shadow-lg shadow-purple-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
						>
							{mode === "login" ? (
								<>
									<LogIn className="h-5 w-5" />
									{loading ? "Prihlasujem..." : "Prihlásiť sa"}
								</>
							) : (
								<>
									<UserPlus className="h-5 w-5" />
									{loading ? "Registrujem..." : "Vytvoriť účet"}
								</>
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
