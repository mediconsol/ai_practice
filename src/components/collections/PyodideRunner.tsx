import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Loader2 } from 'lucide-react';
import { loadPyodide } from 'pyodide';
import type { PyodideInterface } from 'pyodide';

interface PyodideRunnerProps {
  code: string;
}

export function PyodideRunner({ code }: PyodideRunnerProps) {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Pyodide 초기화
  useEffect(() => {
    const initPyodide = async () => {
      try {
        setIsLoading(true);
        setOutput(['🐍 Python 환경을 로딩하는 중입니다...']);

        const pyodideInstance = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/',
        });

        // stdout/stderr 리디렉션 설정
        pyodideInstance.setStdout({
          batched: (text) => {
            setOutput((prev) => [...prev, text]);
          },
        });

        pyodideInstance.setStderr({
          batched: (text) => {
            setOutput((prev) => [...prev, `❌ ${text}`]);
          },
        });

        setPyodide(pyodideInstance);
        setOutput(['✅ Python 환경이 준비되었습니다. 실행 버튼을 클릭하세요.']);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Pyodide:', err);
        setError('Python 환경 로딩 실패');
        setIsLoading(false);
      }
    };

    initPyodide();
  }, []);

  // 출력이 업데이트될 때마다 스크롤을 아래로
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const runCode = async () => {
    if (!pyodide || !code.trim()) return;

    try {
      setIsRunning(true);
      setError(null);
      setOutput(['▶️ 코드 실행 중...\n']);

      // Python 코드 실행
      const result = await pyodide.runPythonAsync(code);

      // 결과가 있으면 출력
      if (result !== undefined && result !== null) {
        setOutput((prev) => [...prev, `\n📤 결과: ${result}`]);
      }

      setOutput((prev) => [...prev, '\n✅ 실행 완료']);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setOutput((prev) => [...prev, `\n❌ 에러: ${errorMessage}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setOutput(['']);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 컨트롤 버튼 */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
        <Button
          size="sm"
          onClick={runCode}
          disabled={isLoading || isRunning || !code.trim()}
          className="gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              실행 중...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              실행
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={clearOutput}
          disabled={isLoading || isRunning}
          className="gap-2"
        >
          <Square className="w-4 h-4" />
          출력 지우기
        </Button>
        {isLoading && (
          <span className="text-sm text-muted-foreground ml-2">
            Python 환경 로딩 중...
          </span>
        )}
      </div>

      {/* 출력 영역 */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-slate-950 text-slate-100">
        {output.length === 0 ? (
          <div className="text-slate-400">
            출력 결과가 여기에 표시됩니다.
          </div>
        ) : (
          <div className="space-y-1">
            {output.map((line, index) => (
              <div
                key={index}
                className={
                  line.startsWith('❌')
                    ? 'text-red-400'
                    : line.startsWith('✅')
                    ? 'text-green-400'
                    : line.startsWith('📤')
                    ? 'text-blue-400'
                    : 'text-slate-100'
                }
              >
                {line}
              </div>
            ))}
            <div ref={outputEndRef} />
          </div>
        )}
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="p-3 border-t border-border bg-destructive/10">
          <p className="text-sm text-destructive font-medium">❌ 에러 발생</p>
          <pre className="text-xs text-destructive/80 mt-1 overflow-auto">
            {error}
          </pre>
        </div>
      )}

      {/* 사용 가능한 라이브러리 안내 */}
      <div className="p-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        💡 사용 가능한 라이브러리: NumPy, Pandas, Matplotlib, SciPy 등 (micropip으로 추가 설치 가능)
      </div>
    </div>
  );
}
