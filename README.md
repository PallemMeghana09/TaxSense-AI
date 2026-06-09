# TaxSense AI ⚖️💼

**TaxSense AI** is an elite, full-stack, AI-powered corporate tax auditing, regulatory search, and legal compliance suite. It enables legal contract analysts, tax professionals, and compliance officers to research complex regulatory frameworks, perform rigorous document auditing, conduct automated risk assessments, and check legal agreements against real-time regulatory rules.

---

## 🌟 Key Capabilities

- 🔍 **Smart Search & Semantic Grounding**: Grounded research coupled with vector similarity indexing. Query passages to locate exact compliance matches.
- 📜 **Compliance Checker**: Cross-references legal contracts (such as SaaS service agreements, SaaS licensing, or internal corporate SLAs) against IRS/SEC regulations (like pass-through structures or tax-deductible limitations).
- 📋 **Checklist Generator**: Formulates targeted checklists under tax/regulatory clauses (e.g., IRS Section 199A pass-through write-off codes).
- ⚠️ **Risk Assessment**: Highlights liabilities, structural weaknesses, unauthorized clauses, or security lapses in corporate agreements.
- 📊 **Real-time Analytics**: Displays overall risk distributions, contract status summaries, and auditing logs to verify passed markers in sandbox environments.

---

## ⚙️ Setting Up Firebase Configuration

TaxSense AI integrates with Cloud Firestore and Firebase Authentication to persist analysis results, verified document marks, and user credentials.

### Supplied Configuration
Your custom Firebase JS SDK credentials have been configured inside:
- `firebase-applet-config.json` (root directory)
- `src/firebase-applet-config.json` (client application space)

---

## 🛠️ Troubleshooting: Solving the `auth/unauthorized-domain` Error

If you attempt to sign in or register via Email/Password or Google OAuth and receive a `Firebase: Error (auth/unauthorized-domain)` error, it means the Google Cloud Run hosting URL has not been added to your Firebase Authorized Domains.

### How to Fix This in 3 Steps:

1. **Verify Your App URL**: Note down your current hosting domain from your browser address bar:
   - For example: `ais-dev-edkujplk7msublpt4chtix-938450475729.asia-southeast1.run.app` or `ais-pre-edkujplk7msublpt4chtix-938450475729.asia-southeast1.run.app`.

2. **Open the Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Select your project: **`ai-legal-1b62b`**.

3. **Authorize the Domain**:
   - Navigate to **Authentication** (in the Build section) -> **Settings** tab.
   - Click on **Authorized domains** under the settings block.
   - Click **Add domain**.
   - Input your specific hosting domain (do not include `https://`, just specify the hostname itself, e.g., `ais-dev-edkujplk7msublpt4chtix-938450475729.asia-southeast1.run.app`).
   - Click **Add** to authorize.

Your domain authentication request will immediately begin succeeding!

---

## 💻 Technical Setup & Environment

The application runs as a cohesive Full-stack Express + React application utilizing a Vite build system.

### Dependencies
- **Core Runtime**: Node.js, Express, React, Vite
- **AI Capabilities**: `@google/genai` (Gemini API SDK for real-time text summaries and analysis)
- **Database / Auth**: Firebase (Auth & Firestore)
- **Styling & Motion**: Tailwind CSS v4, Motion (Animation framework)

### Required Environment Variables (`.env.example`)
Configure the following secrets in your environment settings:
```bash
# Required for server-side Gemini AI models
GEMINI_API_KEY=""

# The hosted URL injected during runtimes (for self-referential hooks)
APP_URL=""
```

---

## 🚀 Running the Application

Manage the environment using the typical Node scripts:

### Development Mode
Boot the full-stack server (runs Express and mounts Vite dynamically in development mode) on port `3000`:
```bash
npm run dev
```

### Build Phase
Build the React production static files into the `dist/` folder and compile the backend `server.ts` into standard CommonJS `dist/server.cjs` via `esbuild`:
```bash
npm run build
```

### Production Start
Launch the optimized bundle:
```bash
npm run start
```

### Code Integrity / Type-Checking
Validate Typescript syntax statically:
```bash
npm run lint
```
