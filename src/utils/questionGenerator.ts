/**
 * Smart Randomized Question Generator
 *
 * Rules:
 * - 5th grade (8-rocne): Simple fractions only (result = whole number or simple fraction). NO percentages. NO decimals.
 * - 9th grade (4-rocne & bilingvalne): All fractions + percentages with WHOLE NUMBER results only. NO decimals.
 * - Triangle area: base OR height must be even → whole number result
 * - All questions type: "multiple-choice" with 4 options
 */

import type { ExamType, Question, Subject } from "../types";

let questionCounter = 0;

function uid(): string {
	questionCounter++;
	return `q-${Date.now()}-${questionCounter}`;
}

function randInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function pickRandom<T>(arr: T[]): T {
	return arr[randInt(0, arr.length - 1)];
}

// ============ HELPERS ============

function getGCD(a: number, b: number): number {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b) {
		[a, b] = [b, a % b];
	}
	return a;
}

function lcm(a: number, b: number): number {
	return (a * b) / getGCD(a, b);
}

function simplifyFraction(num: number, den: number): string {
	if (num % den === 0) return String(num / den);
	const gcd = getGCD(num, den);
	return `${num / gcd}/${den / gcd}`;
}

function generateWrongFractionAnswers(
	correct: string,
	count: number,
): string[] {
	const wrongs: string[] = [];
	const isWhole = !correct.includes("/");

	if (isWhole) {
		const n = Number(correct);
		const candidates = [n + 1, n - 1, n + 2, n * 2, Math.max(1, n - 2)];
		for (const c of candidates) {
			if (String(c) !== correct && !wrongs.includes(String(c)) && c > 0) {
				wrongs.push(String(c));
			}
			if (wrongs.length >= count) break;
		}
	} else {
		const [num, den] = correct.split("/").map(Number);
		const candidates = [
			`${num + 1}/${den}`,
			`${num}/${den + 1}`,
			`${Math.max(1, num - 1)}/${den}`,
			`${num + 2}/${den}`,
		];
		for (const c of candidates) {
			if (c !== correct && !wrongs.includes(c)) {
				wrongs.push(c);
			}
			if (wrongs.length >= count) break;
		}
	}

	while (wrongs.length < count) {
		wrongs.push(String(randInt(1, 10)));
	}

	return wrongs.slice(0, count);
}

function generateWrongWholeNumberAnswers(
	correct: number,
	count: number,
): string[] {
	const wrongs: string[] = [];
	const correctStr = String(correct);
	const candidates = [
		correct + randInt(1, 5),
		Math.max(1, correct - randInt(1, 5)),
		correct * 2,
		Math.max(1, Math.floor(correct / 2)),
		correct + 10,
		Math.max(1, correct - 10),
	];

	for (const c of candidates) {
		const s = String(c);
		if (s !== correctStr && !wrongs.includes(s) && c > 0) {
			wrongs.push(s);
		}
		if (wrongs.length >= count) break;
	}

	while (wrongs.length < count) {
		const fallback = correct + wrongs.length + 3;
		const s = String(fallback);
		if (!wrongs.includes(s) && s !== correctStr) {
			wrongs.push(s);
		}
	}

	return wrongs.slice(0, count);
}

// ============ MATH - FRACTIONS 5th Grade (8-rocne) ============

function generateFractionAddition5th(): Question {
	const den = pickRandom([2, 3, 4, 5, 6]);
	const num1 = randInt(1, den - 1);
	let num2 = den - num1;
	if (Math.random() > 0.5 && den > 2) {
		num2 = randInt(1, den - num1);
	}
	const sumNum = num1 + num2;
	const result = simplifyFraction(sumNum, den);
	const questionText = `${num1}/${den} + ${num2}/${den} = ?`;

	const wrongAnswers = generateWrongFractionAnswers(result, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType: "8-rocne",
		topic: "Zlomky",
		difficulty: 1,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `Správna odpoveď je ${result}.`,
	};
}

function generateFractionSubtraction5th(): Question {
	const den = pickRandom([2, 3, 4, 5, 6]);
	const num1 = randInt(2, den);
	const num2 = randInt(1, num1 - 1);
	const diffNum = num1 - num2;
	const result = simplifyFraction(diffNum, den);
	const questionText = `${num1}/${den} - ${num2}/${den} = ?`;

	const wrongAnswers = generateWrongFractionAnswers(result, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType: "8-rocne",
		topic: "Zlomky",
		difficulty: 1,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `Správna odpoveď je ${result}.`,
	};
}

function generateFractionMultiplication5th(): Question {
	const whole = randInt(2, 5);
	const den = pickRandom([2, 3, 4, 5]);
	const resNum = whole;
	const result = simplifyFraction(resNum, den);
	const questionText = `${whole} × 1/${den} = ?`;

	const wrongAnswers = generateWrongFractionAnswers(result, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType: "8-rocne",
		topic: "Zlomky",
		difficulty: 1,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `${whole} × 1/${den} = ${whole}/${den} = ${result}`,
	};
}

// ============ MATH - FRACTIONS 9th Grade (4-rocne / bilingvalne) ============

function generateFractionAddition9th(): Question {
	const den1 = pickRandom([2, 3, 4, 5, 6, 8]);
	const den2 = pickRandom([2, 3, 4, 5, 6, 8]);
	const num1 = randInt(1, den1 - 1);
	const num2 = randInt(1, den2 - 1);

	const commonDen = lcm(den1, den2);
	const sumNum = num1 * (commonDen / den1) + num2 * (commonDen / den2);
	const result = simplifyFraction(sumNum, commonDen);

	const questionText = `${num1}/${den1} + ${num2}/${den2} = ?`;
	const wrongAnswers = generateWrongFractionAnswers(result, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType: "4-rocne",
		topic: "Zlomky",
		difficulty: 2,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `Spoločný menovateľ ${commonDen}. Výsledok je ${result}.`,
	};
}

function generateFractionSubtraction9th(): Question {
	const den1 = pickRandom([3, 4, 5, 6, 8, 10]);
	const den2 = pickRandom([3, 4, 5, 6, 8, 10]);
	const num1 = randInt(2, den1);
	const num2 = randInt(1, den2 - 1);

	const commonDen = lcm(den1, den2);
	const newNum1 = num1 * (commonDen / den1);
	const newNum2 = num2 * (commonDen / den2);

	if (newNum1 <= newNum2) {
		return generateFractionSubtraction9th();
	}

	const diffNum = newNum1 - newNum2;
	const result = simplifyFraction(diffNum, commonDen);

	const questionText = `${num1}/${den1} - ${num2}/${den2} = ?`;
	const wrongAnswers = generateWrongFractionAnswers(result, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType: "4-rocne",
		topic: "Zlomky",
		difficulty: 2,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `Spoločný menovateľ ${commonDen}. ${newNum1}/${commonDen} - ${newNum2}/${commonDen} = ${result}.`,
	};
}

function generateFractionMultiplication9th(): Question {
	const c1 = randInt(1, 5);
	const m1 = randInt(2, 8);
	const c2 = randInt(1, 5);
	const m2 = randInt(2, 8);

	const resultC = c1 * c2;
	const resultM = m1 * m2;
	const result = simplifyFraction(resultC, resultM);

	const questionText = `${c1}/${m1} × ${c2}/${m2} = ?`;
	const wrongAnswers = generateWrongFractionAnswers(result, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType: "4-rocne",
		topic: "Zlomky",
		difficulty: 2,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `Čitatele: ${c1} × ${c2} = ${resultC}. Menovatele: ${m1} × ${m2} = ${resultM}. Výsledok: ${result}.`,
	};
}

// ============ MATH - PERCENTAGES (9th grade only) ============

function generatePercentageBasic(): Question {
	const percentages = [10, 20, 25, 50, 75];
	const pct = pickRandom(percentages);
	const correctBase = Math.round((100 / pct) * randInt(1, 10));
	const answer = (pct * correctBase) / 100;

	const questionText = `Koľko je ${pct}% z ${correctBase}?`;
	const result = String(answer);

	const wrongAnswers = generateWrongWholeNumberAnswers(answer, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType: "4-rocne",
		topic: "Percentá",
		difficulty: 2,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `${pct}% z ${correctBase} = ${pct}/100 × ${correctBase} = ${answer}`,
	};
}

function generatePercentageDiscount(): Question {
	const zlavaPercent = pickRandom([10, 20, 25, 30, 40, 50]);
	// Pick price divisible by (100/zlavaPercent) so discount is whole
	const multiplier = randInt(2, 10);
	const cena = multiplier * (100 / getGCD(zlavaPercent, 100));
	const zlavaEur = (cena * zlavaPercent) / 100;
	const novaCena = cena - zlavaEur;

	const questionText = `Tovar stojí ${cena}€. Zľava je ${zlavaPercent}%. Koľko zaplatíš?`;
	const result = String(novaCena);

	const wrongAnswers = generateWrongWholeNumberAnswers(novaCena, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType: "4-rocne",
		topic: "Percentá",
		difficulty: 2,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `Zľava: ${zlavaPercent}% z ${cena}€ = ${zlavaEur}€. Nová cena: ${cena}€ - ${zlavaEur}€ = ${novaCena}€.`,
	};
}

function generatePercentageIncrease(): Question {
	// Ensure whole number percentage: rozdiel/povodna * 100 must be whole
	const povodna = pickRandom([50, 100, 150, 200, 250, 300, 400, 500]);
	const percentNarast = pickRandom([10, 20, 25, 50, 75, 100]);
	const rozdiel = (povodna * percentNarast) / 100;
	const nova = povodna + rozdiel;

	const questionText = `Cena vzrástla z ${povodna}€ na ${nova}€. O koľko percent?`;
	const result = String(percentNarast);

	const wrongAnswers = generateWrongWholeNumberAnswers(percentNarast, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType: "4-rocne",
		topic: "Percentá",
		difficulty: 3,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `Rozdiel: ${nova}€ - ${povodna}€ = ${rozdiel}€. Percento: (${rozdiel}/${povodna}) × 100 = ${percentNarast}%.`,
	};
}

// ============ MATH - GEOMETRY ============

function generateGeometryRectPerimeter(examType: ExamType): Question {
	const is5th = examType === "8-rocne";
	const a = is5th ? randInt(3, 15) : randInt(5, 25);
	const b = is5th ? randInt(2, 10) : randInt(3, 20);
	const obvod = 2 * (a + b);

	const questionText = `Obdĺžnik: a = ${a} cm, b = ${b} cm. Aký je obvod?`;
	const result = String(obvod);

	const wrongAnswers = generateWrongWholeNumberAnswers(obvod, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType,
		topic: "Geometria",
		difficulty: is5th ? 1 : 2,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `O = 2 × (a + b) = 2 × (${a} + ${b}) = 2 × ${a + b} = ${obvod} cm`,
	};
}

function generateGeometryRectArea(examType: ExamType): Question {
	const is5th = examType === "8-rocne";
	const a = is5th ? randInt(3, 12) : randInt(4, 25);
	const b = is5th ? randInt(2, 10) : randInt(3, 20);
	const obsah = a * b;

	const questionText = `Obdĺžnik: a = ${a} cm, b = ${b} cm. Aký je obsah?`;
	const result = String(obsah);

	const wrongAnswers = generateWrongWholeNumberAnswers(obsah, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType,
		topic: "Geometria",
		difficulty: is5th ? 1 : 2,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `S = a × b = ${a} × ${b} = ${obsah} cm²`,
	};
}

function generateGeometrySquarePerimeter(examType: ExamType): Question {
	const is5th = examType === "8-rocne";
	const strana = is5th ? randInt(2, 12) : randInt(3, 20);
	const obvod = 4 * strana;

	const questionText = `Štvorec so stranou ${strana} cm. Aký je obvod?`;
	const result = String(obvod);

	const wrongAnswers = generateWrongWholeNumberAnswers(obvod, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType,
		topic: "Geometria",
		difficulty: is5th ? 1 : 2,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `O = 4 × strana = 4 × ${strana} = ${obvod} cm`,
	};
}

