import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PreviewPane } from './PreviewPane';
import { Loader2 } from 'lucide-react';
import type { Collection, CollectionWithContent } from '@/types/collection';

interface CollectionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection | null;
  onLoadCollection: (id: string) => Promise<CollectionWithContent | null>;
}

export function CollectionViewDialog({
  open,
  onOpenChange,
  collection,
  onLoadCollection,
}: CollectionViewDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [collectionData, setCollectionData] = useState<CollectionWithContent | null>(null);

  useEffect(() => {
    if (open && collection) {
      const loadData = async () => {
        setIsLoading(true);
        const data = await onLoadCollection(collection.id);
        setCollectionData(data);
        setIsLoading(false);
      };
      loadData();
    } else {
      setCollectionData(null);
    }
  }, [open, collection, onLoadCollection]);

  if (!collection) return null;

  const getSourceCode = () => {
    if (!collectionData) return '';
    if (collectionData.preview_mode === 'artifact') {
      return collectionData.artifact_url || '';
    }
    return collectionData.sourceCode || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-lg">
            {collection.title}
          </DialogTitle>
          {collection.memo && (
            <p className="text-sm text-muted-foreground mt-1">
              {collection.memo}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
              {collection.category}
            </span>
            <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
              {collection.preview_mode === 'html' ? 'HTML' :
               collection.preview_mode === 'react' ? 'React' :
               collection.preview_mode === 'python' ? 'Python' :
               'Claude Artifact'}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">프로그램을 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <PreviewPane
              sourceCode={getSourceCode()}
              previewMode={collectionData?.preview_mode || 'none'}
              artifactUrl={collectionData?.artifact_url || undefined}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
