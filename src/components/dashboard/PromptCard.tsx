import { Copy, Play, Star, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  title: string;
  category: string;
  content: string;
  isFavorite?: boolean;
  usageCount: number;
}

export function PromptCard({
  title,
  category,
  content,
  isFavorite = false,
  usageCount,
}: PromptCardProps) {
  return (
    <div className="group bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full">
            {category}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Star className={cn(
              "w-4 h-4",
              isFavorite ? "fill-warning text-warning" : "text-muted-foreground"
            )} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 font-mono bg-muted/50 p-3 rounded-lg">
        {content}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {usageCount}회 사용됨
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            복사
          </Button>
          <Button size="sm" className="h-8">
            <Play className="w-3.5 h-3.5 mr-1.5" />
            실행
          </Button>
        </div>
      </div>
    </div>
  );
}
