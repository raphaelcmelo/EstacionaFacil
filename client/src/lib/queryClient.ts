import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Função para redirecionar para a página de login
const redirectToLogin = () => {
  localStorage.removeItem("accessToken");
  window.dispatchEvent(new CustomEvent("unauthorized"));
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Se for erro de autenticação (401), redireciona para login
    if (res.status === 401) {
      redirectToLogin();
    }
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  p0?: { headers: { Authorization: string } }
): Promise<any> {
  const accessToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  console.log("API Request:", {
    method,
    url,
    data,
    headers,
  });

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const accessToken = localStorage.getItem("accessToken");
    const headers: Record<string, string> = {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers,
    });

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      redirectToLogin();
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error("Mutation error:", error);
      },
      onSuccess: (data) => {
        console.log("Mutation success:", data);
      },
    },
  },
});
