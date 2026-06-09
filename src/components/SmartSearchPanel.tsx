import React, { useState } from "react";
import { Search, Info, SlidersHorizontal, BookOpen, AlertCircle, MoveRight } from "lucide-react";
import { SmartSearchResult } from "../types";

interface SmartSearchProps {
  darkMode: boolean;
  onSelectSearchResult: (docId: string) => void;
}

export default function SmartSearchPanel({ darkMode, onSelectSearchResult }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SmartSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Semantic search backend failed", err);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const setPresetSearch = (text: string, cat?: string) => {
    setQuery(text);
    if (cat) {
      setCategory(cat);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight">TaxSense AI Smart Semantic Search</h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform high-fidelity vector matching to find clauses, liability policies, or IRS tax provisions instantly.
        </p>
      </div>

      {/* Main Search Bento Box */}
      <div className={`p-6 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by statutory clause, tax code section, regulatory keyword (e.g. Liability, QBI deduction, audit)..."
                className={`w-full py-3 pl-10 pr-4 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-colors ${
                  darkMode ? "bg-slate-800 text-slate-100 border-slate-700" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
            
            <div className="flex gap-2 shrink-0">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`py-3 pl-9 pr-6 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] font-semibold appearance-none cursor-pointer border ${
                    darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-700"
                  }`}
                >
                  <option value="">All Categories</option>
                  <option value="Legal Contract">Legal Contract</option>
                  <option value="Tax Regulation">Tax Regulation</option>
                  <option value="Compliance Audit">Compliance Audit</option>
                  <option value="Internal Policy">Internal Policy</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 bg-[#6D28D9] hover:bg-[#8B5CF6] text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-purple-900/15 cursor-pointer transition-colors"
              >
                {loading ? "Aligning Vectors..." : "Retrieve Matches"}
              </button>
            </div>
          </div>

          {/* Quick presets list */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Recommended Search Filters:</span>
            {[
              { text: "Who conducts the directory seat controls?", label: "Directory Audits", cat: "Legal Contract" },
              { text: "Specified Service Trades or Businesses (SSTB)", label: "Tax Phase-outs", cat: "Tax Regulation" },
              { text: "Delaware Jurisdiction dispute arbitration", label: "Delaware Escalation", cat: "Legal Contract" },
              { text: "Liability limits and GDPR field exposures", label: "GDPR Indemnity", cat: "Legal Contract" }
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPresetSearch(p.text, p.cat)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  darkMode ? "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Results Container Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className={`p-5 rounded-2xl border animate-pulse ${darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-150 border-slate-200"}`}>
                <div className="h-4 bg-slate-400/20 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-slate-400/20 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-400/20 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {results.map((res) => {
              const scoreColor = res.relevanceScore >= 80 ? "text-[#10B981] bg-emerald-500/10" : res.relevanceScore >= 60 ? "text-[#F59E0B] bg-yellow-500/10" : "text-blue-400 bg-blue-500/10";
              const scoreText = res.relevanceScore >= 80 ? "Highly Relevant" : res.relevanceScore >= 60 ? "Moderate Match" : "Static Grounding Reference";

              return (
                <div
                  key={res.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    darkMode ? "bg-[#1E293B] border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-purple-500/10 text-[#8B5CF6] text-[9px] font-bold rounded uppercase">
                          {res.regulation}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          in {res.documentName}
                        </span>
                      </div>
                      <h4 className="text-base font-bold select-all pt-1">
                        {res.clause}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`px-2 py-1 rounded-lg font-black text-xs space-y-0.5 ${scoreColor}`}>
                        <div>{res.relevanceScore}% Similar</div>
                        <div className="text-[8px] uppercase tracking-wider">{scoreText}</div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl text-xs leading-relaxed mt-4 whitespace-pre-wrap select-text font-serif italic ${
                    darkMode ? "bg-slate-800/40 text-slate-300 border-l-4 border-[#8B5CF6]" : "bg-slate-50 text-slate-700 border-l-4 border-[#6D28D9]"
                  }`}>
                    "{res.matchedText}"
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700/10 text-xs">
                    <div className="flex space-x-3 text-slate-400">
                      <span><strong>Document Ref</strong>: {res.section}</span>
                      <span>•</span>
                      <span><strong>Page Offset</strong>: {res.pageNumber}</span>
                    </div>
                    <button
                      onClick={() => onSelectSearchResult(res.section.includes("Agreement") ? "doc-1" : "doc-2")}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 font-bold cursor-pointer hover:underline"
                    >
                      <span>Analyze inside AI Workspace</span>
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : hasSearched ? (
          <div className="p-8 text-center rounded-3xl border border-dashed border-slate-400/20">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">No semantic vector blocks matches found.</p>
            <p className="text-xs text-slate-400 mt-1">Try expanding your keyword terms or select a broader category filter.</p>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border border-dashed flex items-center gap-4 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
            <Info className="w-10 h-10 text-purple-400 shrink-0" />
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider">Semantic Prompt Grounding</h5>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Enter phrases, regulatory citations, or contractual clauses to query active documents. Perfect for looking up complex, scattered provisions without manual scrolling.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
