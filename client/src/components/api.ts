async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Determine the base URL for API calls
const getBaseUrl = () => {
  // Use production API URL for deployed app, localhost for development
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Use the current origin (Vite dev server with proxy)
      return window.location.origin;
    }
    // Use the same domain for production API
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:5001';
};

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
  }
): Promise<any> {
  // If url starts with /, prepend the base URL
  const fullUrl = url.startsWith('/') ? `${getBaseUrl()}${url}` : url;
  
  const res = await fetch(fullUrl, {
    method: options?.method || "GET",
    headers: {
      ...options?.headers,
    },
    body: options?.body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}
