
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Auth } from "@/pages/Auth";
import { Index } from "@/pages/Index";
import { Settings } from "@/pages/Settings";
import { ClientSettings } from "@/pages/ClientSettings";
import { Clients } from "@/pages/Clients";
import Profile from "@/pages/Profile";
import { NotFound } from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:clientId/settings" element={<ClientSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
