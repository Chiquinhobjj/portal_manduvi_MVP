// ✅ OTIMIZAÇÃO: Logger mais eficiente
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
    
    // ✅ Em produção, enviar apenas erros críticos para monitoramento
    if (isProduction) {
      // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
      // sendToErrorTracking(args);
    }
  },
};