
import { supabase } from './client';

export async function createBucketIfNotExists() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.name === 'client-assets')) {
    const { error } = await supabase.storage.createBucket('client-assets', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
      fileSizeLimit: 2097152, // 2MB
    });
    if (error) console.error('Error creating bucket:', error);
  }
}

// Call this when the app initializes
createBucketIfNotExists();
