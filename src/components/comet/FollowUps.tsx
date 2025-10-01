import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FollowUpsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  className?: string;
}

export function FollowUps({ suggestions, onSelect, className }: FollowUpsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ui-muted dark:text-dark-muted">
          perguntas relacionadas
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="group flex items-center gap-2 rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel px-4 py-2.5 text-left text-sm text-ui-text dark:text-dark-text transition-all hover:border-brand hover:bg-ui-bg dark:hover:bg-dark-bg hover:shadow-sm"
          >
            <span className="flex-1">{suggestion}</span>
            <ArrowRight className="h-3.5 w-3.5 text-ui-muted dark:text-dark-muted transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
          </button>
        ))}
      </div>
    </div>
  );
}
