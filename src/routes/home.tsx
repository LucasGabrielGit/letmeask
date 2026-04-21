import googleIcon from "@/assets/google-icon.svg";
import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { database } from "@/services/firebase";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { onValue, ref } from "firebase/database";
import { Loader2, LogIn, Search, Users } from "lucide-react";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

type PublicRoom = {
  id: string;
  title: string;
  authorId: string;
  participantsCount: number;
};

function RouteComponent() {
  const { user, signInWithGoogle, isAuthenticated } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const roomsRef = ref(database, "rooms");
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data)
          .map(([id, val]: [string, any]) => ({
            id,
            title: val.title,
            authorId: val.authorId,
            participantsCount: val.presence
              ? Object.keys(val.presence).length
              : 0,
            endedAt: val.endedAt,
          }))
          .filter((r) => !r.endedAt);
        parsed.sort((a, b) => b.participantsCount - a.participantsCount);
        setPublicRooms(parsed);
      } else {
        setPublicRooms([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateRoom = useCallback(async () => {
    if (!user) {
      sessionStorage.setItem("redirectAfterLogin", "/app/new-room");
      await signInWithGoogle();
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) return; // Prevent navigation here, wait for redirect
    }

    navigate({
      to: "/app/new-room",
      replace: true,
    });
  }, [user, navigate, signInWithGoogle]);

  const handleJoinRoomForm = useCallback(
    async (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleJoinRoom(roomCode);
    },
    [roomCode],
  );

  const handleJoinRoom = async (idToJoin: string) => {
    if (idToJoin.trim() === "") return;

    try {
      setLoading(true);
      const roomRef = ref(database, `rooms/${idToJoin}`);

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
            params: { id: idToJoin },
            replace: true,
          });

          if (user?.name) {
            toast.success(`Bem-vindo à sala, ${user.name}!`);
          }
        },
        { onlyOnce: true },
      );
    } catch (error) {
      setLoading(false);
      console.log(`Ocorreu um erro ao tentar entrar na sala: ${error}`);
    }
  };

  const filteredRooms = publicRooms.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 md:px-8 py-5 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-card shadow-sm z-10 sticky top-0">
        <img src={logo} alt="Letmeask" className="h-8" />

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Caixa de Entrada via Código */}
          <form
            onSubmit={handleJoinRoomForm}
            className="flex gap-2 w-full md:w-auto"
          >
            <Input
              type="text"
              placeholder="Digite o código da sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="bg-background max-w-50"
            />
            <Button
              type="submit"
              disabled={roomCode.trim() === "" || loading}
              variant="outline"
              className="border-[#835afd] text-[#835afd] hover:bg-[#835afd] hover:text-white transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              Entrar
            </Button>
          </form>

          {/* Criação de nova sala */}
          <Button
            onClick={handleCreateRoom}
            className="bg-[#ea4335] hover:bg-[#ea4335]/90 text-white w-full md:w-auto font-medium shadow-sm transition-all shadow-[#ea4335]/20"
          >
            {isAuthenticated ? (
              "Criar nova sala"
            ) : (
              <>
                <img src={googleIcon} alt="Google" className="w-4 mr-2" />
                Crie sala com Google
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Título e Barra de Pesquisa */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Salas Disponíveis
            </h1>
            <p className="text-muted-foreground mt-1">
              Encontre uma comunidade para tirar dúvidas ou debater assuntos.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pelo nome da sala..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 bg-background border-border text-base"
            />
          </div>
        </div>

        {/* Grade de Salas Livres / Scroll automático caso haja muitas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[#835afd]/50 transition-all duration-200 flex flex-col group cursor-pointer"
              onClick={() => handleJoinRoom(room.id)}
            >
              <div className="flex-1">
                <h2 className="text-lg font-bold leading-tight line-clamp-2 w-full group-hover:text-[#835afd] transition-colors">
                  {room.title}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mt-4 text-sm">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 rounded-full font-medium">
                    <Users className="w-3.5 h-3.5" />
                    {room.participantsCount}{" "}
                    {room.participantsCount === 1 ? "ativo" : "ativos"} ao vivo
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <span
                  className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded w-16 truncate"
                  title={room.id}
                >
                  #{room.id.substring(1, 7)}
                </span>

                <Button
                  size="sm"
                  className="bg-[#835afd]/10 text-[#835afd] hover:bg-[#835afd] hover:text-white transition-colors"
                >
                  Participar
                </Button>
              </div>
            </div>
          ))}

          {filteredRooms.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-card border border-dashed border-border rounded-2xl">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Nenhuma sala encontrada
              </h3>
              <p className="text-muted-foreground max-w-md">
                {searchQuery !== ""
                  ? `Não encontramos salas com o termo "${searchQuery}". Deseja tentar outra busca?`
                  : "Ainda não criaram nenhuma sala pública no servidor."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
