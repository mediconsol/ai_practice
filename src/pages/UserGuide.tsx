import { BookOpen, Sparkles, MessageSquare, ClipboardList, FileText, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function UserGuide() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">사용자 매뉴얼</h1>
            <p className="text-muted-foreground">메디콘솔 AI 프랙티스 완벽 가이드</p>
          </div>
        </div>
      </div>

      {/* 서비스 소개 */}
      <section className="space-y-4 animate-fade-in bg-card rounded-xl border border-border p-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          서비스 소개
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          메디콘솔 AI 프랙티스는 의료 전문가가 자신의 업무에 맞는 AI 프로그램을 직접 만들고 실행할 수 있는 플랫폼입니다.
          프롬프트를 자산화하고, 다양한 AI 프로그램을 통해 업무를 자동화하세요.
        </p>
      </section>

      {/* 3가지 프로그램 타입 */}
      <section className="space-y-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">프로그램 타입</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat */}
          <div className="bg-gradient-to-br from-primary/10 to-info/10 border border-primary/20 rounded-xl p-5">
            <MessageSquare className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">Chat 대화형</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AI와 자유로운 대화를 통해 실시간으로 아티팩트를 생성합니다.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 시스템 프롬프트 설정 가능</li>
              <li>• 실시간 아티팩트 생성</li>
              <li>• 대화 히스토리 관리</li>
            </ul>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-success/10 to-primary/10 border border-success/20 rounded-xl p-5">
            <ClipboardList className="w-8 h-8 text-success mb-3" />
            <h3 className="font-semibold text-lg mb-2">Form 폼 기반</h3>
            <p className="text-sm text-muted-foreground mb-4">
              구조화된 입력 필드를 통해 일관된 결과를 생성합니다.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• AI 자동 폼 생성</li>
              <li>• 구조화된 입력/출력</li>
              <li>• 정해진 포맷 유지</li>
            </ul>
          </div>

          {/* Template */}
          <div className="bg-gradient-to-br from-warning/10 to-primary/10 border border-warning/20 rounded-xl p-5">
            <FileText className="w-8 h-8 text-warning mb-3" />
            <h3 className="font-semibold text-lg mb-2">Template 템플릿</h3>
            <p className="text-sm text-muted-foreground mb-4">
              미리 만든 템플릿을 선택하고 AI가 커스터마이징합니다.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 템플릿 선택</li>
              <li>• AI 수정 도우미</li>
              <li>• 빠른 문서 생성</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 핵심 워크플로우 */}
      <section className="space-y-4 animate-fade-in bg-card rounded-xl border border-border p-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          핵심 워크플로우
        </h2>
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">프롬프트 작업실에서 AI 실행</h3>
              <p className="text-muted-foreground mb-2">
                프롬프트 작업실에서 프롬프트를 작성하고 실행하여 원하는 결과를 얻습니다.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/ai-execute")}>
                프롬프트 작업실 바로가기 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">내 프롬프트에 저장</h3>
              <p className="text-muted-foreground mb-2">
                좋은 결과를 얻었다면 프롬프트를 저장하여 재사용합니다.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/prompts")}>
                내 프롬프트 바로가기 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">프로그램으로 만들기</h3>
              <p className="text-muted-foreground mb-2">
                내 프롬프트나 실행 히스토리에서 "프로그램으로 만들기"를 클릭합니다.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
                <li><strong>프롬프트로 만들기</strong>: Chat 대화형 프로그램 생성</li>
                <li><strong>결과로 폼 생성</strong>: AI가 결과를 분석하여 Form 프로그램 자동 생성</li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">프로그램 실행 & 공유</h3>
              <p className="text-muted-foreground mb-2">
                생성된 프로그램을 실행하고, 공개 설정을 통해 다른 사용자와 공유합니다.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/programs")}>
                AI도구 제작실 바로가기 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI소스 수집함 */}
      <section className="space-y-4 animate-fade-in bg-gradient-to-br from-info/5 to-primary/5 border border-info/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-info" />
          AI소스 수집함 (NEW!)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          ChatGPT, Claude, Gemini 등 AI 도구가 생성한 HTML/React/Python 프로그램과 Claude Artifact를
          한곳에서 실행하고 보관할 수 있습니다.
        </p>
        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h3 className="font-semibold">지원하는 형식</h3>
          <ul className="text-sm space-y-2 text-muted-foreground ml-4 list-disc">
            <li>
              <strong>HTML</strong>: AI가 생성한 HTML 코드를 즉시 실행 (가장 안정적, 권장)
            </li>
            <li>
              <strong>Claude Artifact</strong>: Claude에서 생성한 아티팩트를 임베딩하여 보관
            </li>
            <li>
              <strong>React</strong>: 간단한 UI 컴포넌트 실행 (제한적)
            </li>
            <li>
              <strong>Python</strong>: 데이터 분석 스크립트 실행 (Pyodide, 제한적)
            </li>
          </ul>
        </div>
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <h3 className="font-semibold mb-2 text-primary">핵심 기능</h3>
          <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
            <li>2분할 에디터: 코드 입력 + 실시간 미리보기</li>
            <li>샌드박스 환경: 안전하게 격리된 실행 환경</li>
            <li>클라우드 저장: Supabase Storage에 안전하게 보관</li>
            <li>공유 기능: 다른 의료 전문가와 유용한 도구 공유</li>
          </ul>
        </div>
        <Button variant="outline" onClick={() => navigate("/program-collections")}>
          AI소스 수집함 바로가기 <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </section>

      {/* AI Form Generator 활용법 */}
      <section className="space-y-4 animate-fade-in bg-gradient-to-br from-success/5 to-primary/5 border border-success/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-success" />
          AI 폼 생성기 활용법
        </h2>
        <div className="space-y-3">
          <p className="text-muted-foreground">
            Form 타입 프로그램을 만들 때, AI가 자동으로 입력 필드를 생성해줍니다.
          </p>
          <div className="bg-card rounded-lg p-4 border border-border">
            <h3 className="font-semibold mb-2">💡 작성 팁</h3>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
              <li>필요한 입력 필드명을 구체적으로 나열하세요</li>
              <li>필드 타입을 명시하면 더 정확합니다 (텍스트, 숫자, 날짜, 드롭다운 등)</li>
              <li>필수 입력 여부를 알려주세요</li>
              <li>선택 항목(드롭다운)의 경우 옵션을 나열하세요</li>
            </ul>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <h3 className="font-semibold mb-2 text-primary">예시</h3>
            <p className="text-sm font-mono bg-card p-3 rounded border border-border">
              "환자 예약 폼. 필수: 이름(텍스트), 전화번호, 예약날짜. 선택: 증상(긴 텍스트), 진료과(내과/외과/소아과 중 선택)"
            </p>
          </div>
        </div>
      </section>

      {/* 프로젝트 관리 */}
      <section className="space-y-4 animate-fade-in bg-card rounded-xl border border-border p-6">
        <h2 className="text-2xl font-bold text-foreground">프로젝트 관리</h2>
        <p className="text-muted-foreground">
          관련된 프롬프트들을 프로젝트로 묶어서 관리할 수 있습니다.
        </p>
        <ul className="space-y-2 text-muted-foreground ml-4 list-disc">
          <li>프로젝트 생성 후 프롬프트 추가</li>
          <li>프로젝트 단위로 프롬프트 조회 및 관리</li>
          <li>팀 단위 협업 시 유용</li>
        </ul>
        <Button variant="outline" onClick={() => navigate("/projects")}>
          내 프로젝트 바로가기 <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </section>

      {/* 실행 히스토리 */}
      <section className="space-y-4 animate-fade-in bg-card rounded-xl border border-border p-6">
        <h2 className="text-2xl font-bold text-foreground">실행 히스토리</h2>
        <p className="text-muted-foreground">
          모든 AI 실행 기록이 자동으로 저장됩니다. 이전 결과를 다시 확인하고 재사용할 수 있습니다.
        </p>
        <ul className="space-y-2 text-muted-foreground ml-4 list-disc">
          <li>프롬프트와 결과가 함께 저장</li>
          <li>실행 시간, AI Provider 정보 포함</li>
          <li>히스토리에서 바로 프로그램 생성 가능</li>
        </ul>
        <Button variant="outline" onClick={() => navigate("/history")}>
          실행 히스토리 바로가기 <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </section>

      {/* Tips & Best Practices */}
      <section className="space-y-4 animate-fade-in bg-gradient-to-br from-warning/5 to-primary/5 border border-warning/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-foreground">💡 Tips & Best Practices</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. 좋은 프롬프트 작성법</h3>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
              <li>명확하고 구체적으로 작성하세요</li>
              <li>원하는 출력 형식을 지정하세요</li>
              <li>예시를 포함하면 더 정확합니다</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. 공유 전 체크사항</h3>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
              <li><strong>프로그램/컬렉션 공유 시</strong>: 개인정보나 민감한 정보가 포함되지 않았는지 확인</li>
              <li><strong>AI소스 수집함 공유 시</strong>: HTML/Python/React 소스 코드에 환자 정보가 없는지 확인</li>
              <li>제목과 설명을 명확히 작성</li>
              <li>카테고리를 정확히 설정</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">3. 효율적인 활용법</h3>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
              <li>자주 사용하는 프롬프트는 프로그램으로 저장</li>
              <li>프로젝트 단위로 관련 프롬프트 관리</li>
              <li>실행 히스토리를 주기적으로 확인하여 재사용</li>
              <li>외부 AI 도구가 생성한 유용한 HTML 소스코드는 AI소스 수집함에 저장</li>
              <li>공유 컬렉션 탭에서 다른 사용자의 유용한 도구 발견</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 문의 */}
      <section className="space-y-4 animate-fade-in bg-card rounded-xl border border-border p-6">
        <h2 className="text-2xl font-bold text-foreground">문의하기</h2>
        <p className="text-muted-foreground">
          서비스 이용 중 문의사항이 있으시면 아래로 연락주세요.
        </p>
        <div className="space-y-2 text-sm">
          <p><strong>운영사:</strong> 메디콘솔</p>
          <p><strong>웹사이트:</strong> <a href="https://mediconsol.co.kr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mediconsol.co.kr</a></p>
          <p><strong>이메일:</strong> <a href="mailto:admin@mediconsol.com" className="text-primary hover:underline">admin@mediconsol.com</a></p>
        </div>
      </section>
    </div>
  );
}
