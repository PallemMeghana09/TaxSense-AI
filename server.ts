import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, query, where, getDoc } from "firebase/firestore";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Firestore safely
let firebaseApp: any = null;
let db: any = null;
let useFirestore = false;

try {
  const configPath = path.join(process.cwd(), "src/firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const isPlaceholder = !firebaseConfig ||
                          !firebaseConfig.apiKey ||
                          firebaseConfig.apiKey === "YOUR_API_KEY" ||
                          firebaseConfig.apiKey === "remixed-api-key" ||
                          firebaseConfig.apiKey.includes("your-") ||
                          firebaseConfig.projectId.includes("remixed-") ||
                          firebaseConfig.projectId === "YOUR_PROJECT_ID";

    if (firebaseConfig && !isPlaceholder) {
      firebaseApp = initializeApp(firebaseConfig);
      db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
      useFirestore = true;
      console.log("Successfully connected into cloud-backed Firebase Firestore.");
    } else {
      console.log("Firebase config contains unconfigured or placeholder/remixed credentials. Operating with robust local sandboxed datastore.");
    }
  }
} catch (err) {
  console.error("Resilient fallback active. Failed to initialize Firestore client:", err);
}

// Initialize Gemini Client safely
let aiClient: any = null;
const getGeminiClient = () => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
        console.log("Initialized GoogleGenAI Client successfully.");
      } catch (err) {
        console.warn("Failed to instantiate GoogleGenAI, using mock handler instead.", err);
      }
    }
  }
  return aiClient;
};

// Initial database seed for documents
const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    title: "CloudFlow_SaaS_Service_Agreement_2026.pdf",
    category: "Legal Contract",
    uploadedAt: "2026-06-01T10:15:00Z",
    uploadedBy: "Samantha Ross (General Counsel)",
    fileSize: "2.4 MB",
    pagesCount: 8,
    status: "Analyzed",
    executiveSummary: {
      purpose: "Enterprise SLA governing cloud application delivery, security standards, liability limits, and annual subscription compliance between CloudFlow Inc. and AlphaCorp Solutions.",
      keyFindings: [
        "Grants a non-exclusive, non-transferable global cloud access license.",
        "Guarantees a 99.95% uptime availability, backed by tiered service credits.",
        "Limits service provider liability to the fees paid in the trailing 12-month period.",
        "Establishes Delaware jurisdiction with mandatory informal peer escalation before formal arbitration."
      ],
      importantClauses: [
        {
          title: "Section 4.1: Subscription Fees and Audits",
          content: "AlphaCorp yields the right to deploy CloudFlow for up to 5,000 active monthly employees. CloudFlow reserves the right to conduct an annual digital credential audit of active directory accounts to evaluate compliant usage. Overages are billed at $15 per seat retrospectively.",
          page: 3
        },
        {
          title: "Section 7.3: Data Ownership and GDPR Indemnity",
          content: "All client-uploaded regulatory inputs remain the sole exclusive property of AlphaCorp. However, CloudFlow is indemnified against individual regulatory inquiries under GDPR Chapter 4 obligations if the client utilizes non-standard unencrypted custom payload fields.",
          page: 5
        },
        {
          title: "Section 11.2: Limitation of Liability Cap",
          content: "In no event shall either party be liable to the other for indirect, special, punitive, or consequential damages. The maximal consolidated threshold for active direct contract claims shall not surpass the total amounts actually collected during the twelve months immediately preceding the liability trigger.",
          page: 7
        }
      ],
      risks: [
        "Uncapped retrospectively calculated fees of $15/seat for subscription directory overages.",
        "Indemnification gaps exist if local users accidentally upload unencrypted PII in public schema fields.",
        "Arbitration clauses require pre-mediation in Delaware, potentially increasing litigation defense costs."
      ],
      recommendations: [
        "Establish an internal Active Directory seat monitor to prevent retroactive $15 invoice penalties.",
        "Execute the separate DP-Addendum (DPA) specifying high-grade field encryptors before launching public modules.",
        "Propose state-local arbitration or mutual neutral region (e.g., Chicago) to save regional jurisdictional travel overhead."
      ]
    },
    sections: [
      {
        title: "1. Scope of Subscription License",
        content: "CloudFlow grants AlphaCorp a restricted, non-exclusive, revocable, and non-transferable subscription license to access the SaaS orchestration layers during the active term solely for legitimate corporate objectives.",
        summary: "Authorized SaaS usage license criteria, specifically banning distribution or sub-licensing to subsidiary holdings.",
        importantTerms: ["revocable", "non-transferable", "orchestration"],
        riskIndicators: ["Restrictive access could trigger audit compliance holds if structural mergers occur."],
        references: ["ToS §1.1", "Exhibit B License Sheet"],
        page: 1
      },
      {
        title: "4. Billing and Directory Audits",
        content: "Subscriber shall settle standard recurring service charges within 30 calendar days. Service provider exercises explicit authority to launch electronic seat queries to verify directory compliance annually.",
        summary: "30-day payment term guidelines combined with the active service provider usage audit terms.",
        importantTerms: ["electronic queries", "30 calendar days", "retrospective overages"],
        riskIndicators: ["Failure to restrict remote queries could expose private organizational telemetry."],
        references: ["ToS §4.1", "Fee Appendix 2"],
        page: 3
      },
      {
        title: "7. Data Protection & Processing Integrity",
        content: "Parties will conform to standard security frameworks. AlphaCorp is strictly liable for securing local credentials and avoiding unencrypted personally identifiable information (PII) transfers in general-use form elements.",
        summary: "Data privacy division. Customers retain general database inputs but assume liabilities for uploading loose PII.",
        importantTerms: ["PII", "general-use form elements", "Processing Integrity"],
        riskIndicators: ["High penalty potential if user forms are exposed without separate DB encryption agreements."],
        references: ["ToS §7.3", "Data Policy v4"],
        page: 5
      }
    ]
  },
  {
    id: "doc-2",
    title: "US_IRC_Section_199A_Tax_Advisory.pdf",
    category: "Tax Regulation",
    uploadedAt: "2026-06-03T14:45:00Z",
    uploadedBy: "Arthur Sterling, CPA",
    fileSize: "1.8 MB",
    pagesCount: 5,
    status: "Analyzed",
    executiveSummary: {
      purpose: "Analysis of Section 199A Pass-Through Qualification rules, specifically assessing Qualified Business Income (QBI) deductions for trust-managed operating LLCs.",
      keyFindings: [
        "A 20% tax deduction on Qualified Business Income is valid for eligible pass-through entities.",
        "Specific Specified Service Trades or Businesses (SSTBs) face rigorous phase-out limitations once taxable income exceeds statutory caps.",
        "W-2 wages paid and the unadjusted basis immediately after acquisition (UBIA) of qualified property act as direct deduction caps."
      ],
      importantClauses: [
        {
          title: "Section 1.199A-1: Operational QBI Definition",
          content: "Qualified Business Income is restricted to items of income, gain, deduction, and loss effectively connected with the conduct of a domestic trade or business within the United States. Excludes qualified investment dividends, capital gains, or reasonable officer salaries.",
          page: 2
        },
        {
          title: "Section 1.199A-5: Specified Service Business phase-out",
          content: "Specified Service Trades or Businesses (SSTBs) include services rendered in fields of health, law, accounting, actuarial science, financial analysis, athletic representation, or where the principal asset is the reputation or skill of employees. Phase-out ranges from $182,100 to $232,100 (single filers).",
          page: 4
        }
      ],
      risks: [
        "Tax advisory firms could be reclassified as SSTBs, fully eliminating the 20% QBI pass-through deduction.",
        "Incorrect inclusion of passive stock option payouts in QBI calculations, risking IRS audit adjustments and underpayment interest."
      ],
      recommendations: [
        "Segregate client-services consulting (SSTB) from administrative property leasing (non-SSTB) within distinct LLC tax structures.",
        "Accurately record and document actual W-2 salary disbursements per entity to satisfy wage testing limits."
      ]
    },
    sections: [
      {
        title: "1. Core Pass-Through QBI Deductions",
        content: "Under Section 199A, an individual taxpayer is generally permitted a deduction equal to 20% of their domestic qualified business income from partnership, S-Corporation, or single-member LLC structures, subject to taxable income limitations.",
        summary: "Introduction of the 20% pass-through tax write-off framework.",
        importantTerms: ["deduction", "pass-through", "partnership", "S-Corporation"],
        riskIndicators: ["Exclusion of foreign branches or international subsidiary earnings from the 199A deduction."],
        references: ["IRC Code §199A(a)", "Form 8995"],
        page: 1
      },
      {
        title: "3. Trade & SSTB Definitions",
        content: "Tax write-offs are explicitly capped for service firms categorized under Specified Service Trades or Businesses (SSTB). Standard consulting, accounting, law and healthcare organizations are disqualified past base income thresholds.",
        summary: "Categorization of service entities that are denied or capped under pass-through incentives.",
        importantTerms: ["SSTB", "phase-out thresholds", "consulting", "health"],
        riskIndicators: ["Cross-contamination of operational LLCs with consulting divisions, which invalidates deductions."],
        references: ["Reg. §1.199A-5(b)"],
        page: 3
      }
    ]
  }
];

