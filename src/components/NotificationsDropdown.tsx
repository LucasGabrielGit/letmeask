import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  useNotifications,
  markAsRead,
  markAllAsRead,
} from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function NotificationsDropdown() {
  const { notifications, unreadCount } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleNotificationClick = async (
    notificationId: string,
    roomId: string,
  ) => {
    await markAsRead(user.id, notificationId);
    navigate({ to: "/app/room/$id", params: { id: roomId } });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(user.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer hover:bg-transparent"
        >
          <Bell className="w-6 h-6 text-slate-700 dark:text-zinc-300" />
          {unreadCount > 0 && (
            <span className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#222222]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h4 className="px-4 py-3 text-sm font-semibold">Notificações</h4>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="cursor-pointer"
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Marcar todas como lidas</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.slice(0, 30).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex flex-col items-start p-4 cursor-pointer gap-1 border-b last:border-b-0 ${n.read ? "opacity-60" : "bg-slate-50 dark:bg-white/5"}`}
              onClick={() => handleNotificationClick(n.id, n.roomId)}
            >
              <div className="flex items-center gap-2">
                {!n.read && (
                  <div className="w-2 h-2 shrink-0 bg-blue-500 rounded-full" />
                )}
                <p className="text-sm font-medium">{n.content}</p>
              </div>
              <span className="text-xs text-muted-foreground ml-4">
                {new Date(n.createdAt).toLocaleDateString()}{" "}
                {new Date(n.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Sem notificações no momento.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
