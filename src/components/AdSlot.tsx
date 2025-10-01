import { cn } from '../lib/utils';

type AdFormat = 'leaderboard' | 'mpu' | 'halfpage' | 'incontent';

interface AdSlotProps {
  format: AdFormat;
  className?: string;
  imageUrl?: string;
  altText?: string;
  linkUrl?: string;
}

const formatDimensions: Record<AdFormat, { width: string; height: string; label: string }> = {
  leaderboard: { width: '970px', height: '90px', label: '970×90' },
  mpu: { width: '300px', height: '250px', label: '300×250' },
  halfpage: { width: '300px', height: '600px', label: '300×600' },
  incontent: { width: '300px', height: '250px', label: '300×250' },
};

export function AdSlot({ format, className, imageUrl, altText, linkUrl }: AdSlotProps) {
  const dims = formatDimensions[format];

  const content = imageUrl ? (
    <div className="relative w-full h-full">
      <img
        src={imageUrl}
        alt={altText || 'Publicidade'}
        className="w-full h-full object-cover rounded-lg"
      />
      {/* Overlay com informações identificadoras */}
      <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
        {format.toUpperCase()} {dims.label}
      </div>
      {altText && altText.includes('[') && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
          {altText.match(/\[(.*?)\]/)?.[1]} - {format.toUpperCase()}
        </div>
      )}
    </div>
  ) : (
    <div className="text-center p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ui-muted dark:text-dark-muted">
        publicidade
      </div>
      <div className="text-xs text-ui-muted/60 dark:text-dark-muted/60">{dims.label}</div>
    </div>
  );

  const containerElement = (
    <div
      className={cn(
        'flex items-center justify-center rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel/50 dark:bg-dark-panel/50 overflow-hidden relative',
        imageUrl && 'hover:opacity-90 transition-opacity cursor-pointer',
        className
      )}
      style={{
        maxWidth: dims.width,
        minHeight: dims.height,
      }}
    >
      {content}
    </div>
  );

  // Se tem link, envolve em um elemento <a>
  if (linkUrl && imageUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
      >
        {containerElement}
      </a>
    );
  }

  return containerElement;
}

interface NativeAdProps {
  label: string;
  description?: string;
  link: string;
  disclosure?: string;
  className?: string;
}

export function NativeAd({
  label,
  description,
  link,
  disclosure = 'Patrocinado',
  className,
}: NativeAdProps) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={cn(
        'block rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-4 transition-all hover:border-brand hover:shadow-md',
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
          {disclosure}
        </span>
      </div>

      <h3 className="mb-1 text-sm font-semibold text-ui-text dark:text-dark-text">{label}</h3>
      {description && <p className="text-xs text-ui-muted dark:text-dark-muted leading-relaxed">{description}</p>}
    </a>
  );
}
