import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";

export function TanstackQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 1000 * 5 * 60,
          staleTime: 1000 * 5 * 60,
        },
      },
    })
  );

  const [isClient, setIsClient] = useState(false);
  const [persister, setPersister] = useState<any>(null);

  useEffect(() => {
    // This runs only in the browser
    const syncPersister = createSyncStoragePersister({
      storage: window.localStorage,
    });
    setPersister(syncPersister);
    setIsClient(true);
  }, []);

  if (!isClient || !persister) {
    // During SSR or before persister is ready, render children without persistence
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
