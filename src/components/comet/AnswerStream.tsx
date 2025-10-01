import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AnswerStreamProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

export function AnswerStream({ content, isStreaming, className }: AnswerStreamProps) {
  if (!content && !isStreaming) {
    return null;
  }

  return (
    <div className={cn('rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6', className)}>
      {content ? (
        <div className="prose dark:prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-brand mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-brand mb-3 mt-6">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-brand mb-2 mt-4">{children}</h3>,
              p: ({ children }) => <p className="mb-4 text-ui-text dark:text-dark-text leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="mb-4 space-y-2 list-disc pl-6">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 space-y-2 list-decimal pl-6">{children}</ol>,
              li: ({ children }) => <li className="text-ui-text dark:text-dark-text">{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:text-brand-warm underline"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="rounded bg-ui-bg dark:bg-dark-bg px-1.5 py-0.5 text-sm text-brand font-mono">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-brand pl-4 italic text-ui-muted dark:text-dark-muted my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-ui-muted dark:text-dark-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">pensando...</span>
        </div>
      )}

      {isStreaming && content && (
        <div className="mt-4 flex items-center gap-2 text-xs text-ui-muted dark:text-dark-muted">
          <div className="h-2 w-2 rounded-full bg-ui-live animate-pulse" />
          <span>gerando resposta</span>
        </div>
      )}
    </div>
  );
}
