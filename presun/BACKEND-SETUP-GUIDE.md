# 🚀 BACKEND SETUP GUIDE - KROK ZA KROKOM

**Pre úplných začiatočníkov!**  
**Čas: ~2-3 hodiny**  
**Budget: €0 (všetko ZADARMO)**

---

## 📋 ČO BUDEŠ POTREBOVAŤ

- ✅ Google účet (Gmail)
- ✅ GitHub účet (zadarmo)
- ✅ Počítač s internetom
- ✅ Prehliadač (Chrome/Firefox)
- ✅ Moje súbory (už máš)

---

## ČASŤ 1: FIREBASE SETUP (30 minút)

Firebase = databáza kde sa uložia údaje študentov

### KROK 1: Vytvor Firebase projekt

**1.1** Choď na: **https://firebase.google.com**

**1.2** Klikni **"Get Started"** (modrý button vpravo hore)

**1.3** Prihlás sa Google účtom

**1.4** Klikni **"Add project"** alebo **"Create a project"**

**1.5** Zadaj meno projektu:
```
Meno: AI-Mentor-Production
```
*(môžeš použiť aj iný názov)*

**1.6** Klikni **"Continue"**

**1.7** Google Analytics:
- Vypni prepínač "Enable Google Analytics" (netreba)
- Klikni **"Create project"**

**1.8** Čakaj 30 sekúnd... 

**1.9** Keď uvidíš ✅ "Your new project is ready", klikni **"Continue"**

---

### KROK 2: Aktivuj Authentication (prihlásenie)

**2.1** V ľavom menu klikni **"Build"** → **"Authentication"**

**2.2** Klikni **"Get started"**

**2.3** V záložke **"Sign-in method"** klikni **"Add new provider"**

**2.4** Vyber **"Email/Password"**

**2.5** Zapni prepínač **"Enable"**

**2.6** Klikni **"Save"**

**2.7** (Voliteľné) Pridaj Google login:
- Klikni **"Add new provider"** → **"Google"**
- Zapni **"Enable"**
- Support email: [tvoj-email@gmail.com]
- Klikni **"Save"**

---

### KROK 3: Vytvor Firestore databázu

**3.1** V ľavom menu klikni **"Build"** → **"Firestore Database"**

**3.2** Klikni **"Create database"**

**3.3** Vyber lokáciu:
```
📍 eur3 (europe-west)
```
*(servery v Európe = GDPR compliant)*

**3.4** Security rules:
- Vyber **"Start in production mode"** (bezpečnejšie)
- Klikni **"Next"**

**3.5** Klikni **"Enable"**

**3.6** Čakaj 1 minútu...

**3.7** ✅ Teraz vidíš prázdnu databázu!

---

### KROK 4: Vytvor kolekcie (tabuľky)

**4.1** Klikni **"Start collection"**

**4.2** Collection ID: `users`

**4.3** Klikni **"Next"**

**4.4** Document ID: **"Auto-ID"** (nechaj automatické)

**4.5** Pridaj polia:

| Field | Type | Value |
|-------|------|-------|
| email | string | test@example.com |
| name | string | Test User |
| tier | string | free |
| points | number | 0 |
| created | timestamp | *nechaj prázdne* |

**4.6** Klikni **"Save"**

**4.7** Opakuj pre ďalšie kolekcie:
- `progress` (pokrok študentov)
- `mock_tests` (výsledky testov)
- `achievements` (achievementy)

*(Môžeš to urobiť aj neskôr cez kód)*

---

### KROK 5: Získaj Firebase config (dôležité!)

**5.1** Klikni na ⚙️ **Settings** (koliesko vľavo hore)

**5.2** Klikni **"Project settings"**

**5.3** Scrolluj dole na **"Your apps"**

**5.4** Klikni na **</> Web** ikonu

**5.5** App nickname: `AI-Mentor-Web`

**5.6** Klikni **"Register app"**

