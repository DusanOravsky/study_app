/**
 * Smart Randomized Question Generator
 *
 * Rules:
 * - 5th grade (8-rocne): Simple fractions only (result = whole number or simple fraction). NO percentages. NO decimals.
 * - 9th grade (4-rocne): All fractions + percentages with WHOLE NUMBER results only. NO decimals.
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

// ============ MATH - 5th Grade (8-rocne) ============

function generateFraction5thGrade(): Question {
	const ops = ["+", "-", "*"] as const;
	const op = ops[randInt(0, 2)];

	let num1: number, num2: number, result: string;
	let questionText: string;

	if (op === "+") {
		// Same denominator, result is whole or simple fraction
		const den = [2, 3, 4, 5, 6][randInt(0, 4)];
		num1 = randInt(1, den - 1);
		num2 = den - num1; // Makes result = 1
		if (Math.random() > 0.5 && den > 2) {
			num2 = randInt(1, den - num1);
		}
		const sumNum = num1 + num2;
		if (sumNum % den === 0) {
			result = String(sumNum / den);
		} else {
			const gcd = getGCD(sumNum, den);
			result = `${sumNum / gcd}/${den / gcd}`;
		}
		questionText = `${num1}/${den} + ${num2}/${den} = ?`;
	} else if (op === "-") {
		const den = [2, 3, 4, 5, 6][randInt(0, 4)];
		num1 = randInt(2, den);
		num2 = randInt(1, num1 - 1);
		const diffNum = num1 - num2;
		if (diffNum % den === 0) {
			result = String(diffNum / den);
		} else {
			const gcd = getGCD(diffNum, den);
			result = `${diffNum / gcd}/${den / gcd}`;
		}
		questionText = `${num1}/${den} - ${num2}/${den} = ?`;
	} else {
		// Multiplication: simple like 2 * 1/3
		const whole = randInt(2, 5);
		const den = [2, 3, 4, 5][randInt(0, 3)];
		const num = 1;
		const resNum = whole * num;
		if (resNum % den === 0) {
			result = String(resNum / den);
		} else {
			const gcd = getGCD(resNum, den);
			result = `${resNum / gcd}/${den / gcd}`;
		}
		questionText = `${whole} × ${num}/${den} = ?`;
	}

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

// ============ MATH - 9th Grade (4-rocne) ============

function generateFraction9thGrade(): Question {
	if (Math.random() > 0.5) {
		return generatePercentage9thGrade();
	}

	// Complex fractions with different denominators
	const den1 = [2, 3, 4, 5, 6, 8][randInt(0, 5)];
	const den2 = [2, 3, 4, 5, 6, 8][randInt(0, 5)];
	const num1 = randInt(1, den1 - 1);
	const num2 = randInt(1, den2 - 1);

	const commonDen = lcm(den1, den2);
	const sumNum = num1 * (commonDen / den1) + num2 * (commonDen / den2);

	let result: string;
	if (sumNum % commonDen === 0) {
		result = String(sumNum / commonDen);
	} else {
		const gcd = getGCD(sumNum, commonDen);
		result = `${sumNum / gcd}/${commonDen / gcd}`;
	}

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
		explanation: `Nájdeme spoločný menovateľ ${commonDen}. Výsledok je ${result}.`,
	};
}

function generatePercentage9thGrade(): Question {
	// Percentages with whole number results ONLY
	const percentages = [10, 20, 25, 50, 75];
	const pct = percentages[randInt(0, percentages.length - 1)];

	// Pick a base that gives whole number result
	const correctBase = Math.round((100 / pct) * randInt(1, 10));
	const answer = (pct * correctBase) / 100;

	const questionText = `Koľko je ${pct}% z ${correctBase}?`;
	const result = String(answer);

	const wrongAnswers = [
		String(answer + randInt(1, 5)),
		String(Math.max(1, answer - randInt(1, 3))),
		String(answer * 2),
	].filter((w) => w !== result);
	while (wrongAnswers.length < 3) {
		wrongAnswers.push(String(answer + wrongAnswers.length + 2));
	}

	const options = shuffle([result, ...wrongAnswers.slice(0, 3)]);

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

// ============ SLOVAK LANGUAGE ============

const slovakQuestions: Omit<Question, "id">[] = [
	{
		subject: "slovak",
		examType: "8-rocne",
		topic: "Vybrané slová",
		difficulty: 1,
		type: "multiple-choice",
		question: "Ktoré slovo je napísané správne?",
		options: ["bíť", "biť", "byť", "býť"],
		correctAnswer: "byť",
		explanation: "Slovo 'byť' (existovať) sa píše s 'y'. 'Biť' (udierať) sa píše s 'i'.",
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
		examType: "8-rocne",
		topic: "Slovné druhy",
		difficulty: 1,
		type: "multiple-choice",
		question: "Koľko slovných druhov poznáme v slovenčine?",
		options: ["8", "9", "10", "11"],
		correctAnswer: "10",
		explanation: "V slovenčine poznáme 10 slovných druhov.",
	},
	{
		subject: "slovak",
		examType: "4-rocne",
		topic: "Literatúra",
		difficulty: 2,
		type: "multiple-choice",
		question: "Kto napísal dielo 'Mort na Dunaji'?",
		options: ["Pavol Országh Hviezdoslav", "Samo Chalupka", "Ján Botto", "Andrej Sládkovič"],
		correctAnswer: "Samo Chalupka",
		explanation: "Samo Chalupka je autorom básne 'Mor ho!' (Mort na Dunaji je ľudový názov).",
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
		explanation: "'Vonku' je príslovkové určenie miesta - odpovedá na otázku 'kde?'",
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

function generateSlovakQuestion(examType: ExamType): Question {
	const filterType = examType === "bilingvalne" ? "4-rocne" : examType;
	const filtered = slovakQuestions.filter(
		(q) => q.examType === filterType || q.examType === "8-rocne",
	);
	const q = filtered[randInt(0, filtered.length - 1)];
	return { ...q, id: uid(), examType };
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

function generateWrongFractionAnswers(correct: string, count: number): string[] {
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

// ============ PUBLIC API ============

export function generateQuestion(subject: Subject, examType: ExamType): Question {
	if (subject === "math") {
		if (examType === "8-rocne") {
			return generateFraction5thGrade();
		}
		const q = generateFraction9thGrade();
		return examType === "bilingvalne" ? { ...q, examType: "bilingvalne" } : q;
	}
	return generateSlovakQuestion(examType);
}

export function generateQuestionSet(
	subject: Subject,
	examType: ExamType,
	count: number,
): Question[] {
	return Array.from({ length: count }, () => generateQuestion(subject, examType));
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
