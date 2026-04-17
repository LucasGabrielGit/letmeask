import logoLight from "@/assets/logo-light.svg";
import logo from "@/assets/logo.svg";
import { AnswerSection } from "@/components/AnswerSection";
import { BadgeTitle } from "@/components/BadgeTitle";
import { EmptyQuestions } from "@/components/EmptyQuestions";
import { Question } from "@/components/Question";
import { RoomCode } from "@/components/RoomCode";
import { SettingsDropdown } from "@/components/SettingsDropdown";
import { ToggleSwitch } from "@/components/toggle-switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useRoom } from "@/hooks/useRoom";
import { database } from "@/services/firebase";
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { onValue, push, ref, remove, set } from "firebase/database";
import {
  Loader2,
  LogOut,
  MessageSquareMore,
  ThumbsUp,
  Users,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/_layout/room/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const [newQuestion, setNewQuestion] = useState("");
  const { id } = useParams({ from: "/app/_layout/room/$id" });
  const { user, isAuthenticated, signInWithGoogle, signOut } = useAuth();
  const { questions, title, loading: isRoomLoading } = useRoom(id);
  const [loading, setLoading] = useState(false);
  const [openAnswerId, setOpenAnswerId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { theme } = useTheme();

  const logoSource = theme === "dark" ? logoLight : logo;

  useEffect(() => {
    const roomRef = ref(database, `rooms/${id}`);
    onValue(roomRef, (snapshot) => {
      const room = snapshot.val();
      if (room.endedAt) {
        toast.info("Esta sala foi encerrada!");
        setTimeout(() => {
          navigate({ to: "/home" });
        }, 1500);
      }
    });
  }, [id, navigate]);

  const handleSendQuestion = async (event: ChangeEvent) => {
    event.preventDefault();
    setLoading(true);

    if (newQuestion.trim() === "") {
      toast.info("Digite uma pergunta.");
      return;
    }

    if (!user) {
      toast.info("Você precisa estar logado para fazer uma pergunta.");
      return;
    }

    const questionsRef = ref(database, `rooms/${id}/questions`);

    const question = {
      content: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      isHighlighted: false,
      isAnswered: false,
    };

    const newQuestionRef = push(questionsRef, question);

    await set(newQuestionRef, question);

    setLoading(false);
    setNewQuestion("");
  };

  const handleLikeQuestion = async (
    questionId: string,
    likeId: string | undefined,
  ) => {
    if (!isAuthenticated) {
      toast.info("Você precisa estar logado para curtir uma pergunta.");
      return;
    }
    if (likeId) {
      const questionLikeRef = ref(
        database,
        `rooms/${id}/questions/${questionId}/likes/${likeId}`,
      );
      await remove(questionLikeRef);
    } else {
      const questionLikeRef = ref(
        database,
        `rooms/${id}/questions/${questionId}/likes`,
      );
      await push(questionLikeRef, {
        authorId: user?.id,
      });
    }
  };

  const handleSendAnswer = async (questionId: string, content: string) => {
    if (!user) return;

    const answersRef = ref(
      database,
      `rooms/${id}/questions/${questionId}/answers`,
    );

    const answer = {
      content,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      createdAt: Date.now(),
      isBestAnswer: false,
    };

    const newAnswerRef = push(answersRef, answer);
    await set(newAnswerRef, answer);
  };

  const handleLikeAnswer = async (
    questionId: string,
    answerId: string,
    likeId: string | undefined,
  ) => {
    if (!isAuthenticated) {
      toast.info("Você precisa estar logado para curtir uma resposta.");
      return;
    }
    if (likeId) {
      const likeRef = ref(
        database,
        `rooms/${id}/questions/${questionId}/answers/${answerId}/likes/${likeId}`,
      );
      await remove(likeRef);
    } else {
      const likesRef = ref(
        database,
        `rooms/${id}/questions/${questionId}/answers/${answerId}/likes`,
      );
      await push(likesRef, { authorId: user?.id });
    }
  };

  const options = [
    <DropdownMenuItem>
      <Users />
      Participantes
    </DropdownMenuItem>,
    <DropdownMenuSeparator />,
    <DropdownMenuItem variant={"destructive"} onClick={signOut}>
      <LogOut />
      Sair da sala
    </DropdownMenuItem>,
  ];

  return (
    <div className="w-full h-screen">
      <header className="sticky top-0 z-50 bg-slate-200 backdrop-blur dark:bg-[#222222]/80 supports-backdrop-filter:bg-white/60 shadow-md w-full lg:px-40 md:px-20 sm:px-8 px-6">
        <div className="flex h-16 items-center justify-between sm:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/home">
              <img
                src={logoSource}
                alt="Logo Letmeask"
                className="w-16 sm:w-20"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <RoomCode code={id} />
            <ToggleSwitch />
            <SettingsDropdown children={options} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl lg:px-40 md:px-20 sm:px-8 px-4 mx-auto mt-16">
        <BadgeTitle title={title} questions={questions} />
        <form onSubmit={handleSendQuestion}>
          <Textarea
            className="mt-6 resize-none"
            placeholder="O que você quer perguntar?"
            onChange={(e) => setNewQuestion(e.target.value)}
            value={newQuestion}
          />
          <div className="flex items-center justify-between mt-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-muted-foreground">
                  {user.name}
                </span>
              </div>
            ) : (
              <small>
                Para enviar uma pergunta,
                <Button
                  type="button"
                  variant={"link"}
                  onClick={signInWithGoogle}
                  className="cursor-pointer hover:text-[#835afd] px-0 ml-1"
                >
                  faça seu login
                </Button>
              </small>
            )}
            <Button disabled={!user || !newQuestion.trim()}>
              {loading ? <Loader2 className="animate-spin" /> : "Enviar"}
            </Button>
          </div>
        </form>

        <Separator className="my-4" />

        {isRoomLoading ? (
          <div className="flex items-center justify-center mt-16 text-muted-foreground w-full">
            <Loader2 className="animate-spin w-12 h-12" />
          </div>
        ) : questions.length > 0 ? (
          <div className="flex flex-col gap-4 justify-center">
            {questions.map((q) => {
              return (
                <Question key={q.id} question={q}>
                  <div className="flex gap-2 justify-end">
                    {!q.isAnswered && (
                      <Button
                        variant={"outline"}
                        size={"icon-lg"}
                        className="hover:bg-slate-300 cursor-pointer group/like flex gap-1 items-center justify-center"
                        onClick={() => {
                          handleLikeQuestion?.(q.id, q.likeId);
                        }}
                      >
                        {q.likesCount}
                        <ThumbsUp
                          className={`group-hover/like:text-green-500 ${q.likeId ? "text-green-500" : "text-muted-foreground"} mb-1`}
                        />
                      </Button>
                    )}
                    <Button
                      variant={openAnswerId === q.id ? "default" : "outline"}
                      onClick={() =>
                        setOpenAnswerId(openAnswerId === q.id ? null : q.id)
                      }
                    >
                      <MessageSquareMore />
                      {q.answers.length} respostas
                    </Button>
                  </div>
                  {openAnswerId === q.id && (
                    <AnswerSection
                      answers={q.answers}
                      questionId={q.id}
                      isAnswered={q.isAnswered}
                      isAuthenticated={isAuthenticated}
                      currentUserName={user?.name}
                      currentUserAvatar={user?.avatar}
                      onSendAnswer={handleSendAnswer}
                      onLikeAnswer={handleLikeAnswer}
                      onSignIn={signInWithGoogle}
                    />
                  )}
                </Question>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-16">
            <EmptyQuestions />
          </div>
        )}
      </main>
    </div>
  );
}
