import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FolderOpen,
  MoreVertical,
  Calendar,
  FileText,
  Sparkles,
  Trash2,
  Edit,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects, useDeleteProject } from "@/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Database } from "@/lib/supabase";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";

type ProjectStatus = Database['public']['Tables']['projects']['Row']['status'];

interface ProjectCardProps {
  id: string;
  title: string;
  description: string | null;
  prompt_count: number;
  updated_at: string;
  status: ProjectStatus;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

function ProjectCard({ id, title, description, prompt_count, updated_at, status, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="group bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <FolderOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            status === "active" && "bg-success/10 text-success",
            status === "completed" && "bg-primary/10 text-primary",
            status === "archived" && "bg-muted text-muted-foreground"
          )}>
            {status === "active" && "진행 중"}
            {status === "completed" && "완료"}
            {status === "archived" && "보관됨"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                편집
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                복제
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id, title);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h3 className="font-semibold text-card-foreground mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {description}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>프롬프트 {prompt_count}개</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDistanceToNow(new Date(updated_at), { addSuffix: true, locale: ko })}</span>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ProjectStatus | null>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    title: string;
    description: string | null;
    status: ProjectStatus;
  } | null>(null);
  const { data: projects = [], isLoading } = useProjects();
  const deleteProjectMutation = useDeleteProject();

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === "all" || project.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchQuery, filter]);

  const handleEdit = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setSelectedProject({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
      });
      setEditDialogOpen(true);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`"${title}" 프로젝트를 삭제하시겠습니까?`)) {
      deleteProjectMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">내 프로젝트</h1>
          <p className="text-muted-foreground">
            관련 프롬프트를 프로젝트로 묶어 체계적으로 관리하세요
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          새 프로젝트
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{projects.length}</p>
          <p className="text-sm text-muted-foreground">전체 프로젝트</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-success">{projects.filter(p => p.status === "active").length}</p>
          <p className="text-sm text-muted-foreground">진행 중</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">{projects.reduce((acc, p) => acc + p.prompt_count, 0)}</p>
          <p className="text-sm text-muted-foreground">총 프롬프트</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="프로젝트 검색..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            전체
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            진행 중
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            완료
          </Button>
          <Button
            variant={filter === "archived" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("archived")}
          >
            보관됨
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project, index) => (
          <div
            key={project.id}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ProjectCard
              id={project.id}
              title={project.title}
              description={project.description}
              prompt_count={project.prompt_count}
              updated_at={project.updated_at}
              status={project.status}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">프로젝트가 없습니다.</p>
          <Button variant="outline" className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            첫 프로젝트 만들기
          </Button>
        </div>
      )}

      {/* Edit Project Dialog */}
      {selectedProject && (
        <EditProjectDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          project={selectedProject}
        />
      )}
    </div>
  );
}
