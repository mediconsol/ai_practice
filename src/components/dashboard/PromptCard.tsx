import { Copy, Play, Star, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PromptCardProps {
  id: string;
  title: string;
  category: string;
  content: string;
  isFavorite?: boolean;
  usageCount: number;
  onToggleFavorite?: (id: string, currentFavorite: boolean) => void;
  onDelete?: (id: string, title: string) => void;
}

export function PromptCard({
  id,
  title,
  category,
  content,
  isFavorite = false,
  usageCount,
  onToggleFavorite,
  onDelete,
}: PromptCardProps) {
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("프롬프트를 클립보드에 복사했습니다");
  };

  const handleExecute = () => {
    navigate("/ai-execute", { state: { prompt: content } });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id, isFavorite);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id, title);
    }
  };

  return (
    <div className="group bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full">
            {category}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleToggleFavorite}
          >
            <Star className={cn(
              "w-4 h-4 transition-all",
              isFavorite ? "fill-warning text-warning" : "text-muted-foreground hover:text-warning"
            )} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/ai-execute", { state: { prompt: content } })}>
                <Play className="w-4 h-4 mr-2" />
                실행
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                복사
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleFavorite}>
                <Star className="w-4 h-4 mr-2" />
                {isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      <div className="text-xs text-muted-foreground mb-4 font-mono bg-muted/50 p-3 rounded-lg max-h-[120px] overflow-y-auto">
        {content}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {usageCount}회 사용됨
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8" onClick={handleCopy}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            복사
          </Button>
          <Button size="sm" className="h-8" onClick={handleExecute}>
            <Play className="w-3.5 h-3.5 mr-1.5" />
            실행
          </Button>
        </div>
      </div>
    </div>
  );
}
