import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface ReactRunnerProps {
  code: string;
}

export function ReactRunner({ code }: ReactRunnerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    if (!code.trim()) {
      setIsLoading(false);
      return;
    }

    const runReactCode = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // import/export 문 제거 (Babel Standalone 환경에서는 불가)
        let cleanedCode = code
          // React import 제거
          .replace(/import\s+React\s*,?\s*\{[^}]*\}\s*from\s+['"]react['"]\s*;?/gi, '')
          .replace(/import\s+React\s+from\s+['"]react['"]\s*;?/gi, '')
          .replace(/import\s+\{[^}]*\}\s*from\s+['"]react['"]\s*;?/gi, '')
          .replace(/import\s+.*\s+from\s+['"]react-dom['"]\s*;?/gi, '')
          // 기타 import 제거
          .replace(/import\s+.*\s+from\s+['""][^'"]+['"]\s*;?/gi, '')
          // export 문 제거
          .replace(/export\s+default\s+/gi, '')
          .replace(/export\s+\{[^}]*\}\s*;?/gi, '')
          .replace(/export\s+/gi, '')
          .trim();

        // 메인 컴포넌트 이름 찾기 (App이 없을 경우 대체)
        const componentMatch = cleanedCode.match(/(?:function|const)\s+([A-Z]\w+)/);
        const mainComponent = componentMatch ? componentMatch[1] : null;

        // App 컴포넌트가 없지만 다른 컴포넌트가 있으면 App으로 alias
        if (mainComponent && !cleanedCode.includes('function App') && !cleanedCode.includes('const App')) {
          cleanedCode += `\n\n// 자동 생성된 App 컴포넌트\nfunction App() { return <${mainComponent} />; }`;
        }

        // JSX를 변환하고 실행할 HTML 생성
        const generatedHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>

  <!-- React & ReactDOM UMD -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <!-- Babel Standalone -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #root {
      width: 100%;
      height: 100%;
    }
    .error-container {
      padding: 20px;
      background-color: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      color: #c33;
    }
    .error-title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .error-message {
      font-family: monospace;
      white-space: pre-wrap;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useCallback, useMemo, useRef } = React;

    // 에러 바운더리 컴포넌트
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        console.error('React Error:', error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return (
            <div className="error-container">
              <div className="error-title">⚠️ 렌더링 에러</div>
              <div className="error-message">{this.state.error.toString()}</div>
            </div>
          );
        }
        return this.props.children;
      }
    }

    // 사용자 코드 실행
    try {
      ${cleanedCode}

      // App 컴포넌트가 정의되어 있으면 렌더링
      if (typeof App !== 'undefined') {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        );
      } else {
        // App 컴포넌트가 없으면 안내 메시지
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
          <div style={{ padding: '20px', color: '#666' }}>
            <p><strong>ℹ️ 안내</strong></p>
            <p>컴포넌트를 찾을 수 없습니다. React 컴포넌트를 정의해주세요.</p>
            <p style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
              💡 React와 Hooks는 이미 로드되어 있습니다. import/export 문 없이 바로 사용하세요!
            </p>
            <pre style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '13px'
            }}>{
\`// ✅ 올바른 예시
function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello React!</h1>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        증가
      </button>
    </div>
  );
}

// ❌ 잘못된 예시
import React from 'react';  // import 불필요
export default App;         // export 불필요\`
            }</pre>
          </div>
        );
      }
    } catch (error) {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        <div className="error-container">
          <div className="error-title">❌ 코드 실행 에러</div>
          <div className="error-message">{error.toString()}</div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
            💡 <strong>팁:</strong> import/export 문은 사용하지 마세요. React와 Hooks는 이미 사용 가능합니다.
          </div>
        </div>
      );
      console.error('Code execution error:', error);
    }
  </script>

  <script>
    // 부모 창에 로딩 완료 알림
    window.addEventListener('load', () => {
      window.parent.postMessage({ type: 'react-loaded' }, '*');
    });

    // 전역 에러 핸들러
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  </script>
</body>
</html>
        `;

        // HTML 컨텐츠 설정
        setHtmlContent(generatedHtml);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    runReactCode();
  }, [code]);

  // iframe에서 메시지 수신
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'react-loaded') {
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-destructive/10 rounded-lg border border-destructive/20">
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="text-destructive font-medium mb-2">React 코드 실행 실패</p>
          <pre className="text-xs text-destructive/80 text-left bg-background/50 p-3 rounded overflow-auto max-w-md">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-white rounded-lg">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10 rounded-lg">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">React 환경 로딩 중...</p>
          </div>
        </div>
      )}
      <iframe
        srcDoc={htmlContent}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-0 rounded-lg"
        title="React Preview"
      />
    </div>
  );
}