// In-Memory database for standard LexAI session data
let activeDocuments = [...INITIAL_DOCUMENTS];
let complianceReports: any[] = [
  {
    id: "rep-1",
    documentId: "doc-1",
    documentTitle: "CloudFlow_SaaS_Service_Agreement_2026.pdf",
    industry: "Financial Technology (FinTech)",
    score: 84,
    passedChecks: [
      { id: "p-1", title: "Encrypted Data Transmission Protocols", category: "Data Security", description: "Standard TLS 1.3 is configured for all external connections." },
      { id: "p-2", title: "Customer Proprietary Data Shield", category: "Ownership", description: "Customer retains absolute proprietary IP ownership on general platform inputs." },
      { id: "p-3", title: "Disaster Recovery Uptime Contingency", category: "Business Continuity", description: "Service SLA includes redundancy protocols and automated physical VM snapshots." }
    ],
    warningAreas: [
      { id: "w-1", title: "Retroactive Active Directory Employee Audits", severity: "Medium", description: "Section 4.1 grants CloudFlow structural access to conduct direct employee credential count evaluations with retrospective seat surcharges.", recommendation: "Clarify directory audit access procedures; request manual self-reporting as the primary option." },
      { id: "w-2", title: "PII Security Exclusion in Form Fields", severity: "Low", description: "Customer is liable for secure encryption configurations on general customizable custom payload inputs.", recommendation: "Implement an internal middleware checker to scrub or mask Social Security or Bank routing inputs before submission." }
    ],
    violations: [
      { id: "v-1", title: "Absence of Specific COPPA / Young-User Protections", penalty: "$50,000 per statutory breach", description: "No warning systems exist within parent license documents if client accounts onboard secondary school minors.", solution: "Add explicit platform age restrictions and secondary parental consent verification flows in global onboarding." }
    ],
    recommendations: [
      { id: "r-1", title: "Draft Separate HIPAA BAA Integration", action: "Negotiate a Business Associate Agreement if medical employee logs are saved.", priority: "High" },
      { id: "r-2", title: "Relocate Delaware Litigation Seat", action: "Alter dispute venues to mutual neutral or domestic headquarters.", priority: "Medium" }
    ]
  },
  {
    id: "rep-2",
    documentId: "doc-2",
    documentTitle: "US_IRC_Section_199A_Tax_Advisory.pdf",
    industry: "Professional Services / Accounting",
    score: 95,
    passedChecks: [
      { id: "p-21", title: "Effective Domestic Trade Alignment", category: "Jurisdiction", description: "Income validation is strictly aligned to domestic U.S. trading activities." },
      { id: "p-22", title: "Wage cap categorization rules", category: "Compensation", description: "Direct calculations separate actual payroll from secondary non-wage partner cash outs." }
    ],
    warningAreas: [
      { id: "w-21", title: "Sole Practitioner Income Ceiling limits", severity: "High", description: "Individual single filers face total phaseout if consulting income exceeds $232,100.", recommendation: "Formulate annual projected tax filings to adjust taxable net incomes below standard limits using Retirement plan contributions." }
    ],
    violations: [],
    recommendations: [
      { id: "r-21", title: "Perform Entity Restructuring", action: "Incorporate secondary management LLC to separate advisory components from physical real-estate ownership.", priority: "High" }
    ]
  }
];

