import {
  Plus,
  Search,
  Filter,
  Sparkles
} from "lucide-react";
import { ProgramCard } from "@/components/dashboard/ProgramCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePrograms, useDeleteProgram } from "@/hooks/usePrograms";
import { getIcon } from "@/lib/iconMap";
import { CreateProgramDialog } from "@/components/programs/CreateProgramDialog";
import { EditProgramDialog } from "@/components/programs/EditProgramDialog";
import { supabase } from "@/lib/supabase";
import type { ProgramWithPromptCount } from "@/hooks/usePrograms";

type ProgramTypeFilter = 'all' | 'chat' | 'form' | 'template';

export default function Programs() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ProgramTypeFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithPromptCount | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { data: programs = [], isLoading } = usePrograms();
  const deleteProgram = useDeleteProgram();

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const handleProgramStart = useCallback((programId: string) => {
    navigate(`/programs/${programId}/run`);
  }, [navigate]);

  const handleEdit = useCallback((programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      setSelectedProgram(program);
      setEditDialogOpen(true);
    }
  }, [programs]);

  const handleDelete = useCallback((programId: string, title: string) => {
    if (window.confirm(`"${title}" 프로그램을 삭제하시겠습니까?`)) {
      deleteProgram.mutate(programId);
    }
  }, [deleteProgram]);

  // 카테고리 목록 동적 생성 (선택된 타입 기준)
  const categories = useMemo(() => {
    const filteredByType = selectedType === 'all'
      ? programs
      : programs.filter(p => p.program_type === selectedType);
    const uniqueCategories = new Set(filteredByType.map(p => p.category));
    return ["전체", ...Array.from(uniqueCategories).sort()];
  }, [programs, selectedType]);

  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      const matchesType = selectedType === 'all' || program.program_type === selectedType;
      const matchesCategory = selectedCategory === "전체" || program.category === selectedCategory;
      const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           program.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [programs, selectedType, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">프로그램을 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
        <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
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
              의료 업무를 위한 독립적인 AI 애플리케이션입니다. Chat(대화형), Form(폼 기반), Template(템플릿) 타입으로 다양한 업무를 자동화할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Program Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 animate-fade-in border-b border-border">
        <Button
          variant={selectedType === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setSelectedType("all");
            setSelectedCategory("전체");
          }}
          className="shrink-0"
        >
          전체
        </Button>
        <Button
          variant={selectedType === "chat" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setSelectedType("chat");
            setSelectedCategory("전체");
          }}
          className="shrink-0 gap-2"
        >
          💬 Chat 대화형
        </Button>
        <Button
          variant={selectedType === "form" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setSelectedType("form");
            setSelectedCategory("전체");
          }}
          className="shrink-0 gap-2"
        >
          📋 Form 폼 기반
        </Button>
        <Button
          variant={selectedType === "template" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setSelectedType("template");
            setSelectedCategory("전체");
          }}
          className="shrink-0 gap-2"
        >
          📄 Template 템플릿
        </Button>
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
        <span>
          {selectedType === 'all' ? '총' :
           selectedType === 'chat' ? '💬 Chat' :
           selectedType === 'form' ? '📋 Form' : '📄 Template'} {filteredPrograms.length}개
        </span>
        {filteredPrograms.filter(p => p.is_new).length > 0 && (
          <>
            <span>•</span>
            <span>신규 {filteredPrograms.filter(p => p.is_new).length}개</span>
          </>
        )}
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPrograms.map((program, index) => (
          <div
            key={program.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ProgramCard
              id={program.id}
              title={program.title}
              description={program.description || ""}
              icon={getIcon(program.icon || "Sparkles")}
              category={program.category}
              promptCount={program.prompt_count}
              usageCount={program.usage_count || 0}
              gradient={program.gradient}
              isNew={program.is_new || false}
              userId={program.user_id}
              currentUserId={currentUserId || undefined}
              onStart={handleProgramStart}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <p className="text-muted-foreground mb-2">
            {searchQuery
              ? '검색 결과가 없습니다.'
              : selectedType === 'all'
              ? '등록된 프로그램이 없습니다.'
              : `${selectedType === 'chat' ? 'Chat 대화형' : selectedType === 'form' ? 'Form 폼 기반' : 'Template 템플릿'} 프로그램이 없습니다.`
            }
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              새 프로그램 만들기
            </Button>
          )}
        </div>
      )}

      <CreateProgramDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedProgram && (
        <EditProgramDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          program={selectedProgram}
        />
      )}
    </div>
  );
}
