const imageCache = new Map<string, string>();

export const fetchCropImage = async (query: string): Promise<string | null> => {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (imageCache.has(normalizedQuery)) {
    return imageCache.get(normalizedQuery)!;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/images?q=${encodeURIComponent(normalizedQuery)}`);
    if (!response.ok) {
      console.warn(`Failed to fetch image for ${query}`);
      return null;
    }
    
    const data = await response.json();
    if (data.url) {
      imageCache.set(normalizedQuery, data.url);
      return data.url;
    }
  } catch (error) {
    console.error('Error fetching image from backend:', error);
  }
  return null;
};
