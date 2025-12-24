import { memo } from "react";
import { LucideIcon, ArrowRight, Users, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ProgramCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  promptCount: number;
  usageCount: number;
  gradient: string;
  isNew?: boolean;
  userId?: string;
  currentUserId?: string;
  onStart?: (programId: string) => void;
  onEdit?: (programId: string) => void;
  onDelete?: (programId: string, title: string) => void;
}

export const ProgramCard = memo(function ProgramCard({
  id,
  title,
  description,
  icon: Icon,
  category,
  promptCount,
  usageCount,
  gradient,
  isNew = false,
  userId,
  currentUserId,
  onStart,
  onEdit,
  onDelete,
}: ProgramCardProps) {
  const isOwner = userId && currentUserId && userId === currentUserId;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id, title);
    }
  };

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
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground backdrop-blur-sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  수정
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
          
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 group-hover:text-primary"
            onClick={() => onStart?.(id)}
          >
            시작
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
});
