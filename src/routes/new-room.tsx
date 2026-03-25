import { useAuth } from "@/hooks/useAuth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/new-room")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();
  return <div>Hello, {user?.name}!</div>;
}