let riskReports: any[] = [
  {
    id: "risk-1",
    documentId: "doc-1",
    documentTitle: "CloudFlow_SaaS_Service_Agreement_2026.pdf",
    overallScore: "Medium",
    categories: [
      {
        name: "Contract Risk",
        level: "High",
        probability: 60,
        impact: 75,
        mitigationStrategy: "Propose limits on retro-billing overages and secure pre-escalation dispute resolution timelines."
      },
      {
        name: "Financial Risk",
        level: "Medium",
        probability: 40,
        impact: 65,
        mitigationStrategy: "Monitor directory subscription targets monthly via Cloud ERP connectors."
      },
      {
        name: "Tax Risk",
        level: "Low",
        probability: 15,
        impact: 30,
        mitigationStrategy: "Local state standard digital license taxes are accounted for; no exceptional exposure."
      },
      {
        name: "Regulatory Risk",
        level: "High",
        probability: 50,
        impact: 85,
        mitigationStrategy: "Deploy automatic data protection check structures to isolate European PII from custom variables."
      },
      {
        name: "Legal Exposure",
        level: "Medium",
        probability: 30,
        impact: 70,
        mitigationStrategy: "Introduce a reciprocal $500k cap on contract breaches to level the current one-way SaaS provider protection stance."
      }
    ]
  },
  {
    id: "risk-2",
    documentId: "doc-2",
    documentTitle: "US_IRC_Section_199A_Tax_Advisory.pdf",
    overallScore: "High",
    categories: [
      {
        name: "Contract Risk",
        level: "Low",
        probability: 10,
        impact: 20,
        mitigationStrategy: "Advisory client agreements should clarify QBI liability exemptions based on changing federal tax codes."
      },
      {
        name: "Financial Risk",
        level: "High",
        probability: 70,
        impact: 90,
        mitigationStrategy: "Execute year-end asset purchases or retirement fund balances to adjust eligible income margins."
      },
      {
        name: "Tax Risk",
        level: "Critical",
        probability: 80,
        impact: 95,
        mitigationStrategy: "Obtain clean third-party S-corp compensation appraisals to satisfy logical IRS officer wage demands."
      },
      {
        name: "Regulatory Risk",
        level: "High",
        probability: 60,
        impact: 80,
        mitigationStrategy: "Maintain continuous monitoring of legislative amendments regarding pass-through write-off sunset dates."
      },
      {
        name: "Legal Exposure",
        level: "Medium",
        probability: 45,
        impact: 60,
        mitigationStrategy: "Secure robust professional S-corp and LLC liability policies to offset prospective IRS penalties."
      }
    ]
  }
];

let checklists: any[] = [
  {
    id: "chk-1",
    title: "Quarterly GST Filing Checklist",
    category: "GST Filing",
    createdAt: "2026-06-05T09:00:00Z",
    items: [
      { id: "i-1", text: "Reconcile outward supply records against active sales invoicing registers.", checked: true },
      { id: "i-2", text: "Verify Input Tax Credit (ITC) qualifications matches current purchase receipts.", checked: true },
      { id: "i-3", text: "Match physical stock alterations against registered asset losses or write-offs.", checked: false, notes: "Needs investigation from procurement lead." },
      { id: "i-4", text: "Validate cross-border remote digital license invoices meet inverse charge structures.", checked: false },
      { id: "i-5", text: "Compile and file draft GSTR-1, obtaining statutory electronic verify markers.", checked: false }
    ]
  },
  {
    id: "chk-2",
    title: "SaaS Enterprise Compliance Audit Checklist",
    category: "Audit Preparation",
    createdAt: "2026-06-03T11:30:00Z",
    items: [
      { id: "i-11", text: "Verify active single-sign-on credentials are de-provisioned for inactive logins.", checked: true },
      { id: "i-12", text: "Perform simulated penetration testing on core AWS databases.", checked: false, notes: "Scheduled for next Tuesday by CloudOps." },
      { id: "i-13", text: "Validate remote customer data backups execute with full 256-bit AES encryption key cycles.", checked: true },
      { id: "i-14", text: "Review active SaaS ToS liabilities against state limit updates.", checked: false }
    ]
  }
];

// Helper to retrieve documents from DB or fall back to memory
const getDocumentsFromDb = async () => {
  if (!useFirestore) return activeDocuments;
  try {
    const snapshot = await getDocs(collection(db, "documents"));
    const docs: any[] = [];
    snapshot.forEach((docSnap) => {
      docs.push({ id: docSnap.id, ...docSnap.data() });
    });
    if (docs.length === 0) {
      console.log("Seeding documents inside Firestore...");
      for (const docObj of INITIAL_DOCUMENTS) {
        await setDoc(doc(db, "documents", docObj.id), {
          ...docObj,
          ownerId: "user-default-1"
        });
        docs.push({ ...docObj, ownerId: "user-default-1" });
      }
    }
    return docs;
  } catch (err) {
    console.error("Failed to query documents from Firestore, falling back", err);
    return activeDocuments;
  }
};

