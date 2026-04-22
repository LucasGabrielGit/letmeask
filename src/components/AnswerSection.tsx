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
  onSendAnswer?: (questionId: string, content: string, replyToId?: string) => Promise<void>;
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
  const [replyText, setReplyText] = useState("");
  const [nestedReplyText, setNestedReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSend = async () => {
    if (!replyText.trim() || !onSendAnswer) return;
    setSending(true);
    await onSendAnswer(questionId, replyText.trim());
    setReplyText("");
    setSending(false);
  };

  const topLevelAnswers = answers.filter(a => !a.replyToId);
  const getReplies = (parentId: string) => answers.filter(a => a.replyToId === parentId);

  const renderAnswer = (answer: AnswerType, isChild = false) => {
    const replies = getReplies(answer.id);

    return (
      <div key={answer.id} className={`flex flex-col relative ${isChild ? "ml-6 mt-2 before:absolute before:left-[-14px] before:top-[-10px] before:bottom-6 before:border-l-2 before:border-b-2 before:rounded-bl-xl before:border-border before:w-3" : ""}`}>
        <div className={`flex gap-3 rounded-lg p-3 text-sm transition-colors relative z-10 ${
          answer.isBestAnswer
            ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700"
            : "bg-muted/40"
        }`}>
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
                <span className="text-xs font-medium leading-none mt-1">
                  {answer.likesCount} curtida(s)
                </span>
              )}
            </p>

            {!isAdmin && isAuthenticated && (
              <div className="mt-2 flex gap-3">
                <button 
                  type="button" 
                  className="text-xs text-muted-foreground font-semibold hover:text-foreground transition-colors cursor-pointer" 
                  onClick={() => setReplyingTo(replyingTo === answer.id ? null : answer.id)}
                >
                  Responder
                </button>
              </div>
            )}
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
                  ? "text-[#835afd]"
                  : "text-muted-foreground hover:text-[#835afd]"
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

        {replyingTo === answer.id && isAuthenticated && (
           <div className="ml-6 mt-2 mb-2 flex gap-2 items-start shrink-0 relative z-10">
             <Avatar className="w-6 h-6 mt-1 shrink-0">
               <AvatarImage src={currentUserAvatar} />
               <AvatarFallback className="text-xs bg-[#835afd] text-zinc-50">{currentUserName?.charAt(0)}</AvatarFallback>
             </Avatar>
             <div className="flex-1 flex flex-col gap-2">
               <Textarea 
                 className="min-h-12 text-sm py-2 px-3 resize-none bg-background/50" 
                 placeholder={`Respondendo a ${answer.author.name}...`} 
                 value={nestedReplyText} 
                 onChange={e => setNestedReplyText(e.target.value)} 
               />
               <div className="flex justify-end gap-2">
                 <Button variant="ghost" size="sm" onClick={() => { setReplyingTo(null); setNestedReplyText(""); }} className="h-8 cursor-pointer text-xs">Cancelar</Button>
                 <Button size="sm" disabled={!nestedReplyText.trim() || sending} className="h-8 cursor-pointer text-xs" onClick={async () => {
                    if (!onSendAnswer) return;
                    setSending(true);
                    await onSendAnswer(questionId, nestedReplyText.trim(), answer.id);
                    setNestedReplyText("");
                    setReplyingTo(null);
                    setSending(false);
                 }}>{sending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Responder"}</Button>
               </div>
             </div>
           </div>
        )}

        {replies.length > 0 && (
          <div className="flex flex-col">
            {replies.map(r => renderAnswer(r, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      {topLevelAnswers.length > 0 && (
        <div className="flex flex-col gap-3 mb-3 animate-in fade-in-15 slide-in-from-top-20 duration-200">
          {topLevelAnswers.map((answer) => renderAnswer(answer))}
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
