import React, { useState } from "react";
import { Scale, Lock, Mail, Shield, Sparkles, AlertCircle } from "lucide-react";
import { UserRole } from "../types";
import { auth, isFirebasePlaceholder } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";

interface AuthProps {
  onLogin: (role: UserRole, email: string, name: string) => void;
  darkMode: boolean;
}

export default function AuthScreen({ onLogin, darkMode }: AuthProps) {
  const [email, setEmail] = useState("analyst.ross@taxsense.ai");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Samantha Ross");
  const [role, setRole] = useState<UserRole>("Research Analyst");
  const [isRegister, setIsRegister] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Security password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");

    if (isFirebasePlaceholder) {
      console.log("Using dynamic local user auth mock for sandbox environment.");
      setTimeout(() => {
        setIsLoading(false);
        onLogin(role, email, isRegister ? name : "Samantha Ross");
      }, 500);
      return;
    }

    if (isRegister) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          try {
            await updateProfile(userCredential.user, { displayName: name });
          } catch (profileErr) {
            console.warn("Could not set displayName during sign-up:", profileErr);
          }
          setIsLoading(false);
          onLogin(role, email, name);
        })
        .catch((err) => {
          setIsLoading(false);
          if (err.code === "auth/unauthorized-domain") {
            setErrorMessage(
              `Unauthorized Domain Error: This app's hosting domain is not authorized in your Firebase console.\n\nTo solve this:\n1. Open the Firebase Console for your project 'ai-legal-1b62b'.\n2. Navigate to Authentication -> Settings -> Authorized domains.\n3. Click 'Add domain' and enter exactly:\n   "${window.location.host}"`
            );
          } else {
            setErrorMessage(err.message || "Failed to register user credentials in cloud.");
          }
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setIsLoading(false);
          onLogin(role, email, userCredential.user.displayName || "Samantha Ross");
        })
        .catch((err) => {
          setIsLoading(false);
          if (err.code === "auth/unauthorized-domain") {
            setErrorMessage(
              `Unauthorized Domain Error: This app's hosting domain is not authorized in your Firebase console.\n\nTo solve this:\n1. Open the Firebase Console for your project 'ai-legal-1b62b'.\n2. Navigate to Authentication -> Settings -> Authorized domains.\n3. Click 'Add domain' and enter exactly:\n   "${window.location.host}"`
            );
          } else {
            setErrorMessage("Authentication failed. Please verify credentials or register first.");
          }
        });
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setErrorMessage("");

    if (isFirebasePlaceholder) {
      console.log("Using dynamic local Google SSO mock for sandbox environment.");
      setTimeout(() => {
        setIsLoading(false);
        onLogin("Research Analyst", "google.user@taxsense.ai", "Google Professional User");
      }, 500);
      return;
    }

    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        setIsLoading(false);
        const displayName = result.user.displayName || "Google Professional User";
        const userEmail = result.user.email || "google.user@taxsense.ai";
        onLogin("Research Analyst", userEmail, displayName);
      })
      .catch((err: any) => {
        setIsLoading(false);
        if (err.code === "auth/unauthorized-domain") {
          setErrorMessage(
            `Unauthorized Domain Error: This app's hosting domain is not authorized in your Firebase console.\n\nTo solve this:\n1. Open the Firebase Console for your project 'ai-legal-1b62b'.\n2. Navigate to Authentication -> Settings -> Authorized domains.\n3. Click 'Add domain' and enter exactly:\n   "${window.location.host}"`
          );
        } else {
          setErrorMessage(err.message || "Failed to verify workspace credentials via Google accounts.");
        }
      });
  };

  const handleForgotPassword = () => {
    if (!email) {
      setErrorMessage("Enter your email address to receive reset guidelines.");
      return;
    }
    setErrorMessage("");

    if (isFirebasePlaceholder) {
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
      }, 5000);
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setResetSent(true);
        setTimeout(() => {
          setResetSent(false);
        }, 5000);
      })
      .catch((err) => {
        setErrorMessage(err.message || "Failed to initiate recovery mail.");
      });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${darkMode ? "bg-[#0F172A] text-slate-100" : "bg-[#F8FAFC] text-slate-900"}`}>
      <div id="auth-card" className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col md:flex-row transition-all duration-300 ${darkMode ? "bg-[#1E293B]/90 border-slate-800" : "bg-white border-slate-200"}`}>
        
        {/* Decorative Brand Panel */}
        <div className="md:w-1/2 p-10 bg-gradient-to-br from-[#6D28D9] via-[#8B5CF6] to-[#A855F7] text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center space-x-3 z-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">TaxSense AI</span>
          </div>

          <div className="my-10 z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4 text-white">
              AI Legal & Tax Research Suite
            </h1>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Empowering lawyers, accountants, and risk officers with instant document intelligence, deep regulation summaries, semantic search clauses, and precise compliance reports.
            </p>
            <div className="space-y-3">
              {[
                "RAG-Based Intelligent Contract Analysis",
                "U.S. Tax Code Section 199A Expert Grounding",
                "Interactive Compliance Risk Scorecards",
                "Page & Clause Exact Citations"
              ].map((text, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs font-medium text-purple-100">
                  <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-white/60 text-xs flex justify-between items-center z-10">
            <span>TaxSense AI Platform v2.4</span>
            <div className="flex space-x-1 items-center bg-white/10 px-2 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-[10px]">Gemini 3.5 Active</span>
            </div>
          </div>
        </div>

        {/* Dynamic Form Control Panel */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {isRegister ? "Create Auditor Account" : "Access Securitas Workspace"}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {isRegister ? "Register credentials for statutory workspace access" : "Sign in using credentials generated via your corporate IT registry"}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl text-xs bg-red-500/10 border border-red-500/30 text-[#EF4444] flex items-start gap-2 whitespace-pre-wrap leading-relaxed">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {resetSent && (
            <div className="p-3 mb-4 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/30 text-[#10B981] flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Sent recovery instructions to <strong>{email}</strong>! Check inbox.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Shield className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full py-2 pl-9 pr-4 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-colors border ${darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300"}`}
                    placeholder="Samantha Ross"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-2 pl-9 pr-4 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-colors border ${darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300"}`}
                  placeholder="analyst.ross@taxsense.ai"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Security Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-purple-400 hover:underline hover:text-purple-300"
                  >
                    Forgot Lock Key?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full py-2 pl-9 pr-4 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-colors border ${darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300"}`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">Auditor Role Privilege</label>
              <div className="grid grid-cols-3 gap-2">
                {(["User", "Research Analyst", "Admin"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                      role === r
                        ? "bg-[#6D28D9] border-[#8B5CF6] text-white shadow-md shadow-purple-900/20"
                        : darkMode
                        ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                        : "bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {role === "Admin" && "🔑 Fully unlocked legislative override, policy deletions, and custom systems configuration capabilities."}
                {role === "Research Analyst" && "🛡️ Access to regulatory comparisons, circular audit gauges, and Gemini code structures."}
                {role === "User" && "🔍 Basic contract intelligence search, PDF uploads, and compliance checklists."}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] hover:opacity-90 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-700/20 flex justify-center items-center gap-2 cursor-pointer transition-opacity"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegister ? "Confirm Profile Sandbox" : "Enter Interactive Workspace"}</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${darkMode ? "border-slate-800" : "border-slate-200"}`}></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={`px-2 text-[10px] tracking-widest ${darkMode ? "bg-[#1E293B] text-slate-500" : "bg-white text-slate-400"}`}>Secure Provider Key</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className={`w-full py-2 px-4 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                darkMode ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3.01.69 4.02l3.24-2.52c1.9-1.75 3.12-4.32 3.12-7.35z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.24-2.52c-.9.6-2.05.96-3.25.96-3.13 0-5.78-2.11-6.73-4.96L3.4 17.09C5.38 21.04 9.4 24 12 24z" />
                <path fill="#FBBC05" d="M5.27 14.57a7.2 7.2 0 0 1 0-4.57L1.87 7.37A11.94 11.94 0 0 0 0 12c0 1.64.33 3.21.91 4.63l4.36-2.06z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 9.4 0 5.38 2.96 3.4 6.91l4.36 3.39c.95-2.85 3.6-4.55 6.24-4.55z" />
              </svg>
              <span>Verify client account via Google Single Sign On</span>
            </button>

            <div className="text-center text-xs mt-3">
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-purple-400 hover:underline font-medium text-xs bg-transparent border-none"
              >
                {isRegister ? "Already hold a certificate? Secure Sign In" : "Need workspace credentials? Self-register inside database"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
