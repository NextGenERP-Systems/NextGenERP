"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, Clock } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead, AppNotification } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const data = await getUnreadNotifications(currentUser.username);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // In a real app, you might want to use a websocket or polling here
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      await markAllNotificationsAsRead(currentUser.username);
      setNotifications([]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                {loading ? <Clock className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 group">
                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 truncate">{n.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                    <button 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-500 transition-all h-fit"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
