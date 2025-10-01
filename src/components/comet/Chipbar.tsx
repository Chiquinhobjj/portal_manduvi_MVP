import { cn } from '../../lib/utils';

export interface ChipbarFilters {
  lens: 'all' | 'news' | 'services' | 'data';
  timespan: 'today' | '24h' | '7d' | '30d';
  region: 'MT' | 'Brasil' | 'Global';
  mode: 'express' | 'complete' | 'timeline' | 'debate';
}

interface ChipbarProps {
  filters: ChipbarFilters;
  onChange: (filters: Partial<ChipbarFilters>) => void;
  className?: string;
}

export function Chipbar({ filters, onChange, className }: ChipbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <ChipGroup label="lente">
        <Chip
          active={filters.lens === 'all'}
          onClick={() => onChange({ lens: 'all' })}
        >
          tudo
        </Chip>
        <Chip
          active={filters.lens === 'news'}
          onClick={() => onChange({ lens: 'news' })}
        >
          notícias
        </Chip>
        <Chip
          active={filters.lens === 'services'}
          onClick={() => onChange({ lens: 'services' })}
        >
          serviços
        </Chip>
        <Chip
          active={filters.lens === 'data'}
          onClick={() => onChange({ lens: 'data' })}
        >
          dados
        </Chip>
      </ChipGroup>

      <div className="h-4 w-px bg-ui-border dark:bg-dark-border" />

      <ChipGroup label="tempo">
        <Chip
          active={filters.timespan === 'today'}
          onClick={() => onChange({ timespan: 'today' })}
        >
          hoje
        </Chip>
        <Chip
          active={filters.timespan === '24h'}
          onClick={() => onChange({ timespan: '24h' })}
        >
          24h
        </Chip>
        <Chip
          active={filters.timespan === '7d'}
          onClick={() => onChange({ timespan: '7d' })}
        >
          7 dias
        </Chip>
        <Chip
          active={filters.timespan === '30d'}
          onClick={() => onChange({ timespan: '30d' })}
        >
          30 dias
        </Chip>
      </ChipGroup>

      <div className="h-4 w-px bg-ui-border dark:bg-dark-border" />

      <ChipGroup label="região">
        <Chip
          active={filters.region === 'MT'}
          onClick={() => onChange({ region: 'MT' })}
        >
          MT
        </Chip>
        <Chip
          active={filters.region === 'Brasil'}
          onClick={() => onChange({ region: 'Brasil' })}
        >
          Brasil
        </Chip>
        <Chip
          active={filters.region === 'Global'}
          onClick={() => onChange({ region: 'Global' })}
        >
          Global
        </Chip>
      </ChipGroup>

      <div className="h-4 w-px bg-ui-border dark:bg-dark-border" />

      <ChipGroup label="modo">
        <Chip
          active={filters.mode === 'express'}
          onClick={() => onChange({ mode: 'express' })}
        >
          express
        </Chip>
        <Chip
          active={filters.mode === 'complete'}
          onClick={() => onChange({ mode: 'complete' })}
        >
          completo
        </Chip>
        <Chip
          active={filters.mode === 'timeline'}
          onClick={() => onChange({ mode: 'timeline' })}
        >
          timeline
        </Chip>
        <Chip
          active={filters.mode === 'debate'}
          onClick={() => onChange({ mode: 'debate' })}
        >
          debate
        </Chip>
      </ChipGroup>
    </div>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'bg-brand text-white shadow-sm'
          : 'bg-ui-panel dark:bg-dark-panel text-ui-muted dark:text-dark-muted hover:bg-ui-bg dark:hover:bg-dark-bg hover:text-ui-text dark:hover:text-dark-text border border-ui-border dark:border-dark-border'
      )}
    >
      {children}
    </button>
  );
}
