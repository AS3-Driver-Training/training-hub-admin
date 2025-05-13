
import { useState, useEffect } from "react";
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
import { UserPlus, Building, Link2, Copy, Search, Loader2, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// Define proper TypeScript interfaces for the RPC responses
interface CreateClientResponse {
  client_id: string;
  invitation_id: string;
  token: string;
}

interface AddUserToClientResponse {
  status: string;
  message: string;
  invitation_id?: string;
  token?: string;
}

interface Client {
  id: string;
  name: string;
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
  const [clientCommandOpen, setClientCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingEmail, setIsSearchingEmail] = useState(false);
  const [isSearchingManual, setIsSearchingManual] = useState(false);
  const [existingClientSelected, setExistingClientSelected] = useState(false);
  
  // Common client search functionality
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, name')
          .order('name');

        if (error) throw error;
        
        return data || [];
      } catch (error: any) {
        console.error("Error fetching clients:", error);
        return [];
      }
    },
  });

  // Get selected client for display
  const selectedClient = clients?.find(client => client.id === selectedClientId);

  // Search clients by name (for email tab)
  const filteredClientsEmail = clients?.filter(client => 
    client.name.toLowerCase().includes(emailFormData.clientName.toLowerCase())
  ) || [];

  // Search clients by name (for manual tab)
  const filteredClientsManual = clients?.filter(client => 
    client.name.toLowerCase().includes(manualFormData.clientName.toLowerCase())
  ) || [];

  // Search clients for shareable link tab
  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handler for selecting an existing client in email tab
  const handleSelectClientEmail = (clientId: string, clientName: string) => {
    setEmailFormData(prev => ({
      ...prev,
      clientName: clientName
    }));
    setSelectedClientId(clientId);
    setExistingClientSelected(true);
    setIsSearchingEmail(false);
  };

  // Handler for selecting an existing client in manual tab
  const handleSelectClientManual = (clientId: string, clientName: string) => {
    setManualFormData(prev => ({
      ...prev,
      clientName: clientName
    }));
    setSelectedClientId(clientId);
    setExistingClientSelected(true);
    setIsSearchingManual(false);
  };

  // Handler for email invitation submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If we're adding a user to an existing client
      if (existingClientSelected && selectedClientId) {
        const { data: responseData, error } = await supabase.rpc('add_user_to_client', {
          p_client_id: selectedClientId,
          p_email: emailFormData.email,
          p_role: 'client_admin'
        });

        if (error) throw error;

        // Type assertion with unknown first to satisfy TypeScript
        const data = responseData as unknown as AddUserToClientResponse;

        // If it's an invited user, send invitation email
        if (data.status === 'invited') {
          const emailResponse = await supabase.functions.invoke('send-invitation', {
            body: {
              clientName: emailFormData.clientName,
              email: emailFormData.email,
              token: data.token,
            },
          });

          if (emailResponse.error) throw emailResponse.error;
        }

        toast.success(data.status === 'invited' 
          ? "Invitation sent successfully!" 
          : "User added to client successfully!");
      } 
      // Create new client and generate invitation
      else {
        const { data: responseData, error } = await supabase.rpc('create_client_with_invitation', {
          client_name: emailFormData.clientName,
          contact_email: emailFormData.email,
        });

        if (error) throw error;

        // Type assertion with unknown first to satisfy TypeScript
        const response = responseData as unknown as CreateClientResponse;

        // Send invitation email
        const emailResponse = await supabase.functions.invoke('send-invitation', {
          body: {
            clientName: emailFormData.clientName,
            email: emailFormData.email,
            token: response.token,
          },
        });

        if (emailResponse.error) throw new Error("Failed to send invitation email");
        
        toast.success("Client invited successfully!");
      }
      
      setOpen(false);
      setEmailFormData({ clientName: "", email: "" });
      setExistingClientSelected(false);
      setSelectedClientId("");
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
      // If we're updating an existing client
      if (existingClientSelected && selectedClientId) {
        const { error } = await supabase
          .from('clients')
          .update({
            address: manualFormData.address,
            city: manualFormData.city,
            state: manualFormData.state,
            zip_code: manualFormData.zipCode,
            phone: manualFormData.phone,
            contact_email: manualFormData.contactEmail,
          })
          .eq('id', selectedClientId);

        if (error) throw error;

        toast.success("Client updated successfully!");
      } 
      // Create a new client
      else {
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
      }
      
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
      setExistingClientSelected(false);
      setSelectedClientId("");
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast.error(error.message || "Failed to create client");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when dialog is closed
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEmailFormData({ clientName: "", email: "" });
      setManualFormData({
        clientName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        contactEmail: "",
      });
      setShareableLink("");
      setSelectedClientId("");
      setExistingClientSelected(false);
      setSearchQuery("");
    }
    setOpen(open);
  };

  // Handler for generating shareable link
  const handleGenerateShareableLink = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    setIsLoading(true);

    try {
      const { data: responseData, error } = await supabase.rpc('create_client_shareable_invitation', {
        client_id: selectedClientId,
      });

      if (error) throw error;

      // Type assertion with unknown first to satisfy TypeScript
      const response = responseData as unknown as CreateClientResponse;
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

  // Handle tab change and reset form state
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setExistingClientSelected(false);
    setSelectedClientId("");
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
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

        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
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
                  <div className="relative">
                    <Input
                      id="clientName"
                      value={emailFormData.clientName}
                      onChange={(e) => {
                        setEmailFormData((prev) => ({
                          ...prev,
                          clientName: e.target.value,
                        }));
                        setIsSearchingEmail(e.target.value.length > 0);
                        setExistingClientSelected(false);
                      }}
                      placeholder="Acme Corp"
                      required
                      className={cn(
                        isSearchingEmail && filteredClientsEmail.length > 0 
                          ? "rounded-b-none border-b-0" 
                          : ""
                      )}
                    />
                    {isSearchingEmail && filteredClientsEmail.length > 0 && (
                      <div className="absolute z-10 w-full border border-t-0 rounded-b-md bg-background max-h-48 overflow-y-auto">
                        <ul className="py-1">
                          {filteredClientsEmail.map(client => (
                            <li 
                              key={client.id} 
                              className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                              onClick={() => handleSelectClientEmail(client.id, client.name)}
                            >
                              <Building className="mr-2 h-4 w-4" />
                              {client.name}
                            </li>
                          ))}
                          <li 
                            className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center text-muted-foreground border-t"
                            onClick={() => {
                              setIsSearchingEmail(false);
                              setExistingClientSelected(false);
                              setSelectedClientId("");
                            }}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create new client "{emailFormData.clientName}"
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  {existingClientSelected && (
                    <p className="text-sm text-blue-500">
                      Adding user to existing client: {emailFormData.clientName}
                    </p>
                  )}
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
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {existingClientSelected ? "Adding..." : "Sending..."}
                    </>
                  ) : (
                    existingClientSelected ? "Add to Existing Client" : "Send Invitation"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="manualClientName">Organization Name</Label>
                  <div className="relative">
                    <Input
                      id="manualClientName"
                      value={manualFormData.clientName}
                      onChange={(e) => {
                        setManualFormData((prev) => ({
                          ...prev,
                          clientName: e.target.value,
                        }));
                        setIsSearchingManual(e.target.value.length > 0);
                        setExistingClientSelected(false);
                      }}
                      placeholder="Acme Corp"
                      required
                      className={cn(
                        isSearchingManual && filteredClientsManual.length > 0 
                          ? "rounded-b-none border-b-0" 
                          : ""
                      )}
                    />
                    {isSearchingManual && filteredClientsManual.length > 0 && (
                      <div className="absolute z-10 w-full border border-t-0 rounded-b-md bg-background max-h-48 overflow-y-auto">
                        <ul className="py-1">
                          {filteredClientsManual.map(client => (
                            <li 
                              key={client.id} 
                              className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                              onClick={() => handleSelectClientManual(client.id, client.name)}
                            >
                              <Building className="mr-2 h-4 w-4" />
                              {client.name}
                            </li>
                          ))}
                          <li 
                            className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center text-muted-foreground border-t"
                            onClick={() => {
                              setIsSearchingManual(false);
                              setExistingClientSelected(false);
                              setSelectedClientId("");
                            }}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create new client "{manualFormData.clientName}"
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  {existingClientSelected && (
                    <p className="text-sm text-blue-500">
                      Updating existing client: {manualFormData.clientName}
                    </p>
                  )}
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
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {existingClientSelected ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    existingClientSelected ? "Update Client" : "Create Client"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="link">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="selectClient">Select Client</Label>
                <Popover open={clientCommandOpen} onOpenChange={setClientCommandOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      role="combobox" 
                      aria-expanded={clientCommandOpen}
                      className="justify-between w-full"
                    >
                      {selectedClient ? selectedClient.name : "Search for a client..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[300px]">
                    <Command>
                      <CommandInput 
                        placeholder="Search clients..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>No clients found</CommandEmpty>
                        <CommandGroup>
                          {clientsLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                          ) : (
                            filteredClients.map((client) => (
                              <CommandItem
                                key={client.id}
                                value={client.name}
                                onSelect={() => {
                                  setSelectedClientId(client.id);
                                  setClientCommandOpen(false);
                                }}
                              >
                                <Building className="mr-2 h-4 w-4" />
                                {client.name}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">
                  Search and select a client to generate a shareable invitation link
                </p>
              </div>
              
              <Button 
                type="button" 
                onClick={handleGenerateShareableLink} 
                disabled={isLoading || !selectedClientId}
                className="mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Generate Shareable Link
                  </>
                )}
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
