
import { ImageIcon } from "lucide-react";

interface BrandingPreviewProps {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export function BrandingPreview({ logoUrl, primaryColor, secondaryColor }: BrandingPreviewProps) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h4 className="font-semibold text-sm text-muted-foreground">Branding Preview</h4>
      <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: secondaryColor + '20' }}>
        {logoUrl ? (
          <img src={logoUrl} alt="Client logo" className="h-12 w-auto object-contain" />
        ) : (
          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="space-y-2">
          <div className="h-4 w-24 rounded" style={{ backgroundColor: primaryColor }} />
          <div className="h-3 w-32 rounded" style={{ backgroundColor: secondaryColor }} />
        </div>
      </div>
    </div>
  );
}
