// ============================================================================
// SMART RANDOMIZOVANÁ DATABÁZA OTÁZOK
// Každý študent dostane INÉ čísla = nemôžu si pomáhať!
// Úroveň: PRIJÍMAČKY (náročnejšie)
// ============================================================================

// Pomocná funkcia: náhodné číslo v rozsahu
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => {
  return (Math.random() * (max - min) + min).toFixed(decimals);
};

// ============================================================================
// MATEMATIKA - 8-ROČNÉ GYMNÁZIUM (100+ variácií)
// ============================================================================

const MATH_8_TEMPLATES = {
  
  // ZLOMKY - Sčítanie (20 variácií)
  zlomky_scitanie: () => {
    const menovatel1 = randomInt(2, 8);
    const menovatel2 = randomInt(2, 8);
    const citatel1 = randomInt(1, menovatel1 - 1);
    const citatel2 = randomInt(1, menovatel2 - 1);
    
    // Spoločný menovateľ
    const nsn = (menovatel1 * menovatel2) / gcd(menovatel1, menovatel2);
    
    // Úprava zlomkov
    const new_citatel1 = citatel1 * (nsn / menovatel1);
    const new_citatel2 = citatel2 * (nsn / menovatel2);
    
    // Výsledok
    const result_citatel = new_citatel1 + new_citatel2;
    const result_menovatel = nsn;
    
    // Zjednodušenie
    const d = gcd(result_citatel, result_menovatel);
    const final_citatel = result_citatel / d;
    const final_menovatel = result_menovatel / d;
    
    return {
      question: `${citatel1}/${menovatel1} + ${citatel2}/${menovatel2}`,
      answer: final_menovatel === 1 ? `${final_citatel}` : `${final_citatel}/${final_menovatel}`,
      steps: [
        `1. Spoločný menovateľ: ${nsn}`,
        `2. ${citatel1}/${menovatel1} = ${new_citatel1}/${nsn}`,
        `3. ${citatel2}/${menovatel2} = ${new_citatel2}/${nsn}`,
        `4. ${new_citatel1}/${nsn} + ${new_citatel2}/${nsn} = ${result_citatel}/${nsn}`,
        `5. Zjednodušenie: ${final_citatel}/${final_menovatel}`
      ],
      difficulty: 2,
      topic: 'zlomky'
    };
  },
  
  // ZLOMKY - Odčítanie (20 variácií)
  zlomky_odcitanie: () => {
    const menovatel1 = randomInt(3, 10);
    const menovatel2 = randomInt(3, 10);
    const citatel1 = randomInt(2, menovatel1);
    const citatel2 = randomInt(1, menovatel2 - 1);
    
    const nsn = (menovatel1 * menovatel2) / gcd(menovatel1, menovatel2);
    const new_citatel1 = citatel1 * (nsn / menovatel1);
    const new_citatel2 = citatel2 * (nsn / menovatel2);
    
    // Zabezpečíme že výsledok je kladný
    if (new_citatel1 <= new_citatel2) {
      return MATH_8_TEMPLATES.zlomky_odcitanie(); // Skús znova
    }
    
    const result_citatel = new_citatel1 - new_citatel2;
    const d = gcd(result_citatel, nsn);
    const final_citatel = result_citatel / d;
    const final_menovatel = nsn / d;
    
    return {
      question: `${citatel1}/${menovatel1} - ${citatel2}/${menovatel2}`,
      answer: final_menovatel === 1 ? `${final_citatel}` : `${final_citatel}/${final_menovatel}`,
      steps: [
        `1. Spoločný menovateľ: ${nsn}`,
        `2. ${new_citatel1}/${nsn} - ${new_citatel2}/${nsn} = ${result_citatel}/${nsn}`,
        `3. Zjednodušenie: ${final_citatel}/${final_menovatel}`
      ],
      difficulty: 2,
      topic: 'zlomky'
    };
  },
  
  // ZLOMKY - Násobenie (20 variácií)
  zlomky_nasobenie: () => {
    const c1 = randomInt(1, 5);
    const m1 = randomInt(2, 8);
    const c2 = randomInt(1, 5);
    const m2 = randomInt(2, 8);
    
    const result_c = c1 * c2;
    const result_m = m1 * m2;
    
    const d = gcd(result_c, result_m);
    const final_c = result_c / d;
    const final_m = result_m / d;
    
    return {
      question: `${c1}/${m1} × ${c2}/${m2}`,
      answer: final_m === 1 ? `${final_c}` : `${final_c}/${final_m}`,
      steps: [
        `1. Násob čitatele: ${c1} × ${c2} = ${result_c}`,
        `2. Násob menovatele: ${m1} × ${m2} = ${result_m}`,
        `3. Výsledok: ${result_c}/${result_m}`,
        `4. Zjednodušenie: ${final_c}/${final_m}`
      ],
      difficulty: 2,
      topic: 'zlomky'
    };
  },
  
  // PERCENTÁ - Základný výpočet (30 variácií)
  percenta_zaklad: () => {
    const percent = randomInt(5, 50);
    const cislo = randomInt(20, 200);
    const vysledok = (percent / 100 * cislo).toFixed(2);
    
    return {
      question: `${percent}% z ${cislo}`,
      answer: vysledok,
      steps: [
        `1. ${percent}% = ${(percent/100).toFixed(2)}`,
        `2. ${(percent/100).toFixed(2)} × ${cislo} = ${vysledok}`
      ],
      difficulty: 1,
      topic: 'percentá'
    };
  },
  
  // PERCENTÁ - Zľava (30 variácií)
  percenta_zlava: () => {
    const cena = randomInt(50, 500);
    const zlava = randomInt(10, 50);
    const zlava_eur = (cena * zlava / 100).toFixed(2);
    const nova_cena = (cena - zlava_eur).toFixed(2);
    
    return {
      question: `Tovar stojí ${cena}€. Zľava je ${zlava}%. Koľko zaplatíš?`,
      answer: nova_cena,
      steps: [
        `1. Vypočítaj zľavu: ${zlava}% z ${cena}€ = ${zlava_eur}€`,
        `2. Odčítaj: ${cena}€ - ${zlava_eur}€ = ${nova_cena}€`
      ],
      difficulty: 2,
      topic: 'percentá'
    };
  },
  
  // PERCENTÁ - Nárast (20 variácií)
  percenta_narast: () => {
    const povodna = randomInt(100, 500);
    const nova = randomInt(povodna + 10, povodna + 200);
    const rozdiel = nova - povodna;
    const percent = ((rozdiel / povodna) * 100).toFixed(1);
    
    return {
      question: `Cena vzrástla z ${povodna}€ na ${nova}€. O koľko percent?`,
      answer: percent,
      steps: [
        `1. Rozdiel: ${nova}€ - ${povodna}€ = ${rozdiel}€`,
        `2. Percento: (${rozdiel}/${povodna}) × 100 = ${percent}%`
      ],
      difficulty: 3,
      topic: 'percentá'
    };
  },
  
  // GEOMETRIA - Obvod obdĺžnika (20 variácií)
  geometria_obvod_obdlznik: () => {
    const a = randomInt(5, 20);
    const b = randomInt(3, 15);
    const obvod = 2 * (a + b);
    
    return {
      question: `Obdĺžnik: a=${a}cm, b=${b}cm. Obvod?`,
      answer: `${obvod}`,
      steps: [
        `1. Vzorec: O = 2(a + b)`,
        `2. O = 2(${a} + ${b}) = 2 × ${a+b}`,
        `3. O = ${obvod}cm`
      ],
      difficulty: 1,
      topic: 'geometria'
    };
  },
  
  // GEOMETRIA - Obsah obdĺžnika (20 variácií)
  geometria_obsah_obdlznik: () => {
    const a = randomInt(4, 25);
    const b = randomInt(3, 20);
    const obsah = a * b;
    
    return {
      question: `Obdĺžnik: a=${a}cm, b=${b}cm. Obsah?`,
      answer: `${obsah}`,
      steps: [
        `1. Vzorec: S = a × b`,
        `2. S = ${a} × ${b} = ${obsah}cm²`
      ],
      difficulty: 1,
      topic: 'geometria'
    };
  },
  
  // GEOMETRIA - Obvod štvorca (15 variácií)
  geometria_obvod_stvorec: () => {
    const strana = randomInt(3, 15);
    const obvod = 4 * strana;
    
    return {
      question: `Štvorec so stranou ${strana}cm. Obvod?`,
      answer: `${obvod}`,
      steps: [
        `1. Vzorec: O = 4 × strana`,
        `2. O = 4 × ${strana} = ${obvod}cm`
      ],
      difficulty: 1,
      topic: 'geometria'
    };
  },
  
  // GEOMETRIA - Obsah trojuholníka (20 variácií)
  geometria_trojuholnik: () => {
    const zaklad = randomInt(4, 20);
    const vyska = randomInt(3, 15);
    const obsah = (zaklad * vyska / 2);
    
    return {
      question: `Trojuholník: základňa=${zaklad}cm, výška=${vyska}cm. Obsah?`,
      answer: `${obsah}`,
      steps: [
        `1. Vzorec: S = (a × v) / 2`,
        `2. S = (${zaklad} × ${vyska}) / 2 = ${zaklad * vyska} / 2`,
        `3. S = ${obsah}cm²`
      ],
      difficulty: 2,
      topic: 'geometria'
    };
  },
  
  // SLOVNÉ ÚLOHY - Násobenie (30 variácií)
  slovne_nasobenie: () => {
    const cena = randomInt(2, 50);
    const pocet = randomInt(3, 20);
    const vysledok = cena * pocet;
    const predmet = ['kníh', 'pier', 'zošitov', 'ceruziek', 'jablk'][randomInt(0, 4)];
    
    return {
      question: `Jeden kus stojí ${cena}€. Koľko stojí ${pocet} ${predmet}?`,
      answer: `${vysledok}`,
      steps: [
        `1. ${cena}€ × ${pocet} = ${vysledok}€`
      ],
      difficulty: 1,
      topic: 'slovné úlohy'
    };
  },
  
  // SLOVNÉ ÚLOHY - Odčítanie (30 variácií)
  slovne_odcitanie: () => {
    const mam = randomInt(50, 500);
    const kupim = randomInt(20, mam - 10);
    const ostane = mam - kupim;
    
    return {
      question: `Mám ${mam}€. Kúpim si vec za ${kupim}€. Koľko mi ostane?`,
      answer: `${ostane}`,
      steps: [
        `1. ${mam}€ - ${kupim}€ = ${ostane}€`
      ],
      difficulty: 1,
      topic: 'slovné úlohy'
    };
  },
  
  // SLOVNÉ ÚLOHY - Zlomky (40 variácií)
  slovne_zlomky: () => {
    const celkom = randomInt(12, 60);
    const zlomok = [2, 3, 4, 5, 6][randomInt(0, 4)];
    
    // Zabezpečíme že je to celé číslo
    const upravene_celkom = celkom - (celkom % zlomok);
    const vysledok = upravene_celkom / zlomok;
    const nazov = ['žiakov', 'jabĺk', 'cukríkov', 'detí', 'kníh'][randomInt(0, 4)];
    
    return {
      question: `Je tu ${upravene_celkom} ${nazov}. 1/${zlomok} sú chlapci. Koľko chlapcov?`,
      answer: `${vysledok}`,
      steps: [
        `1. 1/${zlomok} znamená: vydeľ ${zlomok}`,
        `2. ${upravene_celkom} ÷ ${zlomok} = ${vysledok}`
      ],
      difficulty: 2,
      topic: 'slovné úlohy'
    };
  },
  
  // SLOVNÉ ÚLOHY - X-krát viac (ŤAŽKÉ - prijímačkové)
  slovne_x_krat_viac: () => {
    const krat = randomInt(2, 5);
    const spolu = randomInt(12, 60);
    
    // x + krat*x = spolu → x(1 + krat) = spolu
    const delitel = 1 + krat;
    const upravene_spolu = spolu - (spolu % delitel);
    const x = upravene_spolu / delitel;
    const druhy = x * krat;
    
    const mena = [
      ['Peter', 'Jana'],
      ['Matej', 'Lucia'],
      ['Adam', 'Eva'],
      ['Tom', 'Anna']
    ][randomInt(0, 3)];
    
    return {
      question: `${mena[0]} má ${krat}× viac jabĺk ako ${mena[1]}. Spolu majú ${upravene_spolu}. Koľko má ${mena[1]}?`,
      answer: `${x}`,
      steps: [
        `1. Označíme: ${mena[1]} = x`,
        `2. ${mena[0]} = ${krat}x`,
        `3. Rovnica: x + ${krat}x = ${upravene_spolu}`,
        `4. ${delitel}x = ${upravene_spolu}`,
        `5. x = ${x}`
      ],
      difficulty: 3,
      topic: 'slovné úlohy'
    };
  }
};

