import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import RevenueDashboard from "./pages/RevenueDashboard";
import PricingEngine from "./pages/PricingEngine";
import Bookings from "./pages/Bookings";
import CorporateAccounts from "./pages/CorporateAccounts";
import UpsellUpgrades from "./pages/UpsellUpgrades";
import PreArrival from "./pages/PreArrival";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/dashboard" element={<ProtectedRoute><RevenueDashboard /></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><PricingEngine /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/corporate" element={<ProtectedRoute><CorporateAccounts /></ProtectedRoute>} />
          <Route path="/upsell" element={<ProtectedRoute><UpsellUpgrades /></ProtectedRoute>} />
          <Route path="/pre-arrival" element={<ProtectedRoute><PreArrival /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
