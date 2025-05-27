
export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
];

export const getCountryByCode = (code: string): Country => {
  return countries.find(country => country.code === code) || 
    { code: code, name: 'Unknown', flag: '🏳️' };
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