function generateGeometryTriangleArea(examType: ExamType): Question {
	const is5th = examType === "8-rocne";
	// Ensure base OR height is even so result is whole number
	let zaklad = is5th ? randInt(3, 15) : randInt(4, 20);
	const vyska = is5th ? randInt(2, 12) : randInt(3, 18);
	if (zaklad % 2 !== 0 && vyska % 2 !== 0) {
		zaklad = zaklad + 1;
	}
	const obsah = (zaklad * vyska) / 2;

	const questionText = `Trojuholník: základňa = ${zaklad} cm, výška = ${vyska} cm. Aký je obsah?`;
	const result = String(obsah);

	const wrongAnswers = generateWrongWholeNumberAnswers(obsah, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType,
		topic: "Geometria",
		difficulty: is5th ? 1 : 2,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `S = (a × v) / 2 = (${zaklad} × ${vyska}) / 2 = ${zaklad * vyska} / 2 = ${obsah} cm²`,
	};
}

// ============ MATH - WORD PROBLEMS ============

function generateWordProblemMultiplication(examType: ExamType): Question {
	const is5th = examType === "8-rocne";
	const cena = is5th ? randInt(2, 20) : randInt(5, 50);
	const pocet = is5th ? randInt(3, 10) : randInt(3, 20);
	const vysledok = cena * pocet;
	const predmet = pickRandom([
		"kníh",
		"pier",
		"zošitov",
		"ceruziek",
		"jablk",
	]);

	const questionText = `Jeden kus stojí ${cena}€. Koľko stojí ${pocet} ${predmet}?`;
	const result = String(vysledok);

	const wrongAnswers = generateWrongWholeNumberAnswers(vysledok, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType,
		topic: "Slovné úlohy",
		difficulty: 1,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `${cena}€ × ${pocet} = ${vysledok}€`,
	};
}

function generateWordProblemSubtraction(examType: ExamType): Question {
	const is5th = examType === "8-rocne";
	const mam = is5th ? randInt(20, 100) : randInt(50, 500);
	const kupim = randInt(10, mam - 10);
	const ostane = mam - kupim;

	const questionText = `Mám ${mam}€. Kúpim si vec za ${kupim}€. Koľko mi ostane?`;
	const result = String(ostane);

	const wrongAnswers = generateWrongWholeNumberAnswers(ostane, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType,
		topic: "Slovné úlohy",
		difficulty: 1,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `${mam}€ - ${kupim}€ = ${ostane}€`,
	};
}

function generateWordProblemFraction(examType: ExamType): Question {
	const zlomok = pickRandom([2, 3, 4, 5, 6]);
	const celkom = zlomok * randInt(3, 12); // divisible → whole number
	const vysledok = celkom / zlomok;
	const nazov = pickRandom(["žiakov", "jabĺk", "cukríkov", "detí", "kníh"]);

	const questionText = `Je tu ${celkom} ${nazov}. 1/${zlomok} sú chlapci. Koľko je chlapcov?`;
	const result = String(vysledok);

	const wrongAnswers = generateWrongWholeNumberAnswers(vysledok, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType,
		topic: "Slovné úlohy",
		difficulty: 2,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `1/${zlomok} z ${celkom} = ${celkom} ÷ ${zlomok} = ${vysledok}`,
	};
}

function generateWordProblemXTimesMore(examType: ExamType): Question {
	const krat = randInt(2, 5);
	const delitel = 1 + krat;
	const x = randInt(3, 15);
	const spolu = x * delitel;
	const druhy = x * krat;

	const mena = pickRandom([
		["Peter", "Jana"],
		["Matej", "Lucia"],
		["Adam", "Eva"],
		["Tom", "Anna"],
	]);

	const questionText = `${mena[0]} má ${krat}× viac jabĺk ako ${mena[1]}. Spolu majú ${spolu}. Koľko má ${mena[1]}?`;
	const result = String(x);

	const wrongAnswers = generateWrongWholeNumberAnswers(x, 3);
	const options = shuffle([result, ...wrongAnswers]);

	return {
		id: uid(),
		subject: "math",
		examType,
		topic: "Slovné úlohy",
		difficulty: 3,
		type: "multiple-choice",
		question: questionText,
		options,
		correctAnswer: result,
		explanation: `${mena[1]} = x, ${mena[0]} = ${krat}x. Rovnica: x + ${krat}x = ${spolu} → ${delitel}x = ${spolu} → x = ${x}. ${mena[0]} má ${druhy}.`,
	};
}

// ============ SLOVAK LANGUAGE - STATIC BANK ============

const slovakStaticQuestions: Omit<Question, "id">[] = [
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Vybrané slová",
		difficulty: 1,
		type: "multiple-choice",
		question: "Ktoré slovo je napísané správne?",
		options: ["bíť", "biť", "byť", "býť"],
		correctAnswer: "byť",
		explanation:
			"Slovo 'byť' (existovať) sa píše s 'y'. 'Biť' (udierať) sa píše s 'i'.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Vybrané slová",
		difficulty: 1,
		type: "multiple-choice",
		question: "Doplň správne: V_soký strom rastie v lese.",
		options: ["i", "y"],
		correctAnswer: "y",
		explanation: "Vysoký - vybrané slovo po V, píšeme 'y'.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Podstatné mená",
		difficulty: 1,
		type: "multiple-choice",
		question: "Aký rod má slovo 'slnko'?",
		options: ["mužský", "ženský", "stredný"],
		correctAnswer: "stredný",
		explanation: "Slnko - to slnko - stredný rod.",
	},
	{
		subject: "slovak",
		examType: "4-rocne",
		topic: "Literatúra",
		difficulty: 2,
		type: "multiple-choice",
		question: "Kto napísal dielo 'Mort na Dunaji'?",
		options: [
			"Pavol Országh Hviezdoslav",
			"Samo Chalupka",
			"Ján Botto",
			"Andrej Sládkovič",
		],
		correctAnswer: "Samo Chalupka",
		explanation:
			"Samo Chalupka je autorom básne 'Mor ho!' (Mort na Dunaji je ľudový názov).",
	},
	{
		subject: "slovak",
		examType: "4-rocne",
		topic: "Gramatika",
		difficulty: 2,
		type: "multiple-choice",
		question: "Ktorá veta obsahuje príslovkové určenie miesta?",
		options: [
			"Včera pršalo.",
			"Deti sa hrali vonku.",
			"Bežal veľmi rýchlo.",
			"Prišiel kvôli mne.",
		],
		correctAnswer: "Deti sa hrali vonku.",
		explanation:
			"'Vonku' je príslovkové určenie miesta - odpovedá na otázku 'kde?'",
	},
	{
		subject: "slovak",
		examType: "4-rocne",
		topic: "Pravopis",
		difficulty: 2,
		type: "multiple-choice",
		question: "V ktorom slove je dlhá samohláska?",
		options: ["dom", "les", "múr", "pes"],
		correctAnswer: "múr",
		explanation: "Múr obsahuje dlhé 'ú'.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Vybrané slová",
		difficulty: 1,
		type: "multiple-choice",
		question: "Doplň i/y: S_n mi dnes pomáhal.",
		options: ["i", "y"],
		correctAnswer: "y",
		explanation: "Syn - vybrané slovo po S, píšeme 'y'.",
	},
	// === From: Polročné opakovanie + prijímacie skúšky worksheets ===
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Spodobovanie",
		difficulty: 2,
		type: "multiple-choice",
		question: "V ktorej možnosti nedochádza k spodobovaniu?",
		options: [
			"stavba, všetko, keď",
			"ťažký, sladký, podpísali",
			"s hĺbkou, dážď, hlad",
			"v závere, zo snehu, z okolia",
		],
		correctAnswer: "v závere, zo snehu, z okolia",
		explanation: "V, zo, z sú predložky viažuce sa k nasledujúcemu slovu – tu nedochádza k spodobovaniu.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Pády",
		difficulty: 2,
		type: "multiple-choice",
		question: "V ktorej možnosti sú všetky podstatné mená v rovnakom páde?",
		options: [
			"po ceste, o programe, na stole",
			"pred školou, pred otca, pred jedlom",
			"na tvári, na lavicu, nad príkladom",
			"cez pole, vedľa parku, s autorom",
		],
		correctAnswer: "po ceste, o programe, na stole",
		explanation: "Všetky tri sú v lokáli (6. pád) – o kom/čom?",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Literatúra",
		difficulty: 1,
		type: "multiple-choice",
		question: "V ktorej možnosti je prirovnanie?",
		options: [
			"Oko za oko, zub za zub.",
			"Chodí po byte ako mátoha.",
			"Povedz, ako sa voláš?",
			"Hovoril, ako sa v meste stratil.",
		],
		correctAnswer: "Chodí po byte ako mátoha.",
		explanation: "Prirovnanie – porovnanie pomocou 'ako' (chodí AKO mátoha).",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Literatúra",
		difficulty: 1,
		type: "multiple-choice",
		question: "SMS je:",
		options: ["pozdrav", "oznámenie", "správa", "diskusia"],
		correctAnswer: "správa",
		explanation: "SMS = Short Message Service = krátka textová správa.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Literatúra",
		difficulty: 2,
		type: "multiple-choice",
		question: "K žánrom ľudovej slovesnosti nepatria:",
		options: [
			"prirovnania, zdrobneniny",
			"príslovia, porekadlá",
			"ľudové piesne, pranostiky",
			"ľudové rozprávky, hádanky",
		],
		correctAnswer: "prirovnania, zdrobneniny",
		explanation: "Prirovnania a zdrobneniny sú umelecké prostriedky, nie žánre ľudovej slovesnosti.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Gramatika",
		difficulty: 2,
		type: "multiple-choice",
		question: "Označ nesprávnu dvojicu:",
		options: [
			"tri = základná číslovka",
			"ony = privlastňovacie zámeno",
			"tretím = radová číslovka",
			"my = osobné zámeno",
		],
		correctAnswer: "ony = privlastňovacie zámeno",
		explanation: "'Ony' je osobné základné zámeno (3. os. pl. ženský rod), nie privlastňovacie.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Literatúra",
		difficulty: 1,
		type: "multiple-choice",
		question: "Označ možnosť, v ktorej slovo nepatrí do radu: verš, strofa, rým, poézia / porekadlo, príslovie, pranostika, hádanka / básnik, strofa, rým, próza",
		options: [
			"verš, strofa, rým, poézia",
			"porekadlo, príslovie, pranostika, hádanka",
			"časopisy, noviny, denníky, tlač",
			"básnik, strofa, rým, próza",
		],
		correctAnswer: "básnik, strofa, rým, próza",
		explanation: "Próza nepatrí do radu – ostatné súvisia s poéziou. Básnik píše básne (poéziu), nie prózu.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Gramatika",
		difficulty: 2,
		type: "multiple-choice",
		question: "Čo je synonymum?",
		options: [
			"slovo s rovnakým významom",
			"slovo s opačným významom",
			"slovo s viacerými významami",
			"slovo prevzaté z cudzieho jazyka",
		],
		correctAnswer: "slovo s rovnakým významom",
		explanation: "Synonymum = slovo s rovnakým alebo podobným významom (napr. dom – budova).",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Gramatika",
		difficulty: 2,
		type: "multiple-choice",
		question: "Čo je antonymum?",
		options: [
			"slovo s rovnakým významom",
			"slovo s opačným významom",
			"slovo s viacerými významami",
			"slovo odvodené predponou",
		],
		correctAnswer: "slovo s opačným významom",
		explanation: "Antonymum = slovo s opačným významom (napr. veľký – malý).",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Gramatika",
		difficulty: 1,
		type: "multiple-choice",
		question: "Ktoré slovo je mnohoznačné (má viac významov)?",
		options: ["koruna", "Bratislava", "ceruzka", "zošit"],
		correctAnswer: "koruna",
		explanation: "Koruna – 1. na hlave kráľa, 2. mena, 3. koruna stromu → mnohoznačné slovo.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Gramatika",
		difficulty: 2,
		type: "multiple-choice",
		question: "Čo je pranostika?",
		options: [
			"krátky výrok o počasí podľa skúseností",
			"porovnanie pomocou 'ako'",
			"krátky príbeh s poučením",
			"krátke múdre porekadlo",
		],
		correctAnswer: "krátky výrok o počasí podľa skúseností",
		explanation: "Pranostika – ľudová predpoveď počasia (napr. 'Medardova kvapka – 40 dní kvapká').",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Gramatika",
		difficulty: 2,
		type: "multiple-choice",
		question: "Aký je rozdiel medzi príslovím a porekadlom?",
		options: [
			"príslovie poúča, porekadlo len konštatuje",
			"porekadlo poúča, príslovie len konštatuje",
			"sú to synonymá",
			"príslovie je o počasí",
		],
		correctAnswer: "príslovie poúča, porekadlo len konštatuje",
		explanation: "Príslovie má poučný charakter (napr. 'Kto druhému jamu kope...'). Porekadlo len konštatuje.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Spodobovanie",
		difficulty: 2,
		type: "multiple-choice",
		question: "Ktoré spoluhlásky sú znelé párové?",
		options: [
			"b, d, ď, g, dz, dž, z, ž, h, v",
			"p, t, ť, k, c, č, s, š, ch, f",
			"m, n, ň, l, ľ, r, j",
			"a, e, i, o, u",
		],
		correctAnswer: "b, d, ď, g, dz, dž, z, ž, h, v",
		explanation: "Znelé párové spoluhlásky: b-p, d-t, ď-ť, g-k, dz-c, dž-č, z-s, ž-š, h-ch, v-f.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Gramatika",
		difficulty: 1,
		type: "multiple-choice",
		question: "Ktoré slabikotvorné spoluhlásky poznáme v slovenčine?",
		options: ["r, ŕ, l, ĺ", "m, n, ň", "b, d, g", "s, z, c"],
		correctAnswer: "r, ŕ, l, ĺ",
		explanation: "Slabikotvorné spoluhlásky tvoria slabiku bez samohlásky (napr. prst, vlk, vŕba, stĺp).",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Vzory",
		difficulty: 2,
		type: "multiple-choice",
		question: "Podstatné meno 'dážď' patrí pod vzor:",
		options: ["stroj", "dub", "chlap", "hrdina"],
		correctAnswer: "stroj",
		explanation: "Dážď – mužský rod neživotný, zakončenie na mäkkú spoluhlásku ď → vzor stroj.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Vzory",
		difficulty: 2,
		type: "multiple-choice",
		question: "Podstatné meno 'hokejista' patrí pod vzor:",
		options: ["hrdina", "chlap", "dub", "žena"],
		correctAnswer: "hrdina",
		explanation: "Hokejista – mužský rod životný, zakončenie na -a → vzor hrdina.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Vzory",
		difficulty: 2,
		type: "multiple-choice",
		question: "Podstatné meno 'nemocnica' patrí pod vzor:",
		options: ["ulica", "žena", "kosť", "dlaň"],
		correctAnswer: "ulica",
		explanation: "Nemocnica – ženský rod, zakončenie na -ica → vzor ulica.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Vzory",
		difficulty: 2,
		type: "multiple-choice",
		question: "Podstatné meno 'báseň' patrí pod vzor:",
		options: ["dlaň", "kosť", "žena", "ulica"],
		correctAnswer: "dlaň",
		explanation: "Báseň – ženský rod, zakončenie na -eň → vzor dlaň.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Prídavné mená",
		difficulty: 2,
		type: "multiple-choice",
		question: "Ktoré prídavné meno je vzťahové (nedá sa stupňovať)?",
		options: ["drevený", "pekný", "veľký", "rýchly"],
		correctAnswer: "drevený",
		explanation: "Drevený – vzťahové (vyjadruje vzťah k materiálu). Nedá sa povedať 'drevenejší'.",
	},
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Prídavné mená",
		difficulty: 2,
		type: "multiple-choice",
		question: "Aký je 2. stupeň prídavného mena 'dobrý'?",
		options: ["lepší", "dobrší", "najlepší", "najdobrší"],
		correctAnswer: "lepší",
		explanation: "Dobrý – lepší – najlepší (nepravidelné stupňovanie).",
	},
];