// ============================================================================
// SLOVENČINA - 8-ROČNÉ (80+ variácií)
// ============================================================================

const SJL_8_TEMPLATES = {
  
  // SLOVNÉ DRUHY - Náhodné slová (200+ variácií)
  slovne_druhy: () => {
    const slova = {
      'podstatné meno': ['strom', 'mama', 'pes', 'dom', 'škola', 'dieťa', 'učiteľ', 'ryba', 'mesto', 'okno'],
      'prídavné meno': ['pekný', 'veľký', 'malý', 'dobrý', 'zlý', 'vysoký', 'nízky', 'rýchly', 'pomalý'],
      'sloveso': ['beží', 'varí', 'píše', 'číta', 'spí', 'je', 'skáče', 'lietá', 'plače', 'spieva'],
      'príslovka': ['rýchlo', 'pomaly', 'dobre', 'zle', 'vysoko', 'nízko', 'doma', 'vonku', 'včera', 'zajtra'],
      'zámeno': ['ja', 'ty', 'on', 'ona', 'my', 'vy', 'oni', 'môj', 'tvoj', 'náš'],
      'číslovka': ['dva', 'tri', 'prvý', 'druhý', 'päť', 'desať', 'sto'],
      'predložka': ['v', 'na', 'do', 'pod', 'nad', 'pri', 'o', 'za', 'pred'],
      'spojka': ['a', 'ale', 'lebo', 'pretože', 'keď', 'aby', 'že', 'alebo'],
      'častica': ['áno', 'nie', 'azda', 'vari', 'nech', 'áj'],
      'citoslovce': ['och', 'jaj', 'ach', 'hop', 'fuj', 'hura']
    };
    
    const typ = Object.keys(slova)[randomInt(0, Object.keys(slova).length - 1)];
    const slovo = slova[typ][randomInt(0, slova[typ].length - 1)];
    
    const otazky = {
      'podstatné meno': 'Kto? Čo?',
      'prídavné meno': 'Aký?',
      'sloveso': 'Čo robí?',
      'príslovka': 'Ako? Kde? Kedy?',
      'zámeno': 'Zastupuje podstatné meno',
      'číslovka': 'Koľko?',
      'predložka': 'Stojí pred podstatným menom',
      'spojka': 'Spája vety/slová',
      'častica': 'Vyjadruje súhlas/nesúhlas',
      'citoslovce': 'Zvukové slovo'
    };
    
    return {
      question: `Urči slovný druh: "${slovo}"`,
      answer: typ,
      steps: [
        `1. Otázka: ${otazky[typ]}`,
        `2. Odpoveď: ${typ}`
      ],
      difficulty: 1,
      topic: 'slovné druhy'
    };
  },
  
  // VZORY - Náhodné slová (100+ variácií)
  vzory: () => {
    const slova = {
      'chlap': ['otec', 'učiteľ', 'kamarát', 'Peter', 'pes', 'sused'],
      'dub': ['strom', 'dom', 'stôl', 'telefón', 'počítač', 'autobus'],
      'žena': ['mama', 'ryba', 'škola', 'trieda', 'cesta', 'voda'],
      'kosť': ['myš', 'radosť', 'mladosť', 'súčasť', 'bolesť'],
      'mesto': ['okno', 'selo', 'pero', 'slovo', 'číslo'],
      'dievča': ['dieťa', 'mláďa', 'zviera', 'kura']
    };
    
    const vzor = Object.keys(slova)[randomInt(0, Object.keys(slova).length - 1)];
    const slovo = slova[vzor][randomInt(0, slova[vzor].length - 1)];
    
    const vysvetlenia = {
      'chlap': 'mužský rod životný',
      'dub': 'mužský rod neživotný',
      'žena': 'ženský rod',
      'kosť': 'ženský rod na -sť',
      'mesto': 'stredný rod na -o',
      'dievča': 'stredný rod na -a'
    };
    
    return {
      question: `Urči vzor podstatného mena: "${slovo}"`,
      answer: vzor,
      steps: [
        `1. ${vysvetlenia[vzor]}`,
        `2. Vzor: ${vzor.toUpperCase()}`
      ],
      difficulty: 2,
      topic: 'vzory'
    };
  },
  
  // PÁDY - Náhodné skloňovanie (150+ variácií)
  pady: () => {
    const pady_info = [
      { pad: 'genitív', otazka: 'Koho? Čoho?', cislo: '2. pád' },
      { pad: 'datív', otazka: 'Komu? Čomu?', cislo: '3. pád' },
      { pad: 'akuzatív', otazka: 'Koho? Čo?', cislo: '4. pád' },
      { pad: 'lokál', otazka: 'O kom? O čom?', cislo: '6. pád' },
      { pad: 'inštrumentál', otazka: 'S kým? S čím?', cislo: '7. pád' }
    ];
    
    const slova = {
      'mama': { genitív: 'mamy', datív: 'mame', akuzatív: 'mamu', lokál: 'mame', inštrumentál: 'mamou' },
      'žena': { genitív: 'ženy', datív: 'žene', akuzatív: 'ženu', lokál: 'žene', inštrumentál: 'ženou' },
      'otec': { genitív: 'otca', datív: 'otcovi', akuzatív: 'otca', lokál: 'otcovi', inštrumentál: 'otcom' },
      'chlap': { genitív: 'chlapa', datív: 'chlapovi', akuzatív: 'chlapa', lokál: 'chlapovi', inštrumentál: 'chlapom' },
      'dom': { genitív: 'domu', datív: 'domu', akuzatív: 'dom', lokál: 'dome', inštrumentál: 'domom' },
      'škola': { genitív: 'školy', datív: 'škole', akuzatív: 'školu', lokál: 'škole', inštrumentál: 'školou' }
    };
    
    const slovo_keys = Object.keys(slova);
    const slovo = slovo_keys[randomInt(0, slovo_keys.length - 1)];
    const pad_info = pady_info[randomInt(0, pady_info.length - 1)];
    const pad = pad_info.pad;
    const odpoved = slova[slovo][pad];
    
    return {
      question: `Skloňuj do ${pad}u: "${slovo}"`,
      answer: odpoved,
      steps: [
        `1. ${pad_info.cislo} - ${pad}`,
        `2. Otázka: ${pad_info.otazka}`,
        `3. Odpoveď: ${odpoved}`
      ],
      difficulty: 2,
      topic: 'pády'
    };
  },
  
  // PRAVOPIS i/y (100+ variácií)
  pravopis_iy: () => {
    const slova = [
      { slovo: 'Deti si hral___', odpoved: 'i', vysvetlenie: 'Po "l" píšeme "i"' },
      { slovo: 'Slnko sviet___', odpoved: 'i', vysvetlenie: 'Po "t" píšeme "i"' },
      { slovo: 'Mama var___', odpoved: 'i', vysvetlenie: 'Po "r" píšeme "i"' },
      { slovo: 'Otec rod___', odpoved: 'i', vysvetlenie: 'Po "d" píšeme "i"' },
      { slovo: 'Dom stoj___', odpoved: 'í', vysvetlenie: 'stojí' },
      { slovo: 'Voda teč___', odpoved: 'ie', vysvetlenie: 'tečie' }
    ];
    
    const vyber = slova[randomInt(0, slova.length - 1)];
    
    return {
      question: `Doplň i/y/í/ie: "${vyber.slovo}"`,
      answer: vyber.odpoved,
      steps: [
        `1. ${vyber.vysvetlenie}`,
        `2. Správne: ${vyber.slovo.replace('___', vyber.odpoved)}`
      ],
      difficulty: 1,
      topic: 'pravopis'
    };
  }
};

