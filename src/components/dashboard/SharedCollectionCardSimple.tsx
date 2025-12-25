import { Eye, Heart, ArrowRight, Code, ExternalLink, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Collection } from "@/types/collection";

interface SharedCollectionCardSimpleProps {
  collection: Collection;
  onViewMore: () => void;
}

export function SharedCollectionCardSimple({
  collection,
  onViewMore,
}: SharedCollectionCardSimpleProps) {
  const getModeDisplay = () => {
    switch (collection.preview_mode) {
      case 'html':
        return { icon: Code, label: 'HTML' };
      case 'react':
        return { icon: Code, label: 'React' };
      case 'python':
        return { icon: Code, label: 'Python' };
      case 'artifact':
        return { icon: ExternalLink, label: 'Claude Artifact' };
      default:
        return { icon: Code, label: 'Unknown' };
    }
  };

  const { icon: ModeIcon, label: modeLabel } = getModeDisplay();

  const timeAgo = formatDistanceToNow(new Date(collection.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="group bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {collection.category}
          </Badge>
          <Badge variant="default" className="text-xs bg-success text-success-foreground">
            공유됨
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {collection.view_count}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {collection.like_count}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
        {collection.title}
      </h3>

      {/* Preview Mode */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <ModeIcon className="w-3 h-3" />
        {modeLabel}
      </div>

      {/* Memo (if exists) */}
      {collection.memo && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {collection.memo}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
        {/* Author Info */}
        {(collection as any).author && (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5 border">
              <AvatarFallback className="bg-gradient-to-br from-primary to-info text-white text-[10px] font-semibold">
                {(collection as any).author.full_name?.substring(0, 2).toUpperCase() || <User className="w-3 h-3" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                {(collection as any).author.full_name || '익명'}
              </span>
              {(collection as any).author.hospital && (
                <span className="text-[10px] text-muted-foreground">
                  {(collection as any).author.hospital}{(collection as any).author.department && ` · ${(collection as any).author.department}`}
                </span>
              )}
            </div>
          </div>
        )}
        {/* Time & Action */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewMore}
            className="h-8 text-xs gap-1"
          >
            자세히 보기
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
