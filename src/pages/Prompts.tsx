import { useState } from "react";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Grid, List, Download, Upload, FolderPlus } from "lucide-react";
import { prompts as allPrompts, promptCategories as categories } from "@/data/prompts";

export default function Prompts() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredPrompts = allPrompts.filter(prompt => {
    const matchesCategory = selectedCategory === "전체" || prompt.category === selectedCategory;
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const favoriteCount = filteredPrompts.filter(p => p.isFavorite).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">프롬프트 자산</h1>
          <p className="text-muted-foreground">
            나만의 프롬프트를 저장하고 관리하세요. 언제든 재사용하고 외부 AI에 적용할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            가져오기
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            내보내기
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            새 프롬프트
          </Button>
        </div>
      </div>

      {/* Asset Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{allPrompts.length}</p>
          <p className="text-sm text-muted-foreground">전체 프롬프트</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-warning">{allPrompts.filter(p => p.isFavorite).length}</p>
          <p className="text-sm text-muted-foreground">즐겨찾기</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-success">{categories.length - 1}</p>
          <p className="text-sm text-muted-foreground">카테고리</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">{allPrompts.reduce((acc, p) => acc + p.usageCount, 0)}</p>
          <p className="text-sm text-muted-foreground">총 실행 횟수</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="프롬프트 검색..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <FolderPlus className="w-4 h-4" />
          </Button>
          <div className="border-l border-border h-6 mx-1" />
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "ghost"} 
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 animate-fade-in">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground animate-fade-in">
        <span>{filteredPrompts.length}개 프롬프트</span>
        <span>•</span>
        <span>즐겨찾기 {favoriteCount}개</span>
      </div>

      {/* Prompts Grid */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        : "space-y-3"
      }>
        {filteredPrompts.map((prompt, index) => (
          <div 
            key={prompt.title}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <PromptCard {...prompt} />
          </div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <p className="text-muted-foreground">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
