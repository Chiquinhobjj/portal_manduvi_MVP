import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  // Reduzir logs do Supabase
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    },
    // ✅ CORREÇÃO: Mover fetch para dentro do objeto global
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        // Cache GET requests por 30 segundos
        ...(options.method === 'GET' && {
          cache: 'default',
          headers: {
            ...options.headers,
            'Cache-Control': 'max-age=30'
          }
        })
      });
    }
  },
  // Desabilitar logs em produção
  ...(import.meta.env.PROD && {
    realtime: {
      log_level: 'error'
    }
  }),
  // Pool de conexões
  db: {
    schema: 'public',
  }
})
