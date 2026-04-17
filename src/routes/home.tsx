import googleIcon from "@/assets/google-icon.svg";
import logo from "@/assets/logo.svg";
import { PageTemplate } from "@/components/PageTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { database } from "@/services/firebase";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { onValue, ref } from "firebase/database";
import { Loader2, LogIn } from "lucide-react";
import { useCallback, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, signInWithGoogle, isAuthenticated } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleCreateRoom = useCallback(async () => {
    if (!user) {
      await signInWithGoogle();
    }

    navigate({
      to: "/app/new-room",
      replace: true,
    });
  }, [user, signInWithGoogle]);

  const handleJoinRoom = useCallback(
    async (e: ChangeEvent) => {
      e.preventDefault();

      try {
        setLoading(true);
        if (roomCode.trim() === "") return;

        const roomRef = ref(database, `rooms/${roomCode}`);

        onValue(
          roomRef,
          (snapshot) => {
            const data = snapshot.val();

            if (!data) {
              toast.error("Sala não encontrada.");
              setLoading(false);
              return;
            }

            if (data.endedAt) {
              toast.error("Sala encerrada.");
              setLoading(false);
              return;
            }

            navigate({
              to: "/app/room/$id",
              params: { id: roomCode },
              replace: true,
            });
          },
          { onlyOnce: true },
        );
      } catch (error) {
        setLoading(false);
        console.log(`Ocorreu um erro ao tentar entrar na sala: ${error}`);
      }
    },
    [roomCode],
  );

  return (
    <PageTemplate>
      <main className="flex flex-col items-center justify-center px-8 flex-2 w-full">
        <div className="flex flex-col items-stretch text-center max-w-3xs w-full">
          <div className="text-4xl font-extrabold mb-12 flex flex-row items-center justify-center gap-2">
            <img src={logo} alt="Logo Letmeask" />
          </div>

          <Button
            onClick={handleCreateRoom}
            className="h-12.5 rounded-lg font-medium bg-[#ea4335] text-white flex justify-center items-center cursor-pointer border-0 transition-colors hover:bg-[#ea4335]/90 mb-8 gap-2"
          >
            {isAuthenticated ? (
              "Criar nova sala"
            ) : (
              <>
                <img src={googleIcon} alt="Google" className="w-4" />
                Crie sua sala com o Google
              </>
            )}
          </Button>

          <div className="text-sm text-[#a8a8b3] flex items-center before:content-[''] before:flex-1 before:h-px before:bg-[#a8a8b3] before:mr-4 after:content-[''] after:flex-1 after:h-px after:bg-[#a8a8b3] after:ml-4 mb-8">
            ou entre em uma sala
          </div>

          <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Digite o código da sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="h-12.5 rounded-lg px-4 bg-white border border-[#a8a8b3] outline-none focus:border-[#835afd] transition-colors placeholder:text-[#a8a8b3] text-[#29292e]"
            />
            <Button
              type="submit"
              className="h-12.5 bg-[#835afd] text-white flex justify-center items-center cursor-pointer border-0 transition-colors hover:bg-[#835afd]/90 disabled:opacity-50"
              disabled={roomCode.trim() === "" || loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5 mr-2" />
              )}
              Entrar na sala
            </Button>
          </form>
        </div>
      </main>
    </PageTemplate>
  );
}
