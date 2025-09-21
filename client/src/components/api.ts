async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Determine the base URL for API calls
const getBaseUrl = () => {
  // Always use localhost for API calls since production API isn't set up yet
  return 'http://localhost:5000';
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