// ============ SLOVAK LANGUAGE - DYNAMIC GENERATORS ============

const SLOVNE_DRUHY_DB: Record<string, string[]> = {
	"podstatné meno": [
		"strom",
		"mama",
		"pes",
		"dom",
		"škola",
		"dieťa",
		"učiteľ",
		"ryba",
		"mesto",
		"okno",
	],
	"prídavné meno": [
		"pekný",
		"veľký",
		"malý",
		"dobrý",
		"zlý",
		"vysoký",
		"nízky",
		"rýchly",
		"pomalý",
	],
	sloveso: [
		"beží",
		"varí",
		"píše",
		"číta",
		"spí",
		"je",
		"skáče",
		"lietá",
		"plače",
		"spieva",
	],
	príslovka: [
		"rýchlo",
		"pomaly",
		"dobre",
		"zle",
		"vysoko",
		"nízko",
		"doma",
		"vonku",
		"včera",
		"zajtra",
	],
	zámeno: ["ja", "ty", "on", "ona", "my", "vy", "oni", "môj", "tvoj", "náš"],
	číslovka: ["dva", "tri", "prvý", "druhý", "päť", "desať", "sto"],
	predložka: ["v", "na", "do", "pod", "nad", "pri", "o", "za", "pred"],
	spojka: ["a", "ale", "lebo", "pretože", "keď", "aby", "že", "alebo"],
	častica: ["áno", "nie", "azda", "vari", "nech", "hádam"],
	citoslovce: ["och", "jaj", "ach", "hop", "fuj", "hurá"],
};

const SLOVNE_DRUHY_HINT: Record<string, string> = {
	"podstatné meno": "Kto? Čo?",
	"prídavné meno": "Aký? Aká? Aké?",
	sloveso: "Čo robí?",
	príslovka: "Ako? Kde? Kedy?",
	zámeno: "Zastupuje podstatné meno",
	číslovka: "Koľko? Ktorý v poradí?",
	predložka: "Stojí pred podstatným menom",
	spojka: "Spája vety alebo slová",
	častica: "Vyjadruje postoj hovorceho",
	citoslovce: "Zvukové/citové slovo",
};

function generateSlovneDruhy(examType: ExamType): Question {
	const allTypes = Object.keys(SLOVNE_DRUHY_DB);
	const typ = pickRandom(allTypes);
	const slovo = pickRandom(SLOVNE_DRUHY_DB[typ]);

	// 3 wrong answers from other types
	const wrongTypes = shuffle(allTypes.filter((t) => t !== typ)).slice(0, 3);
	const options = shuffle([typ, ...wrongTypes]);

	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Slovné druhy",
		difficulty: 1,
		type: "multiple-choice",
		question: `Urči slovný druh: "${slovo}"`,
		options,
		correctAnswer: typ,
		explanation: `"${slovo}" je ${typ}. Otázka: ${SLOVNE_DRUHY_HINT[typ]}.`,
	};
}

const VZORY_DB: Record<string, string[]> = {
	chlap: [
		"otec", "učiteľ", "kamarát", "sused", "pes", "chatár", "syn",
		"lekár", "rozhodca", "vojak", "Turek", "plavec",
	],
	hrdina: [
		"hokejista", "tenista", "sudca", "huslista", "predseda",
		"kolega", "ochránca", "hrdina",
	],
	dub: [
		"strom", "dom", "stôl", "telefón", "počítač", "autobus",
		"sneh", "mráz", "hrad", "dážď", "papier", "obraz",
		"betlehem", "park", "zákon",
	],
	stroj: [
		"nôž", "kôš", "čaj", "meč", "diel", "cieľ",
		"hotel", "likér", "koberec",
	],
	žena: [
		"mama", "ryba", "škola", "trieda", "cesta", "voda",
		"tráva", "hĺbka", "chata", "lopata", "žena", "mapa",
	],
	ulica: [
		"stanica", "ulica", "práca", "lavica", "pesnička",
		"nemocnica", "učebnica", "šatňa",
	],
	dlaň: [
		"pieseň", "báseň", "loď", "obuv", "mrkva", "päsť",
		"jedáleň", "skriňa", "knedľa",
	],
	kosť: ["myš", "radosť", "mladosť", "bolesť", "súčasť", "sladkosť"],
	mesto: ["okno", "selo", "pero", "slovo", "číslo", "miesto"],
	srdce: ["more", "pole", "slnce", "srdce"],
	vysvedčenie: ["lístie", "prítmie", "námestie", "učenie"],
	dievča: ["dieťa", "mláďa", "zviera", "kura", "mačiatko"],
};

const VZORY_HINT: Record<string, string> = {
	chlap: "mužský rod životný, zakončenie na spoluhlásku",
	hrdina: "mužský rod životný, zakončenie na -a",
	dub: "mužský rod neživotný, tvrdá/obojaká spoluhláska",
	stroj: "mužský rod neživotný, mäkká spoluhláska",
	žena: "ženský rod, zakončenie na -a",
	ulica: "ženský rod, zakončenie na -ica/-a (mäkká)",
	dlaň: "ženský rod, zakončenie na -ň/-ľ/-v/-eň",
	kosť: "ženský rod, zakončenie na -sť/-osť",
	mesto: "stredný rod, zakončenie na -o",
	srdce: "stredný rod, zakončenie na -e",
	vysvedčenie: "stredný rod, zakončenie na -ie",
	dievča: "stredný rod, zakončenie na -a/-ä",
};

function generateVzory(examType: ExamType): Question {
	const allVzory = Object.keys(VZORY_DB);
	const vzor = pickRandom(allVzory);
	const slovo = pickRandom(VZORY_DB[vzor]);

	const wrongVzory = shuffle(allVzory.filter((v) => v !== vzor)).slice(0, 3);
	const options = shuffle([vzor, ...wrongVzory]);

	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Vzory",
		difficulty: 2,
		type: "multiple-choice",
		question: `Urči vzor podstatného mena: "${slovo}"`,
		options,
		correctAnswer: vzor,
		explanation: `"${slovo}" patrí pod vzor "${vzor}" (${VZORY_HINT[vzor]}).`,
	};
}

const PADY_DB: Record<string, Record<string, string>> = {
	mama: {
		genitív: "mamy",
		datív: "mame",
		akuzatív: "mamu",
		lokál: "mame",
		inštrumentál: "mamou",
	},
	žena: {
		genitív: "ženy",
		datív: "žene",
		akuzatív: "ženu",
		lokál: "žene",
		inštrumentál: "ženou",
	},
	otec: {
		genitív: "otca",
		datív: "otcovi",
		akuzatív: "otca",
		lokál: "otcovi",
		inštrumentál: "otcom",
	},
	chlap: {
		genitív: "chlapa",
		datív: "chlapovi",
		akuzatív: "chlapa",
		lokál: "chlapovi",
		inštrumentál: "chlapom",
	},
	dom: {
		genitív: "domu",
		datív: "domu",
		akuzatív: "dom",
		lokál: "dome",
		inštrumentál: "domom",
	},
	škola: {
		genitív: "školy",
		datív: "škole",
		akuzatív: "školu",
		lokál: "škole",
		inštrumentál: "školou",
	},
};

