import { database } from "@/services/firebase";
import { off, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type AnswerType = {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: number;
  isBestAnswer: boolean;
  likesCount: number;
  likeId: string | undefined;
};

export type FirebaseQuestions = Record<
  string,
  {
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
    likes: Record<
      string,
      {
        authorId: string;
      }
    >;
    answers: Record<
      string,
      {
        content: string;
        author: { name: string; avatar: string };
        createdAt: number;
        isBestAnswer: boolean;
        likes: Record<
          string,
          {
            authorId: string;
          }
        >;
      }
    >;
  }
>;

export type QuestionType = {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  likesCount: number;
  likeId: string | undefined;
  answers: AnswerType[];
};

export const useRoom = (roomId: string) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

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
            .map(([answerId, answer]) => ({
              id: answerId,
              content: answer.content,
              author: answer.author,
              createdAt: answer.createdAt,
              isBestAnswer: answer.isBestAnswer ?? false,
              likesCount: Object.keys(answer.likes ?? {}).length,
              likeId: Object.entries(answer.likes ?? {}).find(
                ([, like]) => like.authorId === user?.id,
              )?.[0],
            }))
            .sort((a, b) => {
              // Melhor resposta sempre no topo, depois por data
              if (a.isBestAnswer !== b.isBestAnswer)
                return a.isBestAnswer ? -1 : 1;
              return a.createdAt - b.createdAt;
            });

          return {
            id: key,
            content: value.content,
            author: value.author,
            isAnswered: value.isAnswered,
            isHighlighted: value.isHighlighted,
            likesCount: Object.keys(value.likes ?? {}).length,
            likeId: Object.entries(value.likes ?? {}).find(
              ([, like]) => like.authorId === user?.id,
            )?.[0],
            answers: parsedAnswers,
          };
        });
      setTitle(databaseRoom.title);
      setQuestions(parsedQuestions);
      setLoading(false);
    });

    return () => {
      off(roomRef);
    };
  }, [roomId, user?.id]);

  return { questions, title, loading };
};
