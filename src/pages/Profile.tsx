
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { KeyIcon, PenIcon, Building2Icon, AtSignIcon } from "lucide-react";

const Profile = () => {
  const { userName, userRole, userTitle, isLoading } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_name')
          .eq('id', user.id)
          .single();
        if (profile) {
          setOrganization(profile.organization_name || "AS3 Driver Training");
        }
      }
    };
    loadUserData();
  }, []);

  // Update form data when profile information changes
  useEffect(() => {
    const [firstName = '', lastName = ''] = userName.split(' ');
    setFormData(prev => ({
      ...prev,
      firstName,
      lastName,
      title: userTitle || ''
    }));
  }, [userName, userTitle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          title: formData.title,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;
      
      toast.success('Password updated successfully');
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-pulse text-muted-foreground">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-2xl py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Profile Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account settings and change your password
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">Personal Information</h2>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <PenIcon className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input
                    value={userRole}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSaving}>
                  Save changes
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-1 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">First Name</Label>
                  <p className="text-sm mt-1">{formData.firstName || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Name</Label>
                  <p className="text-sm mt-1">{formData.lastName || '-'}</p>
                </div>
              </div>
              <div className="grid gap-1 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <p className="text-sm mt-1">{formData.title || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <p className="text-sm mt-1 capitalize">{userRole}</p>
                </div>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2Icon className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-lg font-medium">Organization</h2>
            </div>
            <div className="pl-6">
              <p className="text-sm">{organization}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AtSignIcon className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-lg font-medium">Email Address</h2>
            </div>
            <div className="pl-6">
              <p className="text-sm">{userEmail}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-lg font-medium">Password</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg mx-auto">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSaving} className="w-full">
                Update password
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
