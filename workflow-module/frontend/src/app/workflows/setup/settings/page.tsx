"use client";

import { useEffect, useState } from "react";
import { getWorkflowSettings, updateWorkflowSettings, WorkflowSettingsData } from "@/lib/api";
import { Settings, Save, Clock, Mail, ShieldAlert, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<WorkflowSettingsData>({
    enableEmailNotifications: true,
    defaultAutoRejectionTimeoutDays: 7,
    strictMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getWorkflowSettings();
        setSettings(res);
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateWorkflowSettings(settings);
      setSettings(updated);
      toast.success("Global workflow settings updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          Workflow Settings
        </h1>
        <p className="text-sm text-slate-500">Configure global workflow engine rules and notification channels.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Clock className="animate-spin text-slate-400 w-8 h-8" /></div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs space-y-6">
          {/* Toggle 1: Email Notifications */}
          <div className="flex items-start justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                <Mail className="w-4 h-4 text-indigo-600" />
                Enable Email Notifications on State Change
              </div>
              <p className="text-xs text-slate-500">
                Log email notifications to the backend service interface whenever a document transitions to a new approval state.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.enableEmailNotifications}
                onChange={e => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Setting 2: Auto-rejection Timeout */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <Clock className="w-4 h-4 text-indigo-600" />
              Default Auto-Rejection Timeout (Days)
            </div>
            <p className="text-xs text-slate-500">
              Set the SLA period after which pending approval requests are automatically escalated or rejected.
            </p>
            <input 
              type="number" 
              min={1}
              max={90}
              value={settings.defaultAutoRejectionTimeoutDays}
              onChange={e => setSettings({ ...settings, defaultAutoRejectionTimeoutDays: parseInt(e.target.value) || 7 })}
              className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Toggle 3: Strict Mode */}
          <div className="flex items-start justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                Strict Mode (Prevent Admin Bypassing)
              </div>
              <p className="text-xs text-slate-500">
                When enabled, even administrators must strictly possess the designated transition role to transition document states.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.strictMode}
                onChange={e => setSettings({ ...settings, strictMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
