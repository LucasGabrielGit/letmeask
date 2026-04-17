import type { AnswerType } from "@/hooks/useRoom";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  Star,
  ThumbsUp,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface AnswerSectionProps {
  answers: AnswerType[];
  questionId: string;
  isAnswered: boolean;
  isAdmin?: boolean;
  currentUserName?: string;
  currentUserAvatar?: string;
  isAuthenticated: boolean;
  onSendAnswer?: (questionId: string, content: string) => Promise<void>;
  onMarkBestAnswer?: (
    questionId: string,
    answerId: string,
    current: boolean,
  ) => Promise<void>;
  onLikeAnswer?: (
    questionId: string,
    answerId: string,
    likeId: string | undefined,
  ) => Promise<void>;
  onSignIn?: () => void;
}

export const AnswerSection = ({
  answers,
  questionId,
  isAnswered,
  isAdmin = false,
  currentUserName,
  currentUserAvatar,
  isAuthenticated,
  onSendAnswer,
  onMarkBestAnswer,
  onLikeAnswer,
  onSignIn,
}: AnswerSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!replyText.trim() || !onSendAnswer) return;
    setSending(true);
    await onSendAnswer(questionId, replyText.trim());
    setReplyText("");
    setSending(false);
    setIsOpen(true);
  };

  const totalAnswers = answers.length;

  return (
    <div className="mt-3 border-t border-border pt-3">
      {/* Toggle */}
      {totalAnswers > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {isOpen ? (
            <>
              Ocultar respostas
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Ver {totalAnswers} {totalAnswers === 1 ? "resposta" : "respostas"}
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}

      {isOpen && totalAnswers > 0 && (
        <div className="flex flex-col gap-3 mb-3 animate-in fade-in-15 slide-in-from-top-20 duration-200">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`flex gap-3 rounded-lg p-3 text-sm transition-colors ${
                answer.isBestAnswer
                  ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700"
                  : "bg-muted/40"
              }`}
            >
              <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                <AvatarImage
                  src={answer.author.avatar}
                  alt={answer.author.name}
                />
                <AvatarFallback className="text-xs">
                  {answer.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-foreground text-xs">
                    {answer.author.name}
                  </span>
                  {answer.isBestAnswer && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5" />
                      Melhor resposta
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 leading-5 whitespace-pre-wrap wrap-break-word flex flex-col gap-2">
                  {answer.content}
                  {isAdmin && answer.likesCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-medium leading-none">
                        {answer.likesCount} curtida(s)
                      </span>
                    </div>
                  )}
                </p>
              </div>

              {!isAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    isAuthenticated
                      ? onLikeAnswer?.(questionId, answer.id, answer.likeId)
                      : onSignIn?.()
                  }
                  className={`shrink-0 self-start mt-0.5 flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                    answer.likeId
                      ? "text-green-500"
                      : "text-muted-foreground hover:text-green-500"
                  }`}
                  title={answer.likeId ? "Descurtir" : "Curtir resposta"}
                >
                  <ThumbsUp
                    className="w-3.5 h-3.5"
                    fill={answer.likeId ? "currentColor" : "none"}
                  />
                  {answer.likesCount > 0 && (
                    <span className="text-[10px] font-medium leading-none">
                      {answer.likesCount}
                    </span>
                  )}
                </button>
              )}

              {isAdmin && onMarkBestAnswer && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={"ghost"}
                      size={"icon-lg"}
                      onClick={() =>
                        onMarkBestAnswer(
                          questionId,
                          answer.id,
                          answer.isBestAnswer,
                        )
                      }
                      className={`shrink-0 self-start mt-0.5 cursor-pointer transition-colors ${
                        answer.isBestAnswer
                          ? "text-amber-500 hover:text-amber-700"
                          : "text-muted-foreground hover:text-amber-500"
                      }`}
                    >
                      <Star
                        className="w-4 h-4"
                        fill={answer.isBestAnswer ? "currentColor" : "none"}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {answer.isBestAnswer
                      ? "Desmarcar como melhor resposta"
                      : "Marcar como melhor resposta"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      )}

      {!isAdmin && (
        <div className="flex flex-col gap-2">
          {isAuthenticated ? (
            <>
              <div className="flex gap-2 items-start">
                <Avatar className="w-7 h-7 shrink-0 mt-1">
                  <AvatarImage src={currentUserAvatar} alt={currentUserName} />
                  <AvatarFallback className="text-xs bg-[#835afd] text-zinc-50">
                    {currentUserName
                      ?.charAt(0)
                      .concat(currentUserName?.charAt(1))}
                  </AvatarFallback>
                </Avatar>
                <Textarea
                  className="resize-none text-sm min-h-16"
                  placeholder={
                    isAnswered
                      ? "Esta pergunta foi respondida pelo admin, mas você ainda pode comentar..."
                      : "Escreva uma resposta..."
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={!replyText.trim() || sending}
                  onClick={handleSend}
                  className="cursor-pointer"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Responder"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              <button
                type="button"
                onClick={onSignIn}
                className="text-[#835afd] hover:underline cursor-pointer font-medium"
              >
                Faça login
              </button>{" "}
              para responder esta pergunta.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
