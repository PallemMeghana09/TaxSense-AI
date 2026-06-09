import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, Play, RefreshCw, BarChart2, Info, Compass } from "lucide-react";
import { RiskReport, RiskCategoryDetails } from "../types";

interface RiskProps {
  darkMode: boolean;
  documentsList: { id: string; title: string; category: string }[];
  activeDocumentId: string;
}

export default function RiskPanel({ darkMode, documentsList, activeDocumentId }: RiskProps) {
  const [selectedDocId, setSelectedDocId] = useState(activeDocumentId || "");
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<RiskReport | null>(null);
  const [hoveredNode, setHoveredNode] = useState<RiskCategoryDetails | null>(null);

  const fetchRiskReport = async (docId: string) => {
    if (!docId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/risk/report/${docId}`);
      const data = await res.json();
      if (data.report) {
        setRiskData(data.report);
      }
    } catch (err) {
      console.error("Failed to load risk index", err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 700);
    }
  };

  useEffect(() => {
    if (activeDocumentId) {
      setSelectedDocId(activeDocumentId);
      fetchRiskReport(activeDocumentId);
    } else if (documentsList.length > 0) {
      setSelectedDocId(documentsList[0].id);
      fetchRiskReport(documentsList[0].id);
    }
  }, [activeDocumentId, documentsList]);

  const handleTriggerRiskCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) return;
    fetchRiskReport(selectedDocId);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Critical": return "bg-red-500/20 text-[#EF4444] border-red-500/30";
      case "High": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Medium": return "bg-yellow-500/10 text-[#F59E0B] border-yellow-500/20";
      default: return "bg-emerald-500/10 text-[#10B981] border-emerald-500/20";
    }
  };

  const getRiskWeightLabelColor = (level: string) => {
    switch (level) {
      case "Critical": return "text-[#EF4444]";
      case "High": return "text-orange-400";
      case "Medium": return "text-[#F59E0B]";
      default: return "text-[#10B981]";
    }
  };

  // Convert radar metrics to interactive SVG points (Spider Web simulation)
  const categories = riskData?.categories || [];
  
  // Custom hardcoded spider nodes coordinates for clean visual display
  const getSpiderPoint = (idx: number, multiplier: number) => {
    const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
    const r = multiplier * 60; // Max radius length
    const x = 120 + r * Math.cos(angle);
    const y = 110 + r * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight" id="risk-tracker-root">TaxSense AI Algorithmic Risk Assessment Module</h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform a thorough audit mapping potential exposures against standard commercial codes, GAAP policies and litigation databases.
        </p>
      </div>

      {/* Selector Bento Row */}
      <div className={`p-6 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
        <form onSubmit={handleTriggerRiskCheck} className="flex flex-col sm:flex-row gap-4 items-end justify-between">
          <div className="flex-1 w-full">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Select Active Document Target</span>
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className={`w-full p-2.5 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] border-solid border ${
                darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-700"
              }`}
            >
              <option value="">-- Select index files --</option>
              {documentsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.category})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedDocId}
            className="px-6 py-2.5 bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/10 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Generating Exposure maps...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white" />
                <span>Recalculate Corporate Risks</span>
              </>
            )}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`p-6 rounded-3xl border h-64 ${darkMode ? "bg-slate-800/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}></div>
          ))}
        </div>
      ) : riskData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bento Group 1: Interactive Heatmap Matrix & Overall Metric */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculated Risk Threshold</span>
                <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                  riskData.overallScore === "Critical" || riskData.overallScore === "High" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-500"
                }`}>
                  {riskData.overallScore} ALERTSTATUS
                </span>
              </div>
              <h3 className="text-3xl font-black mt-2 tracking-tighter">{riskData.overallScore} Score</h3>
              <p className="text-xs text-slate-400 mt-1">Aggregated legal & tax liabilities indexed inside this regulatory profile.</p>

              {/* Bento Heatmap visual layout */}
              <div className="mt-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bento Exposure Grid Heatmap</span>
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {categories.map((c, i) => {
                    const probFactor = c.probability / 100;
                    const impFactor = c.impact / 100;
                    const colorScore = probFactor * impFactor;
                    const tileBg = colorScore >= 0.6 ? "bg-red-500 font-extrabold" : colorScore >= 0.3 ? "bg-amber-500" : "bg-emerald-500/60";

                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg flex items-center justify-center text-[10px] text-white border-none cursor-pointer hover:scale-105 transition-all ${tileBg}`}
                        title={`${c.name}: Level ${c.level} (Impact: ${c.impact}%, Probability: ${c.probability}%)`}
                        onMouseEnter={() => setHoveredNode(c)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        {c.name.charAt(0)}
                      </div>
                    );
                  })}
                  {/* Fill empty spots for bento aesthetics */}
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-slate-500/10 border-none"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hover details sidebar inside card */}
            <div className="mt-6 pt-4 border-t border-slate-700/10 h-24 flex flex-col justify-center select-none">
              {hoveredNode ? (
                <div>
                  <h4 className="text-xs font-bold text-purple-400 tracking-tight">{hoveredNode.name} Metrics</h4>
                  <p className="text-[10px] text-slate-350">
                    Calculated Probability: <strong>{hoveredNode.probability}%</strong> | Impact: <strong>{hoveredNode.impact}%</strong>
                  </p>
                  <p className="text-[9px] text-[#F59E0B] italic mt-1.5 line-clamp-2">"Mitigation: {hoveredNode.mitigationStrategy}"</p>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 flex items-center gap-1.5 justify-center">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Hover grid cells to read localized mitigation guidelines</span>
                </div>
              )}
            </div>
          </div>

          {/* Bento Group 2: Radar Spider Chart SVG representation */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-Axis Exposure Spider Map</span>
              <h4 className="text-xs text-slate-400 mt-1">Visualizing normalized severity thresholds</h4>
            </div>

            <div className="h-48 relative flex items-center justify-center my-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 240 220">
                {/* Back Spider rings */}
                <polygon points={[0, 1, 2, 3, 4].map(idx => `${getSpiderPoint(idx, 1).x},${getSpiderPoint(idx, 1).y}`).join(" ")} fill="none" stroke={darkMode ? "#334155" : "#E2E8F0"} strokeWidth="1" />
                <polygon points={[0, 1, 2, 3, 4].map(idx => `${getSpiderPoint(idx, 0.7).x},${getSpiderPoint(idx, 0.7).y}`).join(" ")} fill="none" stroke={darkMode ? "#334155" : "#E2E8F0"} strokeWidth="1" strokeDasharray="2,2" />
                <polygon points={[0, 1, 2, 3, 4].map(idx => `${getSpiderPoint(idx, 0.4).x},${getSpiderPoint(idx, 0.4).y}`).join(" ")} fill="none" stroke={darkMode ? "#334155" : "#E2E8F0"} strokeWidth="1" />

                {/* Draw actual values polygon */}
                {categories.length > 0 && (
                  <polygon
                    points={categories.map((c, idx) => {
                      const maxFactor = (c.probability * c.impact) / 10000;
                      // Safe guard scale, min value 0.25 to prevent singular polygons
                      const finalFactor = Math.max(0.25, maxFactor);
                      const { x, y } = getSpiderPoint(idx, finalFactor);
                      return `${x},${y}`;
                    }).join(" ")}
                    fill="rgba(139, 92, 246, 0.3)"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                  />
                )}

                {/* Dots & Labels */}
                {categories.map((c, idx) => {
                  const labelPt = getSpiderPoint(idx, 1.25);
                  const nodePt = getSpiderPoint(idx, Math.max(0.25, (c.probability * c.impact) / 10000));
                  return (
                    <g key={idx}>
                      <circle cx={nodePt.x} cy={nodePt.y} r="3.5" fill="#A855F7" />
                      <text
                        x={labelPt.x}
                        y={labelPt.y}
                        textAnchor="middle"
                        className={`text-[8px] font-bold ${darkMode ? "fill-slate-400" : "fill-slate-600"}`}
                      >
                        {c.name.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="text-[10px] text-slate-400 text-center leading-relaxed">
              *Radar shape expands toward the periphery as category-specific probability and penalty impacts reach critical caps.
            </div>
          </div>

          {/* Bento Group 3: Categorized Exposure Level Cards */}
          <div className="space-y-4 lg:col-span-1 overflow-y-auto max-h-[20rem] lg:max-h-none">
            {categories.map((c, i) => (
              <div
                key={i}
                className={`p-4 rounded-3xl border select-text ${getRiskColor(c.level)} ${
                  darkMode ? "bg-slate-900/50" : "bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-black tracking-tight">{c.name}</h4>
                  <span className="text-[9px] uppercase font-bold tracking-widest">{c.level}</span>
                </div>

                {/* Progress bars showing probability and impact */}
                <div className="space-y-1.5 mt-2.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                    <span>Likelihood Probability:</span>
                    <span>{c.probability}%</span>
                  </div>
                  <div className="w-full bg-slate-700/10 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${c.probability}%` }}></div>
                  </div>

                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                    <span>Hazard Damage Impact:</span>
                    <span>{c.impact}%</span>
                  </div>
                  <div className="w-full bg-slate-700/10 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${c.impact}%` }}></div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-350 italic mt-2.5 bg-slate-500/5 p-2 rounded-lg">
                  <strong>Mitigation Strategy:</strong> {c.mitigationStrategy}
                </p>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-400/20">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">Ready to plot regulatory exposure point heatmaps.</p>
          <p className="text-xs text-slate-400 mt-1">Please upload or select an indexed document above and click 'Recalculate Corporate Risks'.</p>
        </div>
      )}
    </div>
  );
}
