import { database } from "@/services/firebase";
import { off, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type AnswerType = {
  id: string;
  content: string;
  author: {
    id?: string;
    name: string;
    avatar: string;
  };
  createdAt: number;
  isBestAnswer: boolean;
  likesCount: number;
  likeId: string | undefined;
  reactionsCount: Record<string, number>;
  userReactionType: string | undefined;
  replyToId?: string;
};

export type FirebaseQuestions = Record<
  string,
  {
    author: {
      id?: string;
      name: string;
      avatar: string;
    };
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
    attachmentBase64?: string;
    likes: Record<
      string,
      {
        authorId: string;
        type?: string;
      }
    >;
    answers: Record<
      string,
      {
        content: string;
        author: { id?: string; name: string; avatar: string };
        createdAt: number;
        isBestAnswer: boolean;
        likes: Record<
          string,
          {
            authorId: string;
            type?: string;
          }
        >;
        replyToId?: string;
      }
    >;
  }
>;

export type QuestionType = {
  id: string;
  author: {
    id?: string;
    name: string;
    avatar: string;
  };
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  attachmentBase64?: string;
  likesCount: number;
  likeId: string | undefined;
  reactionsCount: Record<string, number>;
  userReactionType: string | undefined;
  answers: AnswerType[];
};

export const useRoom = (roomId: string) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [authorId, setAuthorId] = useState("");

  useEffect(() => {
    setLoading(true);
    const roomRef = ref(database, `rooms/${roomId}`);

    onValue(roomRef, (room) => {
      const databaseRoom = room.val();

      const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};

      const parsedQuestions = Object.entries(firebaseQuestions)
        .filter(
          ([, value]) => value && typeof value === "object" && value.author,
        )
        .map(([key, value]) => {
          const parsedAnswers: AnswerType[] = Object.entries(
            value.answers ?? {},
          )
            .map(([answerId, answer]) => {
              const reactionsCount = Object.values(answer.likes ?? {}).reduce(
                (acc, like) => {
                  const t = like.type || "👍";
                  acc[t] = (acc[t] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>,
              );
              const userLikeParams = Object.entries(answer.likes ?? {}).find(
                ([, like]) => like.authorId === user?.id,
              );

              return {
                id: answerId,
                content: answer.content,
                author: answer.author,
                createdAt: answer.createdAt,
                isBestAnswer: answer.isBestAnswer ?? false,
                likesCount: Object.keys(answer.likes ?? {}).length,
                likeId: userLikeParams?.[0],
                reactionsCount,
                userReactionType:
                  userLikeParams?.[1].type ||
                  (userLikeParams ? "👍" : undefined),
                replyToId: answer.replyToId,
              };
            })
            .sort((a, b) => {
              // Melhor resposta sempre no topo, depois por data
              if (a.isBestAnswer !== b.isBestAnswer)
                return a.isBestAnswer ? -1 : 1;
              return a.createdAt - b.createdAt;
            });

          const reactionsCount = Object.values(value.likes ?? {}).reduce(
            (acc, like) => {
              const t = like.type || "👍";
              acc[t] = (acc[t] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );
          const userLikeParams = Object.entries(value.likes ?? {}).find(
            ([, like]) => like.authorId === user?.id,
          );

          return {
            id: key,
            content: value.content,
            author: value.author,
            isAnswered: value.isAnswered,
            isHighlighted: value.isHighlighted,
            attachmentBase64: value.attachmentBase64,
            likesCount: Object.keys(value.likes ?? {}).length,
            likeId: userLikeParams?.[0],
            reactionsCount,
            userReactionType:
              userLikeParams?.[1].type || (userLikeParams ? "👍" : undefined),
            answers: parsedAnswers,
          };
        });
      setTitle(databaseRoom.title);
      setAuthorId(databaseRoom.authorId);
      setQuestions(parsedQuestions);
      setLoading(false);
    });

    return () => {
      off(roomRef);
    };
  }, [roomId, user?.id]);

  return { questions, title, loading, authorId };
};
