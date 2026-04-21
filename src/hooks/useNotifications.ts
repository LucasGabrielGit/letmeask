import { database } from "@/services/firebase";
import { onValue, ref, push, set, update, get } from "firebase/database";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type NotificationType = {
  id: string;
  type: "like" | "answer" | "new_question";
  content: string;
  roomId: string;
  read: boolean;
  createdAt: number;
};

export const pushNotification = async (
  userId: string,
  notification: Omit<NotificationType, "id">,
) => {
  try {
    const notifRef = ref(database, `notifications/${userId}`);
    const newNotifRef = push(notifRef);
    await set(newNotifRef, notification);
  } catch (error) {
    console.error(
      "Erro ao enviar notificação (Verifique as regras do Firebase Database):",
      error,
    );
  }
};

export const markAsRead = async (userId: string, notificationId: string) => {
  const notifRef = ref(database, `notifications/${userId}/${notificationId}`);
  await update(notifRef, { read: true });
};

export const markAllAsRead = async (userId: string) => {
  const notifRef = ref(database, `notifications/${userId}`);
  const snapshot = await get(notifRef);

  const notifications = snapshot.val();

  if (!notifications) return;

  Object.keys(notifications).forEach((key) => {
    update(ref(database, `notifications/${userId}/${key}`), { read: true });
  });
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isInitialLoad = useRef(true);
  const previousUnreadCount = useRef(0);

  useEffect(() => {
    if (!user) return;

    const notifRef = ref(database, `notifications/${user.id}`);
    onValue(notifRef, (snapshot) => {
      const data = snapshot.val() || {};
      const parsed = Object.entries(data).map(([key, value]: any) => ({
        id: key,
        ...value,
      })) as NotificationType[];

      // Sort by newest first
      parsed.sort((a, b) => b.createdAt - a.createdAt);

      const unread = parsed.filter((n) => !n.read);

      if (
        !isInitialLoad.current &&
        unread.length > previousUnreadCount.current
      ) {
        const newest = unread[0];
        if (newest) {
          toast(newest.content, { duration: 2000 });
        }
      }

      setNotifications(parsed);
      setUnreadCount(unread.length);
      previousUnreadCount.current = unread.length;
      isInitialLoad.current = false;
    });
  }, [user]);

  return { notifications, unreadCount };
};
