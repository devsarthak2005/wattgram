export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  
  // Extract filename if it contains our image API path (prevent localhost leaking into prod)
  if (imagePath.includes('/api/images/')) {
    const filename = imagePath.split('/api/images/').pop();
    return `${baseUrl}/api/images/${filename}`;
  }

  // If it's a full URL (but not our API), return it directly (e.g., Google avatars, external links)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove leading slash if it exists
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  return `${baseUrl}/api/images/${cleanPath}`;
};
