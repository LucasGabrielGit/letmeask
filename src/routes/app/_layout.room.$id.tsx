import logoLight from "@/assets/logo-light.svg";
import logo from "@/assets/logo.svg";
import { AnswerSection } from "@/components/AnswerSection";
import { BadgeTitle } from "@/components/BadgeTitle";
import { EmptyQuestions } from "@/components/EmptyQuestions";
import { Question } from "@/components/Question";
import { ParticipantsList } from "@/components/ParticipantsList";
import { QuestionFilters, type SortOption } from "@/components/QuestionFilters";
import { RoomCode } from "@/components/RoomCode";
import { SettingsDropdown } from "@/components/SettingsDropdown";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { ToggleSwitch } from "@/components/toggle-switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { usePresence } from "@/hooks/usePresence";
import { useRoom } from "@/hooks/useRoom";
import { pushNotification } from "@/hooks/useNotifications";
import { database } from "@/services/firebase";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { onValue, push, ref, remove, set } from "firebase/database";
import {
  Loader2,
  LogOut,
  MessageSquareMore,
  SmilePlus,
  ThumbsUp,
  Users,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export const Route = createFileRoute("/app/_layout/room/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const [newQuestion, setNewQuestion] = useState("");
  const { id } = useParams({ from: "/app/_layout/room/$id" });
  const { user, isAuthenticated, signInWithGoogle } = useAuth();

  const {
    questions,
    title,
    loading: isRoomLoading,
    authorId: roomAuthorId,
  } = useRoom(id);
  const [loading, setLoading] = useState(false);
  const [openAnswerId, setOpenAnswerId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showParticipants, setShowParticipants] = useState(false);
  const navigate = useNavigate();

  const { participants } = usePresence(id);

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

  const handleSendQuestion = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setLoading(true);

    if (newQuestion.trim() === "") {
      toast.info("Digite uma pergunta.");
      setLoading(false);
      return;
    }

    if (!user) {
      toast.info("Você precisa estar logado para fazer uma pergunta.");
      setLoading(false);
      return;
    }

    const questionsRef = ref(database, `rooms/${id}/questions`);

    const question = {
      content: newQuestion,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      isHighlighted: false,
      isAnswered: false,
    };

    const newQuestionRef = push(questionsRef, question);

    await set(newQuestionRef, question);

    if (roomAuthorId && roomAuthorId !== user.id) {
      await pushNotification(roomAuthorId, {
        type: "new_question",
        content: `${user.name} fez uma nova pergunta: "${newQuestion.substring(0, 20)}..."`,
        roomId: id,
        read: false,
        createdAt: Date.now(),
      });
    }

    setLoading(false);
    setNewQuestion("");
  };

  const handleReactToQuestion = async (
    questionId: string,
    emoji: string,
    existingLikeId: string | undefined,
    existingReactionType: string | undefined,
  ) => {
    if (!isAuthenticated) {
      toast.info("Você precisa estar logado para reagir a uma pergunta.");
      return;
    }
    const targetQ = questions.find((q) => q.id === questionId);

    if (existingLikeId) {
      if (existingReactionType === emoji) {
        const questionLikeRef = ref(
          database,
          `rooms/${id}/questions/${questionId}/likes/${existingLikeId}`,
        );
        await remove(questionLikeRef);
      } else {
        const questionLikeRef = ref(
          database,
          `rooms/${id}/questions/${questionId}/likes/${existingLikeId}`,
        );
        await set(questionLikeRef, { authorId: user?.id, type: emoji });
      }
    } else {
      const questionLikeRef = ref(
        database,
        `rooms/${id}/questions/${questionId}/likes`,
      );
      await push(questionLikeRef, {
        authorId: user?.id,
        type: emoji,
      });

      if (targetQ && targetQ.author.id && targetQ.author.id !== user?.id) {
        await pushNotification(targetQ.author.id, {
          type: "like",
          content: `${user?.name} reagiu com ${emoji} à sua pergunta "${targetQ.content.substring(0, 20)}..."`,
          roomId: id,
          read: false,
          createdAt: Date.now(),
        });
      }
    }
  };

  const handleSendAnswer = async (
    questionId: string,
    content: string,
    replyToId?: string,
  ) => {
    if (!user) return;

    const answersRef = ref(
      database,
      `rooms/${id}/questions/${questionId}/answers`,
    );

    const answer = {
      content,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      createdAt: Date.now(),
      isBestAnswer: false,
      replyToId: replyToId || null,
    };

    const newAnswerRef = push(answersRef, answer);
    await set(newAnswerRef, answer);

    const targetQ = questions.find((q) => q.id === questionId);
    if (targetQ && targetQ.author.id && targetQ.author.id !== user.id) {
      await pushNotification(targetQ.author.id, {
        type: "answer",
        content: `${user.name} respondeu sua pergunta: "${targetQ.content.substring(0, 20)}..."`,
        roomId: id,
        read: false,
        createdAt: Date.now(),
      });
    }
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
    <DropdownMenuItem onClick={() => setShowParticipants(true)}>
      <Users />
      Participantes
    </DropdownMenuItem>,
    <DropdownMenuSeparator />,
    <DropdownMenuItem
      variant={"destructive"}
      onClick={() => {
        navigate({ to: "/home" });
      }}
    >
      <LogOut />
      Sair da sala
    </DropdownMenuItem>,
  ];

  return (
    <>
      <ParticipantsList
        open={showParticipants}
        onOpenChange={setShowParticipants}
        participants={participants}
      />
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
              <NotificationsDropdown />
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
              <Button disabled={loading || !user || !newQuestion.trim()}>
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
              <QuestionFilters sortBy={sortBy} onSortChange={setSortBy} />
              {[...questions]
                .sort((a, b) => {
                  if (sortBy === "top") return b.likesCount - a.likesCount;
                  if (sortBy === "most-answered")
                    return b.answers.length - a.answers.length;
                  return 0;
                })
                .map((q) => {
                  return (
                    <Question key={q.id} question={q}>
                      <div className="flex flex-col mt-4">
                        {/* Top Line: Stats */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground pb-3 border-b border-border">
                          <div className="flex items-center gap-1.5">
                            {Object.keys(q.reactionsCount).length > 0 && (
                              <div className="flex -space-x-1.5 items-center">
                                {Object.entries(q.reactionsCount).map(
                                  ([emoji], index) => (
                                    <div
                                      key={emoji}
                                      className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-[#222222]"
                                      style={{ zIndex: 10 - index }}
                                    >
                                      <span className="text-[14px]">
                                        {emoji}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                            {Object.values(q.reactionsCount).reduce(
                              (a, b) => a + b,
                              0,
                            ) > 0 && (
                              <span>
                                {Object.values(q.reactionsCount).reduce(
                                  (a, b) => a + b,
                                  0,
                                )}
                              </span>
                            )}
                          </div>

                          {/* Answer Count */}
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() =>
                              setOpenAnswerId(
                                openAnswerId === q.id ? null : q.id,
                              )
                            }
                          >
                            {q.answers.length}{" "}
                            {q.answers.length === 1
                              ? "comentário"
                              : "comentários"}
                          </span>
                        </div>

                        {/* Bottom Line: Actions */}
                        <div className="flex items-center pt-2 gap-2">
                          {!q.isAnswered && (
                            <HoverCard openDelay={200} closeDelay={200}>
                              <HoverCardTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className={`flex-1 sm:flex-none h-10 px-4 rounded-md font-semibold text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${q.userReactionType ? "text-[#835afd] dark:text-[#835afd]" : ""}`}
                                  onClick={() =>
                                    handleReactToQuestion(
                                      q.id,
                                      q.userReactionType || "👍",
                                      q.likeId,
                                      q.userReactionType,
                                    )
                                  }
                                >
                                  {q.userReactionType ? (
                                    <span className="flex gap-2 items-center text-base">
                                      <span className="text-xl mb-0.5">
                                        {q.userReactionType}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="flex gap-2 items-center">
                                      <ThumbsUp className="w-4 h-4 mb-0.5" />{" "}
                                      Curtir
                                    </span>
                                  )}
                                </Button>
                              </HoverCardTrigger>
                              <HoverCardContent
                                side="top"
                                align="start"
                                className="w-auto flex gap-1 p-2 bg-white dark:bg-slate-900 rounded-[28px] shadow-lg border-muted"
                              >
                                {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-2xl hover:scale-125 hover:-translate-y-2 origin-bottom transition-all duration-200 cursor-pointer"
                                    onClick={() =>
                                      handleReactToQuestion(
                                        q.id,
                                        emoji,
                                        q.likeId,
                                        q.userReactionType,
                                      )
                                    }
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </HoverCardContent>
                            </HoverCard>
                          )}

                          <Button
                            variant="ghost"
                            className="flex-1 sm:flex-none h-10 px-4 rounded-md font-semibold text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 flex gap-2 items-center cursor-pointer"
                            onClick={() =>
                              setOpenAnswerId(
                                openAnswerId === q.id ? null : q.id,
                              )
                            }
                          >
                            <MessageSquareMore className="w-4 h-4" /> Comentar
                          </Button>
                        </div>
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
    </>
  );
}
