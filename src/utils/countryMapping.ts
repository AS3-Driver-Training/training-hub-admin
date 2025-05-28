
export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
}

// Mapping from database country codes to display information
export const countryMapping: Record<string, CountryInfo> = {
  'US': { code: 'US', name: 'United States', flag: '🇺🇸' },
  'MX': { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  'CA': { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  'GB': { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  'FR': { code: 'FR', name: 'France', flag: '🇫🇷' },
  'DE': { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  'ES': { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  'IT': { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  'AU': { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  'JP': { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  'BR': { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
};

export const getCountryInfo = (countryCode: string | null): CountryInfo | null => {
  if (!countryCode) return null;
  return countryMapping[countryCode.toUpperCase()] || null;
};

export const getCountryName = (countryCode: string | null): string => {
  const info = getCountryInfo(countryCode);
  return info ? info.name : countryCode || 'Unknown';
};

export const getCountryFlag = (countryCode: string | null): string => {
  const info = getCountryInfo(countryCode);
  return info ? info.flag : '🏳️';
};
