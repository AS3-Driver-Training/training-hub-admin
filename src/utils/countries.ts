export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
];

// Comprehensive mapping from Google Places country names to ISO codes
const countryNameToCodeMap: Record<string, string> = {
  // Primary names
  'United States': 'US',
  'Mexico': 'MX',
  'Canada': 'CA',
  'United Kingdom': 'GB',
  'France': 'FR',
  'Germany': 'DE',
  'Spain': 'ES',
  'Italy': 'IT',
  'Australia': 'AU',
  'Japan': 'JP',
  'Brazil': 'BR',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  
  // Common variations and alternate names
  'USA': 'US',
  'United States of America': 'US',
  'U.S.A.': 'US',
  'U.S.': 'US',
  'Estados Unidos': 'US',
  'México': 'MX',
  'Canadá': 'CA',
  'Reino Unido': 'GB',
  'Francia': 'FR',
  'Alemania': 'DE',
  'España': 'ES',
  'Italia': 'IT',
  'Japón': 'JP',
  'Brasil': 'BR',
  'UK': 'GB',
  'Great Britain': 'GB',
};

export const getCountryByCode = (code: string): Country => {
  return countries.find(country => country.code === code) || 
    { code: code, name: 'Unknown', flag: '🏳️' };
};

export const getCountryCodeByName = (countryName: string): string => {
  if (!countryName) return 'US';
  
  // Try exact match first
  const exactMatch = countryNameToCodeMap[countryName];
  if (exactMatch) return exactMatch;
  
  // Try case-insensitive match
  const lowerName = countryName.toLowerCase();
  for (const [name, code] of Object.entries(countryNameToCodeMap)) {
    if (name.toLowerCase() === lowerName) {
      return code;
    }
  }
  
  // Fallback to US if no match found
  console.warn(`Unknown country name: ${countryName}, defaulting to US`);
  return 'US';
};

export const formatLastActivity = (lastActivity: string | null): string => {
  if (!lastActivity) return 'Never';
  
  const now = new Date();
  const activity = new Date(lastActivity);
  const diffInDays = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

export const getActivityStatus = (lastActivity: string | null): 'active' | 'warning' | 'inactive' => {
  if (!lastActivity) return 'inactive';
  
  const now = new Date();
  const activity = new Date(lastActivity);
  const diffInDays = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays <= 30) return 'active';
  if (diffInDays <= 60) return 'warning';
  return 'inactive';
};
