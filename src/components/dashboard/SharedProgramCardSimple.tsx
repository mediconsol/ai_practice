import { memo } from "react";
import { LucideIcon, ArrowRight, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SharedProgramCardSimpleProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  promptCount: number;
  usageCount: number;
  gradient: string;
  onViewMore: () => void;
}

export const SharedProgramCardSimple = memo(function SharedProgramCardSimple({
  title,
  description,
  icon: Icon,
  category,
  promptCount,
  usageCount,
  gradient,
  onViewMore,
}: SharedProgramCardSimpleProps) {
  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30">
      {/* Header with gradient */}
      <div className={cn(
        "h-20 relative flex items-end p-4",
        "bg-gradient-to-br",
        gradient
      )}>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm border-0">
            {category}
          </Badge>
        </div>
        <Icon className="w-8 h-8 text-primary-foreground drop-shadow-lg" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{promptCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{usageCount}회</span>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="gap-1 group-hover:text-primary -mr-2"
            onClick={onViewMore}
          >
            자세히 보기
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
});
