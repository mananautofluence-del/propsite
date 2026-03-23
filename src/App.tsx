import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DashboardListings from "./pages/DashboardListings";
import CreateListing from "./pages/CreateListing";
import PublicListing from "./pages/PublicListing";
import PublicCollection from "./pages/PublicCollection";
import DashboardCollections from "./pages/DashboardCollections";
import DashboardLayout from "./components/DashboardLayout";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/create" element={<CreateListing />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="listings" element={<DashboardListings />} />
              <Route path="marketplace" element={<DashboardListings />} />
              <Route path="listings/new" element={<CreateListing />} />
              <Route path="analytics" element={<Dashboard />} />
              <Route path="collections" element={<DashboardCollections />} />
              <Route path="projects" element={<Dashboard />} />
              <Route path="brochures" element={<Dashboard />} />
              <Route path="leads" element={<Dashboard />} />
              <Route path="settings" element={<Dashboard />} />
            </Route>
            <Route path="/l/:slug" element={<PublicListing />} />
            <Route path="/c/:slug" element={<PublicCollection />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
