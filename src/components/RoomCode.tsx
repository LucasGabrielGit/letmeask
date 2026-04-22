import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type RoomCodeProps = {
  code: string;
};

export const RoomCode = ({ code }: RoomCodeProps) => {
  const handleCopyCode = async () => {
    if (globalThis.navigator.clipboard && globalThis.isSecureContext) {
      try {
        await globalThis.navigator.clipboard.writeText(code);
        toast.success("Código copiado com sucesso!");
      } catch (error) {
        console.error(error);
        toast.error("Erro ao copiar código!");
      }
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={handleCopyCode}
        className="cursor-pointer"
        asChild
      >
        <Button
          variant={"outline"}
          size={"lg"}
          className="border border-[#835afd] min-[376px]:flex sm:flex md:flex lg:flex xl:flex hidden"
        >
          <Copy /> <span className="min-[376px]:hidden">{code}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copiar código da sala</p>
      </TooltipContent>
    </Tooltip>
  );
};
