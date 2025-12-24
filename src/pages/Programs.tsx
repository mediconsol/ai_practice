import {
  Plus,
  Search,
  Filter,
  Sparkles
} from "lucide-react";
import { ProgramCard } from "@/components/dashboard/ProgramCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { programs as allPrograms, categories } from "@/data/programs";

export default function Programs() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrograms = allPrograms.filter(program => {
    const matchesCategory = selectedCategory === "전체" || program.category === selectedCategory;
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">AI 업무 프로그램</h1>
          <p className="text-muted-foreground">
            의료 업무에 바로 적용할 수 있는 AI 프로그램을 선택하거나 직접 만드세요
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          새 프로그램 만들기
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-accent/50 border border-primary/20 rounded-xl p-5 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">AI 프로그램이란?</h3>
            <p className="text-sm text-muted-foreground">
              특정 업무를 자동화하는 프롬프트 세트입니다. 
              프로그램을 선택하면 관련 프롬프트가 자동으로 구성되고, 
              ChatGPT, Claude, Gemini 등 원하는 AI에서 바로 실행할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="프로그램 검색..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
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
        <span>총 {filteredPrograms.length}개 프로그램</span>
        <span>•</span>
        <span>신규 {filteredPrograms.filter(p => p.isNew).length}개</span>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPrograms.map((program, index) => (
          <div 
            key={program.title}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ProgramCard {...program} />
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <p className="text-muted-foreground">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
