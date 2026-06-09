import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, ShieldAlert, Sparkles, Sliders, Play, RefreshCw } from "lucide-react";
import { ComplianceReport } from "../types";

interface ComplianceProps {
  darkMode: boolean;
  documentsList: { id: string; title: string; category: string }[];
  activeDocumentId: string;
}

export default function CompliancePanel({ darkMode, documentsList, activeDocumentId }: ComplianceProps) {
  const [selectedDocId, setSelectedDocId] = useState(activeDocumentId || "");
  const [industryType, setIndustryType] = useState("Financial Technology (FinTech)");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);

  const fetchComplianceReport = async (docId: string, ind?: string) => {
    if (!docId) return;
    setLoading(true);
    try {
      const targetInd = ind || industryType;
      const res = await fetch(`/api/compliance/report/${docId}?industry=${encodeURIComponent(targetInd)}`);
      const data = await res.json();
      
      // Merge selected custom industry into the returned report
      if (data.report) {
        setReport({
          ...data.report,
          industry: targetInd
        });
      }
    } catch (err) {
      console.error("Failed to load compliance report", err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 700);
    }
  };

  useEffect(() => {
    if (activeDocumentId) {
      setSelectedDocId(activeDocumentId);
      fetchComplianceReport(activeDocumentId);
    } else if (documentsList.length > 0) {
      setSelectedDocId(documentsList[0].id);
      fetchComplianceReport(documentsList[0].id);
    }
  }, [activeDocumentId, documentsList]);

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) return;
    fetchComplianceReport(selectedDocId, industryType);
  };

  // SVG calculations for circular progress chart
  const score = report?.score || 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 90) return "stroke-[#10B981] text-[#10B981]";
    if (val >= 75) return "stroke-[#F59E0B] text-[#F59E0B]";
    return "stroke-[#EF4444] text-[#EF4444]";
  };

  const getScoreBg = (val: number) => {
    if (val >= 90) return "bg-emerald-500/10 text-[#10B981]";
    if (val >= 75) return "bg-yellow-500/10 text-[#F59E0B]";
    return "bg-red-500/10 text-[#EF4444]";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight">TaxSense AI Statutory Compliance Checker</h2>
        <p className="text-xs text-slate-400 mt-1">
          Simulate a thorough regulatory check against ISO standards, IRS directives, CCPA, or regional labor mandates.
        </p>
      </div>

      {/* Select Controls Bento Box */}
      <div className={`p-6 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
        <form onSubmit={handleRunAudit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Target Legal File</span>
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className={`w-full p-2.5 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] border ${
                darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-700"
              }`}
            >
              <option value="">-- Choose Article to Audit --</option>
              {documentsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Compliance Framework Profile</span>
            </label>
            <select
              value={industryType}
              onChange={(e) => setIndustryType(e.target.value)}
              className={`w-full p-2.5 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] border ${
                darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-700"
              }`}
            >
              <option value="Financial Technology (FinTech)">Financial Technology (FinTech) - HIPAA/PCI/SLA</option>
              <option value="Professional Services / Accounting">Professional Tax Services - Section 199A QBI</option>
              <option value="Healthcare Systems & EMR">Healthcare Systems - HIPAA/PII Privacy</option>
              <option value="E-Commerce Retail Group">E-Commerce Retailing - COPPA/CCPA Disclosures</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedDocId}
            className="w-full py-2.5 bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/10 flex justify-center items-center gap-2 cursor-pointer transition-opacity"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Auditing Policies...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white" />
                <span>Run Interactive Compliance Check</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Main compliance outputs dashboard */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className={`md:col-span-1 p-8 rounded-3xl border h-72 ${darkMode ? "bg-slate-800/50 border-slate-805" : "bg-slate-50 border-slate-200 flex items-center justify-center"}`}>
            <div className="w-24 h-24 rounded-full border-4 border-slate-400/20 border-t-purple-500 animate-spin"></div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="h-6 bg-slate-400/20 rounded w-1/4"></div>
            <div className="h-20 bg-slate-400/20 rounded w-full"></div>
            <div className="h-20 bg-slate-400/20 rounded w-full"></div>
          </div>
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Circular progress Score */}
          <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center relative overflow-hidden ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculated Rating</div>
            
            <div className="relative w-36 h-36 flex items-center justify-center mt-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className={`transition-all duration-1000 ${getScoreColor(score)}`}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center flex flex-col justify-center select-none">
                <span className="text-3xl font-black tracking-tighter">{score}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Secure</span>
              </div>
            </div>

            <div className="text-center mt-6 space-y-1">
              <h4 className="text-sm font-black tracking-tight">{report.documentTitle}</h4>
              <p className="text-[11px] text-slate-400">Target Benchmark: {report.industry}</p>
            </div>

            <div className="mt-6 w-full p-3 bg-slate-500/5 rounded-xl border border-slate-500/10 text-center">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getScoreBg(score)}`}>
                {score >= 90 ? "Excellent Compliance" : score >= 75 ? "Warning Alerts Issued" : "Violations Require Fix"}
              </span>
              <p className="text-[10px] text-slate-400 mt-2">
                This document meets {score}% of industry-specific statutory parameters. Take actions on violations immediately.
              </p>
            </div>
          </div>

          {/* Right panel: Checks breakdowns */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Passed Checks */}
            <div className={`p-5 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className="text-xs font-bold text-[#10B981] uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-700/10 pb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Passed Checks ({report.passedChecks.length})</span>
              </h3>
              {report.passedChecks.length > 0 ? (
                <div className="space-y-3">
                  {report.passedChecks.map((p) => (
                    <div key={p.id} className="flex gap-3 items-start select-text text-left">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                      <div>
                        <h4 className="text-xs font-bold tracking-tight">{p.title} <span className="px-1.5 py-0.5 bg-emerald-500/10 text-[#10B981] text-[9px] rounded font-semibold ml-2">{p.category}</span></h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No verified passed marks loaded inside sandbox.</p>
              )}
            </div>

            {/* Warning areas */}
            {report.warningAreas.length > 0 && (
              <div className={`p-5 rounded-3xl border border-yellow-500/20 bg-yellow-500/5`}>
                <h3 className="text-xs font-bold text-[#F59E0B] uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-yellow-500/10 pb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Warnings & Gaps ({report.warningAreas.length})</span>
                </h3>
                <div className="space-y-4">
                  {report.warningAreas.map((w) => (
                    <div key={w.id} className="text-xs text-left">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-[#F59E0B] tracking-tight">{w.title}</h4>
                        <span className="text-[8px] tracking-wider uppercase font-black bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded">
                          {w.severity} Impact
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{w.description}</p>
                      <div className="p-2 rounded-lg bg-orange-500/5 border-l-2 border-[#F59E0B] text-[10px] text-slate-400 mt-2 italic">
                        <strong>Mitigation Recommendation:</strong> {w.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Violations */}
            {report.violations.length > 0 && (
              <div className={`p-5 rounded-3xl border border-red-500/25 bg-red-500/5`}>
                <h3 className="text-xs font-bold text-[#EF4444] uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-red-500/10 pb-2">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Statutory Violations & Exposure Risks ({report.violations.length})</span>
                </h3>
                <div className="space-y-4">
                  {report.violations.map((v) => (
                    <div key={v.id} className="text-xs text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-[#EF4444] tracking-tight">{v.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-1">{v.description}</p>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-[#EF4444]/20 text-[#EF4444] px-2 py-1 rounded-md text-right whitespace-nowrap shrink-0">
                          Est. Fine: {v.penalty}
                        </span>
                      </div>
                      <div className="p-2 bg-red-500/10 rounded-lg text-[10px] text-slate-350 mt-2 select-all">
                        <strong>Resolution Patch Required:</strong> {v.solution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top actionable recommendations list */}
            {report.recommendations.length > 0 && (
              <div className={`p-5 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Action Plan recommendations</h3>
                <div className="space-y-2">
                  {report.recommendations.map((r) => (
                    <div key={r.id} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-slate-500/5 border border-slate-500/10">
                      <div>
                        <h4 className="font-bold text-slate-300">{r.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{r.action}</p>
                      </div>
                      <span className={`px-2 py-0.5 font-bold text-[9px] tracking-wider uppercase rounded-md ${
                        r.priority === "High" ? "bg-red-500/20 text-red-400" : r.priority === "Medium" ? "bg-yellow-500/20 text-yellow-500" : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {r.priority} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-400/20">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">Ready to launch compliance controls.</p>
          <p className="text-xs text-slate-400 mt-1">Please select an uploaded article in the top drop-down menu and choose your industry framework.</p>
        </div>
      )}
    </div>
  );
}
