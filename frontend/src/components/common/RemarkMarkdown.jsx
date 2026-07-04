import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const KEYWORD_REGEX = /\b(important|key point|note|warning|critical|remember|summary|definition)\b/gi;

function hasMarkdownStructure(text) {
  return (
    /^(\s*[-*+]\s+|\s*\d+\.\s+|#{1,6}\s+|>\s+|```)/m.test(text) ||
    /\|.+\|/.test(text)
  );
}

function normalizeForReadability(text) {
  if (!text) return "";

  let normalized = text.trim();
  normalized = normalized.replace(KEYWORD_REGEX, (match) => `**${match}**`);
  normalized = normalized.replace(
    /(^|\n)(\s*)([A-Za-z][A-Za-z0-9 /_-]{2,40}:)/g,
    (_, p1, p2, p3) => `${p1}${p2}**${p3}**`
  );

  if (hasMarkdownStructure(normalized)) return normalized;

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines.map((line) => `- ${line}`).join("\n");
  }

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length > 1) {
    return sentences.map((sentence) => `- ${sentence}`).join("\n");
  }

  return normalized;
}

function RemarkMarkdown({ content }) {
  if (!content) return null;
  const formattedContent = normalizeForReadability(content);

  return (
    <div className="prose prose-base max-w-none leading-relaxed prose-slate prose-headings:font-semibold prose-headings:mb-3 prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-6 prose-ol:pl-6 prose-li:my-1.5 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 dark:prose-strong:text-amber-300 prose-strong:bg-amber-100 dark:prose-strong:bg-amber-950/45 prose-strong:px-1 prose-strong:rounded prose-code:text-emerald-700 dark:prose-code:text-emerald-300 prose-code:bg-emerald-50 dark:prose-code:bg-emerald-950/45 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-slate-900 prose-pre:text-slate-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match) {
              return (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-xl text-sm"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}

export default RemarkMarkdown;
