// Media upload utility - Uses Cloudinary for storage

export interface UploadResult {
  url: string;
  hash: string;
  fileId?: string;
}

/**
 * Upload a file to Cloudinary via the API route
 * Returns the public URL
 */
export async function uploadToArweave(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }
  
  return result.url;
}

/**
 * Upload a file and return full details including hash
 */
export async function uploadMedia(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }
  
  return {
    url: result.url,
    hash: result.hash,
    fileId: result.fileId,
  };
}