const PADY_INFO = [
	{ pad: "genitív", otazka: "Koho? Čoho?", cislo: "2. pád" },
	{ pad: "datív", otazka: "Komu? Čomu?", cislo: "3. pád" },
	{ pad: "akuzatív", otazka: "Koho? Čo?", cislo: "4. pád" },
	{ pad: "lokál", otazka: "O kom? O čom?", cislo: "6. pád" },
	{ pad: "inštrumentál", otazka: "S kým? S čím?", cislo: "7. pád" },
] as const;

function generatePady(examType: ExamType): Question {
	const slovoKeys = Object.keys(PADY_DB);
	const slovo = pickRandom(slovoKeys);
	const padInfo = pickRandom([...PADY_INFO]);
	const pad = padInfo.pad;
	const odpoved = PADY_DB[slovo][pad];

	// Wrong answers: same case from other words + random forms
	const wrongCandidates = slovoKeys
		.filter((s) => s !== slovo)
		.map((s) => PADY_DB[s][pad]);
	const wrongs = shuffle(wrongCandidates).slice(0, 3);

	// Ensure exactly 4 options
	while (wrongs.length < 3) {
		wrongs.push(slovo);
	}
	const options = shuffle([odpoved, ...wrongs]);

	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Pády",
		difficulty: 2,
		type: "multiple-choice",
		question: `Skloňuj do ${pad}u: "${slovo}" (${padInfo.cislo} – ${padInfo.otazka})`,
		options,
		correctAnswer: odpoved,
		explanation: `${slovo} → ${padInfo.cislo} (${pad}): ${padInfo.otazka} → ${odpoved}`,
	};
}

const PRAVOPIS_IY_DB = [
	{
		slovo: "Deti si hral___",
		odpoved: "i",
		vysvetlenie: 'Po "l" v koncovke píšeme "i"',
	},
	{
		slovo: "Slnko sviet___lo",
		odpoved: "i",
		vysvetlenie: 'Po "t" píšeme "i"',
	},
	{ slovo: "Mama var___la", odpoved: "i", vysvetlenie: 'Po "r" píšeme "i"' },
	{
		slovo: "V___soký strom",
		odpoved: "y",
		vysvetlenie: "Vysoký - vybrané slovo po V",
	},
	{
		slovo: "S___n pomáhal",
		odpoved: "y",
		vysvetlenie: "Syn - vybrané slovo po S",
	},
	{
		slovo: "R___ba plávala",
		odpoved: "y",
		vysvetlenie: "Ryba - vybrané slovo po R",
	},
	{
		slovo: "B___vali sme tam",
		odpoved: "y",
		vysvetlenie: "Bývali - odvodené od byť (vybrané po B)",
	},
	{
		slovo: "M___dlo voňalo",
		odpoved: "y",
		vysvetlenie: "Mydlo - vybrané slovo po M",
	},
	{
		slovo: "P___tať sa",
		odpoved: "y",
		vysvetlenie: "Pýtať - vybrané slovo po P",
	},
	{
		slovo: "V___chrica fúkala",
		odpoved: "í",
		vysvetlenie: "Víchrica - dlhé í",
	},
	{
		slovo: "Z___ma prišla",
		odpoved: "i",
		vysvetlenie: "Zima - po Z píšeme mäkké i",
	},
	{
		slovo: "Ch___ba v úlohe",
		odpoved: "y",
		vysvetlenie: "Chyba - vybrané slovo po CH",
	},
];

function generatePravopisIY(examType: ExamType): Question {
	const vyber = pickRandom(PRAVOPIS_IY_DB);
	const options = shuffle(["i", "y", "í", "ie"]);

	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Pravopis i/y",
		difficulty: 1,
		type: "multiple-choice",
		question: `Doplň i/y/í/ie: "${vyber.slovo}"`,
		options,
		correctAnswer: vyber.odpoved,
		explanation: `${vyber.vysvetlenie}. Správne: ${vyber.slovo.replace("___", vyber.odpoved)}.`,
	};
}

// ============ RYTMICKÝ ZÁKON ============

const RYTMICKY_ZAKON_DB = [
	{ slovo: "krás___", spravne: "ny", nespravne: "ný", vysvetlenie: "krás-ny: po dlhej slabike nasleduje krátka (ZoRK)" },
	{ slovo: "múd___", spravne: "ry", nespravne: "rý", vysvetlenie: "múd-ry: po dlhej slabike krátka (ZoRK)" },
	{ slovo: "biel___", spravne: "y", nespravne: "ý", vysvetlenie: "biel-y: po dlhej slabike krátka (ZoRK)" },
	{ slovo: "líš___", spravne: "ka", nespravne: "ká", vysvetlenie: "líš-ka: po dlhej slabike krátka (ZoRK)" },
	{ slovo: "kús___", spravne: "ok", nespravne: "ók", vysvetlenie: "kús-ok: po dlhej slabike krátka (ZoRK)" },
	{ slovo: "vĺ___", spravne: "ča", nespravne: "čá", vysvetlenie: "vĺ-ča: po dlhej slabike krátka (ZoRK)" },
	{ slovo: "úz___", spravne: "ky", nespravne: "ký", vysvetlenie: "úz-ky: po dlhej slabike krátka (ZoRK)" },
	{ slovo: "svie___", spravne: "že", nespravne: "žé", vysvetlenie: "svie-že: po dlhej slabike krátka (ZoRK)" },
	{ slovo: "hlav___", spravne: "né", nespravne: "ne", vysvetlenie: "hlav-né: krátka + dlhá – ZoRK sa neuplatňuje" },
	{ slovo: "dob___", spravne: "rú", nespravne: "ru", vysvetlenie: "dob-rú: krátka + dlhá – ZoRK sa neuplatňuje" },
	{ slovo: "ver___", spravne: "ná", nespravne: "na", vysvetlenie: "ver-ná: krátka + dlhá – ZoRK sa neuplatňuje" },
	{ slovo: "dlh___", spravne: "ý", nespravne: "y", vysvetlenie: "dlh-ý: krátka + dlhá – ZoRK sa neuplatňuje" },
	{ slovo: "slab___", spravne: "á", nespravne: "a", vysvetlenie: "slab-á: krátka + dlhá – ZoRK sa neuplatňuje" },
	{ slovo: "ried___", spravne: "ka", nespravne: "ká", vysvetlenie: "ried-ka: po dlhej slabike krátka (ZoRK)" },
	{ slovo: "súcit___", spravne: "ný", nespravne: "ny", vysvetlenie: "sú-cit-ný: predchádzajúca slabika je krátka (cit), ZoRK sa neuplatňuje" },
	{ slovo: "mors___", spravne: "ké", nespravne: "ke", vysvetlenie: "mor-ské: predchádzajúca slabika je krátka, ZoRK sa neuplatňuje" },
	{ slovo: "domá___", spravne: "ce", nespravne: "cé", vysvetlenie: "domá-ce: po dlhej slabike krátka (ZoRK)" },
	{ slovo: "zlat___", spravne: "ý", nespravne: "y", vysvetlenie: "zla-tý: krátka + dlhá – ZoRK sa neuplatňuje" },
	{ slovo: "ohniv___", spravne: "ý", nespravne: "y", vysvetlenie: "oh-ni-vý: krátka + dlhá – ZoRK sa neuplatňuje" },
	{ slovo: "prít___", spravne: "mie", nespravne: "mié", vysvetlenie: "prít-mie: po dlhej slabike (prí-) nasleduje krátka – PORUŠENIE ZoRK" },
	{ slovo: "sloven___", spravne: "ský", nespravne: "sky", vysvetlenie: "slo-ven-ský: krátka + dlhá – ZoRK sa neuplatňuje" },
	{ slovo: "hlávko___", spravne: "vé", nespravne: "ve", vysvetlenie: "hláv-ko-vé: predchádzajúca slabika (ko) je krátka, ZoRK sa neuplatňuje" },
	{ slovo: "vráska___", spravne: "vá", nespravne: "va", vysvetlenie: "vrás-ka-vá: predchádzajúca slabika (ka) je krátka, ZoRK sa neuplatňuje" },
];

function generateRytmickyZakon(examType: ExamType): Question {
	const item = pickRandom(RYTMICKY_ZAKON_DB);
	const options = shuffle([
		item.spravne,
		item.nespravne,
		item.spravne === item.spravne.toLowerCase()
			? item.spravne.replace(/[aeiou]/i, "á")
			: item.spravne.toLowerCase(),
		`-${item.spravne}`,
	]);
	// Deduplicate and ensure 4 options
	const unique = [...new Set(options)];
	while (unique.length < 4) unique.push("---");

	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Rytmický zákon",
		difficulty: 2,
		type: "multiple-choice",
		question: `Doplň správny tvar (rytmický zákon): "${item.slovo}"`,
		options: shuffle(unique),
		correctAnswer: item.spravne,
		explanation: item.vysvetlenie,
	};
}

// ============ VEĽKÉ / MALÉ PÍSMENÁ ============

const VELKE_PISMENA_DB = [
	{ text: "Vysoké Tatry", spravne: "Vysoké Tatry", vysvetlenie: "vlastné meno – pohorie" },
	{ text: "slovenská republika", spravne: "Slovenská republika", vysvetlenie: "oficiálny názov štátu – prvé slovo veľkým" },
	{ text: "bratislavský hrad", spravne: "Bratislavský hrad", vysvetlenie: "vlastné meno – pamiatka/konkrétna stavba" },
	{ text: "dunaj", spravne: "Dunaj", vysvetlenie: "vlastné meno – rieka" },
	{ text: "vianoce", spravne: "Vianoce", vysvetlenie: "sviatok – veľké V" },
	{ text: "dejepis a slovenský jazyk", spravne: "dejepis a slovenský jazyk", vysvetlenie: "školské predmety – malým písmenom" },
	{ text: "Grécki bohovia", spravne: "grécki bohovia", vysvetlenie: "prídavné meno odvodené od vlastného mena – malým; nie oficiálne náboženstvo" },
	{ text: "Národná rada Slovenskej republiky", spravne: "Národná rada Slovenskej republiky", vysvetlenie: "názov inštitúcie" },
	{ text: "Základná škola Jozefa Murgaša", spravne: "Základná škola Jozefa Murgaša", vysvetlenie: "konkrétny názov školy – veľké Z" },
	{ text: "poslanec v parlamente", spravne: "poslanec v parlamente", vysvetlenie: "zamestnanie/funkcia – malým" },
	{ text: "atlantický Oceán", spravne: "Atlantický oceán", vysvetlenie: "vlastné meno + druhový názov malým (oceán)" },
	{ text: "Slovenský raj", spravne: "Slovenský raj", vysvetlenie: "vlastné meno – národný park" },
	{ text: "školský zákon", spravne: "školský zákon", vysvetlenie: "všeobecný zákon – malým" },
	{ text: "Námestie hraničiarov", spravne: "Námestie hraničiarov", vysvetlenie: "názov námestia – prvé slovo vždy veľkým" },
	{ text: "Január", spravne: "január", vysvetlenie: "mesiace – malým písmenom" },
	{ text: "Kysucké nové mesto", spravne: "Kysucké Nové Mesto", vysvetlenie: "názov mesta – všetky slová okrem predložiek veľkým" },
	{ text: "pes dunčo", spravne: "pes Dunčo", vysvetlenie: "meno zvieraťa – veľkým, druh malým" },
	{ text: "mars", spravne: "Mars", vysvetlenie: "vlastné meno – planéta" },
	{ text: "nový rok", spravne: "Nový rok", vysvetlenie: "sviatok (1.1.) – N veľké, r malé" },
	{ text: "časopis slniečko", spravne: "časopis Slniečko", vysvetlenie: "druh (časopis) malým, názov (Slniečko) veľkým" },
	{ text: "Traja Králi", spravne: "Traja králi", vysvetlenie: "sviatok – prvé veľkým, druhé malým" },
	{ text: "minister vnútra", spravne: "minister vnútra", vysvetlenie: "funkcia – malým" },
	{ text: "ázia", spravne: "Ázia", vysvetlenie: "vlastné meno – svetadiel" },
	{ text: "Záhorská Bystrica", spravne: "Záhorská Bystrica", vysvetlenie: "názov mestskej časti" },
	{ text: "oravské obce", spravne: "oravské obce", vysvetlenie: "prídavné meno odvodené od vlastného – malým" },
	{ text: "Slovenská národná galéria", spravne: "Slovenská národná galéria", vysvetlenie: "oficiálny názov inštitúcie" },
	{ text: "Muránska Planina", spravne: "Muránska planina", vysvetlenie: "vlastné meno + druhový názov malým (planina)" },
	{ text: "Jaskyňa Driny", spravne: "Jaskyňa Driny", vysvetlenie: "konkrétny názov jaskyne" },
	{ text: "vianočné sviatky", spravne: "vianočné sviatky", vysvetlenie: "prídavné meno odvodené od sviatku – malým" },
	{ text: "Streda nad bodrogom", spravne: "Streda nad Bodrogom", vysvetlenie: "názov obce – predložka malým, zvyšok veľkým" },
	{ text: "Severná kórea", spravne: "Severná Kórea", vysvetlenie: "názov štátu" },
	{ text: "kniha narnia", spravne: "kniha Narnia", vysvetlenie: "druh malým, názov diela veľkým" },
	{ text: "Rozprávky starej matere", spravne: "Rozprávky starej matere", vysvetlenie: "názov knihy – prvé slovo veľkým" },
	{ text: "Park kultúry", spravne: "Park kultúry", vysvetlenie: "konkrétny názov parku" },
	{ text: "Filmový ústav", spravne: "Filmový ústav", vysvetlenie: "názov inštitúcie" },
	{ text: "tragédia hamlet", spravne: "tragédia Hamlet", vysvetlenie: "druh malým, názov diela veľkým" },
	{ text: "Žiar nad hronom", spravne: "Žiar nad Hronom", vysvetlenie: "názov mesta – predložka malým" },
	{ text: "Považská bystrica", spravne: "Považská Bystrica", vysvetlenie: "názov mesta" },
	{ text: "Ulica mieru", spravne: "Ulica mieru", vysvetlenie: "názov ulice – prvé slovo veľkým" },
	{ text: "Mierová ulica", spravne: "Mierová ulica", vysvetlenie: "názov ulice – prvé slovo veľkým" },
];

