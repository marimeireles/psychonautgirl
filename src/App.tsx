import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { logVisit } from "@/lib/visitLog";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Anki from "./pages/Anki";
import NotFound from "./pages/NotFound";

// Code-split: these pages (and their data) download only when the route is opened.
const Ukiepc = lazy(() => import("./pages/Ukiepc"));
const Interview = lazy(() => import("./pages/Interview"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: "#efe3f5" }}>
    <div className="text-sm font-bold" style={{ color: "#a0306b", fontFamily: "Quicksand, system-ui, sans-serif" }}>
      loading… ✨
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  // anonymous visit logging: location only (country/city), never the IP
  useEffect(() => {
    logVisit();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/anki" element={<Anki />} />
          <Route path="/ukiepc" element={<Suspense fallback={<PageLoader />}><Ukiepc /></Suspense>} />
          <Route path="/interview" element={<Suspense fallback={<PageLoader />}><Interview /></Suspense>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
