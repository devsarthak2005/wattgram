export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full absolute URL (http or https)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's just a relative path or filename, prepend the API base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  
  // Remove leading slash if it exists
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // Assuming relative images are stored in /api/images/
  if (cleanPath.startsWith('api/images/')) {
    return `${baseUrl}/${cleanPath}`;
  }
  
  // Otherwise just append to /api/images/
  return `${baseUrl}/api/images/${cleanPath}`;
};