const getComplianceReportsFromDb = async () => {
  if (!useFirestore) return complianceReports;
  try {
    const snapshot = await getDocs(collection(db, "complianceReports"));
    const reports: any[] = [];
    snapshot.forEach((snap) => {
      reports.push({ id: snap.id, ...snap.data() });
    });
    if (reports.length === 0) {
      console.log("Seeding complianceReports inside Firestore...");
      for (const rep of complianceReports) {
        await setDoc(doc(db, "complianceReports", rep.id), {
          ...rep,
          ownerId: "user-default-1"
        });
        reports.push({ ...rep, ownerId: "user-default-1" });
      }
    }
    return reports;
  } catch (err) {
    console.error("Failed to fetch compliance reports from Firestore, falling back", err);
    return complianceReports;
  }
};

const getRiskReportsFromDb = async () => {
  if (!useFirestore) return riskReports;
  try {
    const snapshot = await getDocs(collection(db, "riskReports"));
    const reports: any[] = [];
    snapshot.forEach((snap) => {
      reports.push({ id: snap.id, ...snap.data() });
    });
    if (reports.length === 0) {
      console.log("Seeding riskReports inside Firestore...");
      for (const rep of riskReports) {
        await setDoc(doc(db, "riskReports", rep.id), {
          ...rep,
          ownerId: "user-default-1"
        });
        reports.push({ ...rep, ownerId: "user-default-1" });
      }
    }
    return reports;
  } catch (err) {
    console.error("Failed to fetch risk reports from Firestore, falling back", err);
    return riskReports;
  }
};

const getChecklistsFromDb = async () => {
  if (!useFirestore) return checklists;
  try {
    const snapshot = await getDocs(collection(db, "checklists"));
    const lists: any[] = [];
    snapshot.forEach((snap) => {
      lists.push({ id: snap.id, ...snap.data() });
    });
    if (lists.length === 0) {
      console.log("Seeding checklists inside Firestore...");
      for (const chk of checklists) {
        await setDoc(doc(db, "checklists", chk.id), {
          ...chk,
          ownerId: "user-default-1"
        });
        lists.push({ ...chk, ownerId: "user-default-1" });
      }
    }
    return lists;
  } catch (err) {
    console.error("Failed to fetch checklists from Firestore, falling back", err);
    return checklists;
  }
};

// Document Upload trends visual mock generator
const DOCUMENT_TRENDS_MOCK = [
  { month: "Jan", uploads: 2, score: 78, queries: 12 },
  { month: "Feb", uploads: 5, score: 82, queries: 28 },
  { month: "Mar", uploads: 8, score: 80, queries: 45 },
  { month: "Apr", uploads: 6, score: 85, queries: 32 },
  { month: "May", uploads: 12, score: 88, queries: 64 },
  { month: "Jun", uploads: 15, score: 91, queries: 87 }
];

// API Endpoints

// GET /api/documents
// GET /api/documents
app.get("/api/documents", async (req, res) => {
  const docs = await getDocumentsFromDb();
  res.json({ documents: docs });
});

