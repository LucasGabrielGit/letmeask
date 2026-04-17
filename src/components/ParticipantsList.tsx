import type { PresenceUser } from "@/hooks/usePresence";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Users } from "lucide-react";

interface ParticipantsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: PresenceUser[];
}

export const ParticipantsList = ({
  open,
  onOpenChange,
  participants,
}: ParticipantsListProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4" />
            Participantes na sala
            <span className="ml-auto text-xs font-normal bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {participants.length} online
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-6rem)] pr-1">
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-8">
              Nenhum participante no momento.
            </p>
          ) : (
            participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={p.avatar} alt={p.name} />
                    <AvatarFallback className="text-xs bg-[#835afd] text-zinc-50">
                      {p.name.charAt(0).concat(p.name.charAt(1))}
                    </AvatarFallback>
                  </Avatar>
                  {/* Indicador de online */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
                </div>
                <span className="text-sm font-medium truncate">{p.name}</span>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
