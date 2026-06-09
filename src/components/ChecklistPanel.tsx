import React, { useState, useEffect } from "react";
import { ListChecks, Plus, Trash2, Download, CheckCircle, Clock, Check, Star, Edit3 } from "lucide-react";
import { Checklist, ChecklistItem } from "../types";

interface ChecklistProps {
  darkMode: boolean;
}

export default function ChecklistPanel({ darkMode }: ChecklistProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Checklist["category"]>("Tax Compliance");
  const [customItemText, setCustomItemText] = useState("");
  const [toastText, setToastText] = useState("");

  const loadChecklists = async () => {
    try {
      const res = await fetch("/api/checklists");
      const data = await res.json();
      setChecklists(data.checklists || []);
      if (data.checklists?.length > 0 && !selectedListId) {
        setSelectedListId(data.checklists[0].id);
      }
    } catch (err) {
      console.error("Failed to load checklists from API", err);
    }
  };

  useEffect(() => {
    loadChecklists();
  }, []);

  const triggerToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(""), 3500);
  };

  const handleToggleItem = (listId: string, itemId: string) => {
    setChecklists((prevLists) =>
      prevLists.map((list) => {
        if (list.id !== listId) return list;
        return {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        };
      })
    );
  };

  const handleUpdateNotes = (listId: string, itemId: string, notes: string) => {
    setChecklists((prevLists) =>
      prevLists.map((list) => {
        if (list.id !== listId) return list;
        return {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, notes } : item
          )
        };
      })
    );
  };

  const handleRemoveItem = (listId: string, itemId: string) => {
    setChecklists((prevLists) =>
      prevLists.map((list) => {
        if (list.id !== listId) return list;
        return {
          ...list,
          items: list.items.filter((item) => item.id !== itemId)
        };
      })
    );
  };

  const handleAddCustomItem = (listId: string) => {
    if (!customItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: customItemText,
      checked: false,
      notes: ""
    };

    setChecklists((prevLists) =>
      prevLists.map((list) => {
        if (list.id !== listId) return list;
        return { ...list, items: [...list.items, newItem] };
      })
    );
    setCustomItemText("");
    triggerToast("Custom compliance step appended to guidelines.");
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let prebakedItems: string[] = [];
    if (newCategory === "GST Filing") {
      prebakedItems = [
        "Reconcile monthly outbound invoices with ERP logs.",
        "Verify GSTR-2B details for active input credit exemptions.",
        "Perform digital statutory signing procedures.",
        "Upload finalized reports to state tax portal."
      ];
    } else if (newCategory === "Audit Preparation") {
      prebakedItems = [
        "Index historical SaaS contracts signed during corporate year.",
        "Separate external PII exposures into a dedicated storage list.",
        "Conduct mock penetration controls on public database interfaces.",
        "Schedule informal pre-audit mediation escalation checks."
      ];
    } else if (newCategory === "Tax Compliance") {
      prebakedItems = [
        "Review Section 199A QBI pass-through deductions with CPAs.",
        "Categorify SSTB divisions to adjust target income ceilings.",
        "Perform officer salary testing parameters per state guidelines."
      ];
    } else {
      prebakedItems = [
        "Verify executive signatures are present on all digital sheets.",
        "Confirm mutual liability limits fall under $1M contract thresholds."
      ];
    }

    const payload = {
      title: newTitle,
      category: newCategory,
      items: prebakedItems.map((text, idx) => ({
        id: `item-gen-${idx}-${Date.now()}`,
        text,
        checked: false,
        notes: ""
      }))
    };

    try {
      const res = await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setChecklists(prev => [...prev, data.checklist]);
        setSelectedListId(data.checklist.id);
        setNewTitle("");
        triggerToast(`Successfully generated "${payload.title}" Checklist template!`);
      }
    } catch (err) {
      console.error("Failed to post checklist", err);
    }
  };

  const handleExportChecklist = (format: "csv" | "print") => {
    const list = checklists.find((c) => c.id === selectedListId);
    if (!list) return;

    if (format === "print") {
      window.print();
    } else {
      let content = `Category,Task,Status,Staff Notes\n`;
      list.items.forEach((it) => {
        content += `"${list.category}","${it.text}","${it.checked ? "Done" : "Pending"}","${it.notes || ""}"\n`;
      });
      const blob = new Blob([content], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${list.title.replace(/\s+/g, "_")}_compliance_checklist.csv`;
      link.click();
      URL.revokeObjectURL(url);
      triggerToast("CSV spreadsheet downloaded successfully!");
    }
  };

  const activeList = checklists.find((c) => c.id === selectedListId);

  return (
    <div className="space-y-6">
      {/* Toast Alert popup */}
      {toastText && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-purple-500/30 text-white shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold font-sans">{toastText}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight">TaxSense AI Compliance Checklists</h2>
        <p className="text-xs text-slate-400 mt-1">
          Create, track, and export action-ready checklists for audits, corporate filing dates, and regulatory mandates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Bento: Templates & Checklist Generation */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Create checklist form */}
          <div className={`p-5 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
            <h3 className="text-xs font-bold text-[#8B5CF6] uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Instantiate Template</span>
            </h3>

            <form onSubmit={handleCreateChecklist} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Checklist Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. FY26 Tax Filing Protocol, Delaware ToS Audit"
                  className={`w-full p-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-colors border ${
                    darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category & Pre-baked steps</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className={`w-full p-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] font-semibold border ${
                    darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-700"
                  }`}
                >
                  <option value="GST Filing">GST Filing Guide</option>
                  <option value="Audit Preparation">Audit Preparation Protocol</option>
                  <option value="Tax Compliance">IRS Tax Code Compliance</option>
                  <option value="Legal Documentation">Legal Agreement Review</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:opacity-90 transition-opacity"
              >
                Construct Checklist
              </button>
            </form>
          </div>

          {/* List of active checklists */}
          <div className={`p-5 rounded-3xl border ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Active Checklist Indexes</h3>
            <div className="space-y-2">
              {checklists.map((list) => {
                const total = list.items.length;
                const completed = list.items.filter((i) => i.checked).length;
                const ratio = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`w-full p-3 text-left rounded-xl border transition-all flex justify-between items-center ${
                      selectedListId === list.id
                        ? "border-[#8B5CF6] bg-purple-500/10"
                        : darkMode
                        ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold tracking-tight">{list.title}</h4>
                      <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                        <span className="font-semibold text-purple-400">{list.category}</span>
                        <span>•</span>
                        <span>{completed}/{total} Completed</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black tracking-widest ${ratio === 100 ? "text-[#10B981]" : "text-[#F59E0B]"}`}>{ratio}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Bento Checklist details workspace */}
        <div className="lg:col-span-2">
          {activeList ? (
            <div className={`p-6 rounded-3xl border h-full flex flex-col justify-between ${darkMode ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200"}`}>
              <div>
                <div className="flex justify-between items-start border-b border-slate-700/10 pb-4 mb-4">
                  <div>
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded uppercase">
                      {activeList.category}
                    </span>
                    <h3 className="text-lg font-black mt-1 tracking-tight">{activeList.title}</h3>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleExportChecklist("csv")}
                      className={`p-1.5 hover:opacity-80 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                        darkMode ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV Spreadsheet</span>
                    </button>
                    <button
                      onClick={() => handleExportChecklist("print")}
                      className={`p-1.5 bg-[#6D28D9] text-white hover:bg-[#8B5CF6] text-xs font-bold rounded-lg flex items-center gap-1`}
                    >
                      <span>Printer Format</span>
                    </button>
                  </div>
                </div>

                {/* Items container list */}
                <div className="space-y-3">
                  {activeList.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row gap-3 justify-between items-start md:items-center transition-colors ${
                        item.checked
                          ? darkMode
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-emerald-500/5 border-emerald-500/20"
                          : darkMode
                          ? "bg-slate-800/20 border-slate-800"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <button
                          onClick={() => handleToggleItem(activeList.id, item.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                            item.checked
                              ? "bg-emerald-500 border-emerald-600 text-white"
                              : darkMode
                              ? "border-slate-700 hover:border-slate-600"
                              : "border-slate-300 hover:border-slate-400"
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        
                        <div className="space-y-1 flex-1">
                          <p className={`text-xs font-medium ${item.checked ? "line-through text-slate-400" : ""}`}>
                            {item.text}
                          </p>
                          <input
                            type="text"
                            value={item.notes || ""}
                            onChange={(e) => handleUpdateNotes(activeList.id, item.id, e.target.value)}
                            placeholder="Add administrative staff action notes, deadlines, or query targets..."
                            className="w-full bg-transparent text-[10px] text-slate-400 focus:outline-none focus:underline"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(activeList.id, item.id)}
                        className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-slate-500/5 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add custom step bottom row */}
              <div className="mt-6 pt-4 border-t border-slate-700/10 flex gap-2">
                <input
                  type="text"
                  value={customItemText}
                  onChange={(e) => setCustomItemText(e.target.value)}
                  placeholder="Insert custom verification step into this checklist..."
                  className={`flex-1 p-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] border ${
                    darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCustomItem(activeList.id);
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomItem(activeList.id)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Append Method</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-400/20">
              <ListChecks className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">Select a statutory checklist on the left.</p>
              <p className="text-xs text-slate-400 mt-1">Alternatively, configure a new automated template above to start auditing audits.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
