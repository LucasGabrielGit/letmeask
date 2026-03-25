import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Loader } from "lucide-react";
import { createRoot } from "react-dom/client";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { AuthContextProvider } from "./context/AuthContext.tsx";
import "./index.css";
import { routeTree } from "./routeTree.gen.ts";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPendingComponent: () => <Loader />,
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthContextProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthContextProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
