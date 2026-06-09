import React, { useState } from "react";
import { TrendingUp, FileText, MessageSquare, BarChart3, PieChart, ShieldAlert, CheckCircle } from "lucide-react";

interface AnalyticsProps {
  darkMode: boolean;
  analyticsData: {
    totalDocuments: number;
    queriesAsked: number;
    complianceChecks: number;
    riskReportsGenerated: number;
    trends: { month: string; uploads: number; score: number; queries: number }[];
  };
}

export default function AnalyticsPanel({ darkMode, analyticsData }: AnalyticsProps) {
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  const stats = [
    { label: "Analyzed Documents", value: analyticsData.totalDocuments, desc: "Indexed legal agreements & acts", icon: FileText, color: "text-[#6D28D9]", bg: "bg-purple-500/10" },
    { label: "Semantic Queries", value: analyticsData.queriesAsked, desc: "Auditing chat questions answered", icon: MessageSquare, color: "text-[#8B5CF6]", bg: "bg-indigo-500/10" },
    { label: "Compliance Scorecard Checks", value: analyticsData.complianceChecks, desc: "Tax & ISO audits compiled", icon: CheckCircle, color: "text-[#10B981]", bg: "bg-emerald-500/10" },
    { label: "Risk Exposure Audits", value: analyticsData.riskReportsGenerated, desc: "Calculated legal liabilities", icon: ShieldAlert, color: "text-[#EF4444]", bg: "bg-red-500/10" }
  ];

  // Visual helper calculations for inline SVG trends
  const trendsList = analyticsData.trends || [];
  const maxQueries = Math.max(...trendsList.map(t => t.queries), 40);
  const maxUploads = Math.max(...trendsList.map(t => t.uploads), 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight" id="analytics-banner">Compliance & Research Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time indicators processed across active regulatory updates.</p>
        </div>
        <div className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${darkMode ? "bg-slate-800 text-slate-300" : "bg-white text-slate-600 border border-slate-200"}`}>
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span>Index Synced: Just now</span>
        </div>
      </div>

      {/* Bento Grid Stats Card Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ${
              darkMode ? "bg-[#1E293B] border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:shadow-md"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{st.label}</p>
                <h3 className="text-3xl font-black tracking-widest mt-1">{st.value}</h3>
              </div>
              <div className={`p-2 rounded-xl ${st.bg} ${st.color}`}>
                <st.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-3">{st.desc}</p>
            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#6D28D9] to-transparent w-3/4`}></div>
          </div>
        ))}
      </div>

      {/* Complex Bento Layout Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Document Upload Strategy Trend (Takes 2 Columns) */}
        <div className={`lg:col-span-2 p-5 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#8B5CF6]">Research Workload & Query Activity</h4>
              <p className="text-xs text-slate-400">Monthly upload index vs queries asked</p>
            </div>
            <div className="flex space-x-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#8B5CF6] rounded-full"></span> Queries asks</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#10B981] rounded-full"></span> Document volume</span>
            </div>
          </div>

          {/* SVG Bar / Line Chart */}
          <div className="h-64 relative w-full pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-full pr-1 overflow-visible">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="480" y2="20" stroke={darkMode ? "#334155" : "#E2E8F0"} strokeDasharray="3,3" />
              <line x1="30" y1="70" x2="480" y2="70" stroke={darkMode ? "#334155" : "#E2E8F0"} strokeDasharray="3,3" />
              <line x1="30" y1="120" x2="480" y2="120" stroke={darkMode ? "#334155" : "#E2E8F0"} strokeDasharray="3,3" />
              <line x1="30" y1="170" x2="480" y2="170" stroke={darkMode ? "#334155" : "#E2E8F0"} strokeDasharray="1,1" />

              {/* Draw query curve */}
              {trendsList.length > 1 && (
                <path
                  d={trendsList.map((t, idx) => {
                    const x = 30 + idx * 85;
                    const y = 170 - (t.queries / maxQueries) * 140;
                    return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}

              {/* Interactive Bars for monthly uploads */}
              {trendsList.map((t, idx) => {
                const xBar = 20 + idx * 85;
                const barHeight = (t.uploads / maxUploads) * 120 + 10;
                const yBar = 170 - barHeight;
                const queryPointY = 170 - (t.queries / maxQueries) * 140;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredTrendIndex(idx)}
                    onMouseLeave={() => setHoveredTrendIndex(null)}
                  >
                    {/* Upload columns */}
                    <rect
                      x={xBar}
                      y={yBar}
                      width="18"
                      height={barHeight}
                      rx="4"
                      className="fill-emerald-500/30 group-hover:fill-emerald-400 transition-colors duration-200"
                    />
                    
                    {/* Line nodes for interactive hover */}
                    <circle
                      cx={30 + idx * 85}
                      cy={queryPointY}
                      r={hoveredTrendIndex === idx ? "7" : "5"}
                      fill="#8B5CF6"
                      stroke="#FFF"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />

                    {/* Labels */}
                    <text
                      x={30 + idx * 85}
                      y="190"
                      textAnchor="middle"
                      className={`text-[9px] font-bold ${darkMode ? "fill-slate-400" : "fill-slate-500"}`}
                    >
                      {t.month}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Custom Interactive Floating Tooltip */}
            {hoveredTrendIndex !== null && (
              <div className={`absolute top-2 p-3 rounded-lg border shadow-lg text-xs flex flex-col space-y-1 select-none z-10 transition-all ${
                darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              }`} style={{ left: `${hoveredTrendIndex * 15 + 10}%` }}>
                <p className="font-bold text-[#6D28D9]">{trendsList[hoveredTrendIndex].month} Auditing Logs</p>
                <div className="h-px bg-slate-700/20 my-1"></div>
                <p><span className="text-slate-400">Uploaded files:</span> <span className="font-semibold text-emerald-400">{trendsList[hoveredTrendIndex].uploads} articles</span></p>
                <p><span className="text-slate-400">Total queries:</span> <span className="font-semibold text-purple-400">{trendsList[hoveredTrendIndex].queries} API asks</span></p>
                <p><span className="text-slate-400">Average Compliance:</span> <span className="font-semibold text-yellow-500">{trendsList[hoveredTrendIndex].score}%</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Modern Bento Risk Heatmap Metrics (Takes 1 Column) */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#EF4444]">Exposure Heat Index</h4>
                <p className="text-xs text-slate-400">Aggregated audits by severity level</p>
              </div>
              <span className={`px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded uppercase tracking-wider`}>
                High Alert
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 mt-6">
              {[
                { label: "Contract SLA", score: 65, status: "Medium", bg: "bg-[#F59E0B]/25 border-yellow-500/30" },
                { label: "GDPR PII", score: 85, status: "High", bg: "bg-red-500/20 border-red-500/30" },
                { label: "Sec 199A QBI", score: 92, status: "Critical", bg: "bg-red-500/40 border-red-600/40" },
                { label: "Delaware Escrow", score: 30, status: "Low", bg: "bg-emerald-500/15 border-emerald-500/30" },
                { label: "Audit Ledger", score: 75, status: "High", bg: "bg-red-500/25 border-red-500/30" },
                { label: "Tax LLC Caps", score: 80, status: "High", bg: "bg-red-500/30 border-red-500/40" },
                { label: "HIPAA Med Logs", score: 12, status: "Low", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { label: "S-Corp Officer", score: 50, status: "Medium", bg: "bg-[#F59E0B]/20 border-yellow-500/30" }
              ].map((h, i) => (
                <div
                  key={i}
                  className={`col-span-2 p-2 rounded-xl border flex flex-col justify-between text-left ${h.bg}`}
                >
                  <p className="text-[10px] font-bold truncate">{h.label}</p>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-[9px] text-slate-400 font-medium">{h.status}</span>
                    <span className="text-xs font-black">{h.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/10 text-xs flex justify-between items-center text-slate-400">
            <span>Critical legal exposure points:</span>
            <span className="text-red-400 font-bold">5 Items mapped</span>
          </div>
        </div>

      </div>

      {/* Extra Bento Section: Recent Statutory Actions */}
      <div className={`p-5 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
        <h4 className="text-xs font-bold tracking-widest text-[#10B981] uppercase mb-3">Live Jurisdictional Feeds (Mock Grounded API)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-500/10">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] font-bold uppercase rounded">Tax Code §199A</span>
            <p className="text-xs font-medium mt-2">Treasury clarifies pass-through tax advisory ceiling phaseout for trust-managed consulting S-Corporations.</p>
            <span className="text-[10px] text-slate-500 block mt-2">Active: 2 days ago</span>
          </div>
          <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-500/10">
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[9px] font-bold uppercase rounded">SLA Jurisdiction</span>
            <p className="text-xs font-medium mt-2">Delaware Court of Chancery declares online seat-scans valid if written agreements grant audit credentials.</p>
            <span className="text-[10px] text-slate-500 block mt-2">Active: 4 days ago</span>
          </div>
          <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-500/10">
            <span className="px-2 py-0.5 bg-emerald-500/20 text-[#10B981] text-[9px] font-bold uppercase rounded">GDPR Privacy</span>
            <p className="text-xs font-medium mt-2">EU Data Protection Board reviews custom payload field exposures on unencrypted general cloud forms.</p>
            <span className="text-[10px] text-slate-500 block mt-2">Active: June 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
