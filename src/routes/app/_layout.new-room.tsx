import logo from "@/assets/logo.svg";
import { PageTemplate } from "@/components/PageTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { database } from "@/services/firebase";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  get,
  push,
  ref,
  set,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { Loader2 } from "lucide-react";
import { useCallback, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/_layout/new-room")({
  component: RouteComponent,
});

function RouteComponent() {
  const [newRoom, setNewRoom] = useState<string>("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCreateRoom = useCallback(
    async (event: ChangeEvent) => {
      setLoading(true);
      event.preventDefault();
      if (newRoom.trim() === "") return;

      const roomQuery = query(
        ref(database, "rooms"),
        orderByChild("title"),
        equalTo(newRoom),
      );

      const snapshot = await get(roomQuery);

      if (snapshot.exists()) {
        toast.error("Já existe uma sala com esse nome.");
        setLoading(false);
        return;
      }

      const roomRef = ref(database, "rooms");

      const newRoomRef = push(roomRef);

      await set(newRoomRef, {
        title: newRoom,
        authorId: user?.id,
      })
        .then(() => {
          setLoading(false);
          toast.success("Sala criada com sucesso!");
        })
        .catch(() => {
          toast.error("Erro ao criar sala.");
          setLoading(false);
        });

      navigate({
        to: "/app/admin-room/$id",
        params: {
          id: newRoomRef.key as string,
        },
      });
    },
    [newRoom, user?.id, navigate],
  );

  return (
    <PageTemplate>
      <main className="flex flex-col items-center justify-center px-8 flex-1 w-full">
        <div className="flex flex-col items-center text-center max-w-3xs w-full">
          <div className="text-4xl font-extrabold mb-12 flex flex-row items-center justify-center gap-2">
            <img src={logo} alt="Logo Letmeask" />
          </div>

          <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Nome da sala"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="h-12.5 rounded-lg px-4 bg-white border border-[#a8a8b3] outline-none focus:border-[#835afd] transition-colors placeholder:text-[#a8a8b3] text-[#29292e]"
            />
            <Button
              type="submit"
              className="h-12.5 bg-[#835afd] text-white flex justify-center items-center cursor-pointer border-0 transition-colors hover:bg-[#835afd]/90 disabled:opacity-50"
              disabled={newRoom.trim() === ""}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                "Criar sala"
              )}
            </Button>
          </form>

          <span className="text-xs text-[#737380] mt-2">
            <Link to="/home" className="underline text-[#835afd]">
              Clique aqui
            </Link>{" "}
            para entrar em uma sala já existente.
          </span>
        </div>
      </main>
    </PageTemplate>
  );
}
