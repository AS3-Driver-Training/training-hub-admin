
import { ImageIcon, Calendar, GraduationCap, Building } from "lucide-react";
import { PoweredByAS3 } from "@/components/branding/PoweredByAS3";

interface BrandingPreviewProps {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export function BrandingPreview({ logoUrl, primaryColor, secondaryColor }: BrandingPreviewProps) {
  const displayLogo = logoUrl || "https://as3driving.com/wp-content/uploads/2020/07/AS3-Driver-Training-Logo-HiRes.png";
  const hasClientBranding = !!(logoUrl || primaryColor !== '#C10230' || secondaryColor !== '#FF6B35');

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h4 className="font-semibold text-sm text-muted-foreground">Live Application Preview</h4>
      
      {/* Header Preview */}
      <div className="border rounded-lg bg-background">
        <div className="flex h-16 items-center px-4 gap-4 border-b">
          <div className="flex items-center gap-2">
            <img src={displayLogo} alt="Logo preview" className="h-12 w-auto object-contain" />
            {hasClientBranding && logoUrl && (
              <PoweredByAS3 className="ml-2" />
            )}
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <span 
              className="text-xs px-2 py-1 rounded"
              style={{ color: primaryColor }}
            >
              client_admin
            </span>
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor + '20' }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </div>
        </div>
        
        {/* Sidebar Preview */}
        <div className="flex">
          <div className="w-48 bg-muted/20 p-4 space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Menu</div>
            <div className="flex items-center gap-2 p-2 rounded">
              <Calendar 
                className="h-3 w-3" 
                style={{ color: primaryColor }}
              />
              <span className="text-xs">Training Events</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded">
              <GraduationCap 
                className="h-3 w-3" 
                style={{ color: primaryColor }}
              />
              <span className="text-xs">Students</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded">
              <Building 
                className="h-3 w-3" 
                style={{ color: primaryColor }}
              />
              <span className="text-xs">Venues</span>
            </div>
          </div>
          
          {/* Content Preview */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div 
                className="h-3 w-16 rounded"
                style={{ backgroundColor: primaryColor }}
              />
              <div 
                className="h-2 w-24 rounded"
                style={{ backgroundColor: secondaryColor + '60' }}
              />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-32 bg-muted rounded" />
              <div className="h-2 w-24 bg-muted rounded" />
            </div>
            <div 
              className="h-8 w-20 rounded flex items-center justify-center text-xs text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Button
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
