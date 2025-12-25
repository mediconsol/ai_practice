import { Button } from "@/components/ui/button";
import { Copy, Download, Printer, FileText } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FormOutputRendererProps {
  output: string;
  title?: string;
  format?: "text" | "html" | "markdown";
}

export function FormOutputRenderer({
  output,
  title = "생성 결과",
  format = "text",
}: FormOutputRendererProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("결과를 복사했습니다");
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("파일을 다운로드했습니다");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("팝업이 차단되었습니다. 팝업을 허용해주세요.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body {
              font-family: 'Noto Sans KR', Arial, sans-serif;
              line-height: 1.6;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${format === "html" ? output : `<pre>${output}</pre>`}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            복사
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            다운로드
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="w-4 h-4" />
            인쇄
          </Button>
        </div>
      </div>

      {/* Output Content */}
      <div className="border border-border rounded-lg bg-card">
        {format === "html" ? (
          <div
            className="p-6 prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: output }}
          />
        ) : (
          <div className="p-6 prose prose-base max-w-none dark:prose-invert prose-slate prose-headings:font-bold prose-headings:text-foreground prose-p:text-card-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:not-italic prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2 prose-ul:list-disc prose-ol:list-decimal prose-li:text-card-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // 코드 블록 커스터마이징
                code({className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                // 표 커스터마이징
                table({children}: any) {
                  return (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full">{children}</table>
                    </div>
                  );
                },
                // 인용구 커스터마이징
                blockquote({children}: any) {
                  return (
                    <blockquote className="border-l-4 pl-4 py-2 my-4">
                      {children}
                    </blockquote>
                  );
                },
              }}
            >
              {output}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
