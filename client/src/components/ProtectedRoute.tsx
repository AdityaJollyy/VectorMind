import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import type { ApiEnvelope, User } from "@/lib/types";

export function ProtectedRoute() {
  const setUser = useAuthStore((s) => s.setUser);

  const { isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<{ user: User }>>("/auth/me");
      setUser(res.data.data.user);
      return res.data.data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-canvas">
        <Spinner className="size-6 text-accent" />
      </div>
    );
  }

  if (isError) return <Navigate to="/auth" replace />;
  return <Outlet />;
}
