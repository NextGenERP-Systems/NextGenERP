"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  UserPlus,
  Users,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Plus,
  X,
  Building,
  DollarSign,
  Phone,
  Mail,
  Trash2,
} from "lucide-react";
import {
  getJobOpenings,
  createJobOpening,
  deleteJobOpening,
  getApplicants,
  addApplicant,
  deleteApplicant,
  updateApplicantStage,
  MOCK_DEPARTMENTS,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { JobOpening, JobApplicant, ApplicantStage } from "@/types/hrm";

const STAGES: { stage: ApplicantStage; label: string }[] = [
  { stage: "APPLIED", label: "Applied" },
  { stage: "TECH_INTERVIEW", label: "Tech Interview" },
  { stage: "HR_INTERVIEW", label: "HR Round" },
  { stage: "OFFER_MADE", label: "Offer Made" },
  { stage: "HIRED", label: "Hired" },
];

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  const [newJob, setNewJob] = useState({
    jobTitle: "",
    departmentId: MOCK_DEPARTMENTS[0].id,
    vacancies: 1,
    location: "Bengaluru / Hybrid",
    minExperienceYears: 3,
    description: "",
  });

  const [newCandidate, setNewCandidate] = useState({
    applicantName: "",
    email: "",
    phone: "",
    currentCompany: "",
    expectedCtc: 1800000,
    rating: 5,
    jobOpeningId: "",
  });

  useEffect(() => {
    async function load() {
      const [jobData, appData] = await Promise.all([getJobOpenings(), getApplicants()]);
      setJobs(jobData);
      setApplicants(appData);
      if (jobData.length > 0) {
        setNewCandidate((prev) => ({ ...prev, jobOpeningId: jobData[0].id }));
      }
    }
    load();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createJobOpening(newJob);
    setJobs((prev) => [created, ...prev]);
    setShowJobModal(false);
    setNewJob({
      jobTitle: "",
      departmentId: MOCK_DEPARTMENTS[0].id,
      vacancies: 1,
      location: "Bengaluru / Hybrid",
      minExperienceYears: 3,
      description: "",
    });
  };

  const handleDeleteJob = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await deleteJobOpening(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await addApplicant(newCandidate);
    setApplicants((prev) => [created, ...prev]);
    setShowCandidateModal(false);
    setNewCandidate({
      applicantName: "",
      email: "",
      phone: "",
      currentCompany: "",
      expectedCtc: 1800000,
      rating: 5,
      jobOpeningId: jobs[0]?.id || "",
    });
  };

  const handleDeleteApplicant = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await deleteApplicant(id);
    setApplicants((prev) => prev.filter((a) => a.id !== id));
  };

  const handleStageChange = async (applicantId: string, nextStage: ApplicantStage) => {
    const updated = await updateApplicantStage(applicantId, nextStage);
    if (updated) {
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicantId ? { ...a, stage: nextStage } : a))
      );
    }
  };

  const getNextStage = (current: ApplicantStage): ApplicantStage | null => {
    const idx = STAGES.findIndex((s) => s.stage === current);
    if (idx !== -1 && idx < STAGES.length - 1) {
      return STAGES[idx + 1].stage;
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            Recruitment & Talent Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Post job openings, track candidate applications, and progress talent across stages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCandidateModal(true)}
            className="liquid-btn-glass flex items-center gap-2 px-5 py-2.5 text-xs shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-700" />
            + Add Candidate
          </button>
          <button
            onClick={() => setShowJobModal(true)}
            className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs shadow-xs"
          >
            <Briefcase className="w-4 h-4 text-slate-800" />
            + Post Job Opening
          </button>
        </div>
      </div>

      {/* Active Job Openings Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active Job Openings ({jobs.length})
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="p-8 rounded-2xl liquid-glass-card text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">No Job Openings Posted</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click &ldquo;+ Post Job Opening&rdquo; to create a new role.</p>
            </div>
            <button
              onClick={() => setShowJobModal(true)}
              className="liquid-btn-primary px-5 py-2 text-xs inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-slate-800" />
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl liquid-glass-card space-y-3 group relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{job.jobTitle}</h3>
                    <p className="text-xs text-slate-500 font-mono font-medium">{job.jobCode} • {job.department?.departmentName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider liquid-glass text-slate-800">
                      {job.vacancies} Open Roles
                    </span>
                    <button
                      onClick={(e) => handleDeleteJob(job.id, e)}
                      title="Delete Job Opening"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white/60 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium line-clamp-2">{job.description}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-white/40 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Min {job.minExperienceYears} yrs exp
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kanban Pipeline Stages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Candidate Pipeline Kanban ({applicants.length} Total)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGES.map(({ stage, label }) => {
            const stageApplicants = applicants.filter((a) => a.stage === stage);
            return (
              <div
                key={stage}
                className="p-3.5 rounded-2xl liquid-glass space-y-3 min-h-[360px] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-white/60 pb-2.5">
                  <span className="text-xs font-bold text-slate-800">{label}</span>
                  <span className="w-5 h-5 rounded-full liquid-glass flex items-center justify-center text-[10px] font-bold text-slate-700">
                    {stageApplicants.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {stageApplicants.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-center text-[11px] text-slate-400">
                      No candidates in this round
                    </div>
                  ) : (
                    stageApplicants.map((applicant) => {
                      const next = getNextStage(applicant.stage);
                      return (
                        <div
                          key={applicant.id}
                          className="p-3.5 rounded-xl liquid-glass-card space-y-2.5 group relative"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-slate-900">
                                {applicant.applicantName}
                              </h4>
                              <p className="text-[11px] text-slate-500">{applicant.currentCompany || "Previous Enterprise"}</p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteApplicant(applicant.id, e)}
                              title="Delete Candidate"
                              className="text-slate-400 hover:text-rose-600 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-[10px] text-slate-600 font-mono">
                            Exp CTC: {formatCurrency(applicant.expectedCtc)}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/40 text-[11px]">
                            <div className="flex items-center text-slate-600 font-bold gap-0.5 text-[10px]">
                              <Star className="w-3 h-3 fill-slate-400 text-slate-400" />
                              <span>{applicant.rating || 5}/5</span>
                            </div>

                            {next && (
                              <button
                                onClick={() => handleStageChange(applicant.id, next)}
                                className="text-[10px] text-slate-800 hover:text-slate-900 font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full liquid-glass"
                              >
                                Next <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {applicant.stage === "HIRED" && (
                              <span className="text-[10px] text-slate-800 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Hired
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Post Job Opening */}
      {showJobModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white/60">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Post New Job Opening</h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Job Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Lead Platform Engineer"
                  value={newJob.jobTitle}
                  onChange={(e) => setNewJob({ ...newJob, jobTitle: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Department</label>
                  <select
                    value={newJob.departmentId}
                    onChange={(e) => setNewJob({ ...newJob, departmentId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  >
                    {MOCK_DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Vacancies</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newJob.vacancies}
                    onChange={(e) => setNewJob({ ...newJob, vacancies: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Bengaluru / Hybrid"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={newJob.minExperienceYears}
                    onChange={(e) => setNewJob({ ...newJob, minExperienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Role Description & Requirements</label>
                <textarea
                  rows={3}
                  placeholder="Describe technical stack, responsibilities, and qualifications..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="liquid-btn-glass px-5 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-btn-primary px-5 py-2.5 text-xs shadow-xs"
                >
                  Post Job Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Candidate */}
      {showCandidateModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white/60">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Job Candidate</h3>
              <button onClick={() => setShowCandidateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Candidate Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newCandidate.applicantName}
                  onChange={(e) => setNewCandidate({ ...newCandidate, applicantName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Email</label>
                  <input
                    required
                    type="email"
                    placeholder="candidate@gmail.com"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98000 11222"
                    value={newCandidate.phone}
                    onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Current Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon / Freelance"
                    value={newCandidate.currentCompany}
                    onChange={(e) => setNewCandidate({ ...newCandidate, currentCompany: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Expected CTC (INR)</label>
                  <input
                    type="number"
                    step="50000"
                    placeholder="1800000"
                    value={newCandidate.expectedCtc}
                    onChange={(e) => setNewCandidate({ ...newCandidate, expectedCtc: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
              </div>

              {jobs.length > 0 && (
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Applying For Job Opening</label>
                  <select
                    value={newCandidate.jobOpeningId}
                    onChange={(e) => setNewCandidate({ ...newCandidate, jobOpeningId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>{j.jobTitle} ({j.jobCode})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(false)}
                  className="liquid-btn-glass px-5 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-btn-primary px-5 py-2.5 text-xs shadow-xs"
                >
                  Add Candidate to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
