import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import ComplaintPortal from "./routes/index";
import AuthPage from "./routes/auth";
import AdminDashboard from "./routes/admin";
import CheckStatusPage from "./routes/check-status";

const queryClient = new QueryClient();

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ComplaintPortal />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/check-status" element={<CheckStatusPage />} />
            <Route path="*" element={<NotFoundComponent />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-center" />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
