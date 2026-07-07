import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthPage } from "@/pages/AuthPage";
import { HomePage } from "@/pages/HomePage";
import { useThemeStore } from "@/stores/theme.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export function App() {
  const theme = useThemeStore((s) => s.theme);
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster theme={theme} position="bottom-right" richColors />
    </QueryClientProvider>
  );
}