function generateVelkePismena(examType: ExamType): Question {
	const item = pickRandom(VELKE_PISMENA_DB);

	// Generate 3 wrong variants with different capitalization
	const words = item.spravne.split(" ");
	const wrongs: string[] = [];

	// All lowercase
	wrongs.push(item.spravne.toLowerCase());
	// All first-letter uppercase
	wrongs.push(words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
	// Swap first word case
	const swapped = words[0] === words[0].toLowerCase()
		? words[0].charAt(0).toUpperCase() + words[0].slice(1)
		: words[0].toLowerCase();
	wrongs.push([swapped, ...words.slice(1)].join(" "));

	// Filter out duplicates of correct answer, pick 3
	const uniqueWrongs = [...new Set(wrongs.filter((w) => w !== item.spravne))];
	while (uniqueWrongs.length < 3) {
		uniqueWrongs.push(item.spravne.toUpperCase());
	}

	const options = shuffle([item.spravne, ...uniqueWrongs.slice(0, 3)]);

	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Veľké písmená",
		difficulty: 2,
		type: "multiple-choice",
		question: `Vyber správny zápis:`,
		options,
		correctAnswer: item.spravne,
		explanation: item.vysvetlenie,
	};
}

// ============ SPODOBOVANIE ============

const SPODOBOVANIE_DB = [
	{ veta: "Pred tvojím domom", spravne: "d→t", vysvetlenie: "pred [pret] – d sa spodobuje na t pred t" },
	{ veta: "K ťažším časom", spravne: "ťaž→ťaš", vysvetlenie: "ťažším [ťašším] – ž sa spodobuje na š pred š" },
	{ veta: "Hrad stojí na kopci", spravne: "d→t", vysvetlenie: "hrad [hrat] – d na konci slova sa spodobuje na t" },
	{ veta: "Na lúke stojí dub", spravne: "b→p", vysvetlenie: "dub [dup] – b na konci slova sa spodobuje na p" },
	{ veta: "Hriech si priznal", spravne: "ch→x", vysvetlenie: "hriech [hriex] – ch na konci sa spodobuje" },
	{ veta: "Krv tiekla prúdom", spravne: "v→f", vysvetlenie: "krv [krf] – v na konci sa spodobuje na f" },
	{ veta: "Hŕba ľudí v uliciach", spravne: "b→p", vysvetlenie: "hŕba [hŕba] – ale predložka 'v' [f] sa tiež spodobuje" },
	{ veta: "Hneď sa vrátiš", spravne: "ď→ť", vysvetlenie: "hneď [hneť] – ď na konci sa spodobuje na ť" },
	{ veta: "Máš pravdu", spravne: "š→ž", vysvetlenie: "máš [máš] – žiadne spodobovanie, ale pravdu je správne" },
	{ veta: "Keď odišli, plakala som", spravne: "ď→ť", vysvetlenie: "keď [keť] – ď na konci sa spodobuje na ť" },
	{ veta: "Dnes je pondelok", spravne: "k→g", vysvetlenie: "pondelok [pondelok] – k na konci slova sa zachováva (znelá pred znelou)" },
	{ veta: "V dome nik nie je", spravne: "v→f", vysvetlenie: "v [f] – predložka v sa spodobuje na f pred neznelou" },
	{ veta: "S hĺbkou a dažďom", spravne: "s→z", vysvetlenie: "s [z] – predložka s sa spodobuje na z pred znelou h" },
	{ veta: "Stavba je veľká", spravne: "v→f", vysvetlenie: "stavba [stafba] – v sa spodobuje na f pred neznelou b" },
	{ veta: "Sneh padal celú noc", spravne: "h→ch", vysvetlenie: "sneh [snech] – h na konci sa spodobuje na ch" },
];

const SPODOBOVANIE_PARY = ["d→t", "b→p", "v→f", "z→s", "ž→š", "g→k", "h→ch", "ď→ť", "dz→c", "dž→č"];

function generateSpodobovanie(examType: ExamType): Question {
	const item = pickRandom(SPODOBOVANIE_DB);
	const wrongPairs = shuffle(
		SPODOBOVANIE_PARY.filter((p) => p !== item.spravne),
	).slice(0, 3);
	const options = shuffle([item.spravne, ...wrongPairs]);

	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Spodobovanie",
		difficulty: 2,
		type: "multiple-choice",
		question: `Nájdi spodobovanie vo vete: "${item.veta}"`,
		options,
		correctAnswer: item.spravne,
		explanation: item.vysvetlenie,
	};
}

// ============ PRÍDAVNÉ MENÁ (vzory pekný / cudzí) ============

const PRIDAVNE_MENA_DB = [
	{ spojenie: "v tmavom kabáte", vzor: "pekný", vysvetlenie: "tmavom – tvrdá koncovka -om → vzor pekný" },
	{ spojenie: "znepokojení žiaci", vzor: "pekný", vysvetlenie: "znepokojení – koncovka -í v N pl. → vzor pekný" },
	{ spojenie: "najstarší brat", vzor: "cudzí", vysvetlenie: "najstarší – mäkká koncovka -í → vzor cudzí" },
	{ spojenie: "najmenšie mačiatko", vzor: "cudzí", vysvetlenie: "najmenšie – mäkká koncovka -ie → vzor cudzí" },
	{ spojenie: "pod vysokými stromami", vzor: "pekný", vysvetlenie: "vysokými – tvrdá koncovka -ými → vzor pekný" },
	{ spojenie: "svieži nápoj", vzor: "cudzí", vysvetlenie: "svieži – mäkká koncovka -í → vzor cudzí" },
	{ spojenie: "so zaujímavou knihou", vzor: "pekný", vysvetlenie: "zaujímavou – tvrdá koncovka -ou → vzor pekný" },
	{ spojenie: "voňavý čaj", vzor: "pekný", vysvetlenie: "voňavý – tvrdá koncovka -ý → vzor pekný" },
	{ spojenie: "s malým mačaťom", vzor: "pekný", vysvetlenie: "malým – tvrdá koncovka -ým → vzor pekný" },
	{ spojenie: "ľahší diktát", vzor: "cudzí", vysvetlenie: "ľahší – mäkká koncovka -í → vzor cudzí" },
	{ spojenie: "súmerná tvár", vzor: "pekný", vysvetlenie: "súmerná – tvrdá koncovka -á → vzor pekný" },
	{ spojenie: "čierne gombíky", vzor: "pekný", vysvetlenie: "čierne – tvrdá koncovka -e → vzor pekný" },
	{ spojenie: "ťažké učebnice", vzor: "pekný", vysvetlenie: "ťažké – tvrdá koncovka -é → vzor pekný" },
	{ spojenie: "majestátny hrad", vzor: "pekný", vysvetlenie: "majestátny – tvrdá koncovka -ý → vzor pekný" },
	{ spojenie: "suché lístie", vzor: "pekný", vysvetlenie: "suché – tvrdá koncovka -é → vzor pekný" },
	{ spojenie: "dobrú čokoládku", vzor: "pekný", vysvetlenie: "dobrú – tvrdá koncovka -ú → vzor pekný" },
	{ spojenie: "štíhla laň", vzor: "pekný", vysvetlenie: "štíhla – tvrdá koncovka -a → vzor pekný" },
	{ spojenie: "prázdnejšie miesta", vzor: "cudzí", vysvetlenie: "prázdnejšie – mäkká koncovka → vzor cudzí" },
	{ spojenie: "chutná sladkosť", vzor: "pekný", vysvetlenie: "chutná – tvrdá koncovka -á → vzor pekný" },
	{ spojenie: "usilovní lekári", vzor: "pekný", vysvetlenie: "usilovní – koncovka -í v N pl. MŽ → vzor pekný" },
	{ spojenie: "na drevenej polici", vzor: "pekný", vysvetlenie: "drevenej – tvrdá koncovka -ej → vzor pekný" },
];

const PRIDAVNE_TYPY_DB = [
	{ slovo: "pekný", typ: "akostné", vysvetlenie: "vyjadruje vlastnosť, dá sa stupňovať" },
	{ slovo: "veľký", typ: "akostné", vysvetlenie: "vyjadruje vlastnosť, dá sa stupňovať" },
	{ slovo: "drevený", typ: "vzťahové", vysvetlenie: "vyjadruje vzťah k materiálu (drevo), nedá sa stupňovať" },
	{ slovo: "školský", typ: "vzťahové", vysvetlenie: "vyjadruje vzťah k škole, nedá sa stupňovať" },
	{ slovo: "rýchly", typ: "akostné", vysvetlenie: "vyjadruje vlastnosť, dá sa stupňovať" },
	{ slovo: "otcov", typ: "privlastňovacie", vysvetlenie: "privlastňuje osobe (otec)" },
	{ slovo: "tatranský", typ: "vzťahové", vysvetlenie: "vyjadruje vzťah k Tatrám, nedá sa stupňovať" },
	{ slovo: "matkin", typ: "privlastňovacie", vysvetlenie: "privlastňuje osobe (matka)" },
	{ slovo: "múdry", typ: "akostné", vysvetlenie: "vyjadruje vlastnosť, dá sa stupňovať" },
	{ slovo: "bratov", typ: "privlastňovacie", vysvetlenie: "privlastňuje osobe (brat)" },
	{ slovo: "zlatý", typ: "akostné", vysvetlenie: "vyjadruje vlastnosť (farba), dá sa stupňovať" },
	{ slovo: "morský", typ: "vzťahové", vysvetlenie: "vyjadruje vzťah k moru, nedá sa stupňovať" },
];

