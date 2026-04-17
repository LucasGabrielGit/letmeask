import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter } from "lucide-react";

export type SortOption = "recent" | "top" | "most-answered";
export type FilterOption = "all" | "unanswered" | "answered" | "highlighted";

interface QuestionFiltersProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterBy?: FilterOption;
  onFilterChange?: (filter: FilterOption) => void;
  showFilters?: boolean;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Recentes" },
  { value: "top", label: "Mais votadas" },
  { value: "most-answered", label: "Mais respondidas" },
];

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "unanswered", label: "Não respondidas" },
  { value: "answered", label: "Respondidas" },
  { value: "highlighted", label: "Destacadas" },
];

export const QuestionFilters = ({
  sortBy,
  onSortChange,
  filterBy = "all",
  onFilterChange,
  showFilters = false,
}: QuestionFiltersProps) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Ordenação */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5" />
          Ordenar por
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={sortBy === opt.value ? "default" : "outline"}
              className="h-7 text-xs cursor-pointer rounded-full px-3"
              onClick={() => onSortChange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filtros (apenas admin) */}
      {showFilters && onFilterChange && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Filtrar
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={filterBy === opt.value ? "secondary" : "ghost"}
                className="h-7 text-xs cursor-pointer rounded-full px-3"
                onClick={() => onFilterChange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