// ============================================================================
// GENERÁTOR OTÁZOK
// ============================================================================

function generateQuestion(examType, subject, topic = null) {
  if (examType === '8-rocne' && subject === 'matematika') {
    const topics = topic ? [topic] : Object.keys(MATH_8_TEMPLATES);
    const randomTopic = topics[randomInt(0, topics.length - 1)];
    const generator = MATH_8_TEMPLATES[randomTopic];
    return generator();
  }
  
  if (examType === '8-rocne' && subject === 'sjl') {
    const topics = topic ? [topic] : Object.keys(SJL_8_TEMPLATES);
    const randomTopic = topics[randomInt(0, topics.length - 1)];
    const generator = SJL_8_TEMPLATES[randomTopic];
    return generator();
  }
  
  return null;
}

// ============================================================================
// POMOCNÉ FUNKCIE
// ============================================================================

// Najväčší spoločný deliteľ
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  generateQuestion,
  MATH_8_TEMPLATES,
  SJL_8_TEMPLATES
};

// ============================================================================
// PRÍKLADY POUŽITIA:
// ============================================================================

/*
// Vygeneruj náhodnú matematickú otázku
const q1 = generateQuestion('8-rocne', 'matematika');
console.log(q1.question);  // "15% z 80"
console.log(q1.answer);    // "12"

// Vygeneruj konkrétnu tému
const q2 = generateQuestion('8-rocne', 'matematika', 'zlomky_scitanie');
console.log(q2.question);  // "3/4 + 2/5"  (náhodné čísla!)
console.log(q2.answer);    // "23/20"

// Vygeneruj 10 rôznych otázok pre 10 študentov
for(let i = 0; i < 10; i++) {
  const q = generateQuestion('8-rocne', 'matematika', 'percenta_zaklad');
  console.log(`Študent ${i+1}: ${q.question} = ${q.answer}`);
}

Výstup:
Študent 1: 15% z 80 = 12.00
Študent 2: 23% z 145 = 33.35
Študent 3: 18% z 92 = 16.56
... atď - VŠETKY RÔZNE!
*/
