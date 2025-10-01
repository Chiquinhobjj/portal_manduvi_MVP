import { ExternalLink, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

export interface Citation {
  title: string;
  source: string;
  url: string;
  published_at: string;
  excerpt?: string;
}

interface SourcesRailProps {
  citations: Citation[];
  className?: string;
}

export function SourcesRail({ citations, className }: SourcesRailProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <aside className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 px-1">
        <div className="h-1 w-1 rounded-full bg-brand" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ui-muted dark:text-dark-muted">
          fontes ({citations.length})
        </h3>
      </div>

      <div className="space-y-2">
        {citations.map((citation, index) => (
          <CitationCard key={index} citation={citation} index={index + 1} />
        ))}
      </div>
    </aside>
  );
}

function CitationCard({ citation, index }: { citation: Citation; index: number }) {
  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-4 transition-all hover:border-brand hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ui-bg dark:bg-dark-bg text-xs font-bold text-brand">
          {index}
        </span>
        <ExternalLink className="h-3.5 w-3.5 text-ui-muted dark:text-dark-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <h4 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-ui-text dark:text-dark-text group-hover:text-brand">
        {citation.title}
      </h4>

      <div className="flex items-center gap-2 text-xs text-ui-muted dark:text-dark-muted">
        <span className="font-medium">{citation.source}</span>
        <span>•</span>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(citation.published_at)}</span>
        </div>
      </div>

      {citation.excerpt && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ui-muted dark:text-dark-muted">
          {citation.excerpt}
        </p>
      )}
    </a>
  );
}
