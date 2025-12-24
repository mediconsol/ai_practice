import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollectionCard } from "./CollectionCard";
import { COLLECTION_CATEGORIES } from "@/types/collection";
import type { Collection } from "@/types/collection";

interface CollectionListProps {
  collections: Collection[];
  onOpen: (collection: Collection) => void;
  onDelete: (id: string) => void;
}

export function CollectionList({ collections, onOpen, onDelete }: CollectionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("전체");

  // 필터링
  const filteredCollections = collections.filter((collection) => {
    const matchesSearch = collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.memo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "전체" || collection.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 최신순 정렬
  const sortedCollections = [...filteredCollections].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Sparkles className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-2">저장된 컬렉션이 없습니다</h3>
        <p className="text-sm text-muted-foreground mb-6">
          AI 도구에서 생성한 프로그램을 저장하여 나중에 다시 사용하세요
        </p>
        <p className="text-xs text-muted-foreground">
          에디터 탭에서 HTML 코드를 입력하고 저장 버튼을 눌러보세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="제목 또는 메모 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체</SelectItem>
            {COLLECTION_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 결과 카운트 */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {filteredCollections.length === collections.length
            ? `총 ${collections.length}개의 컬렉션`
            : `${filteredCollections.length}개 검색됨 (전체 ${collections.length}개)`}
        </p>
      </div>

      {/* 컬렉션 그리드 */}
      {sortedCollections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">검색 결과가 없습니다</p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            다른 검색어나 필터를 시도해보세요
          </p>
        </div>
      )}
    </div>
  );
}
