// src/hooks/useUser.ts
import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  wins: number;
  elo: number;
  createdAt: string;
  losses: number;
}

export const useUser = (): { user: User | null; isLoading: boolean } => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const statusResponse = await fetch("/api/auth/status", {
          credentials: "include",
        });

        if (!statusResponse.ok) {
          setUser(null);
          return;
        }

        const authStatus = await statusResponse.json();

        if (!authStatus.authenticated) {
          setUser(null);
          return;
        }

        const response = await fetch("/api/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading };
};