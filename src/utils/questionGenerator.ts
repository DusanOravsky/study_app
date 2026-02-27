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
	chlap: ["otec", "učiteľ", "kamarát", "sused", "pes"],
	dub: ["strom", "dom", "stôl", "telefón", "počítač", "autobus"],
	žena: ["mama", "ryba", "škola", "trieda", "cesta", "voda"],
	kosť: ["myš", "radosť", "mladosť", "bolesť", "súčasť"],
	mesto: ["okno", "selo", "pero", "slovo", "číslo"],
	dievča: ["dieťa", "mláďa", "zviera", "kura"],
};

const VZORY_HINT: Record<string, string> = {
	chlap: "mužský rod životný",
	dub: "mužský rod neživotný",
	žena: "ženský rod",
	kosť: "ženský rod na -sť",
	mesto: "stredný rod na -o",
	dievča: "stredný rod na -a/-ä",
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
	];

	const generators9: (() => Question)[] = [
		...generators8,
		() => generatePady(examType),
	];

	const generators = is8rocne ? generators8 : generators9;

	// 60% dynamic, 40% static bank
	if (Math.random() < 0.6) {
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
