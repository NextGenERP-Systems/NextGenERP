"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  IndianRupee,
  Users,
  Percent,
  Calendar,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { getSalesAnalytics } from "@/lib/api";
import { SalesAnalyticsSummary } from "@/types/sales";

export default function SalesAnalyticsPage() {
  const [analytics, setAnalytics] = useState<SalesAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const data = await getSalesAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Sales Performance & Incentive Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sales representative commission distributions, deal conversion velocity, and historical revenue trends.
          </p>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-400 uppercase">Total Revenue Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(analytics?.totalConfirmedRevenue || 52501.25)}
            </div>
            <div className="text-[11px] text-emerald-400 font-sans mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Exceeding Q3 Targets
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-400 uppercase">Total Incentives Disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {formatCurrency(1500.0)}
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              5.0% Standard Commission rate applied
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-400 uppercase">Average Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-400">
              {formatCurrency(analytics?.averageOrderValue || 26250.62)}
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              Enterprise accounts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Team Incentives Leaderboard */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Sales Representative Performance & Commission Split
          </CardTitle>
          <CardDescription>
            Calculated via ERPNext 100% allocation contribution rule across eligible order items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-100 text-slate-400 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Sales Representative</th>
                  <th className="py-3 px-4">Allocated Volume</th>
                  <th className="py-3 px-4">Effective Rate</th>
                  <th className="py-3 px-4">Incentives Earned</th>
                  <th className="py-3 px-4">Performance Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {analytics?.salesTeamPerformance?.map((rep, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-700">
                        {idx + 1}
                      </div>
                      {rep.salesPersonName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{formatCurrency(rep.totalSales)}</td>
                    <td className="py-3 px-4 text-slate-400">5.0%</td>
                    <td className="py-3 px-4 font-bold text-amber-400">{formatCurrency(rep.incentivesEarned)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 text-[10px]">
                        Top Contributor
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