**5.7** **DÔLEŽITÉ:** Skopíruj tento kód:
```javascript
const firebaseConfig = {
  apiKey: "AIza....",
  authDomain: "ai-mentor-xxx.firebaseapp.com",
  projectId: "ai-mentor-xxx",
  storageBucket: "ai-mentor-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

**5.8** Ulož ho do textového súboru:
```
firebase-config.txt
```

**5.9** Klikni **"Continue to console"**

✅ **Firebase HOTOVO!**

---

## ČASŤ 2: GITHUB SETUP (10 minút)

GitHub = kde nahrať kód

### KROK 1: Vytvor GitHub účet

**1.1** Choď na: **https://github.com**

**1.2** Klikni **"Sign up"** (vpravo hore)

**1.3** Zadaj:
- Email: [tvoj email]
- Password: [silné heslo]
- Username: [napr. "ai-mentor-sk"]

**1.4** Verify (captcha)

**1.5** Potvrď email (príde ti email s kódom)

---

### KROK 2: Vytvor repository (úložisko kódu)

**2.1** Po prihlásení klikni **"New"** (zelený button vľavo hore)

**2.2** Repository name: `ai-mentor`

**2.3** Description: `AI Mentor - Adaptive Learning Platform`

**2.4** Vyber **"Public"** (zadarmo) alebo **"Private"** (tiež zadarmo)

**2.5** ✅ Zaklikni **"Add a README file"**

**2.6** Klikni **"Create repository"**

---

### KROK 3: Nahraj súbory

**MOŽNOSŤ A: Cez web interface (jednoduchšie)**

**3.1** Klikni **"Add file"** → **"Upload files"**

**3.2** Pretiahni moje súbory:
- `ai-mentor-ultra-components.jsx`
- `ai-mentor-ultra-main.jsx`
- `SMART-RANDOM-QUESTIONS.js`

**3.3** Commit message: `Initial commit - AI Mentor app`

**3.4** Klikni **"Commit changes"**

**MOŽNOSŤ B: Cez Git CLI (pokročilejšie)**

*(Preskočiť ak nepoznáš Git)*

```bash
git clone https://github.com/[tvoj-username]/ai-mentor.git
cd ai-mentor
# Skopíruj moje súbory sem
git add .
git commit -m "Initial commit"
git push
```

✅ **GitHub HOTOVO!**

---

## ČASŤ 3: VERCEL DEPLOY (20 minút)

Vercel = hosting (kde bude web online)

### KROK 1: Vytvor Vercel účet

**1.1** Choď na: **https://vercel.com**

**1.2** Klikni **"Sign Up"** (vpravo hore)

**1.3** Vyber **"Continue with GitHub"**

**1.4** Authorize Vercel (povoľ prístup)

---

### KROK 2: Importuj projekt

**2.1** Klikni **"Add New..."** → **"Project"**

**2.2** Vyber svoj GitHub repository: `ai-mentor`

**2.3** Klikni **"Import"**

**2.4** Framework Preset: **"Create React App"** (alebo "Next.js")

**2.5** Root Directory: `./` (nechaj ako je)

**2.6** Build Command:
```bash
npm run build
```

**2.7** Output Directory:
```
build
```

---

### KROK 3: Environment Variables (Firebase config)

**3.1** Scrolluj na **"Environment Variables"**

**3.2** Pridaj:

| Name | Value |
|------|-------|
| REACT_APP_FIREBASE_API_KEY | AIza.... (z firebase-config.txt) |
| REACT_APP_FIREBASE_AUTH_DOMAIN | ai-mentor-xxx.firebaseapp.com |
| REACT_APP_FIREBASE_PROJECT_ID | ai-mentor-xxx |
| REACT_APP_FIREBASE_STORAGE_BUCKET | ai-mentor-xxx.appspot.com |
| REACT_APP_FIREBASE_MESSAGING_SENDER_ID | 123456789 |
| REACT_APP_FIREBASE_APP_ID | 1:123456789:web:xxxxx |

**3.3** Klikni **"Deploy"**

**3.4** Čakaj 2-5 minút... ☕

**3.5** ✅ **"Congratulations! Your project has been deployed."**

---

### KROK 4: Testuj aplikáciu

**4.1** Klikni na **URL** (niečo ako: `ai-mentor-xyz.vercel.app`)

**4.2** Mala by sa otvoriť tvoja aplikácia! 🎉

**4.3** Skúsi sa registrovať:
- Email: test@test.com
- Heslo: Test1234

**4.4** Ak funguje = **SUCCESS!** ✅

---

## ČASŤ 4: STRIPE SETUP (40 minút)

**POZOR:** Stripe vyžaduje IČO/DIČ (SZČO alebo S.R.O.)

### KROK 1: Vytvor SZČO (ak ešte nemáš)

**Čo potrebuješ:**
- Občiansky preukaz
- Trvalý pobyt
- Ísť na živnostenský úrad

**Náklady:** €0 (registrácia zadarmo)

**Čas:** 1-2 hodiny (na úrade)

**Živnosť:** 
- 74.90.2 - Vzdelávacie a výcvikové služby
- alebo: 62.01.0 - Počítačové programovanie

*(Alebo použi už existujúce IČO)*

---

### KROK 2: Registrácia na Stripe

**2.1** Choď na: **https://stripe.com/sk**

**2.2** Klikni **"Sign up"**

**2.3** Zadaj:
- Email: [tvoj email]
- Password: [heslo]
- Country: **Slovakia**

**2.4** Klikni **"Create account"**

---

### KROK 3: Dokončenie profilu

**3.1** Business type: **"Individual"** (SZČO) alebo **"Company"** (SRO)

**3.2** Industry: **"Education"**

**3.3** Zadaj:
- IČO: [tvoje IČO]
- DIČ: [tvoje DIČ]
- Adresa: [sídlo]
- Meno: [tvoje meno]
- Dátum narodenia: [DD/MM/YYYY]

**3.4** Bank account (pre výplaty):
- IBAN: [tvoj IBAN]
- Bank: [tvoja banka]

**3.5** Submit & Wait for verification (1-2 dni)

---

### KROK 4: Vytvor Products (cenové balíčky)

**Počkaj kým Stripe overí účet (1-2 dni)**

**4.1** V Dashboard klikni **"Products"**

**4.2** Klikni **"Add product"**

**4.3** Product 1: STANDARD

| Field | Value |
|-------|-------|
| Name | AI Mentor - Standard |
| Description | Neobmedzené úlohy + AI Chat + Mock testy |
| Price | 9.99 EUR |
| Billing | Recurring - Monthly |

**4.4** Klikni **"Save product"**

**4.5** Opakuj pre:
- **PREMIUM** (€19.99/mes)
- **ULTIMATE** (€49.99/mes)

---

### KROK 5: Zapni Customer Portal

**5.1** V Dashboard → **Settings** → **Customer portal**

**5.2** Klikni **"Activate"**

**5.3** Customize:
- Logo: [tvoje logo]
- Colors: [tvoje farby]

**5.4** Features:
- ✅ Cancel subscription
- ✅ Update payment method
- ✅ View invoice history

**5.5** Klikni **"Save"**

---

### KROK 6: Webhooks (pre automatizáciu)

**6.1** **Settings** → **Developers** → **Webhooks**

**6.2** Klikni **"Add endpoint"**

**6.3** Endpoint URL:
```
https://ai-mentor-xyz.vercel.app/api/stripe-webhook
```
*(tvoja Vercel URL + /api/stripe-webhook)*

**6.4** Events to send:
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**6.5** Klikni **"Add endpoint"**

**6.6** **DÔLEŽITÉ:** Skopíruj **"Signing secret"**
```
whsec_....
```

Ulož do: `stripe-webhook-secret.txt`

---

### KROK 7: Získaj API keys

**7.1** **Developers** → **API keys**

**7.2** Skopíruj:

**Publishable key:**
```
pk_test_.... (test mode)
pk_live_.... (production mode)
```

**Secret key:**
```
sk_test_.... (test mode)
sk_live_.... (production mode - NIKDY NEZDIEĽAJ!)
```

**7.3** Ulož do: `stripe-keys.txt`

---

### KROK 8: Pridaj do Vercel Environment Variables

**8.1** Choď na Vercel → **Project** → **Settings** → **Environment Variables**

**8.2** Pridaj:

| Name | Value |
|------|-------|
| STRIPE_PUBLISHABLE_KEY | pk_test_... (neskôr pk_live_...) |
| STRIPE_SECRET_KEY | sk_test_... (SECRET!) |
| STRIPE_WEBHOOK_SECRET | whsec_... |

**8.3** Klikni **"Save"**

**8.4** Redeploy (Deployments → ... → Redeploy)

✅ **Stripe HOTOVO!**

---

## ČASŤ 5: VLASTNÁ DOMÉNA (voliteľné, €12/rok)

### KROK 1: Kúp doménu

**1.1** Choď na: **https://www.websupport.sk**

**1.2** Hľadaj: `ai-mentor` (alebo iný názov)

**1.3** Vyber voľnú doménu:
- `ai-mentor.sk` - €12/rok
- `prijimacky.sk` - zrejme obsadené
- `smartstudy.sk` - skús

**1.4** Pridaj do košíka

**1.5** Plať kartou (€12)

---

### KROK 2: Nastav DNS

**2.1** V Websupport → **Doména** → **DNS**

**2.2** Pridaj A záznam:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | cname.vercel-dns.com |
| CNAME | www | cname.vercel-dns.com |

**2.3** Klikni **"Uložiť"**

---

### KROK 3: Pridaj doménu do Vercel

**3.1** Vercel → **Project** → **Settings** → **Domains**

**3.2** Zadaj: `ai-mentor.sk`

**3.3** Klikni **"Add"**

**3.4** Čakaj 10-60 minút (DNS propagácia)

**3.5** ✅ Keď uvidíš zelený checkmark = HOTOVO!

**3.6** Tvoj web je teraz na: **https://ai-mentor.sk** 🎉

---

## ČASŤ 6: SSL CERTIFIKÁT (automaticky ZADARMO)

Vercel automaticky vytvorí SSL certifikát (Let's Encrypt).

**Overiť:**
- Choď na tvoju doménu
- Malo by byť **https://** (zelený zámok)
- Ak je **http://** (červené), čakaj ešte 10 minút

---

## ČASŤ 7: TESTOVANIE (30 minút)

### Checklist:

**Frontend:**
- [ ] Web sa načíta
- [ ] Registrácia funguje
- [ ] Prihlásenie funguje
- [ ] Úlohy sa zobrazujú
- [ ] AI Chat funguje
- [ ] Mock test sa dá spustiť

**Backend:**
- [ ] Firebase ukladá dáta (User Dashboard → Firestore)
- [ ] Authentication funguje (Firebase → Authentication → Users)

**Platby (Test Mode):**
- [ ] Stripe checkout sa otvorí
- [ ] Test karta: `4242 4242 4242 4242`
- [ ] Expiry: `12/34`, CVC: `123`
- [ ] Platba prebehla
- [ ] Tier sa zmenil na "Standard"

---

## ČASŤ 8: PREPNI NA PRODUCTION MODE

**Keď všetko funguje v test mode:**

### Stripe:

**8.1** Dashboard → Toggle **"Test mode"** OFF (vpravo hore)

**8.2** Skopíruj **production keys**:
- `pk_live_...`
- `sk_live_...`

**8.3** Vercel → Environment Variables → Update:
- `STRIPE_PUBLISHABLE_KEY` = pk_live_...
- `STRIPE_SECRET_KEY` = sk_live_...

**8.4** Redeploy

---

## 🎉 HOTOVO! WEB JE LIVE!

Tvoj web je teraz:
- ✅ Online (https://ai-mentor.sk)
- ✅ Bezpečný (SSL)
- ✅ S databázou (Firebase)
- ✅ S platbami (Stripe)
- ✅ GDPR compliant

---

## 🆘 POMOC PRI PROBLÉMOCH

### Firebase nefunguje?
- Skontroluj Security Rules (Firestore → Rules)
- Musí byť:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Vercel deploy zlyháva?
- Skontroluj Build Logs
- Pravdepodobne chýbajú dependencies
- Pridaj `package.json`:
```json
{
  "name": "ai-mentor",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "firebase": "^10.7.1",
    "lucide-react": "^0.263.1"
  }
}
```

### Stripe nefunguje?
- Skontroluj či sú správne API keys (pk_, sk_)
- Skontroluj webhook endpoint URL
- Test karta: `4242 4242 4242 4242`

### Ešte niečo?
Email: support@ai-mentor.sk

---

## 📝 ĎALŠIE KROKY

**1. Marketing (0-2 týždne)**
- Vytvor Facebook/Instagram stránku
- Prvý post: "Nová platforma na prípravu na prijímačky!"
- Pozvi 50 známych/rodičov

**2. Beta testing (2-4 týždne)**
- Nájdi 10-20 študentov
- Daj im FREE Premium na 1 mesiac
- Zbieraj feedback

**3. Launch (týždeň 5)**
- Oficiálny launch
- Lokálne médiá (press release)
- Školy (email učiteľom)

**4. Growth (mesiac 2-3)**
- Google/Facebook Ads (budget €100-300)
- SEO (blog články)
- Partnerships (doučovatelia)

---

**Gratulujem! Si teraz majiteľ live EdTech platformy!** 🚀🎓

