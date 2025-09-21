async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Determine the base URL for API calls
const getBaseUrl = () => {
  // In development, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // In production, use the current domain
  return window.location.origin;
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
