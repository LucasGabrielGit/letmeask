import emptyQuestionsImg from "@/assets/messages-empty.svg";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

export const EmptyQuestions = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <img
            src={emptyQuestionsImg}
            alt="Empty Questions"
            className="w-3xs"
          />
        </EmptyMedia>
        <EmptyTitle>Nenhuma pergunta por aqui...</EmptyTitle>
        <EmptyDescription>
          Envie o código da sala para seus amigos e comece a responder
          perguntas!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