function generatePridavneMenaVzory(examType: ExamType): Question {
	const item = pickRandom(PRIDAVNE_MENA_DB);
	const options = shuffle(["pekný", "cudzí"]);
	while (options.length < 4) {
		options.push(pickRandom(["matkin", "otcov"]));
	}

	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Prídavné mená",
		difficulty: 2,
		type: "multiple-choice",
		question: `Urči vzor prídavného mena: "${item.spojenie}"`,
		options: shuffle([...new Set(options)].slice(0, 4)),
		correctAnswer: item.vzor,
		explanation: item.vysvetlenie,
	};
}

function generatePridavneMenuTypy(examType: ExamType): Question {
	const item = pickRandom(PRIDAVNE_TYPY_DB);
	const options = shuffle(["akostné", "vzťahové", "privlastňovacie"]);
	if (options.length < 4) options.push("neurčité");

	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Prídavné mená",
		difficulty: 2,
		type: "multiple-choice",
		question: `Aký druh prídavného mena je "${item.slovo}"?`,
		options: shuffle(options),
		correctAnswer: item.typ,
		explanation: item.vysvetlenie,
	};
}

// ============ ZÁMENÁ ============

const ZAMENA_DB = [
	{ veta: "___ som to povedal.", spravne: "Ja", moznosti: ["Ja", "My", "Ty", "On"], vysvetlenie: "1. osoba sg. → ja" },
	{ veta: "Poď ku ___!", spravne: "mne", moznosti: ["mne", "mi", "mňa", "ja"], vysvetlenie: "ku komu? → ku mne (D sg.)" },
	{ veta: "Daj to ___.", spravne: "mu", moznosti: ["mu", "jemu", "jeho", "im"], vysvetlenie: "komu? → jemu/mu (D sg. krátky tvar)" },
	{ veta: "Videl som ___ na ulici.", spravne: "ju", moznosti: ["ju", "jej", "ona", "ňu"], vysvetlenie: "koho? → ju (A sg. krátky tvar)" },
	{ veta: "Prišiel s ___.", spravne: "nami", moznosti: ["nami", "nás", "nám", "my"], vysvetlenie: "s kým? → s nami (I pl.)" },
	{ veta: "Povedal to o ___.", spravne: "nich", moznosti: ["nich", "im", "ich", "oni"], vysvetlenie: "o kom? → o nich (L pl.)" },
	{ veta: "Stretol som ___ na ihrisku.", spravne: "ich", moznosti: ["ich", "im", "oni", "nich"], vysvetlenie: "koho? → ich (A pl.)" },
	{ veta: "___ kniha je na stole.", spravne: "Moja", moznosti: ["Moja", "Moju", "Moje", "Mne"], vysvetlenie: "čia kniha? → moja (privlastňovacie zámeno)" },
	{ veta: "Toto je ___ pes.", spravne: "tvoj", moznosti: ["tvoj", "tebe", "ti", "tvojho"], vysvetlenie: "čí pes? → tvoj (privlastňovacie zámeno)" },
	{ veta: "Idem k ___.", spravne: "tebe", moznosti: ["tebe", "ti", "ty", "tvoj"], vysvetlenie: "ku komu? → k tebe (D sg. dlhý tvar)" },
];

const ZAMENA_TYPY_DB = [
	{ zameno: "ja", typ: "osobné základné", vysvetlenie: "ja, ty, on/ona/ono, my, vy, oni/ony" },
	{ zameno: "ty", typ: "osobné základné", vysvetlenie: "ja, ty, on/ona/ono, my, vy, oni/ony" },
	{ zameno: "my", typ: "osobné základné", vysvetlenie: "ja, ty, on/ona/ono, my, vy, oni/ony" },
	{ zameno: "môj", typ: "osobné privlastňovacie", vysvetlenie: "môj, tvoj, jeho, jej, náš, váš, ich" },
	{ zameno: "tvoj", typ: "osobné privlastňovacie", vysvetlenie: "môj, tvoj, jeho, jej, náš, váš, ich" },
	{ zameno: "náš", typ: "osobné privlastňovacie", vysvetlenie: "môj, tvoj, jeho, jej, náš, váš, ich" },
	{ zameno: "váš", typ: "osobné privlastňovacie", vysvetlenie: "môj, tvoj, jeho, jej, náš, váš, ich" },
	{ zameno: "ich", typ: "osobné privlastňovacie", vysvetlenie: "môj, tvoj, jeho, jej, náš, váš, ich" },
];

function generateZamenaFill(examType: ExamType): Question {
	const item = pickRandom(ZAMENA_DB);
	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Zámená",
		difficulty: 2,
		type: "multiple-choice",
		question: `Doplň správne zámeno: "${item.veta}"`,
		options: shuffle([...item.moznosti]),
		correctAnswer: item.spravne,
		explanation: item.vysvetlenie,
	};
}

function generateZamenaTypy(examType: ExamType): Question {
	const item = pickRandom(ZAMENA_TYPY_DB);
	const options = shuffle(["osobné základné", "osobné privlastňovacie", "ukazovacie", "opytovacie"]);
	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Zámená",
		difficulty: 2,
		type: "multiple-choice",
		question: `Aký druh zámena je "${item.zameno}"?`,
		options,
		correctAnswer: item.typ,
		explanation: item.vysvetlenie,
	};
}

// ============ VETY PODĽA OBSAHU ============

const VETY_PODLA_OBSAHU_DB = [
	{ veta: "Skončili sa zimné prázdniny.", typ: "oznamovacia", vysvetlenie: "oznamuje skutočnosť" },
	{ veta: "Aké bude počasie v januári?", typ: "opytovacia", vysvetlenie: "pýta sa na informáciu" },
	{ veta: "Bicyklisti, noste prilby!", typ: "rozkazovacia", vysvetlenie: "prikazuje, rozkazuje" },
	{ veta: "Nech sa nám v škole všetko podarí!", typ: "želacia", vysvetlenie: "vyjadruje želanie" },
	{ veta: "To je ale krásny deň!", typ: "zvolacia", vysvetlenie: "vyjadruje silný citový vzťah" },
	{ veta: "Mama ide do obchodu.", typ: "oznamovacia", vysvetlenie: "oznamuje skutočnosť" },
	{ veta: "Kedy prídeš domov?", typ: "opytovacia", vysvetlenie: "pýta sa na informáciu" },
	{ veta: "Otvor okno!", typ: "rozkazovacia", vysvetlenie: "prikazuje, rozkazuje" },
	{ veta: "Kiežby už bolo leto!", typ: "želacia", vysvetlenie: "vyjadruje želanie (kiežby)" },
	{ veta: "Aký krásny západ slnka!", typ: "zvolacia", vysvetlenie: "vyjadruje silný citový vzťah" },
];

function generateVetyPodlaObsahu(examType: ExamType): Question {
	const item = pickRandom(VETY_PODLA_OBSAHU_DB);
	const options = shuffle(["oznamovacia", "opytovacia", "rozkazovacia", "želacia"]);
	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Vety podľa obsahu",
		difficulty: 1,
		type: "multiple-choice",
		question: `Urči vetu podľa obsahu (zámeru hovoriaceho): "${item.veta}"`,
		options,
		correctAnswer: item.typ,
		explanation: `${item.typ} veta – ${item.vysvetlenie}.`,
	};
}

// ============ MELÓDIA VETY ============

const MELODIA_VETY_DB = [
	{ veta: "Kedy napadne dostatok snehu?", melodia: "klesavá", vysvetlenie: "opytovacie zámeno (kedy) → klesavá melódia" },
	{ veta: "Budú moje odpovede správne?", melodia: "stúpavá", vysvetlenie: "zisťovacia otázka (áno/nie) → stúpavá melódia" },
	{ veta: "Čo si to urobil?!", melodia: "klesavá", vysvetlenie: "opytovacie zámeno (čo) → klesavá melódia" },
	{ veta: "Ideš dnes do školy?", melodia: "stúpavá", vysvetlenie: "zisťovacia otázka (áno/nie) → stúpavá melódia" },
	{ veta: "Kde bývaš?", melodia: "klesavá", vysvetlenie: "opytovacie zámeno (kde) → klesavá melódia" },
	{ veta: "Prečo si neprišiel?", melodia: "klesavá", vysvetlenie: "opytovacie zámeno (prečo) → klesavá melódia" },
	{ veta: "Máš rád čokoládu?", melodia: "stúpavá", vysvetlenie: "zisťovacia otázka (áno/nie) → stúpavá melódia" },
	{ veta: "Koľko máš rokov?", melodia: "klesavá", vysvetlenie: "opytovacie zámeno (koľko) → klesavá melódia" },
];

function generateMelodiaVety(examType: ExamType): Question {
	const item = pickRandom(MELODIA_VETY_DB);
	const options = shuffle(["klesavá", "stúpavá", "klesavo-stúpavá", "stúpavo-klesavá"]);
	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Melódia vety",
		difficulty: 1,
		type: "multiple-choice",
		question: `Aká je melódia vety: "${item.veta}"`,
		options,
		correctAnswer: item.melodia,
		explanation: item.vysvetlenie,
	};
}

// ============ UMELECKÉ PROSTRIEDKY ============

const UMELECKE_PROSTRIEDKY_DB = [
	{ priklad: "sniežik", prostriedok: "zdrobnenina", vysvetlenie: "zdrobnenina – zmenšená forma slova (sneh → sniežik)" },
	{ priklad: "dážď smúti", prostriedok: "personifikácia", vysvetlenie: "personifikácia – neživému sa pripisujú ľudské vlastnosti" },
	{ priklad: "Tatry sa tešia", prostriedok: "personifikácia", vysvetlenie: "personifikácia – neživému sa pripisujú ľudské vlastnosti" },
	{ priklad: "biely sťa sneh", prostriedok: "prirovnanie", vysvetlenie: "prirovnanie – porovnanie pomocou sťa/ako/než" },
	{ priklad: "chodí ako mátoha", prostriedok: "prirovnanie", vysvetlenie: "prirovnanie – porovnanie pomocou ako" },
	{ priklad: "zlaté slnko", prostriedok: "epiteton", vysvetlenie: "epiteton (básnický prívlastok) – výrazné prídavné meno" },
	{ priklad: "slzy veľké ako hrášky", prostriedok: "prirovnanie", vysvetlenie: "prirovnanie – porovnanie pomocou ako" },
	{ priklad: "mamička", prostriedok: "zdrobnenina", vysvetlenie: "zdrobnenina – zmenšená forma slova (mama → mamička)" },
];

function generateUmeleckeProstriedky(examType: ExamType): Question {
	const item = pickRandom(UMELECKE_PROSTRIEDKY_DB);
	const options = shuffle(["personifikácia", "prirovnanie", "zdrobnenina", "epiteton"]);
	return {
		id: uid(),
		subject: "slovak",
		examType,
		topic: "Umelecké prostriedky",
		difficulty: 2,
		type: "multiple-choice",
		question: `Aký umelecký prostriedok je použitý: "${item.priklad}"?`,
		options,
		correctAnswer: item.prostriedok,
		explanation: item.vysvetlenie,
	};
}

// ============ MIESTNA HODNOTA (MATH, 8-ročné) ============

const MIESTNE_HODNOTY = [
	{ nazov: "jednotky", pozicia: 0 },
	{ nazov: "desiatky", pozicia: 1 },
	{ nazov: "stovky", pozicia: 2 },
	{ nazov: "tisícky", pozicia: 3 },
	{ nazov: "desaťtisícky", pozicia: 4 },
	{ nazov: "stotisícky", pozicia: 5 },
	{ nazov: "milióny", pozicia: 6 },
] as const;

