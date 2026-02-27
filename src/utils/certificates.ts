import { jsPDF } from "jspdf";
import type { CertificateRecord, ExamType, Subject } from "../types";

export function generateCertificateId(): string {
	const year = new Date().getFullYear();
	const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `CERT-${year}-${rand}`;
}

export function shouldAwardCertificate(percentage: number): boolean {
	return percentage >= 70;
}

const examTypeLabels: Record<ExamType, string> = {
	"8-rocne": "8-ročné gymnázium",
	"4-rocne": "4-ročné gymnázium",
	bilingvalne: "Bilingválne gymnázium",
};

const subjectLabels: Record<Subject, string> = {
	math: "Matematika",
	slovak: "Slovenčina",
	german: "Nemčina",
};

export function generateCertificatePDF(cert: CertificateRecord): void {
	const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
	const w = doc.internal.pageSize.getWidth();
	const h = doc.internal.pageSize.getHeight();

	// Background
	doc.setFillColor(250, 248, 255);
	doc.rect(0, 0, w, h, "F");

	// Decorative border
	doc.setDrawColor(139, 92, 246);
	doc.setLineWidth(3);
	doc.rect(10, 10, w - 20, h - 20);
	doc.setLineWidth(1);
	doc.rect(14, 14, w - 28, h - 28);

	// Corner accents
	const cornerSize = 20;
	doc.setFillColor(139, 92, 246);
	// Top-left
	doc.triangle(10, 10, 10 + cornerSize, 10, 10, 10 + cornerSize, "F");
	// Top-right
	doc.triangle(w - 10, 10, w - 10 - cornerSize, 10, w - 10, 10 + cornerSize, "F");
	// Bottom-left
	doc.triangle(10, h - 10, 10 + cornerSize, h - 10, 10, h - 10 - cornerSize, "F");
	// Bottom-right
	doc.triangle(w - 10, h - 10, w - 10 - cornerSize, h - 10, w - 10, h - 10 - cornerSize, "F");

	// Title
	doc.setFont("helvetica", "bold");
	doc.setFontSize(36);
	doc.setTextColor(139, 92, 246);
	doc.text("CERTIFIKAT", w / 2, 45, { align: "center" });

	// App name
	doc.setFontSize(14);
	doc.setTextColor(100, 100, 100);
	doc.text("AI Mentor - Priprava na prijimacky", w / 2, 56, { align: "center" });

	// Divider
	doc.setDrawColor(139, 92, 246);
	doc.setLineWidth(0.5);
	doc.line(w / 2 - 60, 62, w / 2 + 60, 62);

	// Student name
	doc.setFontSize(28);
	doc.setTextColor(30, 30, 30);
	doc.text(cert.studentName || "Student", w / 2, 82, { align: "center" });

	// Description
	doc.setFontSize(13);
	doc.setTextColor(80, 80, 80);
	doc.text("uspesne absolvoval/a skusobny test", w / 2, 96, { align: "center" });

	// Exam type and subject
	doc.setFontSize(16);
	doc.setTextColor(60, 60, 60);
	doc.text(
		`${subjectLabels[cert.subject]} - ${examTypeLabels[cert.examType]}`,
		w / 2,
		110,
		{ align: "center" },
	);

	// Score
	doc.setFontSize(24);
	doc.setTextColor(139, 92, 246);
	doc.text(`${cert.percentage}%`, w / 2, 128, { align: "center" });

	doc.setFontSize(12);
	doc.setTextColor(100, 100, 100);
	doc.text(`(${cert.score} z ${cert.maxScore} spravnych)`, w / 2, 136, { align: "center" });

	// Date and cert ID
	const date = new Date(cert.issuedAt).toLocaleDateString("sk-SK", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	doc.setFontSize(10);
	doc.setTextColor(120, 120, 120);
	doc.text(`Datum: ${date}`, w / 2 - 40, 160, { align: "center" });
	doc.text(`ID: ${cert.id}`, w / 2 + 40, 160, { align: "center" });

	// Footer
	doc.setFontSize(9);
	doc.setTextColor(160, 160, 160);
	doc.text(
		"Vygenerovane aplikaciou AI Mentor",
		w / 2,
		h - 20,
		{ align: "center" },
	);

	doc.save(`certifikat-${cert.id}.pdf`);
}
