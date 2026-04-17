import illustration from "@/assets/asset-image.svg";
interface PageTemplateProps {
  children: React.ReactNode;
}

export const PageTemplate = ({ children }: PageTemplateProps) => {
  return (
    <div className="flex min-h-screen items-stretch w-full">
      <aside className="hidden flex-1 md:flex lg:flex flex-col items-center justify-center px-12 lg:px-24 bg-[#835afd] text-white w-full">
        <img
          src={illustration}
          alt="Ilustração simbolizando perguntas e respostas"
          className="max-w-64 mb-8"
        />
        <strong className="font-bold text-4xl leading-tight">
          Toda pergunta tem <br /> uma resposta.
        </strong>
        <p className="text-xl leading-8 mt-4 text-[#f8f8f8] opacity-80">
          Aprenda e compartilhe conhecimento <br /> com outras pessoas
        </p>
      </aside>
      {children}
    </div>
  );
};
