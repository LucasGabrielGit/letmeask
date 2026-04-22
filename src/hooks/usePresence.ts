import { database } from "@/services/firebase";
import {
  onDisconnect,
  onValue,
  ref,
  remove,
  serverTimestamp,
  set,
} from "firebase/database";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type PresenceUser = {
  id: string;
  name: string;
  avatar: string;
  joinedAt: number;
};

export const usePresence = (roomId: string) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!user) return;

    const connectedRef = ref(database, ".info/connected");
    const presenceRef = ref(database, `rooms/${roomId}/presence/${user.id}`);

    // Ouve o estado de conexão do Firebase
    const unsubscribe = onValue(connectedRef, async (snapshot) => {
      if (!snapshot.val()) return;

      // Registra remoção automática ao desconectar (server-side)
      await onDisconnect(presenceRef).remove();

      // Escreve a presença do usuário
      await set(presenceRef, {
        name: user.name,
        avatar: user.avatar,
        joinedAt: serverTimestamp(),
      });
    });

    return () => {
      unsubscribe();
      remove(presenceRef);
    };
  }, [roomId, user]);

  useEffect(() => {
    const presenceListRef = ref(database, `rooms/${roomId}/presence`);

    const unsubscribe = onValue(presenceListRef, (snapshot) => {
      const data = snapshot.val() ?? {};
      const list: PresenceUser[] = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as Omit<PresenceUser, "id">),
      }));
      // Ordena por quem entrou primeiro
      list.sort((a, b) => a.joinedAt - b.joinedAt);
      setParticipants(list);
    });

    return () => unsubscribe();
  }, [roomId]);

  return { participants };
};
