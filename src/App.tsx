import React, { useState, useEffect } from "react";
import {
  Scale, FileText, MessageSquare, ShieldAlert, AlertTriangle, Play,
  CheckCircle2, TrendingUp, Star, ListChecks, Settings, UserCheck,
  UploadCloud, Search, PlusCircle, Trash2, Moon, Sun, PanelLeftClose,
  ChevronDown, ChevronRight, HelpCircle, Download, ExternalLink,
  RefreshCw, ZoomIn, ZoomOut, Check, Eye, AlertOctagon, Sparkles,
  Sliders, ArrowUpRight, LogOut, FileCode, CheckSquare
} from "lucide-react";

// Import modular panels
import AuthScreen from "./components/AuthScreen";
import AnalyticsPanel from "./components/AnalyticsPanel";
import SmartSearchPanel from "./components/SmartSearchPanel";
import ChecklistPanel from "./components/ChecklistPanel";
import CompliancePanel from "./components/CompliancePanel";
import RiskPanel from "./components/RiskPanel";
import { UserRole, LegalDocument, ChatMessage, UserProfile } from "./types";

export default function App() {
  // Core theme and authentication state
  const [darkMode, setDarkMode] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState<UserProfile | null>({
    id: "user-default-1",
    name: "Samantha Ross",
    email: "analyst.ross@taxsense.ai",
    role: "Research Analyst",
    organization: "AlphaCorp General Counsel",
    industry: "Tech Compliance"
  });

  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<
    "Dashboard" | "Documents" | "AI Research Chat" | "Compliance Checker" | "Risk Assessment" | "Analytics" | "Checklist Generator" | "Settings"
  >("Dashboard");

  // Document states
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>("doc-1");
  const [activePage, setActivePage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom interactive highlight section
  const [highlightedText, setHighlightedText] = useState<string | null>(null);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadingFileName, setUploadingFileName] = useState("");
  const [newFileCategory, setNewFileCategory] = useState<LegalDocument["category"]>("Legal Contract");

  // Chat conversational states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are TaxSense AI Research Assistant, an elite legal and corporate tax auditor. Answer with citations, source details, and a high-fidelity confidence score."
  );

  // Global Toast
  const [toastMessage, setToastMessage] = useState("");

  // Initial Data Fetch
  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  // Run initial loading
  useEffect(() => {
    fetchDocuments();
    // Default initial chat thread
    setChatMessages([
      {
        id: "msg-16",
        sender: "ai",
        text: "Greetings. I have initialized the **TaxSense AI Grounding Engine** aligned to active SEC directives, internal corporate SLA structures, and IRS Section 199A pass-through write-off codes.\n\nSelect a document from the Left Panel (such as the *CloudFlow SaaS Service Agreement* or *US IRC Section 199A Tax Advisory*) or upload custom files to conduct real-time AI-powered audit summaries.\n\nHow may I assist you with contract checking or risk assessments today?",
        timestamp: new Date().toLocaleTimeString(),
        citations: [],
        suggestedPrompts: [
          "Explain the liability cap under Section 11.2 of the CloudFlow contract.",
          "Who conducts the automatic Active Directory seat control audits?",
          "How does Specified Service Trades or Businesses (SSTB) limit tax deductions?"
        ]
      }
    ]);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Google / Email Sign-in trigger
  const handleAuthSuccess = (role: UserRole, email: string, name: string) => {
    setUser({
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      organization: "Bento Statutory Group",
      industry: "Legal & Regulatory Solutions"
    });
    setShowLanding(false);
    triggerToast(`Sign-in verified with digital credentials. Role: ${role}`);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLanding(true);
    triggerToast("Signed out. Credentials de-provisioned successfully.");
  };

  // Trigger search matching within Active Workspace
  const handleSelectSearchResult = (docId: string) => {
    setActiveDocId(docId);
    setActiveTab("AI Research Chat");
    triggerToast("Loaded matching document inside AI Assistant Workspace.");
  };

  // Smart Drag & Drop uploading triggers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadState("uploading");
    setUploadingFileName(file.name);
    
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          category: newFileCategory,
          uploadedBy: user?.name || "Anonymous Compliance Officer",
          contentPlaceholder: "Analyzing legal rules and regulatory limits in real-time."
        })
      });
      const data = await res.json();
      if (data.success) {
        setUploadState("success");
        triggerToast(`Uploading & Lexical Vectorizing completed for "${file.name}"!`);
        // Refresh index
        await fetchDocuments();
        setActiveDocId(data.document.id);
        
        // Wait briefly for background AI parsing simulation and refresh again to show results
        setTimeout(async () => {
          await fetchDocuments();
        }, 2000);

      } else {
        setUploadState("error");
      }
    } catch (err) {
      console.error("Upload process target errored", err);
      setUploadState("error");
    } finally {
      setTimeout(() => {
        setUploadState("idle");
      }, 3000);
    }
  };

  // Send RAG chat query
  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || inputValue;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          documentId: activeDocId,
          systemPrompt: systemPrompt
        })
      });

      const data = await res.json();
      
      const aiMsg: ChatMessage = {
        id: `ai-msg-${Date.now()}`,
        sender: "ai",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString(),
        citations: data.citations || [],
        suggestedPrompts: data.suggestedPrompts || []
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Failed to fetch RAG reply", err);
      // Basic mock fallback if offline
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "The local Gemini gateway timed out or failed to parse. Reviewing statutory fallback notes: Clause variables require signature validation.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const activeDoc = documents.find((d) => d.id === activeDocId);

  // Dynamic quick analysis action templates
  const handleQuickAssistantAction = (actionType: "summarize" | "explain-clause" | "generate-compliance-action") => {
    if (!activeDoc) {
      triggerToast("Please select a document context first.");
      return;
    }
    let queryText = "";
    if (actionType === "summarize") {
      queryText = `Summarize the active executive purpose and primary findings of "${activeDoc.title}".`;
    } else if (actionType === "explain-clause") {
      queryText = `Identify the top 3 highest-rated risk clauses present in "${activeDoc.title}" and explain potential legal exposures.`;
    } else {
      queryText = `Generate a dedicated action-ready checklist to audit the structural warnings flagged inside "${activeDoc.title}".`;
    }
    handleSendChat(queryText);
  };

  // Copy or print active chat dialogue sessions
  const handleExportChatResults = () => {
    let content = `TAXSENSE AI RESEARCH CHAT EXPORT\n`;
    content += `Timestamp: ${new Date().toLocaleString()}\n`;
    content += `Active Document context: ${activeDoc ? activeDoc.title : "None Selected"}\n\n`;
    chatMessages.forEach(m => {
      content += `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TaxSense_AI_Research_Dialogue_Export.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast("Filing dialogue logs saved as text file.");
  };

  // If user is logged out, show Auth Gate
  if (!user) {
    return <AuthScreen onLogin={handleAuthSuccess} darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-[#0F172A] text-slate-100" : "bg-[#F8FAFC] text-slate-900"}`}>
      
      {/* Toast Popup */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white border border-purple-500/40 shadow-2xl flex items-center gap-2 animate-slide-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* LANDING PAGE HERO OVERVIEW */}
      {showLanding ? (
        <div className="min-h-screen flex flex-col justify-between">
          
          {/* Landing Header */}
          <header className={`h-16 px-8 flex items-center justify-between border-b ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold select-all">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight select-none">TaxSense AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg cursor-pointer ${darkMode ? "hover:bg-slate-800 text-yellow-400" : "hover:bg-slate-100 text-slate-600"}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowLanding(false)}
                className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer hover:bg-purple-700 transition"
              >
                Open Dashboard
              </button>
            </div>
          </header>

          {/* Landing Hero Screen with Interactive balance illustration */}
          <main className="flex-1 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Next-Gen Vector Audit Framework</span>
              </span>
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight select-none">
                AI-Powered Legal &amp; Tax Research Assistant
              </h1>
              <p className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Upload contract SLAs, tax advisory files, SEC folders, or compliance policies to extract RAG-anchored vector answers, executive checklists, high-precision risk scorecards, and page-exact citations inside a sleek Bento layout.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowLanding(false);
                    setActiveTab("Dashboard");
                  }}
                  className="px-6 py-3 bg-[#6D28D9] hover:bg-[#8B5CF6] text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/20 cursor-pointer flex items-center gap-2"
                >
                  <span>Start Secure Research</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setShowLanding(false);
                    setActiveTab("Documents");
                  }}
                  className={`px-6 py-3 font-semibold text-sm rounded-xl border cursor-pointer ${
                    darkMode ? "bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  Upload Legislative Document
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-10 border-t border-slate-800/85">
                <div>
                  <h4 className="text-2xl font-extrabold text-[#8B5CF6]">92%</h4>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">SLA Compliance Gauges</p>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-[#10B981]">100%</h4>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Page Citation Accuracy</p>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-[#A855F7]">Gemini</h4>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Grounding Matrix Active</p>
                </div>
              </div>
            </div>

            {/* Interactive Animated Scales Vector Column */}
            <div className="flex justify-center select-none">
              <div className={`p-10 rounded-3xl border relative w-full max-w-md aspect-square flex flex-col justify-between overflow-hidden shadow-2xl ${
                darkMode ? "bg-[#1E293B]/80 border-slate-800" : "bg-white border-slate-200"
              }`}>
                <div className="absolute top-4 left-4 text-[10px] uppercase font-bold tracking-wider text-slate-500">Corporate Statutory Shield</div>
                
                {/* Scale SVG Container - Rocks back and forth slightly via clean CSS */}
                <div className="flex-1 flex flex-col items-center justify-center pt-4">
                  <svg className="w-48 h-48 animate-pulse text-purple-500" viewBox="0 0 200 200" fill="currentColor">
                    {/* Stand Balance */}
                    <rect x="95" y="40" width="10" height="120" fill={darkMode ? "#475569" : "#94A3B8"} />
                    <rect x="70" y="160" width="60" height="12" rx="4" fill={darkMode ? "#334155" : "#64748B"} />
                    <circle cx="100" cy="40" r="10" fill="#8B5CF6" />
                    
                    {/* Beam balance bar (rotated slightly in css or static offset) */}
                    <g className="origin-center" style={{ transform: "rotate(3deg)", transformOrigin: "100px 48px", transition: "transform 2s ease-in-out" }}>
                      <line x1="40" y1="48" x2="160" y2="48" stroke="#8B5CF6" strokeWidth="6" />
                      <circle cx="100" cy="48" r="6" fill="#A855F7" />
                      
                      {/* Left Scale Plate */}
                      <line x1="40" y1="48" x2="25" y2="100" stroke={darkMode ? "#475569" : "#94A3B8"} strokeWidth="1.5" />
                      <line x1="40" y1="48" x2="55" y2="100" stroke={darkMode ? "#475569" : "#94A3B8"} strokeWidth="1.5" />
                      <path d="M15,100 L65,100 A25,25 0 0,1 15,100" fill="#10B981" />
                      
                      {/* Right Scale Plate */}
                      <line x1="160" y1="48" x2="145" y2="104" stroke={darkMode ? "#475569" : "#94A3B8"} strokeWidth="1.5" />
                      <line x1="160" y1="48" x2="175" y2="104" stroke={darkMode ? "#475569" : "#94A3B8"} strokeWidth="1.5" />
                      <path d="M135,104 L185,104 A25,25 0 0,1 135,104" fill="#6D28D9" />
                    </g>
                  </svg>
                  <p className="text-xs font-bold text-[#8B5CF6] tracking-widest uppercase mt-4">Statutory Audits Matched</p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Cryptographic Ledger Synced</span>
                  <span>June 2026 UTC</span>
                </div>
              </div>
            </div>

          </main>

          {/* Landing Footer */}
          <footer className={`h-12 px-8 flex items-center justify-center border-t text-[10px] text-slate-500 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
            <span>TaxSense AI Intelligent Research System conforms blindly with statutory regulatory parameters.</span>
          </footer>

        </div>
      ) : (
        
        /* CORE DASHBOARD WORKSPACE */
        <div className="flex h-screen overflow-hidden">
          
          {/* Left Sidebar Menu */}
          <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col h-full text-slate-350 shrink-0">
            
            {/* Toolbar logo brand */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div onClick={() => setShowLanding(true)} className="flex items-center space-x-2.5 cursor-pointer">
                <div className="w-8 h-8 bg-[#6D28D9] rounded-lg flex items-center justify-center text-white font-bold">
                  <Scale className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base leading-none">TaxSense</h2>
                  <span className="text-[9px] text-[#A855F7] uppercase tracking-widest font-black leading-none">AI</span>
                </div>
              </div>
              
              <span className="px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-[8px] font-black rounded uppercase tracking-wider select-none">
                PRO v2.4
              </span>
            </div>

            {/* Profile widget bar info */}
            <div className="px-4 py-4 border-b border-slate-800/60 bg-[#1E293B]/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-slate-800 shrink-0 flex items-center justify-center font-bold text-xs text-white">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white truncate leading-tight select-text">{user.name}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></span>
                    <span className="text-[9px] text-slate-400 capitalize truncate font-semibold">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Unlock Workspace/Logout"
                  className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sidebar Navigation Items list */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              <div className="text-[10px] text-slate-500 px-3 uppercase tracking-wider font-extrabold pb-1 select-none">Core Indexes</div>
              
              {[
                { label: "Dashboard", tab: "Dashboard", icon: Sliders },
                { label: "Documents", tab: "Documents", icon: FileText },
                { label: "AI Research Chat", tab: "AI Research Chat", icon: MessageSquare },
                { label: "Compliance Checker", tab: "Compliance Checker", icon: CheckCircle2 },
                { label: "Risk Assessment", tab: "Risk Assessment", icon: ShieldAlert },
                { label: "Analytics", tab: "Analytics", icon: TrendingUp },
                { label: "Checklist Generator", tab: "Checklist Generator", icon: CheckSquare },
                { label: "Settings", tab: "Settings", icon: Settings }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer font-sans text-xs ${
                      isActive
                        ? "bg-[#6D28D9] text-white font-bold shadow-md shadow-purple-900/40"
                        : "hover:bg-slate-800/50 hover:text-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Dark mode & info footer in sidebar */}
            <div className="p-4 border-t border-slate-800 space-y-2.5">
              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-900/30 rounded-xl p-3.5">
                <h5 className="text-[10px] text-white font-extrabold tracking-wider uppercase">Active Privilege Map</h5>
                <p className="text-[10px] text-purple-300 mt-1 leading-relaxed">
                  Enterprise regulatory workspace activated by corporate security credentials.
                </p>
                <button
                  onClick={() => triggerToast(`Privilege context: ${user.role}`)}
                  className="w-full mt-2.5 bg-[#6D28D9] hover:bg-[#8B5CF6] text-white font-bold py-1.5 rounded-lg text-[9px] uppercase tracking-widest cursor-pointer border-solid border-none text-center"
                >
                  View Limitations
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500">Theme mode</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-1 px-2 text-[10px] bg-slate-800 border border-slate-705 rounded-md flex items-center gap-1 cursor-pointer text-slate-400 hover:text-white"
                >
                  {darkMode ? <Sun className="w-3 h-3 text-yellow-400" /> : <Moon className="w-3 h-3" />}
                  <span>Change</span>
                </button>
              </div>
            </div>

          </aside>

          {/* Main workspace frame right */}
          <main className="flex-1 flex flex-col overflow-hidden min-w-0">
            
            {/* Top Workspace Header */}
            <header className={`h-16 px-8 flex items-center justify-between border-b shrink-0 transition-colors ${
              darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowLanding(true)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                    darkMode ? "bg-slate-800 border-slate-705 text-slate-350 hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  ← Home
                </button>
                <div className="h-4 w-px bg-slate-800"></div>
                <h3 className="text-sm font-black select-none tracking-tight">
                  TaxSense AI Workspace: <span className="text-[#8B5CF6]">{activeTab}</span>
                </h3>
                <span className="px-2 py-0.5 bg-purple-500/10 text-[#8B5CF6] text-[9px] font-bold rounded">
                  {user.role} Privilege
                </span>
              </div>

              {/* Dynamic top search and parameters */}
              <div className="flex items-center space-x-4">
                <div className="relative hidden md:block select-all">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Semantic search files..."
                    onClick={() => {
                      setActiveTab("Documents");
                      triggerToast("Use semantic search below to find regulatory references.");
                    }}
                    className={`text-xs py-1.5 pl-8 pr-32 rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      darkMode ? "bg-slate-800 text-slate-205" : "bg-slate-100 text-slate-805"
                    }`}
                  />
                  <span className="absolute right-2 top-1.5 px-1.5 py-0.2 text-[8px] bg-slate-700 rounded text-slate-400 uppercase font-bold select-none">
                    CMD+K
                  </span>
                </div>

                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" title="System synchronizer active"></div>
              </div>
            </header>

            {/* Dynamic Panel Workspace container frame */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* TAB 1: DASHBOARD VIEW COPIES THE BENTO GRID EXQUISITE STRUCTURE */}
              {activeTab === "Dashboard" && (
                <div className="space-y-6">
                  
                  {/* Greeting Banner */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-black tracking-tight select-none">Statutory Intelligence Hub</h2>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Welcome back, {user.name}. You are logged in with credential level <strong>{user.role}</strong>. Let's research.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("Documents")}
                        className="px-4 py-2 bg-[#6D28D9] hover:bg-[#8B5CF6] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1"
                      >
                        <UploadCloud className="w-4 h-4 text-white" />
                        <span>Upload File</span>
                      </button>
                      <button
                        onClick={fetchDocuments}
                        className={`p-2 rounded-xl text-xs font-black border flex items-center gap-1 ${
                          darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh Indices</span>
                      </button>
                    </div>
                  </div>

                  {/* Bento grids style stats card summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-5 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Indexed Documents</p>
                      <h3 className="text-3xl font-black mt-1 tracking-wider">{documents.length} Files</h3>
                      <p className="text-[11px] text-[#A855F7] font-semibold mt-2 flex items-center gap-1">
                        <span>Ready for AI parsing</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </p>
                    </div>

                    <div className={`p-5 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Calculated Compliance score</p>
                      <h3 className="text-3xl font-black mt-1 text-[#10B981] tracking-wider">92% Average</h3>
                      <p className="text-[11px] text-slate-400 mt-2">Passed statutory audits</p>
                    </div>

                    <div className={`p-5 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unresolved regulatory triggers</p>
                      <h3 className="text-3xl font-black mt-1 text-red-400 tracking-wider">3 Risk Nodes</h3>
                      <p className="text-[11px] text-slate-400 mt-2">Required mitigation patches</p>
                    </div>

                    <div className={`p-5 rounded-3xl border bg-gradient-to-br from-[#6D28D9] to-purple-800 text-white`}>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">Grounding matrix</span>
                      <h3 className="text-xl font-bold mt-2">TaxSense AI Active</h3>
                      <p className="text-white/80 text-[10px] mt-1 leading-relaxed">RAG technology matching statutes accurately.</p>
                    </div>
                  </div>

                  {/* Bento interactive central action rows */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Bento Box: Left - Interactive Documents checklist indexes */}
                    <div className={`lg:col-span-2 p-6 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="text-sm font-black text-white px-1 py-0.5 select-none bg-purple-500/10 inline-block text-purple-400 rounded">Active compliance documents</h4>
                          <p className="text-xs text-slate-400 mt-1">Select a database file to activate split-screen AI parsing.</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("Documents")}
                          className="text-xs text-purple-400 hover:underline hover:text-purple-300"
                        >
                          View Index
                        </button>
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setActiveDocId(doc.id);
                              setActiveTab("AI Research Chat");
                              triggerToast(`Workspace active context: ${doc.title}`);
                            }}
                            className={`p-3.5 rounded-xl border flex justify-between items-center cursor-pointer transition ${
                              activeDocId === doc.id
                                ? "border-[#8B5CF6] bg-purple-500/10"
                                : darkMode
                                ? "border-slate-800 bg-slate-900/40 hover:bg-slate-800/60"
                                : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center space-x-3.5 text-left min-w-0">
                              <div className="p-2 rounded-lg bg-purple-500/20 text-[#8B5CF6] shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-black truncate">{doc.title}</h5>
                                <div className="flex space-x-2 text-[10px] text-slate-400 mt-0.5">
                                  <span>{doc.category}</span>
                                  <span>•</span>
                                  <span>{doc.pagesCount} Pages</span>
                                  <span>•</span>
                                  <span>Size: {doc.fileSize}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`px-2 py-0.5 text-[9px] tracking-wider uppercase font-extrabold rounded ${
                                doc.status === "Analyzed" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/15 text-yellow-500 animate-pulse"
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bento Box: Right - Quick LLM Prompt Settings config */}
                    <div className={`p-6 rounded-3xl border flex flex-col justify-between ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
                      <div>
                        <h4 className="text-sm font-bold text-[#8B5CF6]">Research Chat Parameters</h4>
                        <p className="text-xs text-slate-400 mt-1">Configure active system instructions for RAG compliance modeling.</p>

                        <div className="mt-4 space-y-3">
                          <textarea
                            rows={4}
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="Set LLM system guidelines..."
                            className={`w-full p-2.5 text-[11px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] border resize-none ${
                              darkMode ? "bg-slate-800 border-slate-700 text-slate-2" : "bg-slate-50 border-slate-300 text-slate-9"
                            }`}
                          />
                          <p className="text-[10px] text-slate-400 italic">
                            *This system prompt dictates TaxSense AI reasoning guidelines, auditing depth, and precision.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => triggerToast("Successfully synchronized RAG tuning guidelines.")}
                        className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-800 to-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        Commit Guidelines
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: DOCUMENTS INDEX & DRAG-DROP PORTAL */}
              {activeTab === "Documents" && (
                <div className="space-y-6">
                  
                  {/* Grid layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Document Upload panel */}
                    <div className={`lg:col-span-1 p-6 rounded-3xl border flex flex-col justify-between ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#8B5CF6] mb-3">Upload Center</h3>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                          Drag and drop legal agreements, local tax policies, or PDF files. The vectorizer will segment structural clauses and calculate risks.
                        </p>

                        {/* Category selection */}
                        <div className="mb-4">
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Categorize upload as:</label>
                          <select
                            value={newFileCategory}
                            onChange={(e) => setNewFileCategory(e.target.value as any)}
                            className={`w-full p-2 text-xs font-bold rounded-lg border focus:ring-2 focus:ring-[#8B5CF6] ${
                              darkMode ? "bg-slate-800 border-slate-750 text-slate-300" : "bg-slate-50 border-slate-300 text-slate-705"
                            }`}
                          >
                            <option value="Legal Contract">Legal Contract (SLA / Indemnity)</option>
                            <option value="Tax Regulation">Tax Regulation (IRS Code)</option>
                            <option value="Compliance Audit">Compliance Audit (ISO / SOC2)</option>
                            <option value="Internal Policy">Internal Policy (HR Guidelines)</option>
                          </select>
                        </div>

                        {/* Drag & Drop zone */}
                        <div
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onDrop={onDrop}
                          className={`border-2 border-dashed rounded-3xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                            isDragging
                              ? "border-purple-500 bg-purple-500/10"
                              : darkMode
                              ? "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                              : "border-slate-300 bg-slate-50 hover:bg-slate-100/50"
                          }`}
                        >
                          <UploadCloud className="w-10 h-10 text-purple-400 animate-pulse" />
                          <div>
                            <p className="text-xs font-bold select-none">Drag &amp; Drop administrative document</p>
                            <p className="text-[10px] text-slate-400 mt-1">or click manually to choose files</p>
                          </div>
                          
                          <input
                            type="file"
                            id="file-element-input"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <label
                            htmlFor="file-element-input"
                            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 rounded-xl text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                          >
                            Select from local computer
                          </label>
                        </div>
                      </div>

                      {/* Upload status loader */}
                      {uploadState === "uploading" && (
                        <div className="p-3.5 mt-4 rounded-xl bg-purple-900/20 border border-purple-500/30 text-xs text-purple-300 animate-pulse flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-purple-400" />
                          <span>Vectorizing <strong>{uploadingFileName}</strong> ...</span>
                        </div>
                      )}

                      {uploadState === "success" && (
                        <div className="p-3.5 mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span>Index updated successfully!</span>
                        </div>
                      )}
                    </div>

                    {/* All Indexed documents */}
                    <div className={`lg:col-span-2 p-6 rounded-3xl border flex flex-col justify-between ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-[#10B981]">Statutory Files Database</h3>
                          <span className="text-xs text-slate-400">{documents.length} Database entries indexed</span>
                        </div>

                        <div className="space-y-4">
                          {documents.map((d) => (
                            <div
                              key={d.id}
                              className={`p-4 rounded-3xl border select-text transition-all ${
                                darkMode ? "bg-slate-900/50 border-slate-805 hover:border-slate-700" : "bg-slate-50 border-slate-202 hover:shadow-sm"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-black tracking-tight select-all">{d.title}</h4>
                                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                                    <span className="px-1.5 py-0.2 bg-purple-500/15 text-[#8B5CF6] rounded uppercase tracking-wider font-extrabold">{d.category}</span>
                                    <span>•</span>
                                    <span>Uploaded: {new Date(d.uploadedAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>Audit Level: PRO Scope</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                  <button
                                    onClick={() => {
                                      setActiveDocId(d.id);
                                      setActiveTab("AI Research Chat");
                                      triggerToast(`Selected: ${d.title}`);
                                    }}
                                    className="p-1 px-2 text-[10px] font-bold bg-[#6D28D9] hover:bg-[#8B5CF6] text-white rounded-lg flex items-center gap-1 cursor-pointer shadow"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-white" />
                                    <span>Workspace</span>
                                  </button>
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-400 mt-3 select-none leading-relaxed">
                                Uploaded secure metadata parameters list active directory controls and Delaware Mediation statutes accurately.
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 text-center select-none">
                        *Removing or resetting files requires administrative privilege levels. Ask your database engineer to override coordinates.
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 3: SPANNER AI SPLIT-SCREEN RESEARCH WORKSPACE (LEFT PREVIEW, RIGHT CHAT) */}
              {activeTab === "AI Research Chat" && (
                <div className="flex flex-col xl:flex-row gap-6 h-[76vh] overflow-hidden">
                  
                  {/* Left screen panel: Document Intel & expandable sections */}
                  <div className={`xl:w-1/2 rounded-3xl border flex flex-col overflow-hidden transition-all duration-300 ${
                    darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    
                    {/* Left preview header */}
                    <div className="bg-slate-500/5 px-6 py-3 border-b border-slate-700/10 flex justify-between items-center shrink-0">
                      <div>
                        <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest leading-none">Document Intelligence View</span>
                        <h4 className="text-xs font-bold text-slate-400 mt-1 truncate max-w-xs md:max-w-md">
                          {activeDoc ? activeDoc.title : "No file context"}
                        </h4>
                      </div>

                      {/* Zoom controls */}
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
                          className={`p-1.5 rounded hover:bg-slate-500/10 text-slate-400`}
                          title="Zoom metrics out"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] text-slate-400 flex items-center px-1 select-none">{zoomLevel}%</span>
                        <button
                          onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
                          className={`p-1.5 rounded hover:bg-slate-500/10 text-slate-400`}
                          title="Zoom metrics in"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content Area with detailed executive summary card items */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6" style={{ fontSize: `${12 * (zoomLevel / 100)}px` }}>
                      {activeDoc ? (
                        <>
                          {/* Purpose & Context Panel */}
                          <div className={`p-4 rounded-xl border select-text ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase rounded select-none">
                              Executive Purpose Statement
                            </span>
                            <p className="mt-3 text-xs leading-relaxed font-semibold leading-relaxed">
                              {activeDoc.executiveSummary?.purpose}
                            </p>
                          </div>

                          {/* Key findings bullets */}
                          <div className="space-y-2 select-text text-left">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Primary Key Findings Mapped</span>
                            <div className="grid grid-cols-1 gap-2.5 mt-2">
                              {activeDoc.executiveSummary?.keyFindings.map((kf, i) => (
                                <div key={i} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-slate-500/5 text-xs">
                                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full mt-1.5 shrink-0"></span>
                                  <span>{kf}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Important Clauses highlights */}
                          <div className="space-y-4">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Important Verified Clauses</span>
                            {activeDoc.executiveSummary?.importantClauses.map((clause, i) => (
                              <div
                                key={i}
                                onClick={() => setHighlightedText(clause.content)}
                                className={`p-4 rounded-xl border border-dashed transition-colors cursor-pointer text-left select-text ${
                                  highlightedText === clause.content
                                    ? "bg-[#6D28D9]/10 border-[#8B5CF6]"
                                    : darkMode
                                    ? "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1.5">
                                  <h5 className="text-xs font-black text-purple-400">{clause.title}</h5>
                                  <span className="text-[9px] font-bold text-slate-500">Page Reference: {clause.page}</span>
                                </div>
                                <p className="text-xs font-serif italic text-slate-300 leading-relaxed">
                                  "{clause.content}"
                                </p>
                                <div className="text-[8px] uppercase tracking-widest text-slate-500 mt-2">
                                  *Click box to anchor dialogue highlight focus
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Expandable Section breakdowns inside beautiful accordions */}
                          <div className="space-y-3 pt-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Expandable Statutory Sections Breakdown</span>
                            {activeDoc.sections?.map((sec, idx) => (
                              <details
                                key={idx}
                                className={`p-3.5 rounded-xl border transition ${
                                  darkMode ? "bg-slate-900/30 border-slate-800" : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <summary className="text-xs font-bold text-[#8B5CF6] hover:text-[#A855F7] cursor-pointer outline-none flex justify-between items-center">
                                  <span>{sec.title}</span>
                                  <span className="text-[9px] font-semibold text-slate-400">Page Offset {sec.page}</span>
                                </summary>
                                <div className="mt-3.5 pt-3 border-t border-slate-800/60 space-y-3 text-xs leading-relaxed text-left select-text">
                                  <p className="font-serif italic text-slate-300">"{sec.content}"</p>
                                  <p className="font-semibold text-[11px] text-slate-400">Summary: {sec.summary}</p>
                                  
                                  <div className="flex flex-wrap gap-2 pt-1 font-bold">
                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Index Terms:</span>
                                    {sec.importantTerms.map((term, tIdx) => (
                                      <span key={tIdx} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px]">
                                        {term}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </details>
                            ))}
                          </div>

                          {/* Quick Summarize buttons on lower bounds */}
                          <div className="pt-4 border-t border-slate-800/90 flex flex-wrap gap-2">
                            <button
                              onClick={() => handleQuickAssistantAction("summarize")}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-250 text-[10px] uppercase tracking-wider font-bold rounded-xl cursor-pointer"
                            >
                              🚀 Core Summary
                            </button>
                            <button
                              onClick={() => handleQuickAssistantAction("explain-clause")}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-250 text-[10px] uppercase tracking-wider font-bold rounded-xl cursor-pointer"
                            >
                              ⚠️ Explain Risks
                            </button>
                            <button
                              onClick={() => handleQuickAssistantAction("generate-compliance-action")}
                              className="px-3 py-1.5 bg-[#6D28D9] hover:bg-[#8B5CF6] text-white text-[10px] uppercase tracking-wider font-bold rounded-xl cursor-pointer"
                            >
                              📋 Compile Checklists
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col justify-center items-center text-center space-y-3 text-slate-400 py-10 selection:bg-none">
                          <Eye className="w-10 h-10 text-slate-450 shrink-0" />
                          <div>
                            <p className="text-xs font-bold">No Article Context Activated</p>
                            <p className="text-[10px] text-slate-500 mt-1">Please select an indexed file from the Documents page to initiate interactive analysis highlights.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right screen panel: AI RAG ChatGPT/Perplexity Style Assistant Chat */}
                  <div className={`xl:w-1/2 rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-[#E2E8F0]"
                  }`}>
                    
                    {/* Right chat header */}
                    <div className="bg-slate-500/5 px-6 py-4 border-b border-slate-700/10 flex justify-between items-center shrink-0">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#6D28D9] p-2 text-white shrink-0 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white select-none">TaxSense AI Grounding Assistant</h4>
                          <p className="text-[9px] text-emerald-400 flex items-center gap-1 font-semibold leading-none mt-0.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                            <span>Semantic index mapping synchronized</span>
                          </p>
                        </div>
                      </div>

                      {/* Export Dialogue action */}
                      <button
                        onClick={handleExportChatResults}
                        className={`p-1.5 px-3 rounded-lg text-[10px] font-bold border flex items-center gap-1 cursor-pointer hover:bg-slate-800 ${
                          darkMode ? "border-slate-800 text-slate-400 hover:text-white" : "border-slate-300 text-slate-500 hover:text-slate-700"
                        }`}
                        title="Download Dialogue txt"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Logs</span>
                      </button>
                    </div>

                    {/* Chat Messages flow */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-4 items-start ${
                            msg.sender === "user" ? "justify-end text-right" : "justify-start text-left"
                          }`}
                        >
                          {/* Bot Avatar */}
                          {msg.sender === "ai" && (
                            <div className="w-8 h-8 rounded-lg bg-[#6D28D9] shrink-0 flex items-center justify-center text-white text-xs font-bold mt-1">
                              AI
                            </div>
                          )}

                          <div className={`max-w-[85%] select-text leading-relaxed p-4 rounded-3xl ${
                            msg.sender === "user"
                              ? "bg-gradient-to-br from-[#6D28D9] to-indigo-700 text-white rounded-tr-none text-xs"
                              : darkMode
                              ? "bg-[#1E293B] text-slate-300 rounded-tl-none text-xs"
                              : "bg-slate-50 text-slate-800 border rounded-tl-none text-xs"
                          }`}>
                            <div className="prose prose-invert max-w-none text-xs whitespace-pre-wrap select-text selection:bg-purple-600/30">
                              {msg.text}
                            </div>

                            {/* Floating highlight contextual anchor representation */}
                            {highlightedText && msg.sender === "user" && (
                              <div className="p-2 mt-2 rounded bg-white/10 text-[10px] font-mono text-purple-200 text-left select-all">
                                🔑 Context highlight: "{highlightedText.substring(0, 75)}..."
                              </div>
                            )}

                            {/* Citations block (Perplexity source links) */}
                            {msg.citations && msg.citations.length > 0 && (
                              <div className="mt-4 pt-3.5 border-t border-slate-700/80 space-y-2 text-left">
                                <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold block">Authority Citations:</span>
                                <div className="flex flex-col gap-1.5">
                                  {msg.citations.map((cite, cIdx) => (
                                    <div key={cIdx} className="text-[10px] text-purple-400 hover:underline cursor-pointer flex items-center gap-1 p-1 bg-slate-500/5 rounded">
                                      <span className="font-extrabold bg-purple-500/20 text-purple-400 px-1 py-0.2 rounded shrink-0">Source {cIdx + 1}</span>
                                      <span className="truncate">Page {cite.pageNumber} ({cite.sectionReference}) in "{cite.documentName}"</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suggested Prompts mode */}
                            {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-slate-710 space-y-1.5 text-left">
                                <span className="text-[10px] text-slate-400 font-bold float-left select-none mr-2">Follow-up:</span>
                                <div className="flex flex-col gap-1.5 clear-both pt-1">
                                  {msg.suggestedPrompts.map((p, pIdx) => (
                                    <button
                                      key={pIdx}
                                      onClick={() => handleSendChat(p)}
                                      className="w-full text-left p-1.5 rounded-xl border text-[11px] font-semibold transition hover:bg-[#6D28D9]/15 hover:border-[#8B5CF6]/30 cursor-pointer text-slate-400 hover:text-white"
                                    >
                                      {p}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Human Avatar */}
                          {msg.sender === "user" && (
                            <div className="w-8 h-8 rounded-lg bg-indigo-500 shrink-0 flex items-center justify-center text-white text-xs font-bold mt-1">
                              ME
                            </div>
                          )}
                        </div>
                      ))}

                      {/* AI Thinking indicator spinner */}
                      {aiLoading && (
                        <div className="flex gap-4 items-start justify-start select-none">
                          <div className="w-8 h-8 rounded-lg bg-[#6D28D9] shrink-0 flex items-center justify-center text-white text-xs font-bold mt-1 animate-pulse">
                            AI
                          </div>
                          <div className={`p-4 rounded-3xl rounded-tl-none text-xs flex items-center gap-2 ${darkMode ? "bg-[#1E293B]" : "bg-slate-50"}`}>
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat lower input controls bar */}
                    <div className="p-4 border-t border-slate-700/10 shrink-0">
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask about compliance, liabilities, tax limits, or statutory exceptions..."
                          className={`w-full text-xs p-3 pr-16 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-2xl resize-none ${
                            darkMode ? "bg-slate-800/80 border-slate-700 text-slate-10" : "bg-slate-50 border-slate-300 text-slate-80"
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendChat();
                            }
                          }}
                        />
                        <button
                          onClick={() => handleSendChat()}
                          className="absolute right-3.5 bottom-3.5 p-2 bg-[#6D28D9] hover:bg-[#8B5CF6] text-white rounded-xl shadow cursor-pointer transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Footer hints */}
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 select-none">
                        <span>Markdown support. Press Enter to submit queries.</span>
                        <button
                          onClick={() => setHighlightedText(null)}
                          className="hover:underline text-[9px] hover:text-[#8B5CF6]"
                        >
                          Clear anchor selection
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 4: COMPLIANCE CHECKER */}
              {activeTab === "Compliance Checker" && (
                <CompliancePanel
                  darkMode={darkMode}
                  documentsList={documents.map((d) => ({ id: d.id, title: d.title, category: d.category }))}
                  activeDocumentId={activeDocId}
                />
              )}

              {/* TAB 5: RISK ASSESSMENT EXP POINTS HEATMAP MAPS */}
              {activeTab === "Risk Assessment" && (
                <RiskPanel
                  darkMode={darkMode}
                  documentsList={documents.map((d) => ({ id: d.id, title: d.title, category: d.category }))}
                  activeDocumentId={activeDocId}
                />
              )}

              {/* TAB 6: GLOBAL ANALYTICS DASHBOARD */}
              {activeTab === "Analytics" && (
                <AnalyticsPanel
                  darkMode={darkMode}
                  analyticsData={{
                    totalDocuments: documents.length,
                    queriesAsked: 142 + chatMessages.length,
                    complianceChecks: 6,
                    riskReportsGenerated: 2,
                    trends: [
                      { month: "Jan", uploads: 2, score: 78, queries: 12 },
                      { month: "Feb", uploads: 5, score: 82, queries: 28 },
                      { month: "Mar", uploads: 8, score: 80, queries: 45 },
                      { month: "Apr", uploads: 6, score: 85, queries: 32 },
                      { month: "May", uploads: 12, score: 88, queries: 64 },
                      { month: "Jun", uploads: documents.length, score: 91, queries: 87 + chatMessages.length }
                    ]
                  }}
                />
              )}

              {/* TAB 7: EDITABLE COMPLIANCE CHECKLISTS */}
              {activeTab === "Checklist Generator" && (
                <ChecklistPanel darkMode={darkMode} />
              )}

              {/* TAB 8: GLOBAL SETTINGS PANEL */}
              {activeTab === "Settings" && (
                <div className="space-y-6">
                  
                  <div className={`p-6 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
                    <h3 className="text-sm font-bold text-white px-2 py-0.5 select-none bg-purple-500/10 inline-block text-purple-400 rounded">TaxSense AI Configuration panel</h3>
                    <p className="text-xs text-slate-400 mt-2">Adjust corporate information parameters governing security credentials.</p>

                    <div className="mt-6 space-y-4 max-w-xl">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Corporate Officer Name</label>
                        <input
                          type="text"
                          value={user.name}
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                            darkMode ? "bg-slate-800 border-slate-700 text-slate-2" : "bg-slate-50 border-slate-300 text-slate-9"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Privilege Designation level</label>
                        <span className="text-xs font-bold text-[#8B5CF6] block mt-1">{user.role}</span>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Active Database Port (Read Only Reference)</label>
                        <span className="text-xs font-bold text-slate-400 block mt-1">Spanner Engine (Port 3000 Internal Route)</span>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => triggerToast("System credentials and profile fields stored successfully.")}
                          className="px-6 py-2 bg-[#6D28D9] hover:bg-[#8B5CF6] text-white font-bold text-xs rounded-xl shadow"
                        >
                          Apply Adjustments
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Smart Search Preset */}
                  <SmartSearchPanel
                    darkMode={darkMode}
                    onSelectSearchResult={handleSelectSearchResult}
                  />

                </div>
              )}

            </div>

            {/* Bottom Status bar */}
            <footer className={`h-10 px-8 flex justify-between items-center text-[10px] text-slate-500 shrink-0 border-t ${
              darkMode ? "bg-slate-905 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <span>TaxSense AI Research Assistant © 2026. Secure Sandboxed Environment.</span>
              <div className="flex space-x-3">
                <span className="flex items-center gap-1 select-all"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Database Live</span>
                <span>•</span>
                <span>Role: <strong>{user.role}</strong></span>
              </div>
            </footer>

          </main>

        </div>
      )}

    </div>
  );
}
