
import { supabase } from './client';

export async function createBucketIfNotExists() {
  try {
    // First check if we can access the bucket
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const clientAssetsBucket = buckets?.find(b => b.name === 'client-assets');
    
    if (!clientAssetsBucket) {
      console.log('Client assets bucket not found, attempting to create...');
      const { error: createError } = await supabase.storage.createBucket('client-assets', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        fileSizeLimit: 2097152, // 2MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
      
      console.log('Client assets bucket created successfully');
    } else {
      console.log('Client assets bucket already exists');
    }
  } catch (error) {
    console.error('Unexpected error in createBucketIfNotExists:', error);
  }
}

// Initialize the storage system
createBucketIfNotExists();
