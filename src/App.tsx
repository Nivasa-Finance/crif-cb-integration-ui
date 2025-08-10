import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Dashboard pages
import DashboardIndex from "./pages/DashboardIndex";

// Credit Report pages
import ScoreReportIndex from "./pages/ScoreReportIndex";

// Consent Form pages
import ConsentFormIndex from "./pages/ConsentFormIndex";
import WithdrawalForm from "./components/WithdrawalForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Login Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardIndex />
              </ProtectedRoute>
            } />
            
            {/* Credit Report Routes */}
            <Route path="/score-report" element={<ScoreReportIndex />} />
            
            {/* Consent Form Routes */}
            <Route path="/consent-form" element={<ConsentFormIndex />} />
            <Route path="/v1/consent/submit/:personId" element={<ConsentFormIndex />} />
            <Route path="/api/v1/consent/withdraw/:personId" element={<WithdrawalForm />} />
            <Route path="/v1/consent/withdraw/:personId" element={<WithdrawalForm />} />
                        
            {/* Default Route - Redirect to Login */}
            <Route path="/" element={<Login />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App; 