import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface CometTopBarProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function CometTopBar({
  onSubmit,
  placeholder = 'o que você procura?',
  autoFocus = false,
  className,
}: CometTopBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'relative w-full transition-all duration-200',
        isFocused && 'scale-[1.01]',
        className
      )}
    >
      <div
        className={cn(
          'relative flex items-center rounded-lgx border bg-ui-panel dark:bg-dark-panel shadow-soft transition-all',
          isFocused ? 'border-brand ring-2 ring-brand/20' : 'border-ui-border dark:border-dark-border'
        )}
      >
        <div className="flex items-center pl-5 pr-3 text-ui-muted dark:text-dark-muted">
          <Sparkles className="h-5 w-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent py-4 pr-4 text-base text-ui-text dark:text-dark-text placeholder:text-ui-muted dark:placeholder:text-dark-muted focus:outline-none"
        />

        <button
          type="submit"
          disabled={!query.trim()}
          className={cn(
            'mr-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            query.trim()
              ? 'bg-brand text-white hover:bg-brand-warm'
              : 'bg-ui-bg dark:bg-dark-bg text-ui-muted dark:text-dark-muted cursor-not-allowed'
          )}
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2 px-1">
        <span className="text-xs text-ui-muted dark:text-dark-muted">dica:</span>
        <kbd className="rounded bg-ui-panel dark:bg-dark-panel px-1.5 py-0.5 text-xs text-ui-muted dark:text-dark-muted border border-ui-border dark:border-dark-border">
          /
        </kbd>
        <span className="text-xs text-ui-muted dark:text-dark-muted">ou</span>
        <kbd className="rounded bg-ui-panel dark:bg-dark-panel px-1.5 py-0.5 text-xs text-ui-muted dark:text-dark-muted border border-ui-border dark:border-dark-border">
          ⌘K
        </kbd>
        <span className="text-xs text-ui-muted dark:text-dark-muted">para buscar</span>
      </div>
    </form>
  );
}
