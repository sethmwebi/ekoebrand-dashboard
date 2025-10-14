import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { TanstackQueryProvider } from "./providers/tanstack-query-provider";
import { ThemeProvider } from "./providers/theme-provider";

startTransition(() => {
  hydrateRoot(
    document,
    <>
      <TanstackQueryProvider>
        <ThemeProvider>
          <HydratedRouter />
        </ThemeProvider>
      </TanstackQueryProvider>
    </>
  );
});
