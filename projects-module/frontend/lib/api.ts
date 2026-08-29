const API_BASE = "http://localhost:8083/api";

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function fetchTasks(projectId: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function fetchTimesheets() {
  const res = await fetch(`${API_BASE}/timesheets`);
  if (!res.ok) throw new Error("Failed to fetch timesheets");
  return res.json();
}

export async function createProject(data: any) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function createTimesheet(data: any) {
  const res = await fetch(`${API_BASE}/timesheets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create timesheet");
  return res.json();
}

export async function createTask(projectId: string, data: any) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}
