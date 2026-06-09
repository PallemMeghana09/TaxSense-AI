export type UserRole = "User" | "Research Analyst" | "Admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  industry?: string;
  organization?: string;
}

export interface ImportantClause {
  title: string;
  content: string;
  page: number;
}

export interface ExecutiveSummary {
  purpose: string;
  keyFindings: string[];
  importantClauses: ImportantClause[];
  risks: string[];
  recommendations: string[];
}

export interface SectionBreakdown {
  title: string;
  content: string;
  summary: string;
  importantTerms: string[];
  riskIndicators: string[];
  references: string[];
  page: number;
}

export interface LegalDocument {
  id: string;
  title: string;
  category: "Legal Contract" | "Tax Regulation" | "Compliance Audit" | "Internal Policy" | "Custom Upload";
  uploadedAt: string;
  uploadedBy: string;
  fileSize: string;
  pagesCount: number;
  status: "Analyzing" | "Analyzed" | "Error";
  executiveSummary?: ExecutiveSummary;
  sections?: SectionBreakdown[];
}

export interface Citation {
  source: string;
  pageNumber: number;
  sectionReference: string;
  documentName: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  citations?: Citation[];
  suggestedPrompts?: string[];
}

export interface ComplianceReport {
  id: string;
  documentId: string;
  documentTitle: string;
  industry: string;
  score: number; // 0 to 100
  passedChecks: { id: string; title: string; category: string; description: string }[];
  warningAreas: { id: string; title: string; severity: "Low" | "Medium"; description: string; recommendation: string }[];
  violations: { id: string; title: string; penalty: string; description: string; solution: string }[];
  recommendations: { id: string; title: string; action: string; priority: "High" | "Medium" | "Low" }[];
}

export interface RiskCategoryDetails {
  name: string; // "Contract Risk" | "Financial Risk" | "Tax Risk" | "Regulatory Risk" | "Legal Exposure"
  level: "Low" | "Medium" | "High" | "Critical";
  probability: number; // 1-100%
  impact: number; // 1-100%
  mitigationStrategy: string;
}

export interface RiskReport {
  id: string;
  documentId: string;
  documentTitle: string;
  overallScore: "Low" | "Medium" | "High" | "Critical";
  categories: RiskCategoryDetails[];
}

export interface SmartSearchResult {
  id: string;
  clause: string;
  section: string;
  regulation: string;
  matchedText: string;
  relevanceScore: number; // 0 to 100
  pageNumber: number;
  documentName: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  notes?: string;
}

export interface Checklist {
  id: string;
  title: string;
  category: "GST Filing" | "Audit Preparation" | "Tax Compliance" | "Legal Documentation" | "General Regulation";
  items: ChecklistItem[];
  createdAt: string;
}