function generateMiestnaHodnota(examType: ExamType): Question {
	// Generate a random 6-9 digit number
	const numDigits = randInt(6, 9);
	const digits: number[] = [randInt(1, 9)]; // first digit nonzero
	for (let i = 1; i < numDigits; i++) {
		digits.push(randInt(0, 9));
	}
	const numStr = digits.join("");
	const num = Number.parseInt(numStr);

	// Format with spaces (Slovak convention)
	const formatted = num.toLocaleString("sk-SK");

	// Pick a random place value that exists in this number
	const maxPos = Math.min(numDigits - 1, 6);
	const posIdx = randInt(0, maxPos);
	const miestnaHodnota = MIESTNE_HODNOTY[posIdx];

	// Get the digit at that position (from right)
	const reversedDigits = [...digits].reverse();
	const correctDigit = reversedDigits[miestnaHodnota.pozicia];

	// Generate wrong answers from other digits in the number
	const otherDigits = digits.filter((_, i) => i !== numDigits - 1 - miestnaHodnota.pozicia);
	const wrongs = shuffle([...new Set(otherDigits)]).slice(0, 3);
	while (wrongs.length < 3) {
		const r = randInt(0, 9);
		if (r !== correctDigit && !wrongs.includes(r)) wrongs.push(r);
	}

	const options = shuffle([
		String(correctDigit),
		...wrongs.slice(0, 3).map(String),
	]);

	return {
		id: uid(),
		subject: "math",
		examType,
		topic: "Miestna hodnota",
		difficulty: 1,
		type: "multiple-choice",
		question: `Koľko ${miestnaHodnota.nazov} má číslo ${formatted}?`,
		options,
		correctAnswer: String(correctDigit),
		explanation: `Číslo ${formatted}: na pozícii ${miestnaHodnota.nazov} je cifra ${correctDigit}.`,
	};
}

// ============ GERMAN LANGUAGE (bilingvalne only) ============

const GERMAN_VOCAB_DB: { de: string; sk: string; category: string }[] = [
	// Škola
	{ de: "die Schule", sk: "škola", category: "Škola" },
	{ de: "der Lehrer", sk: "učiteľ", category: "Škola" },
	{ de: "die Lehrerin", sk: "učiteľka", category: "Škola" },
	{ de: "der Schüler", sk: "žiak", category: "Škola" },
	{ de: "das Buch", sk: "kniha", category: "Škola" },
	{ de: "der Bleistift", sk: "ceruzka", category: "Škola" },
	{ de: "das Heft", sk: "zošit", category: "Škola" },
	{ de: "die Tafel", sk: "tabuľa", category: "Škola" },
	{ de: "die Klasse", sk: "trieda", category: "Škola" },
	{ de: "die Pause", sk: "prestávka", category: "Škola" },
	{ de: "die Aufgabe", sk: "úloha", category: "Škola" },
	{ de: "die Prüfung", sk: "skúška", category: "Škola" },
	// Rodina
	{ de: "die Mutter", sk: "mama", category: "Rodina" },
	{ de: "der Vater", sk: "otec", category: "Rodina" },
	{ de: "die Schwester", sk: "sestra", category: "Rodina" },
	{ de: "der Bruder", sk: "brat", category: "Rodina" },
	{ de: "die Großmutter", sk: "babka", category: "Rodina" },
	{ de: "der Großvater", sk: "dedko", category: "Rodina" },
	{ de: "die Eltern", sk: "rodičia", category: "Rodina" },
	{ de: "das Kind", sk: "dieťa", category: "Rodina" },
	{ de: "die Familie", sk: "rodina", category: "Rodina" },
	{ de: "der Onkel", sk: "strýko", category: "Rodina" },
	// Jedlo
	{ de: "das Brot", sk: "chlieb", category: "Jedlo" },
	{ de: "die Milch", sk: "mlieko", category: "Jedlo" },
	{ de: "der Apfel", sk: "jablko", category: "Jedlo" },
	{ de: "das Wasser", sk: "voda", category: "Jedlo" },
	{ de: "der Käse", sk: "syr", category: "Jedlo" },
	{ de: "die Suppe", sk: "polievka", category: "Jedlo" },
	{ de: "das Fleisch", sk: "mäso", category: "Jedlo" },
	{ de: "der Kuchen", sk: "koláč", category: "Jedlo" },
	{ de: "die Kartoffel", sk: "zemiak", category: "Jedlo" },
	{ de: "der Tee", sk: "čaj", category: "Jedlo" },
	// Zvieratá
	{ de: "der Hund", sk: "pes", category: "Zvieratá" },
	{ de: "die Katze", sk: "mačka", category: "Zvieratá" },
	{ de: "das Pferd", sk: "kôň", category: "Zvieratá" },
	{ de: "der Vogel", sk: "vták", category: "Zvieratá" },
	{ de: "die Kuh", sk: "krava", category: "Zvieratá" },
	{ de: "der Fisch", sk: "ryba", category: "Zvieratá" },
	{ de: "die Maus", sk: "myš", category: "Zvieratá" },
	{ de: "der Bär", sk: "medveď", category: "Zvieratá" },
	// Farby
	{ de: "rot", sk: "červený", category: "Farby" },
	{ de: "blau", sk: "modrý", category: "Farby" },
	{ de: "grün", sk: "zelený", category: "Farby" },
	{ de: "gelb", sk: "žltý", category: "Farby" },
	{ de: "weiß", sk: "biely", category: "Farby" },
	{ de: "schwarz", sk: "čierny", category: "Farby" },
	{ de: "braun", sk: "hnedý", category: "Farby" },
	// Čísla
	{ de: "eins", sk: "jeden", category: "Čísla" },
	{ de: "zwei", sk: "dva", category: "Čísla" },
	{ de: "drei", sk: "tri", category: "Čísla" },
	{ de: "vier", sk: "štyri", category: "Čísla" },
	{ de: "fünf", sk: "päť", category: "Čísla" },
	{ de: "zehn", sk: "desať", category: "Čísla" },
	{ de: "zwanzig", sk: "dvadsať", category: "Čísla" },
	{ de: "hundert", sk: "sto", category: "Čísla" },
	// Dni a čas
	{ de: "Montag", sk: "pondelok", category: "Čas" },
	{ de: "Dienstag", sk: "utorok", category: "Čas" },
	{ de: "Mittwoch", sk: "streda", category: "Čas" },
	{ de: "Freitag", sk: "piatok", category: "Čas" },
	{ de: "heute", sk: "dnes", category: "Čas" },
	{ de: "morgen", sk: "zajtra", category: "Čas" },
	{ de: "gestern", sk: "včera", category: "Čas" },
];

const GERMAN_ARTICLES_DB: { noun: string; article: "der" | "die" | "das"; meaning: string }[] = [
	{ noun: "Hund", article: "der", meaning: "pes" },
	{ noun: "Katze", article: "die", meaning: "mačka" },
	{ noun: "Buch", article: "das", meaning: "kniha" },
	{ noun: "Tisch", article: "der", meaning: "stôl" },
	{ noun: "Lampe", article: "die", meaning: "lampa" },
	{ noun: "Fenster", article: "das", meaning: "okno" },
	{ noun: "Stuhl", article: "der", meaning: "stolička" },
	{ noun: "Tür", article: "die", meaning: "dvere" },
	{ noun: "Auto", article: "das", meaning: "auto" },
	{ noun: "Baum", article: "der", meaning: "strom" },
	{ noun: "Blume", article: "die", meaning: "kvetina" },
	{ noun: "Haus", article: "das", meaning: "dom" },
	{ noun: "Schuh", article: "der", meaning: "topánka" },
	{ noun: "Uhr", article: "die", meaning: "hodiny" },
	{ noun: "Bild", article: "das", meaning: "obrázok" },
	{ noun: "Ball", article: "der", meaning: "lopta" },
	{ noun: "Tasche", article: "die", meaning: "taška" },
	{ noun: "Zimmer", article: "das", meaning: "izba" },
	{ noun: "Apfel", article: "der", meaning: "jablko" },
	{ noun: "Schule", article: "die", meaning: "škola" },
	{ noun: "Kind", article: "das", meaning: "dieťa" },
	{ noun: "Lehrer", article: "der", meaning: "učiteľ" },
	{ noun: "Stadt", article: "die", meaning: "mesto" },
	{ noun: "Mädchen", article: "das", meaning: "dievča" },
	{ noun: "Mann", article: "der", meaning: "muž" },
	{ noun: "Frau", article: "die", meaning: "žena" },
	{ noun: "Wasser", article: "das", meaning: "voda" },
	{ noun: "Bruder", article: "der", meaning: "brat" },
	{ noun: "Schwester", article: "die", meaning: "sestra" },
	{ noun: "Brot", article: "das", meaning: "chlieb" },
	{ noun: "Kuchen", article: "der", meaning: "koláč" },
	{ noun: "Milch", article: "die", meaning: "mlieko" },
	{ noun: "Geld", article: "das", meaning: "peniaze" },
	{ noun: "Berg", article: "der", meaning: "hora" },
	{ noun: "Straße", article: "die", meaning: "ulica" },
	{ noun: "Telefon", article: "das", meaning: "telefón" },
	{ noun: "Freund", article: "der", meaning: "priateľ" },
	{ noun: "Musik", article: "die", meaning: "hudba" },
	{ noun: "Spiel", article: "das", meaning: "hra" },
	{ noun: "Zug", article: "der", meaning: "vlak" },
];

const GERMAN_VERBS_DB: { infinitive: string; meaning: string; ich: string; du: string; er: string }[] = [
	{ infinitive: "sein", meaning: "byť", ich: "bin", du: "bist", er: "ist" },
	{ infinitive: "haben", meaning: "mať", ich: "habe", du: "hast", er: "hat" },
	{ infinitive: "gehen", meaning: "ísť", ich: "gehe", du: "gehst", er: "geht" },
	{ infinitive: "kommen", meaning: "prísť", ich: "komme", du: "kommst", er: "kommt" },
	{ infinitive: "machen", meaning: "robiť", ich: "mache", du: "machst", er: "macht" },
	{ infinitive: "spielen", meaning: "hrať sa", ich: "spiele", du: "spielst", er: "spielt" },
	{ infinitive: "lesen", meaning: "čítať", ich: "lese", du: "liest", er: "liest" },
	{ infinitive: "schreiben", meaning: "písať", ich: "schreibe", du: "schreibst", er: "schreibt" },
	{ infinitive: "essen", meaning: "jesť", ich: "esse", du: "isst", er: "isst" },
	{ infinitive: "trinken", meaning: "piť", ich: "trinke", du: "trinkst", er: "trinkt" },
	{ infinitive: "schlafen", meaning: "spať", ich: "schlafe", du: "schläfst", er: "schläft" },
	{ infinitive: "sprechen", meaning: "hovoriť", ich: "spreche", du: "sprichst", er: "spricht" },
	{ infinitive: "sehen", meaning: "vidieť", ich: "sehe", du: "siehst", er: "sieht" },
	{ infinitive: "wohnen", meaning: "bývať", ich: "wohne", du: "wohnst", er: "wohnt" },
	{ infinitive: "lernen", meaning: "učiť sa", ich: "lerne", du: "lernst", er: "lernt" },
];

