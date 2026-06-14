import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: unknown) => {
        const err = error as { response?: { status?: number } };
        if (
          err?.response?.status === 401 ||
          err?.response?.status === 403 ||
          err?.response?.status === 404
        ) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        const message = err?.response?.data?.message || err?.message || 'An error occurred';
        toast.error(message);
      },
    },
  },
});
