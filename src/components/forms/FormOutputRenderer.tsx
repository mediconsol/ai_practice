import { Button } from "@/components/ui/button";
import { Copy, Download, Printer, FileText } from "lucide-react";
import { toast } from "sonner";

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
        ) : format === "markdown" ? (
          <div className="p-6 prose prose-sm max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        ) : (
          <pre className="p-6 whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}
