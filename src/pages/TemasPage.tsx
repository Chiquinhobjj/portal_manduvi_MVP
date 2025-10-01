import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Tag } from 'lucide-react';

interface Topic {
  slug: string;
  label: string;
  description: string | null;
  article_count: number;
}

export function TemasPage() {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    const { data, error } = await supabase.rpc('get_topics_with_counts').limit(50);

    if (!error && data) {
      setTopics(data);
    } else {
      const { data: fallback } = await supabase
        .from('topics')
        .select('slug, label, description')
        .order('label');

      if (fallback) {
        setTopics(fallback.map((t) => ({ ...t, article_count: 0 })));
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-brand font-bold mb-2">temas</h1>
          <p className="text-ui-muted dark:text-dark-muted">explore notícias e conteúdo por tema</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              to={`/tema/${topic.slug}`}
              className="group rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6 transition-all hover:border-brand hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand" />
                <span className="text-xs text-ui-muted dark:text-dark-muted">
                  {topic.article_count} {topic.article_count === 1 ? 'artigo' : 'artigos'}
                </span>
              </div>

              <h3 className="text-lg font-brand font-semibold group-hover:text-brand mb-2">
                {topic.label}
              </h3>

              {topic.description && (
                <p className="text-sm text-ui-muted leading-relaxed">{topic.description}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
