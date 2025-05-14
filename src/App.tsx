
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Clients from "@/pages/Clients";
import ClientSettings from "@/pages/ClientSettings";
import Programs from "@/pages/Programs";
import Events from "@/pages/Events";
import Venues from "@/pages/Venues";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import { Toaster } from "sonner";
import Auth from "@/pages/Auth";
import Invitation from "@/pages/Invitation";
import ResetPassword from "@/pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/invitation" element={<Invitation />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:clientId/*" element={<ClientSettings />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/events/*" element={<Events />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
