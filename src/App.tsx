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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/dashboard" element={<RevenueDashboard />} />
          <Route path="/pricing" element={<PricingEngine />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/corporate" element={<CorporateAccounts />} />
          <Route path="/upsell" element={<UpsellUpgrades />} />
          <Route path="/pre-arrival" element={<PreArrival />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
