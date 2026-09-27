"use client";

import { MicrofrontendView } from "@/components/layout/MicrofrontendView";
import { FolderKanban } from "lucide-react";

export default function ProjectsPortalPage() {
  return (
    <MicrofrontendView
      title="Projects & Tasks"
      subtitle="Agile Kanban, Timesheets & Sprint Tracking"
      badge="Project Ops"
      icon={FolderKanban}
      iconColor="text-violet-600"
      iconBg="bg-violet-100"
      src="http://localhost:3003/projects"
      port={3003}
    />
  );
}
