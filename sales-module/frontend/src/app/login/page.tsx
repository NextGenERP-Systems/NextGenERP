"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, ShieldCheck, UserCheck, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("admin@nextgen.erp");
  const [password, setPassword] = useState("Admin@2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await loginUser({ usernameOrEmail, password });
      login(res.token, res.user);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setUsernameOrEmail(email);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 items-center justify-center text-white shadow-md shadow-blue-200">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">NextGen ERP</h1>
          <p className="text-sm text-slate-500">Enterprise Resource Planning & Sales Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your credentials or select a demo role below</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Username or Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin@nextgen.erp"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick One-Click Demo Roles
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@nextgen.erp", "Admin@2026!")}
                className={`p-2 rounded-lg border text-left transition-all ${
                  usernameOrEmail === "admin@nextgen.erp"
                    ? "bg-blue-50 border-blue-300 text-blue-800"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="text-[11px] font-semibold">Admin</div>
                <div className="text-[9px] text-slate-500">Full Suite</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("manager@nextgen.erp", "Manager@2026!")}
                className={`p-2 rounded-lg border text-left transition-all ${
                  usernameOrEmail === "manager@nextgen.erp"
                    ? "bg-blue-50 border-blue-300 text-blue-800"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="text-[11px] font-semibold">Manager</div>
                <div className="text-[9px] text-slate-500">Sales Lead</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("rep@nextgen.erp", "Rep@2026!")}
                className={`p-2 rounded-lg border text-left transition-all ${
                  usernameOrEmail === "rep@nextgen.erp"
                    ? "bg-blue-50 border-blue-300 text-blue-800"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="text-[11px] font-semibold">Sales Rep</div>
                <div className="text-[9px] text-slate-500">Field Ops</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Secured by Spring Security 6 & JWT HMAC-256</span>
        </div>
      </div>
    </div>
  );
}