const GERMAN_SENTENCES_DB: { sentence: string; blank: string; options: string[]; correct: string; explanation: string }[] = [
	{ sentence: "Ich ___ Schüler.", blank: "bin", options: ["bin", "bist", "ist", "sind"], correct: "bin", explanation: "Ich bin = Ja som" },
	{ sentence: "Wie ___ du?", blank: "heißt", options: ["heißt", "heiße", "heißen", "heißt"], correct: "heißt", explanation: "Wie heißt du? = Ako sa voláš?" },
	{ sentence: "___ gehst du zur Schule?", blank: "Wann", options: ["Wann", "Was", "Wer", "Wo"], correct: "Wann", explanation: "Wann = Kedy (otázka na čas)" },
	{ sentence: "Das Buch liegt ___ dem Tisch.", blank: "auf", options: ["auf", "in", "an", "unter"], correct: "auf", explanation: "auf dem Tisch = na stole" },
	{ sentence: "Ich ___ gern Fußball.", blank: "spiele", options: ["spiele", "spielst", "spielt", "spielen"], correct: "spiele", explanation: "Ich spiele = Ja hrám" },
	{ sentence: "Meine Mutter ___ Lehrerin.", blank: "ist", options: ["ist", "bin", "bist", "sind"], correct: "ist", explanation: "Sie ist = Ona je" },
	{ sentence: "Wir ___ in Bratislava.", blank: "wohnen", options: ["wohnen", "wohne", "wohnst", "wohnt"], correct: "wohnen", explanation: "Wir wohnen = My bývame" },
	{ sentence: "___ ist dein Lieblingsfach?", blank: "Was", options: ["Was", "Wer", "Wo", "Wann"], correct: "Was", explanation: "Was = Čo (otázka na vec)" },
	{ sentence: "Er ___ ein Buch.", blank: "liest", options: ["liest", "lese", "lesen", "lest"], correct: "liest", explanation: "Er liest = On číta" },
	{ sentence: "Ich habe ___ Bruder.", blank: "einen", options: ["einen", "eine", "ein", "einer"], correct: "einen", explanation: "einen Bruder = jedného brata (akuzatív mužský rod)" },
	{ sentence: "Die Kinder ___ im Garten.", blank: "spielen", options: ["spielen", "spielt", "spiele", "spielst"], correct: "spielen", explanation: "Die Kinder spielen = Deti sa hrajú" },
	{ sentence: "Ich ___ Hunger.", blank: "habe", options: ["habe", "hast", "hat", "haben"], correct: "habe", explanation: "Ich habe Hunger = Som hladný" },
	{ sentence: "___ kommst du?", blank: "Woher", options: ["Woher", "Wohin", "Wo", "Was"], correct: "Woher", explanation: "Woher = Odkiaľ" },
	{ sentence: "Du ___ sehr gut Deutsch.", blank: "sprichst", options: ["sprichst", "spreche", "spricht", "sprechen"], correct: "sprichst", explanation: "Du sprichst = Ty hovoríš" },
	{ sentence: "Ich gehe ___ die Schule.", blank: "in", options: ["in", "auf", "an", "zu"], correct: "in", explanation: "in die Schule gehen = ísť do školy" },
];

function generateGermanVocabulary(): Question {
	const item = pickRandom(GERMAN_VOCAB_DB);
	// 50% DE→SK, 50% SK→DE
	const deToSk = Math.random() < 0.5;

	if (deToSk) {
		const wrongItems = shuffle(GERMAN_VOCAB_DB.filter((v) => v.sk !== item.sk)).slice(0, 3);
		const options = shuffle([item.sk, ...wrongItems.map((w) => w.sk)]);
		return {
			id: uid(),
			subject: "german",
			examType: "bilingvalne",
			topic: "Slovná zásoba",
			difficulty: 1,
			type: "multiple-choice",
			question: `Čo znamená "${item.de}"?`,
			options,
			correctAnswer: item.sk,
			explanation: `${item.de} = ${item.sk} (kategória: ${item.category})`,
		};
	}

	const wrongItems = shuffle(GERMAN_VOCAB_DB.filter((v) => v.de !== item.de)).slice(0, 3);
	const options = shuffle([item.de, ...wrongItems.map((w) => w.de)]);
	return {
		id: uid(),
		subject: "german",
		examType: "bilingvalne",
		topic: "Slovná zásoba",
		difficulty: 1,
		type: "multiple-choice",
		question: `Ako sa povie "${item.sk}" po nemecky?`,
		options,
		correctAnswer: item.de,
		explanation: `${item.sk} = ${item.de} (kategória: ${item.category})`,
	};
}

function generateGermanArticles(): Question {
	const item = pickRandom(GERMAN_ARTICLES_DB);
	const options = shuffle(["der", "die", "das"]);
	// Ensure we have the correct answer + pad to 4 options
	if (!options.includes(item.article)) options.push(item.article);
	const finalOptions = shuffle([...new Set([item.article, "der", "die", "das"])]);

	return {
		id: uid(),
		subject: "german",
		examType: "bilingvalne",
		topic: "Členy",
		difficulty: 1,
		type: "multiple-choice",
		question: `Aký člen má slovo "${item.noun}" (${item.meaning})?`,
		options: finalOptions,
		correctAnswer: item.article,
		explanation: `${item.article} ${item.noun} = ${item.meaning}. Člen: ${item.article === "der" ? "mužský rod" : item.article === "die" ? "ženský rod" : "stredný rod"}.`,
	};
}

function generateGermanVerbs(): Question {
	const verb = pickRandom(GERMAN_VERBS_DB);
	const personChoice = pickRandom(["ich", "du", "er/sie/es"] as const);
	const correctForm = personChoice === "ich" ? verb.ich : personChoice === "du" ? verb.du : verb.er;

	// Generate wrong options from other verbs' same person form
	const otherVerbs = shuffle(GERMAN_VERBS_DB.filter((v) => v.infinitive !== verb.infinitive)).slice(0, 3);
	const wrongForms = otherVerbs.map((v) =>
		personChoice === "ich" ? v.ich : personChoice === "du" ? v.du : v.er,
	);
	const options = shuffle([correctForm, ...wrongForms]);

	return {
		id: uid(),
		subject: "german",
		examType: "bilingvalne",
		topic: "Slovesá",
		difficulty: 2,
		type: "multiple-choice",
		question: `Doplň správny tvar slovesa "${verb.infinitive}" (${verb.meaning}) pre "${personChoice}":`,
		options,
		correctAnswer: correctForm,
		explanation: `${verb.infinitive} (${verb.meaning}): ich ${verb.ich}, du ${verb.du}, er/sie/es ${verb.er}`,
	};
}

function generateGermanSentences(): Question {
	const item = pickRandom(GERMAN_SENTENCES_DB);
	const display = item.sentence.replace(item.blank, "___");

	return {
		id: uid(),
		subject: "german",
		examType: "bilingvalne",
		topic: "Vety",
		difficulty: 2,
		type: "multiple-choice",
		question: `Doplň do vety: "${display}"`,
		options: shuffle([...item.options]),
		correctAnswer: item.correct,
		explanation: item.explanation,
	};
}

function generateGermanQuestion(): Question {
	const generators: (() => Question)[] = [
		generateGermanVocabulary,
		generateGermanVocabulary,
		generateGermanArticles,
		generateGermanVerbs,
		generateGermanSentences,
	];
	return pickRandom(generators)();
}

// ============ ROUTERS ============

function generateSlovakQuestion(examType: ExamType): Question {
	const filterType = examType === "bilingvalne" ? "4-rocne" : examType;
	const is8rocne = filterType === "8-rocne";

	// Dynamic generators available per level
	const generators8: (() => Question)[] = [
		() => generateSlovneDruhy(examType),
		() => generateVzory(examType),
		() => generatePravopisIY(examType),
		() => generateRytmickyZakon(examType),
		() => generateVelkePismena(examType),
		() => generateSpodobovanie(examType),
		() => generatePridavneMenaVzory(examType),
		() => generatePridavneMenuTypy(examType),
		() => generateZamenaFill(examType),
		() => generateZamenaTypy(examType),
		() => generateVetyPodlaObsahu(examType),
		() => generateMelodiaVety(examType),
		() => generateUmeleckeProstriedky(examType),
	];

	const generators9: (() => Question)[] = [
		...generators8,
		() => generatePady(examType),
	];

	const generators = is8rocne ? generators8 : generators9;

	// 70% dynamic (more generators now), 30% static bank
	if (Math.random() < 0.7) {
		return pickRandom(generators)();
	}

	// Static bank fallback
	const filtered = slovakStaticQuestions.filter(
		(q) => q.examType === filterType || q.examType === "8-rocne",
	);
	const q = filtered[randInt(0, filtered.length - 1)];
	return { ...q, id: uid(), examType };
}

// ============ PUBLIC API ============

export function generateQuestion(
	subject: Subject,
	examType: ExamType,
): Question {
	if (subject === "math") {
		if (examType === "8-rocne") {
			// 5th grade: fractions (add/sub/mult), geometry, word problems
			const generators8: (() => Question)[] = [
				generateFractionAddition5th,
				generateFractionSubtraction5th,
				generateFractionMultiplication5th,
				() => generateGeometryRectPerimeter(examType),
				() => generateGeometryRectArea(examType),
				() => generateGeometrySquarePerimeter(examType),
				() => generateGeometryTriangleArea(examType),
				() => generateWordProblemMultiplication(examType),
				() => generateWordProblemSubtraction(examType),
				() => generateWordProblemFraction(examType),
				() => generateMiestnaHodnota(examType),
			];
			return pickRandom(generators8)();
		}

		// 9th grade (4-rocne & bilingvalne): fractions + geometry + word problems + percentages
		const generators9: (() => Question)[] = [
			generateFractionAddition9th,
			generateFractionSubtraction9th,
			generateFractionMultiplication9th,
			generatePercentageBasic,
			generatePercentageDiscount,
			generatePercentageIncrease,
			() => generateGeometryRectPerimeter(examType),
			() => generateGeometryRectArea(examType),
			() => generateGeometrySquarePerimeter(examType),
			() => generateGeometryTriangleArea(examType),
			() => generateWordProblemMultiplication(examType),
			() => generateWordProblemSubtraction(examType),
			() => generateWordProblemFraction(examType),
			() => generateWordProblemXTimesMore(examType),
		];
		const q = pickRandom(generators9)();
		return examType === "bilingvalne"
			? { ...q, examType: "bilingvalne" }
			: q;
	}
	if (subject === "german") {
		return generateGermanQuestion();
	}
	return generateSlovakQuestion(examType);
}

export function generateQuestionSet(
	subject: Subject,
	examType: ExamType,
	count: number,
): Question[] {
	return Array.from({ length: count }, () =>
		generateQuestion(subject, examType),
	);
}

export function generateMockTest(
	subject: Subject,
	examType: ExamType,
): { questions: Question[]; timeLimit: number } {
	const count = examType === "4-rocne" ? 20 : 15;
	const timeLimit = examType === "4-rocne" ? 45 : 30;
	return {
		questions: generateQuestionSet(subject, examType, count),
		timeLimit,
	};
}

// ============ ADAPTIVE DIFFICULTY ============

/**
 * Generates a question adapted to the student's mastery level.
 * Reads topicMastery from localStorage, weights weaker topics higher,
 * and adjusts difficulty based on overall mastery.
 */
export function generateAdaptiveQuestion(
	subject: Subject,
	examType: ExamType,
	topicMastery: Record<string, number>,
): Question {
	const entries = Object.entries(topicMastery);

	// If no mastery data yet, generate a normal question
	if (entries.length === 0) {
		return generateQuestion(subject, examType);
	}

	// Calculate average mastery
	const avgMastery = entries.reduce((sum, [, v]) => sum + v, 0) / entries.length;

	// Find weak topics (below 40%) to prioritize
	const weakTopics = entries.filter(([, v]) => v < 40).map(([k]) => k);

	// Generate a batch and pick one matching criteria
	const candidates: Question[] = [];
	for (let i = 0; i < 8; i++) {
		candidates.push(generateQuestion(subject, examType));
	}

	// Try to pick a question from a weak topic
	if (weakTopics.length > 0) {
		const weakQ = candidates.find((q) => weakTopics.includes(q.topic));
		if (weakQ) return weakQ;
	}

	// Adjust by difficulty: high mastery → harder, low mastery → easier
	if (avgMastery > 70) {
		const hard = candidates.find((q) => q.difficulty >= 2);
		if (hard) return hard;
	} else if (avgMastery < 40) {
		const easy = candidates.find((q) => q.difficulty === 1);
		if (easy) return easy;
	}

	return candidates[0];
}
