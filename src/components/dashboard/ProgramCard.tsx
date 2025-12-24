import { LucideIcon, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProgramCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  promptCount: number;
  usageCount: number;
  gradient: string;
  isNew?: boolean;
}

export function ProgramCard({
  title,
  description,
  icon: Icon,
  category,
  promptCount,
  usageCount,
  gradient,
  isNew = false,
}: ProgramCardProps) {
  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in">
      {/* Header with gradient */}
      <div className={cn(
        "h-24 relative flex items-end p-4",
        "bg-gradient-to-br",
        gradient
      )}>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isNew && (
            <span className="text-xs font-semibold bg-primary-foreground/90 text-primary px-2 py-0.5 rounded-full">
              NEW
            </span>
          )}
          <span className="text-xs font-medium bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm px-2 py-0.5 rounded-full">
            {category}
          </span>
        </div>
        <Icon className="w-10 h-10 text-primary-foreground drop-shadow-lg" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>프롬프트 {promptCount}개</span>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{usageCount}회 사용</span>
            </div>
          </div>
          
          <Button size="sm" variant="ghost" className="gap-1 group-hover:text-primary">
            시작
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
