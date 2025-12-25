import { Eye, Heart, Play, Download, Code, ExternalLink, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  useToggleCollectionLike,
  useCheckCollectionLike,
  useIncrementCollectionViewCount,
} from "@/hooks/useCollections";
import type { Collection } from "@/types/collection";

interface SharedCollectionCardProps {
  collection: Collection;
  onOpen: (collection: Collection) => void;
  onSaveToMyCollections?: (id: string) => void;
}

export function SharedCollectionCard({
  collection,
  onOpen,
  onSaveToMyCollections,
}: SharedCollectionCardProps) {
  const toggleLike = useToggleCollectionLike();
  const { data: isLiked = false } = useCheckCollectionLike(collection.id);
  const incrementViewCount = useIncrementCollectionViewCount();

  const handleOpen = () => {
    incrementViewCount.mutate(collection.id);
    onOpen(collection);
  };

  const handleSaveToMyCollections = () => {
    incrementViewCount.mutate(collection.id);
    if (onSaveToMyCollections) {
      onSaveToMyCollections(collection.id);
    }
  };

  const handleToggleLike = () => {
    toggleLike.mutate(collection.id);
  };

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
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 gap-1 hover:text-destructive transition-colors"
            onClick={handleToggleLike}
          >
            <Heart
              className={cn(
                "w-3 h-3",
                isLiked && "fill-destructive text-destructive"
              )}
            />
            <span>{collection.like_count}</span>
          </Button>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
        {collection.title}
      </h3>

      {/* Preview Mode */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <ModeIcon className="w-3 h-3" />
        {modeLabel}
      </div>

      {/* Memo (if exists) */}
      {collection.memo && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 bg-muted/30 p-2 rounded">
          {collection.memo}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-3 pt-3 border-t border-border/50">
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
        {/* Time & Actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {timeAgo}
          </span>
          <div className="flex items-center gap-2">
          {onSaveToMyCollections && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleSaveToMyCollections}
            >
              <Download className="w-3.5 h-3.5" />
              내 수집함에 저장
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleOpen}
          >
            <Play className="w-3.5 h-3.5" />
            프로그램 열기
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
