
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Building, Link2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateClientResponse {
  client_id: string;
  invitation_id: string;
  token: string;
}

export function InviteClientDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [emailFormData, setEmailFormData] = useState({
    clientName: "",
    email: "",
  });
  const [manualFormData, setManualFormData] = useState({
    clientName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    contactEmail: "",
  });
  const [shareableLink, setShareableLink] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  // Handler for email invitation submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create client and generate invitation
      const { data, error } = await supabase.rpc('create_client_with_invitation', {
        client_name: emailFormData.clientName,
        contact_email: emailFormData.email,
      });

      if (error) throw error;

      // Type assertion with unknown first to satisfy TypeScript
      const response = data as unknown as CreateClientResponse;

      // Send invitation email
      const emailResponse = await supabase.functions.invoke('send-invitation', {
        body: {
          clientName: emailFormData.clientName,
          email: emailFormData.email,
          token: response.token,
        },
      });

      if (!emailResponse.error) {
        toast.success("Client invited successfully!");
        setOpen(false);
        setEmailFormData({ clientName: "", email: "" });
      } else {
        throw new Error("Failed to send invitation email");
      }
    } catch (error: any) {
      console.error("Error inviting client:", error);
      toast.error(error.message || "Failed to invite client");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for manual client creation
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create client directly
      const { data, error } = await supabase.rpc('create_client_manual', {
        client_name: manualFormData.clientName,
        p_address: manualFormData.address,
        p_city: manualFormData.city,
        p_state: manualFormData.state,
        p_zip_code: manualFormData.zipCode,
        p_phone: manualFormData.phone,
        p_contact_email: manualFormData.contactEmail,
      });

      if (error) throw error;

      toast.success("Client created successfully!");
      setOpen(false);
      setManualFormData({
        clientName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        contactEmail: "",
      });
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast.error(error.message || "Failed to create client");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for generating shareable link
  const handleGenerateShareableLink = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('create_client_shareable_invitation', {
        client_id: selectedClientId,
      });

      if (error) throw error;

      const response = data as unknown as CreateClientResponse;
      const inviteLink = `${window.location.origin}/invitation?token=${response.token}`;
      
      setShareableLink(inviteLink);
      toast.success("Shareable invitation link generated!");
    } catch (error: any) {
      console.error("Error generating shareable link:", error);
      toast.error(error.message || "Failed to generate shareable link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite New Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Choose how you'd like to create or invite a client.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="email">Email Invitation</TabsTrigger>
            <TabsTrigger value="manual">Manual Setup</TabsTrigger>
            <TabsTrigger value="link">Shareable Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientName">Organization Name</Label>
                  <Input
                    id="clientName"
                    value={emailFormData.clientName}
                    onChange={(e) =>
                      setEmailFormData((prev) => ({
                        ...prev,
                        clientName: e.target.value,
                      }))
                    }
                    placeholder="Acme Corp"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailFormData.email}
                    onChange={(e) =>
                      setEmailFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="contact@example.com"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="manualClientName">Organization Name</Label>
                  <Input
                    id="manualClientName"
                    value={manualFormData.clientName}
                    onChange={(e) =>
                      setManualFormData((prev) => ({
                        ...prev,
                        clientName: e.target.value,
                      }))
                    }
                    placeholder="Acme Corp"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={manualFormData.address}
                    onChange={(e) =>
                      setManualFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="123 Main St"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={manualFormData.city}
                      onChange={(e) =>
                        setManualFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder="New York"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={manualFormData.state}
                      onChange={(e) =>
                        setManualFormData((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      placeholder="NY"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={manualFormData.zipCode}
                      onChange={(e) =>
                        setManualFormData((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      placeholder="10001"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={manualFormData.phone}
                      onChange={(e) =>
                        setManualFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="(555) 555-5555"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Contact Email (Optional)</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={manualFormData.contactEmail}
                    onChange={(e) =>
                      setManualFormData((prev) => ({
                        ...prev,
                        contactEmail: e.target.value,
                      }))
                    }
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Client"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="link">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="selectClient">Select Client</Label>
                <Input
                  id="selectClient"
                  placeholder="Enter client ID"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the client ID to generate a shareable invitation link.
                </p>
              </div>
              
              <Button 
                type="button" 
                onClick={handleGenerateShareableLink} 
                disabled={isLoading || !selectedClientId}
                className="mt-2"
              >
                <Link2 className="mr-2 h-4 w-4" />
                {isLoading ? "Generating..." : "Generate Shareable Link"}
              </Button>
              
              {shareableLink && (
                <div className="mt-4 space-y-2">
                  <Label>Invitation Link</Label>
                  <div className="flex items-center">
                    <Input value={shareableLink} readOnly className="mr-2" />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleCopyLink}
                      variant="outline"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This link will expire in 30 days. Anyone with this link can join this client organization.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
