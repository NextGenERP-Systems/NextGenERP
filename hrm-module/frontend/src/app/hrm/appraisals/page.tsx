"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
  Building2,
  UserCheck,
  Plus,
  X,
  Search,
  Filter,
  Users,
  Target,
  MessageSquare,
  FileText,
  AlertCircle,
} from "lucide-react";
import { getAppraisals, createAppraisal, getEmployees } from "@/lib/api";
import { EmployeeAppraisal, Employee } from "@/types/hrm";

interface AppraisalTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  applicableDepartment: string;
  criteria: string[];
  ratingScale: string;
}

interface KeyResultArea {
  id: string;
  kraTitle: string;
  targetMetric: string;
  weightagePercent: number;
  department: string;
  targetQuarter: string;
  progressPercent: number;
}

interface ContinuousFeedback {
  id: string;
  fromEmployee: string;
  toEmployee: string;
  feedbackType: "PEER_RECOGNITION" | "MANAGER_COACHING" | "LEADERSHIP_NOTE";
  feedbackText: string;
  submittedDate: string;
}

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(`NEXTGEN_HRM_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`NEXTGEN_HRM_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(err);
  }
}

function AppraisalsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTab = searchParams.get("tab");
  const validTabs = ["reviews", "templates", "kras", "feedback"];
  const activeTab = validTabs.includes(urlTab || "") ? (urlTab as string) : "reviews";

  const handleTabChange = (tab: string) => {
    const url = tab === "reviews" ? "/hrm/appraisals" : `/hrm/appraisals?tab=${tab}`;
    router.push(url);
  };

  // State (100% Dynamic - Zero static seeds)
  const [appraisals, setAppraisals] = useState<EmployeeAppraisal[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [templates, setTemplates] = useState<AppraisalTemplate[]>(() =>
    getStorage("APPRAISAL_TEMPLATES", [])
  );
  const [kras, setKras] = useState<KeyResultArea[]>(() =>
    getStorage("KRAS_LIST", [])
  );
  const [feedbacks, setFeedbacks] = useState<ContinuousFeedback[]>(() =>
    getStorage("FEEDBACKS_LIST", [])
  );

  const [selectedAppraisal, setSelectedAppraisal] = useState<EmployeeAppraisal | null>(null);

  // Filters
  const [search, setSearch] = useState("");

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showKraModal, setShowKraModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Form states
  const [newReview, setNewReview] = useState({
    employeeId: "",
    managerId: "",
    cycle: "FY 2026-27 Q2 Review",
    selfScore: 4.5,
    managerScore: 4.8,
    remarks: "Exemplary performance, delivered major platform deliverables ahead of schedule.",
    promotionRecommended: true,
    incrementPercentage: 15.0,
  });

  const [newTemplate, setNewTemplate] = useState({
    code: "",
    name: "",
    dept: "All Departments",
    criteriaText: "Technical Execution, System Reliability, Architecture Discipline, Team Mentorship",
  });

  const [newKra, setNewKra] = useState({
    title: "",
    metric: "99.99% Uptime",
    weightage: 25,
    dept: "Software Engineering & Platform",
    quarter: "Q3 2026",
    progress: 50,
  });

  const [newFeedback, setNewFeedback] = useState({
    toEmpId: "",
    type: "PEER_RECOGNITION" as const,
    text: "",
  });

  const loadData = async () => {
    const [aprData, empData] = await Promise.all([getAppraisals(), getEmployees()]);
    setAppraisals(aprData || []);
    setEmployees(empData || []);
    if (empData && empData.length > 0) {
      setNewReview((prev) => ({
        ...prev,
        employeeId: empData[0].id,
        managerId: empData[0].id,
      }));
      setNewFeedback((prev) => ({ ...prev, toEmpId: empData[0].id }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createAppraisal(newReview);
    setAppraisals((prev) => [created, ...prev]);
    setShowReviewModal(false);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const t: AppraisalTemplate = {
      id: `tmpl-${Date.now()}`,
      templateCode: newTemplate.code || `TMP-${Date.now().toString().slice(-3)}`,
      templateName: newTemplate.name,
      applicableDepartment: newTemplate.dept,
      criteria: newTemplate.criteriaText.split(",").map((s) => s.trim()),
      ratingScale: "1.0 - 5.0 Continuous Scale",
    };
    const updated = [...templates, t];
    setTemplates(updated);
    setStorage("APPRAISAL_TEMPLATES", updated);
    setShowTemplateModal(false);
    setNewTemplate({ code: "", name: "", dept: "All Departments", criteriaText: "" });
  };

  const handleCreateKra = (e: React.FormEvent) => {
    e.preventDefault();
    const kra: KeyResultArea = {
      id: `kra-${Date.now()}`,
      kraTitle: newKra.title,
      targetMetric: newKra.metric,
      weightagePercent: Number(newKra.weightage) || 20,
      department: newKra.dept,
      targetQuarter: newKra.quarter,
      progressPercent: Number(newKra.progress) || 0,
    };
    const updated = [...kras, kra];
    setKras(updated);
    setStorage("KRAS_LIST", updated);
    setShowKraModal(false);
    setNewKra({ title: "", metric: "", weightage: 25, dept: "Software Engineering & Platform", quarter: "Q3 2026", progress: 0 });
  };

  const handleCreateFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = employees.find((e) => e.id === newFeedback.toEmpId);
    if (!matched) return;
    const fb: ContinuousFeedback = {
      id: `fb-${Date.now()}`,
      fromEmployee: "Senior Leadership",
      toEmployee: `${matched.firstName} ${matched.lastName}`,
      feedbackType: newFeedback.type,
      feedbackText: newFeedback.text,
      submittedDate: new Date().toISOString().split("T")[0],
    };
    const updated = [fb, ...feedbacks];
    setFeedbacks(updated);
    setStorage("FEEDBACKS_LIST", updated);
    setShowFeedbackModal(false);
    setNewFeedback({ toEmpId: employees[0]?.id || "", type: "PEER_RECOGNITION", text: "" });
  };

  // Filtered appraisals
  const filteredAppraisals = useMemo(() => {
    return appraisals.filter((a) => {
      const name = `${a.employee?.firstName} ${a.employee?.lastName} ${a.employee?.employeeCode}`.toLowerCase();
      return name.includes(search.toLowerCase());
    });
  }, [appraisals, search]);

  // Derived Metrics
  const avgScore = appraisals.length
    ? (appraisals.reduce((acc, a) => acc + (a.finalScore || a.managerScore || 0), 0) / appraisals.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Performance, Appraisals & KRAs Command Center
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-zinc-900 text-white rounded">
              PERFORMANCE & GOVERNANCE
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Performance appraisal review cycles, Key Result Areas (KRAs), competency templates, and continuous 360 peer feedback
          </p>
        </div>

        {/* Dynamic Contextual Action */}
        <div className="flex items-center gap-2">
          {activeTab === "reviews" && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Initiate Appraisal Review
            </button>
          )}

          {activeTab === "templates" && (
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Review Template
            </button>
          )}

          {activeTab === "kras" && (
            <button
              onClick={() => setShowKraModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Key Result Area (KRA)
            </button>
          )}

          {activeTab === "feedback" && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Submit Continuous Feedback
            </button>
          )}
        </div>
      </div>

      {/* 2. Dynamic KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Appraisals Conducted</span>
            <Award className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{appraisals.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Evaluations on record</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Average Score</span>
            <Star className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{avgScore} / 5.0</div>
          <div className="text-[10px] text-zinc-500 font-mono">Workforce rating</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Defined KRAs</span>
            <Target className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{kras.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Goals and objectives</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Review Templates</span>
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{templates.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Evaluation matrices</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium">
            <span>Peer Feedbacks</span>
            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900">{feedbacks.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono">Continuous notes</div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-200 overflow-x-auto pb-0.5 text-xs font-medium">
        <button
          onClick={() => handleTabChange("reviews")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "reviews"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Appraisal Reviews
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {appraisals.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("templates")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "templates"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Review Templates
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {templates.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("kras")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "kras"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Key Result Areas (KRAs)
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {kras.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("feedback")}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "feedback"
              ? "border-zinc-900 text-zinc-900 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Continuous 360 Feedback
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
            {feedbacks.length}
          </span>
        </button>
      </div>

      {/* 4. Tab Views */}

      {/* TAB A: APPRAISAL REVIEWS */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-zinc-200">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews by employee name, code..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md font-medium"
              />
            </div>
          </div>

          {filteredAppraisals.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <Award className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Performance Reviews Logged</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No appraisals recorded yet. Click "Initiate Appraisal Review" to evaluate an employee against competencies.
              </p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Initiate Appraisal Review
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Review Cycle</th>
                    <th className="py-2.5 px-3">Self Score</th>
                    <th className="py-2.5 px-3">Manager Score</th>
                    <th className="py-2.5 px-3">Promotion Rec</th>
                    <th className="py-2.5 px-3">Hike %</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredAppraisals.map((apr) => (
                    <tr
                      key={apr.id}
                      onClick={() => setSelectedAppraisal(apr)}
                      className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-medium text-zinc-900">
                        {apr.employee?.firstName} {apr.employee?.lastName}
                        <span className="block text-[10px] font-mono text-zinc-500">{apr.employee?.employeeCode}</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-zinc-800">{apr.appraisalCycle}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-zinc-800">{apr.selfScore || 4.0} / 5.0</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{apr.managerScore || 4.5} / 5.0</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {apr.promotionRecommended ? "YES" : "NO"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">+{apr.incrementPercentage || 0}%</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-900 text-white">
                          {apr.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppraisal(apr);
                          }}
                          className="px-2.5 py-1 bg-zinc-900 text-white rounded text-[11px] font-semibold"
                        >
                          View Scorecard
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB B: REVIEW TEMPLATES */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Evaluation Competency Templates</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{templates.length} Templates</span>
          </div>

          {templates.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Review Templates Configured</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Define standard assessment criteria, competencies, and scoring weights for appraisals.
              </p>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Create Review Template
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Template Code</th>
                    <th className="py-2.5 px-3">Template Title</th>
                    <th className="py-2.5 px-3">Applicable Scope</th>
                    <th className="py-2.5 px-3">Evaluation Competencies</th>
                    <th className="py-2.5 px-3">Rating Scale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {templates.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-mono font-semibold text-zinc-800">{t.templateCode}</td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">{t.templateName}</td>
                      <td className="py-2.5 px-3 text-zinc-700">{t.applicableDepartment}</td>
                      <td className="py-2.5 px-3 text-zinc-600">
                        {t.criteria.map((c, i) => (
                          <span key={i} className="inline-block mr-1.5 px-1.5 py-0.2 bg-zinc-100 text-zinc-800 rounded text-[10px]">
                            {c}
                          </span>
                        ))}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{t.ratingScale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB C: KEY RESULT AREAS (KRAS) */}
      {activeTab === "kras" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Key Result Areas (KRAs) & Corporate Objectives</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{kras.length} Objectives Active</span>
          </div>

          {kras.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <Target className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Key Result Areas Configured</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Set quantitative targets, weightages, and strategic goals for teams and departments.
              </p>
              <button
                onClick={() => setShowKraModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Add Key Result Area (KRA)
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">KRA Title</th>
                    <th className="py-2.5 px-3">Target Metric</th>
                    <th className="py-2.5 px-3">Weightage</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Target Quarter</th>
                    <th className="py-2.5 px-3">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {kras.map((k) => (
                    <tr key={k.id} className="hover:bg-zinc-50/80">
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">{k.kraTitle}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-800">{k.targetMetric}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{k.weightagePercent}%</td>
                      <td className="py-2.5 px-3 text-zinc-700">{k.department}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-700">{k.targetQuarter}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-zinc-900 h-full" style={{ width: `${k.progressPercent}%` }} />
                          </div>
                          <span>{k.progressPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB D: CONTINUOUS 360 FEEDBACK */}
      {activeTab === "feedback" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-900">Continuous 360 Feedback & Peer Recognition</div>
            <span className="text-[11px] font-mono text-zinc-600 font-semibold">{feedbacks.length} Notes Logged</span>
          </div>

          {feedbacks.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-3">
              <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto" />
              <div className="text-sm font-semibold text-zinc-800">No Continuous Feedback Entries</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Promote peer-to-peer appreciation and continuous managerial coaching by submitting feedback.
              </p>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-md font-semibold"
              >
                + Submit Continuous Feedback
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono">Feedback for: </span>
                      <span className="font-bold text-xs text-zinc-900">{fb.toEmployee}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {fb.feedbackType}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 italic bg-zinc-50 p-2.5 rounded border border-zinc-100">
                    "{fb.feedbackText}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
                    <span>From: {fb.fromEmployee}</span>
                    <span>{fb.submittedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DRAWER: SCORECARD INSPECTOR */}
      {selectedAppraisal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Appraisal Review Scorecard</h2>
                <p className="text-[11px] text-zinc-500 font-mono">{selectedAppraisal.appraisalCycle}</p>
              </div>
              <button
                onClick={() => setSelectedAppraisal(null)}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3.5 rounded border border-zinc-200">
                <div>
                  <span className="text-zinc-500 font-medium">Employee Name</span>
                  <p className="font-bold text-zinc-900 mt-0.5">
                    {selectedAppraisal.employee?.firstName} {selectedAppraisal.employee?.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Employee Code</span>
                  <p className="font-mono font-bold text-zinc-800 mt-0.5">{selectedAppraisal.employee?.employeeCode}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Self Evaluation</span>
                  <p className="font-mono font-bold text-zinc-800 mt-0.5">{selectedAppraisal.selfScore || 4.5} / 5.0</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Manager Evaluation</span>
                  <p className="font-mono font-bold text-zinc-900 mt-0.5">{selectedAppraisal.managerScore || 4.8} / 5.0</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">
                  Evaluation Remarks & Performance Commentary
                </span>
                <div className="p-3 bg-zinc-50 rounded border border-zinc-200 text-zinc-800 leading-relaxed">
                  {selectedAppraisal.remarks || "Exemplary performance, delivered major platform deliverables ahead of schedule."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-zinc-900 text-white p-4 rounded-lg">
                <div>
                  <span className="text-[11px] text-zinc-400">Promotion Recommendation</span>
                  <div className="text-base font-bold font-mono mt-0.5">
                    {selectedAppraisal.promotionRecommended ? "RECOMMENDED FOR UPGRADE" : "RETAIN LEVEL"}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400">Proposed CTC Revision</span>
                  <div className="text-base font-bold font-mono mt-0.5">
                    +{selectedAppraisal.incrementPercentage || 15}% Increment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INITIATE APPRAISAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Initiate Performance Appraisal</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateReview} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Employee</label>
                <select
                  value={newReview.employeeId}
                  onChange={(e) => setNewReview({ ...newReview, employeeId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Review Cycle Period</label>
                <input
                  type="text"
                  value={newReview.cycle}
                  onChange={(e) => setNewReview({ ...newReview, cycle: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Self Rating (out of 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newReview.selfScore}
                    onChange={(e) => setNewReview({ ...newReview, selfScore: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Manager Rating (out of 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newReview.managerScore}
                    onChange={(e) => setNewReview({ ...newReview, managerScore: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Promotion Recommended</label>
                  <select
                    value={newReview.promotionRecommended ? "YES" : "NO"}
                    onChange={(e) => setNewReview({ ...newReview, promotionRecommended: e.target.value === "YES" })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                  >
                    <option value="YES">Yes - Promote</option>
                    <option value="NO">No - Retain Grade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Hike Increment (%)</label>
                  <input
                    type="number"
                    value={newReview.incrementPercentage}
                    onChange={(e) => setNewReview({ ...newReview, incrementPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Managerial Assessment Remarks</label>
                <textarea
                  rows={2}
                  value={newReview.remarks}
                  onChange={(e) => setNewReview({ ...newReview, remarks: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Submit Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TEMPLATE */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Create Review Template</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTemplate} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Template Code</label>
                <input
                  type="text"
                  placeholder="TMP-ENG-SR"
                  value={newTemplate.code}
                  onChange={(e) => setNewTemplate({ ...newTemplate, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Template Title</label>
                <input
                  required
                  type="text"
                  placeholder="Senior Technical Leadership Matrix"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Evaluation Competencies (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="System Design, Delivery Velocity, Mentorship"
                  value={newTemplate.criteriaText}
                  onChange={(e) => setNewTemplate({ ...newTemplate, criteriaText: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD KRA */}
      {showKraModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Add Key Result Area (KRA)</h3>
              <button onClick={() => setShowKraModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateKra} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Goal / Objective Title</label>
                <input
                  required
                  type="text"
                  placeholder="Infrastructure Reliability & Zero Severity Incidents"
                  value={newKra.title}
                  onChange={(e) => setNewKra({ ...newKra, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Target Metric</label>
                  <input
                    type="text"
                    placeholder="99.99% Uptime"
                    value={newKra.metric}
                    onChange={(e) => setNewKra({ ...newKra, metric: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    value={newKra.weightage}
                    onChange={(e) => setNewKra({ ...newKra, weightage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowKraModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Save Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FEEDBACK */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Submit Continuous Feedback</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFeedback} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Recipient</label>
                <select
                  value={newFeedback.toEmpId}
                  onChange={(e) => setNewFeedback({ ...newFeedback, toEmpId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Feedback Category</label>
                <select
                  value={newFeedback.type}
                  onChange={(e) => setNewFeedback({ ...newFeedback, type: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-medium"
                >
                  <option value="PEER_RECOGNITION">Peer Recognition & Kudos</option>
                  <option value="MANAGER_COACHING">Manager Coaching & Guidance</option>
                  <option value="LEADERSHIP_NOTE">Leadership Commendation</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Feedback Notes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share constructive feedback or commendation"
                  value={newFeedback.text}
                  onChange={(e) => setNewFeedback({ ...newFeedback, text: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-1.5 border border-zinc-300 rounded-md text-zinc-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-semibold">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppraisalsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-zinc-400 font-mono">
          Loading Appraisals Command Center...
        </div>
      }
    >
      <AppraisalsContent />
    </Suspense>
  );
}