// POST /api/documents (Create/Upload Document)
app.post("/api/documents", async (req, res) => {
  const { title, category, uploadedBy, contentPlaceholder } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Document title is required" });
  }

  const newDocId = `doc-${Date.now()}`;
  const sizeKb = Math.floor(Math.random() * 2000) + 200;
  const pageEst = Math.floor(Math.random() * 12) + 2;

  const newDocument: any = {
    id: newDocId,
    title,
    category: category || "Custom Upload",
    uploadedAt: new Date().toISOString(),
    uploadedBy: uploadedBy || "Compliance Analyst",
    fileSize: `${(sizeKb / 1024).toFixed(1)} MB`,
    pagesCount: pageEst,
    status: "Analyzing"
  };

  if (useFirestore) {
    try {
      await setDoc(doc(db, "documents", newDocId), {
        ...newDocument,
        ownerId: "user-default-1"
      });
    } catch (err) {
      console.error("Firestore write document error:", err);
    }
  } else {
    activeDocuments.push(newDocument);
  }

  // Trigger asynchronous mock/Gemini parsing
  res.json({ success: true, document: newDocument });

  // background execution simulation
  try {
    const ai = getGeminiClient();
    if (ai) {
      console.log(`Using Gemini API to parse contract/regulation info for: ${title}`);
      const prompt = `You are a Tier-1 Legal and Corporate Tax specialist. Analyze this file title: "${title}". Use the context of the user request: "${contentPlaceholder || ''}".
      Provide a highly realistic, structurally accurate executive summary, lists of findings, clause citations, 3 risks, and 3 recommendations.
      Format the response as a JSON object matching this schema precisely:
      {
        "purpose": "A 1-sentence statement describing purpose",
        "keyFindings": ["Finding 1", "Finding 2"],
        "importantClauses": [{"title": "Section Title", "content": "Verbatim-like clause content", "page": 1}],
        "risks": ["Risk details 1", "Risk details 2"],
        "recommendations": ["Recommendation details 1", "Recommendation details 2"],
        "sections": [{"title": "Section Name", "content": "Full section text content", "summary": "Section summary", "importantTerms": ["term1", "term2"], "riskIndicators": ["risk1"], "references": ["Ref §1"], "page": 1}]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsedData = JSON.parse(response.text.trim());
      const executiveSummary = {
        purpose: parsedData.purpose || `Automated analysis of the uploaded ${category || "General Document"}.`,
        keyFindings: parsedData.keyFindings || [`Document loaded and parsed successfully.`, `Standard regulatory provisions are highlighted.`],
        importantClauses: parsedData.importantClauses || [
          { title: "Standard Obligation §1.1", content: "Parties shall complete performance based on the specific timelines defined within.", page: 1 }
        ],
        risks: parsedData.risks || ["No high-level statutory risks detected inside the file name summary."],
        recommendations: parsedData.recommendations || ["Schedule continuous administrative reviews of regular sub-sections."]
      };
      const sections = parsedData.sections || [
        {
          title: "Header Provisions",
          content: "Primary administrative headers outlining basic responsibilities and operating schedules of this regulatory policy.",
          summary: "Overview of legal operating framework.",
          importantTerms: ["obligations", "governance", "schedule"],
          riskIndicators: ["Administrative delays can trigger late notification issues."],
          references: ["Section 101"],
          page: 1
        }
      ];

      if (useFirestore) {
        await setDoc(doc(db, "documents", newDocId), {
          ...newDocument,
          ownerId: "user-default-1",
          status: "Analyzed",
          executiveSummary,
          sections
        });
      } else {
        const docIndex = activeDocuments.findIndex((d) => d.id === newDocId);
        if (docIndex !== -1) {
          activeDocuments[docIndex].executiveSummary = executiveSummary;
          activeDocuments[docIndex].sections = sections;
          activeDocuments[docIndex].status = "Analyzed";
        }
      }

      // Generate matching Compliance Report
      const compScore = Math.floor(Math.random() * 30) + 65;
      const newComplianceReport = {
        id: `rep-${Date.now()}`,
        documentId: newDocId,
        documentTitle: title,
        industry: "General Business Operations",
        score: compScore,
        passedChecks: [
          { id: `p-${Date.now()}-1`, title: "Authorized Signature Verification", category: "Execution", description: "Standard representative signing clauses have been identified." },
          { id: `p-${Date.now()}-2`, title: "U.S. Jurisdiction Declarations", category: "Compliance", description: "Governing laws align with standard state legal procedures." }
        ],
        warningAreas: [
          { id: `w-${Date.now()}-1`, title: "Vague Dispute Resolution Schedules", severity: "Medium", description: "The timeline to handle internal contract disputes has not been detailed legally.", recommendation: "Specify a definitive 15-day escalation and mediation timeframe prior to arbitration filing." }
        ],
        violations: [],
        recommendations: [
          { id: `r-${Date.now()}-1`, title: "Verify Out-of-State Jurisdiction Charges", action: "Evaluate local municipal business license taxes.", priority: "Low" }
        ]
      };

      // Generate matching Risk Report
      const newRiskReport = {
        id: `risk-${Date.now()}`,
        documentId: newDocId,
        documentTitle: title,
        overallScore: compScore > 85 ? "Low" : compScore > 75 ? "Medium" : "High",
        categories: [
          { name: "Contract Risk", level: compScore > 85 ? "Low" : "Medium", probability: 35, impact: 60, mitigationStrategy: "Re-negotiate regional termination notices." },
          { name: "Financial Risk", level: "Low", probability: 20, impact: 40, mitigationStrategy: "Set up escrow limits." },
          { name: "Tax Risk", level: "Medium", probability: 50, impact: 70, mitigationStrategy: "Consult certified S-Corp tax accountants." },
          { name: "Regulatory Risk", level: "Low", probability: 10, impact: 50, mitigationStrategy: "Deploy periodic system automated logging checks." },
          { name: "Legal Exposure", level: "Medium", probability: 40, impact: 65, mitigationStrategy: "Review state legislative caps." }
        ]
      };

      if (useFirestore) {
        await setDoc(doc(db, "complianceReports", newComplianceReport.id), {
          ...newComplianceReport,
          ownerId: "user-default-1"
        });
        await setDoc(doc(db, "riskReports", newRiskReport.id), {
          ...newRiskReport,
          ownerId: "user-default-1"
        });
      } else {
        complianceReports.push(newComplianceReport);
        riskReports.push(newRiskReport);
      }

    } else {
      // Fallback AI simulation if Gemini API Key not specified
      setTimeout(async () => {
        const executiveSummary = {
          purpose: `Strategic policy agreement analyzing operational standards for "${title}".`,
          keyFindings: [
            "Identifies central cooperative goals, responsibilities, and performance cycles.",
            "Establishes a 30-day payment ledger with standard processing guidelines.",
            "Requires bilateral approval for all secondary contract adjustments."
          ],
          importantClauses: [
            {
              title: "Clause 3.1: Terms of Obligation",
              content: "All physical performance parameters and milestone disbursements are locked for the duration unless amended in writing by authorized representatives.",
              page: 2
            },
            {
              title: "Clause 8.2: Data Security Standards",
              content: "The signing parties shall deploy encryption standards with TLS 1.2 or higher for operational exchanges of any shared customer logs.",
              page: 4
            }
          ],
          risks: [
            "Ambiguity in specific processing timelines can lead to delays.",
            "Absence of reciprocal liabilities in case of physical document data transfer breaches."
          ],
          recommendations: [
            "Formulate a direct SLA schedule annex specifying service-level metrics.",
            "Adjust dispute filing clauses to reflect local state courts."
          ]
        };
        const sections = [
          {
            title: "1. Definition of Terms",
            content: "Defines basic terminology including operational parameters, billing methods, and service credits governing this policy.",
            summary: "Establishing baseline administrative vocabulary.",
            importantTerms: ["operating schedules", "disbursements", "ledger"],
            riskIndicators: ["Broad phrasing could create liability confusion on overpayments."],
            references: ["Art 1.1"],
            page: 1
          },
          {
            title: "2. SLA Performance Parameters",
            content: "Establishes response protocols and customer credit formulas triggered if standard servers remain down.",
            summary: "Service SLA guidelines and performance thresholds.",
            importantTerms: ["service credits", "remediations", "uptime"],
            riskIndicators: ["Reimbursements are capped, limiting customer recovery during outages."],
            references: ["Art 5.2"],
            page: 3
          }
        ];

        const compScore = Math.floor(Math.random() * 20) + 75;
        const newComplianceReport = {
          id: `rep-${Date.now()}`,
          documentId: newDocId,
          documentTitle: title,
          industry: "General Tech Operations",
          score: compScore,
          passedChecks: [
            { id: `p-${Date.now()}`, title: "Jurisdictional Compliance Assessment", category: "Legal", description: "Bilateral agreement maps onto standard state legal procedures." }
          ],
          warningAreas: [
            { id: `w-${Date.now()}`, title: "Missing Specific U.S. Privacy Disclosures", severity: "Medium", description: "Document does not mention specific CCPA customer disclosure workflows.", recommendation: "Add standard California consumer privacy disclosures to user agreements." }
          ],
          violations: [],
          recommendations: [
            { id: `r-${Date.now()}`, title: "Draft Data Processing Addendum", action: "Coordinate a standard global DPA contract.", priority: "High" }
          ]
        };

        const newRiskReport = {
          id: `risk-${Date.now()}`,
          documentId: newDocId,
          documentTitle: title,
          overallScore: "Medium",
          categories: [
            { name: "Contract Risk", level: "Medium", probability: 40, impact: 60, mitigationStrategy: "Re-negotiate standard clause triggers." },
            { name: "Financial Risk", level: "Low", probability: 20, impact: 30, mitigationStrategy: "Validate payment schedule accounts." },
            { name: "Tax Risk", level: "Low", probability: 10, impact: 20, mitigationStrategy: "Consult standard regional filings." },
            { name: "Regulatory Risk", level: "Medium", probability: 45, impact: 70, mitigationStrategy: "Integrate CCPA disclosures." },
            { name: "Legal Exposure", level: "Low", probability: 15, impact: 40, mitigationStrategy: "Validate legal signature credentials." }
          ]
        };

        if (useFirestore) {
          try {
            await setDoc(doc(db, "documents", newDocId), {
              ...newDocument,
              ownerId: "user-default-1",
              status: "Analyzed",
              executiveSummary,
              sections
            });
            await setDoc(doc(db, "complianceReports", newComplianceReport.id), {
              ...newComplianceReport,
              ownerId: "user-default-1"
            });
            await setDoc(doc(db, "riskReports", newRiskReport.id), {
              ...newRiskReport,
              ownerId: "user-default-1"
            });
          } catch (err) {
            console.error("Firestore fallback simulation error:", err);
          }
        } else {
          const docIndex = activeDocuments.findIndex((d) => d.id === newDocId);
          if (docIndex !== -1) {
            activeDocuments[docIndex].executiveSummary = executiveSummary;
            activeDocuments[docIndex].sections = sections;
            activeDocuments[docIndex].status = "Analyzed";
          }
          complianceReports.push(newComplianceReport);
          riskReports.push(newRiskReport);
        }

      }, 1500);
    }
  } catch (err) {
    console.error("Background text parsing failure", err);
  }
});


// POST /api/chat (RAG chat with Document Intelligence and Citations)
app.post("/api/chat", async (req, res) => {
  const { messages, documentId, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const latestMessage = messages[messages.length - 1]?.text || "";
  const docs = await getDocumentsFromDb();
  const selectedDoc = docs.find((d) => d.id === documentId);

  try {
    const ai = getGeminiClient();
    if (ai) {
      let docContextText = "";
      if (selectedDoc) {
        docContextText = `Document Name: "${selectedDoc.title}"
        Executive Summary: ${JSON.stringify(selectedDoc.executiveSummary)}
        Sections: ${JSON.stringify(selectedDoc.sections)}`;
      }

      const promptContext = `You are LexAI Research Assistant, an elite legal and tax advisor. Use the following document context if relevant to provide precise source-based answers, compliance checks and summaries.
      
      [Document Context]
      ${docContextText}
      
      Always provide your response in the following structured JSON format:
      {
        "explanation": "Clear, comprehensive legal or tax explanation markdown text. Keep it detailed. If quoting a policy, provide page or section reference.",
        "citations": [
          {
            "source": "Document Section name or clause title",
            "pageNumber": 3,
            "sectionReference": "e.g., Section 4.1 or IRC §199A",
            "documentName": "${selectedDoc ? selectedDoc.title : 'LexAI Knowledge Base'}"
          }
        ],
        "suggestedPrompts": ["Follow up question 1?", "Follow up question 2?"]
      }

      Be objective, detailed and formal. If no document is selected, answer general legal or tax research topics from your high-fidelity knowledge domain with corresponding authority citations (e.g. IRS tax guidelines, Supreme court precedents).

      User query: "${latestMessage}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: systemPrompt || "You are an elite RAG-based AI Legal & Tax Research Assistant. Use citations for all assertions.",
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text.trim());
      return res.json({
        reply: result.explanation,
        citations: result.citations || [],
        suggestedPrompts: result.suggestedPrompts || []
      });
    }
  } catch (err) {
    console.warn("Gemini API call failed, loading smart heuristic fallback response.", err);
  }

  // Fallback heuristic mock RAG system
  let reply = "";
  let citations: any[] = [];
  let suggestedPrompts: string[] = [];

  const lowerQuery = latestMessage.toLowerCase();
  
  if (selectedDoc) {
    if (lowerQuery.includes("audit") || lowerQuery.includes("control") || lowerQuery.includes("verify")) {
      reply = `Based on our structural compliance analysis of **${selectedDoc.title}**, Section 4.1 outlines a digital credential control audit. Under these parameters:\n\n* **Audit Interval**: Conducted annually by the provider.\n* **Seat Fee Penalty**: Retrogressive calculations applying a **$15/monthly seat fee** if average monthly active users surpass the 5,000 threshold.\n\nWe advise setting up automated monthly active-seat dashboards within your local cloud administration logs to prevent unexpected billing adjustments.`;
      citations = [{
        source: "Section 4.1: Subscription Fees and Audits",
        pageNumber: 3,
        sectionReference: "ToS §4.1",
        documentName: selectedDoc.title
      }];
      suggestedPrompts = ["How can we limit active directory automated audit counts?", "What is the dispute process if we challenge seat logs?"];
    } else if (lowerQuery.includes("liability") || lowerQuery.includes("indemnity") || lowerQuery.includes("limit")) {
      reply = `The liability limits within **${selectedDoc.title}** are heavily focused on protecting the software provider. In *Section 11.2*, direct contract litigation claims are capped tightly at the exact consolidated fee paid during the trailing 12-month period.\n\nFurthermore, *Section 7.3* completely indemnifies the provider against GDPR inquiries if customers fail to separate PII from generalized custom data values. This is a common industry standard, but poses substantial risks if client operators are not trained on security standards.`;
      citations = [
        { source: "Section 11.2: Limitation of Liability Cap", pageNumber: 7, sectionReference: "ToS §11.2", documentName: selectedDoc.title },
        { source: "Section 7.3: GDPR Indemnity Gate", pageNumber: 5, sectionReference: "ToS §7.3", documentName: selectedDoc.title }
      ];
      suggestedPrompts = ["How do we negotiate reciprocal liability caps?", "What specific DP-Addendum overrides these general clauses?"];
    } else {
      reply = `I have scanned **${selectedDoc.title}** regarding your query. The document outlines a comprehensive administrative license framework.\n\n### Main Points related to "${latestMessage}":\n* The agreement establishes severe, unilateral operational obligations on billing limits under Delaware jurisdiction.\n* High penalty clauses (retroactive directory seats at $15/seat) and absolute data indemnity exclusions for custom datasets are present.\n\nWhat other specific contract sections (Liability, Auditing, Data Protection) would you like me to analyze?`;
      citations = [{
        source: "Executive Analysis Suite",
        pageNumber: 1,
        sectionReference: "ToS Summary",
        documentName: selectedDoc.title
      }];
      suggestedPrompts = ["Summarize the top risks in this document.", "Generate an action plan based on these terms."];
    }
  } else {
    // General legal/tax questions
    if (lowerQuery.includes("gst") || lowerQuery.includes("tax") || lowerQuery.includes("199a")) {
      reply = `General Tax Code advisory guidelines on Pass-Through Entities and IRC Section 199A:\n\n1. **Qualified Business Income (QBI)** allows eligible owners of S-Corporations, partnerships, and sole proprietorships to deduct up to **20%** of operational net earnings.\n2. **Income Threshold Limits**: For 2025/2026 filings, phase-out rules initiate past $182,100 (single) or $364,200 (joint) for Specified Service Trades or Businesses (SSTBs).\n3. **Critical Wage Limits**: Once taxable income exceeds target limits, the deduction is directly capped at the greater of 50% of W-2 wages paid OR 25% of W-2 wages plus 2.5% of the unadjusted acquisition basis of business properties.`;
      citations = [{
        source: "IRS Section 199A Pass-Through Guidelines",
        pageNumber: 2,
        sectionReference: "US IRC §199A",
        documentName: "Internal Revenue Code Section 199A"
      }];
      suggestedPrompts = ["What operations qualify as a Specified Service Trade or Business?", "How does S-Corporation officer compensation affect QBI?"];
    } else {
      reply = `Welcome to **LexAI Research Workspace**. I can assist you with contract auditing, tax compliance, or specific clause analysis.\n\nTo begin, please select one of our pre-loaded files from the **Documents view** (such as the *CloudFlow SaaS Service Agreement* or *US IRC Tax Advisory*) or upload your own files.\n\nAlternatively, ask me any compliance or tax code questions generally, and I will search our integrated statutory database!`;
      citations = [{
        source: "LexAI Grounding Library",
        pageNumber: 1,
        sectionReference: "Introduction",
        documentName: "LexAI Core Guidance"
      }];
      suggestedPrompts = ["Analyze S-Corporation tax structures.", "Prepare an enterprise contract review list."];
    }
  }

  res.json({ reply, citations, suggestedPrompts });
});

