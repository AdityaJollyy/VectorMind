import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiEnvelope, User } from "@/lib/types";

interface Credentials {
  name?: string;
  email: string;
  password: string;
}

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  function onAuthSuccess(user: User, message: string) {
    setUser(user);
    queryClient.setQueryData(["me"], user);
    toast.success(message);
    navigate("/");
  }

  const login = useMutation({
    mutationFn: async (input: Credentials) => {
      const res = await api.post<ApiEnvelope<{ user: User }>>(
        "/auth/login",
        input
      );
      return res.data.data.user;
    },
    onSuccess: (user) => onAuthSuccess(user, "Welcome back"),
    onError: (err) => toast.error(err.message),
  });

  const register = useMutation({
    mutationFn: async (input: Credentials) => {
      const res = await api.post<ApiEnvelope<{ user: User }>>(
        "/auth/register",
        input
      );
      return res.data.data.user;
    },
    onSuccess: (user) => onAuthSuccess(user, "Account created"),
    onError: (err) => toast.error(err.message),
  });

  const logout = useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      navigate("/auth");
    },
    onError: (err) => toast.error(err.message),
  });

  return { login, register, logout };
}
