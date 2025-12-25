import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, Trash2, ExternalLink, Code, Play, MoreVertical, Share2 } from "lucide-react";
import type { Collection } from "@/types/collection";

interface CollectionCardProps {
  collection: Collection;
  onOpen: (collection: Collection) => void;
  onDelete: (id: string) => void;
  onToggleShare?: (id: string, currentShared: boolean) => void;
}

export function CollectionCard({ collection, onOpen, onDelete, onToggleShare }: CollectionCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`"${collection.title}"을(를) 삭제하시겠습니까?`)) {
      onDelete(collection.id);
    }
  };

  const handleToggleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleShare) {
      onToggleShare(collection.id, collection.is_shared);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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

  return (
    <Card className="hover:border-primary/50 transition-all duration-200 group">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {collection.category}
            </Badge>
            {collection.is_shared && (
              <Badge variant="default" className="text-xs bg-success text-success-foreground">
                공유 중
              </Badge>
            )}
          </div>
          {collection.is_favorite && (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          )}
        </div>
        <CardTitle className="text-base group-hover:text-primary transition-colors">
          {collection.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <ModeIcon className="w-3 h-3" />
          {modeLabel}
        </CardDescription>
      </CardHeader>

      {collection.memo && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {collection.memo}
          </p>
        </CardContent>
      )}

      <CardFooter className="flex justify-between items-center border-t pt-4">
        <span className="text-xs text-muted-foreground">
          {formatDate(collection.created_at)}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(collection);
            }}
          >
            <Play className="w-3.5 h-3.5" />
            프로그램 열기
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onToggleShare && (
                <DropdownMenuItem onClick={handleToggleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  {collection.is_shared ? "공유 취소" : "공유하기"}
                </DropdownMenuItem>
              )}
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
      </CardFooter>
    </Card>
  );
}