// GET /api/compliance/report/:documentId
app.get("/api/compliance/report/:documentId", async (req, res) => {
  const { documentId } = req.params;
  const reports = await getComplianceReportsFromDb();
  const report = reports.find((r) => r.documentId === documentId);
  if (report) {
    res.json({ report });
  } else {
    // Generate simple default report
    const newReport = {
      id: `rep-${Date.now()}`,
      documentId,
      documentTitle: "Analyzed Legal Protocol.pdf",
      industry: "General Commerce",
      score: 78,
      passedChecks: [
        { id: "p-d-1", title: "Execution Authenticity", category: "Governance", description: "The execution clauses standard complies with state-level administrative signing structures." }
      ],
      warningAreas: [
        { id: "w-d-1", title: "Indemnity Asymmetry", severity: "Medium", description: "Standard clauses do not provide reciprocal damage coverage for client server limits.", recommendation: "Submit a physical addendum requesting equal mutual litigation indemnity caps." }
      ],
      violations: [],
      recommendations: [
        { id: "r-d-1", title: "Execute Mutual Dispute Resolutions", action: "Establish a mandatory 30-day informal mediation schedule prior to state arbitration.", priority: "High" }
      ]
    };
    if (useFirestore) {
      try {
        await setDoc(doc(db, "complianceReports", newReport.id), {
          ...newReport,
          ownerId: "user-default-1"
        });
      } catch (err) {
        console.error("Firestore write default compliance report error:", err);
      }
    } else {
      complianceReports.push(newReport);
    }
    res.json({ report: newReport });
  }
});

