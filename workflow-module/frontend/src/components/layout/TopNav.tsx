"use client";

import NotificationBell from "./NotificationBell";

export default function TopNav() {
  return (
    <div className="h-12 border-b border-slate-200 flex items-center justify-end px-6 bg-white sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <NotificationBell />
      </div>
    </div>
  );
}
