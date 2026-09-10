'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

export interface AppRole {
  id: string;
  roleName: string;
}

export interface AppUser {
  id: string;
  username: string;
  roles: AppRole[];
}

interface AuthContextType {
  currentUser: AppUser | null;
  users: AppUser[];
  setCurrentUser: (user: AppUser) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSetCurrentUser = (user: AppUser) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem("selected_user_id", user.id);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
      if (data.length > 0) {
        let selectedUser = data[0];
        if (typeof window !== 'undefined') {
          const savedUserId = localStorage.getItem("selected_user_id");
          const found = data.find((u: AppUser) => u.id === savedUserId);
          if (found) selectedUser = found;
        }
        setCurrentUser(selectedUser);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, setCurrentUser: handleSetCurrentUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