// GET /api/risk/report/:documentId
app.get("/api/risk/report/:documentId", async (req, res) => {
  const { documentId } = req.params;
  const reports = await getRiskReportsFromDb();
  const report = reports.find((r) => r.documentId === documentId);
  if (report) {
    res.json({ report });
  } else {
    const newRisk = {
      id: `risk-${Date.now()}`,
      documentId,
      documentTitle: "Analyzed Legal Protocol.pdf",
      overallScore: "Medium",
      categories: [
        { name: "Contract Risk", level: "Medium", probability: 45, impact: 60, mitigationStrategy: "Re-negotiate standard clause triggers." },
        { name: "Financial Risk", level: "Low", probability: 20, impact: 30, mitigationStrategy: "Validate payment schedules." },
        { name: "Tax Risk", level: "Low", probability: 10, impact: 15, mitigationStrategy: "Consult regional S-Corp tax advisory firms." },
        { name: "Regulatory Risk", level: "Medium", probability: 40, impact: 75, mitigationStrategy: "Verify standard privacy compliance requirements." },
        { name: "Legal Exposure", level: "High", probability: 65, impact: 85, mitigationStrategy: "Deploy thorough dual-signature executions." }
      ]
    };
    if (useFirestore) {
      try {
        await setDoc(doc(db, "riskReports", newRisk.id), {
          ...newRisk,
          ownerId: "user-default-1"
        });
      } catch (err) {
        console.error("Firestore write default risk report error:", err);
      }
    } else {
      riskReports.push(newRisk);
    }
    res.json({ report: newRisk });
  }
});

