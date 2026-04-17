import type { QuestionType } from "@/hooks/useRoom";
import { Badge } from "./ui/badge";

export const BadgeTitle = ({
  title,
  questions,
}: {
  title: string;
  questions: QuestionType[];
}) => {
  return (
    <div className="flex items-center leading-6 gap-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {questions.length > 0 && (
        <Badge
          variant={"secondary"}
          className="px-2 py-3 bg-red-500 font-semibold text-white"
        >
          {questions.length} pergunta(s)
        </Badge>
      )}
    </div>
  );
};
