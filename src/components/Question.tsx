import type { QuestionType } from "@/hooks/useRoom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";

interface QuestionProps {
  question: QuestionType;
  children: React.ReactNode;
}

export const Question = ({ question, children }: QuestionProps) => {
  return (
    <Card
      className={`shadow-md ${question.isHighlighted ? "border-2 border-blue-500" : ""}`}
    >
      <CardContent>
        <div className="flex justify-between flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Avatar>
              <AvatarImage
                src={question.author.avatar}
                alt={question.author.name}
              />
              <AvatarFallback className="text-base text-zinc-50 bg-[#835afd]">
                {question.author.name
                  .charAt(0)
                  .concat(question.author.name.charAt(1))}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground">
              {question.author.name}
            </span>
          </div>
          <p className="leading-6 mb-6 text-foreground text-base">
            {question.content}
          </p>
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