// GET /api/checklists
app.get("/api/checklists", async (req, res) => {
  const lists = await getChecklistsFromDb();
  res.json({ checklists: lists });
});

// POST /api/checklists (Toggle/Save checklists)
app.post("/api/checklists", async (req, res) => {
  const { title, category, items } = req.body;
  const newChecklist = {
    id: `chk-${Date.now()}`,
    title,
    category,
    createdAt: new Date().toISOString(),
    items: items || []
  };
  if (useFirestore) {
    try {
      await setDoc(doc(db, "checklists", newChecklist.id), {
        ...newChecklist,
        ownerId: "user-default-1"
      });
    } catch (err) {
      console.error("Firestore write checklist error:", err);
    }
  } else {
    checklists.push(newChecklist);
  }
  res.json({ success: true, checklist: newChecklist });
});

// GET /api/analytics
app.get("/api/analytics", async (req, res) => {
  const docs = await getDocumentsFromDb();
  const comps = await getComplianceReportsFromDb();
  const risks = await getRiskReportsFromDb();
  res.json({
    totalDocuments: docs.length,
    queriesAsked: 142,
    complianceChecks: comps.length,
    riskReportsGenerated: risks.length,
    trends: DOCUMENT_TRENDS_MOCK
  });
});

// POST /api/smart-search
app.post("/api/smart-search", async (req, res) => {
  const { query, category } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const searchResults: any[] = [];
  const lowerQuery = query.toLowerCase();

  const docs = await getDocumentsFromDb();
  // Search inside loaded documents
  docs.forEach((doc) => {
    if (category && doc.category !== category) return;

    if (doc.sections) {
      doc.sections.forEach((sec: any) => {
        let matched = false;
        let score = 0;

        if (sec.title.toLowerCase().includes(lowerQuery) || sec.content.toLowerCase().includes(lowerQuery)) {
          matched = true;
          score = Math.floor(Math.random() * 20) + 80; // 80-99
        } else if (sec.importantTerms.some((t: string) => t.toLowerCase().includes(lowerQuery)) || sec.summary.toLowerCase().includes(lowerQuery)) {
          matched = true;
          score = Math.floor(Math.random() * 25) + 55; // 55-79
        }

        if (matched) {
          searchResults.push({
            id: `res-${Date.now()}-${Math.random()}`,
            clause: sec.title,
            section: doc.title,
            regulation: doc.category,
            matchedText: sec.content,
            relevanceScore: score,
            pageNumber: sec.page,
            documentName: doc.title
          });
        }
      });
    }
  });

  // Default grounding responses if nothing matched
  if (searchResults.length === 0) {
    searchResults.push({
      id: "res-default-1",
      clause: "Section 199A Phase-out Framework",
      section: "Federal Tax Regulation",
      regulation: "Tax Code",
      matchedText: `Specified Service Trades or Businesses (SSTBs) include services rendered in fields of health, law, accounting, consulting, and financial representation, which face deductible write-off phase-outs once taxable income limitations are reached.`,
      relevanceScore: 68,
      pageNumber: 3,
      documentName: "Internal Revenue Code Section 199A"
    });
    searchResults.push({
      id: "res-default-2",
      clause: "Delaware Alternative Dispute Resolution Protocols",
      section: "Corporate Legal Precede",
      regulation: "Legal Standards",
      matchedText: `Where contracts incorporate Delaware mediation provisions, corporate entities are legally required to pursue informal administrative peer mediation for a minimum of 30 days prior to filing standard formal filings.`,
      relevanceScore: 55,
      pageNumber: 5,
      documentName: "Delaware Title 10 Court Standards"
    });
  }

  // Sort by highest score
  searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

  res.json({ results: searchResults });
});


// Mounting static production assets or starting Vite on port 3000
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring development environment (Vite Middleware Mode)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Configuring production environment (Hosting Static Build)...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LexAI Full-stack Server successfully active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
