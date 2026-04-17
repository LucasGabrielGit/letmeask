import logoLight from "@/assets/logo-light.svg";
import logo from "@/assets/logo.svg";
import { AnswerSection } from "@/components/AnswerSection";
import { BadgeTitle } from "@/components/BadgeTitle";
import { Question } from "@/components/Question";
import { RoomCode } from "@/components/RoomCode";
import { SettingsDropdown } from "@/components/SettingsDropdown";
import { ToggleSwitch } from "@/components/toggle-switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/context/ThemeContext";
import { useRoom } from "@/hooks/useRoom";
import { database } from "@/services/firebase";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ref, remove, update } from "firebase/database";
import {
  CheckCircle2,
  Loader2,
  LogOut,
  MessageSquare,
  Trash,
  Users,
} from "lucide-react";
import { Fragment } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/_layout/admin-room/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { questions, title, loading } = useRoom(id);
  const { theme } = useTheme();

  const logoSource = theme === "dark" ? logoLight : logo;
  const navigate = useNavigate();

  const handleCloseRoom = async () => {
    const roomRef = ref(database, `rooms/${id}`);

    const updatedRoom = {
      endedAt: new Date(),
    };

    await update(roomRef, updatedRoom)
      .then(() => {
        toast.success("Sala encerrada com sucesso!");
        navigate({ to: "/home" });
      })
      .catch(() => {
        toast.error("Erro ao encerrar sala!");
      });
  };

  const handleHighlightQuestion = async (questionId: string) => {
    const questionRef = ref(database, `rooms/${id}/questions/${questionId}`);
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const updatedQuestion = {
        isHighlighted: !question.isHighlighted,
      };
      await update(questionRef, updatedQuestion);
    }
  };

  const handleCheckQuestionAsAnswered = async (questionId: string) => {
    const questionRef = ref(database, `rooms/${id}/questions/${questionId}`);
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const updatedQuestion = {
        isAnswered: !question.isAnswered,
      };
      await update(questionRef, updatedQuestion);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const questionRef = ref(database, `rooms/${id}/questions/${questionId}`);
    await remove(questionRef);
  };

  const handleMarkBestAnswer = async (
    questionId: string,
    answerId: string,
    isBestAnswer: boolean,
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    // Remove a marca de todas as respostas da pergunta primeiro
    const updates: Record<string, boolean> = {};
    for (const answer of question.answers) {
      updates[
        `rooms/${id}/questions/${questionId}/answers/${answer.id}/isBestAnswer`
      ] = false;
    }
    // Se não estava marcada, marca a atual (comportamento exclusivo)
    if (!isBestAnswer) {
      updates[
        `rooms/${id}/questions/${questionId}/answers/${answerId}/isBestAnswer`
      ] = true;
    }

    await update(ref(database), updates);
  };

  const options = [
    <DropdownMenuItem>
      <Users />
      Participantes
    </DropdownMenuItem>,
    <DropdownMenuSeparator />,
    <DropdownMenuItem variant={"destructive"} onClick={handleCloseRoom}>
      <LogOut />
      Encerrar sala
    </DropdownMenuItem>,
  ];

  return (
    <Fragment>
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

        <Separator className="my-4" />

        {loading ? (
          <Loading />
        ) : (
          <div className="flex flex-col gap-4 justify-center">
            {questions.map((q) => (
              <Question key={q.id} question={q}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {q.likesCount > 0 && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {q.likesCount} curtida(s)
                      </span>
                    )}
                    <Button
                      variant={"outline"}
                      size={"icon-lg"}
                      className={`cursor-pointer group/like ${q.isAnswered ? "text-white" : "text-muted-foreground"} ${q.isAnswered ? "bg-green-500" : ""} flex items-center gap-1`}
                      onClick={() => handleCheckQuestionAsAnswered?.(q.id)}
                    >
                      <CheckCircle2
                        className={`group-hover/like:text-green-500`}
                      />
                    </Button>
                  </div>
                  <Button
                    variant={"outline"}
                    size={"icon-lg"}
                    className="cursor-pointer group/like"
                    onClick={() => handleHighlightQuestion?.(q.id)}
                  >
                    <MessageSquare
                      className={`group-hover/like:text-blue-500 ${q.likeId ? "text-blue-500" : "text-muted-foreground"}`}
                    />
                  </Button>

                  <Dialog modal>
                    <DialogTrigger asChild>
                      <Button
                        variant={"outline"}
                        size={"icon-lg"}
                        className="cursor-pointer group/like"
                      >
                        <Trash
                          className={`group-hover/like:text-red-500 ${q.likeId ? "text-red-500" : "text-muted-foreground"}`}
                        />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="p-8">
                      <DialogHeader>
                        <div className="flex flex-col items-center">
                          <Trash className="text-red-500 mb-6 w-12 h-12" />
                          <DialogTitle className="font-bold text-2xl">
                            Excluir pergunta
                          </DialogTitle>
                          <DialogDescription className="text-lg text-center">
                            Tem certeza que você deseja excluir esta pergunta?
                          </DialogDescription>
                        </div>
                      </DialogHeader>
                      <div className="flex justify-center items-center gap-2">
                        <DialogClose asChild>
                          <Button
                            variant="secondary"
                            size={"lg"}
                            className="p-6"
                          >
                            Cancelar
                          </Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          size={"lg"}
                          onClick={() => handleDeleteQuestion?.(q.id)}
                          className="p-6"
                        >
                          Sim, excluir
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <AnswerSection
                  answers={q.answers}
                  questionId={q.id}
                  isAnswered={q.isAnswered}
                  isAdmin
                  isAuthenticated
                  onMarkBestAnswer={handleMarkBestAnswer}
                />
              </Question>
            ))}
          </div>
        )}
      </main>
    </Fragment>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="animate-spin w-12" />
    </div>
  );
}
